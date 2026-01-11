import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { track } from '@vercel/analytics/server'
import { AccountSubscription } from '@/types/subscriptions'
import { getLatestBuild, updateBuildDeployment, updateProjectDeploySlug, updateBuildDeployStatus } from '@/lib/db'

// =============================================================================
// DEPLOYMENT API
// TIER: Architect+ (required for deployment)
// =============================================================================

// GET handler to check if a deployed site is ready
export async function GET(req: NextRequest) {
  const checkUrl = req.nextUrl.searchParams.get('check')
  
  if (!checkUrl) {
    return NextResponse.json({ error: 'Missing check URL' }, { status: 400 })
  }
  
  try {
    // Validate the URL is from our domain
    const url = new URL(checkUrl)
    if (!url.hostname.endsWith('.hatchit.dev')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
    
    // Try to fetch the site with a timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    
    try {
      const response = await fetch(checkUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'HatchIt-Deploy-Check/1.0'
        }
      })
      clearTimeout(timeout)
      
      // Site is ready if we get any successful response
      const ready = response.ok || response.status === 304
      return NextResponse.json({ ready, status: response.status })
    } catch {
      clearTimeout(timeout)
      // Site not ready yet
      return NextResponse.json({ ready: false, error: 'Site not responding' })
    }
  } catch {
    return NextResponse.json({ ready: false, error: 'Invalid URL format' })
  }
}

// Type for deployed project
interface DeployedProject {
  slug: string
  name: string
  code?: string
  pages?: PageToDeploy[]
  deployedAt: string
}

// Type for page to deploy
interface PageToDeploy {
  name: string
  path: string
  code: string
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check tier - Architect or higher required for deployment
    const clerkClientInstance = await clerkClient()
    const userRecord = await clerkClientInstance.users.getUser(userId)
    const accountSub = userRecord.publicMetadata?.accountSubscription as AccountSubscription | undefined
    
    const hasDeployAccess = ['architect', 'visionary', 'singularity'].includes(accountSub?.tier || '') || userRecord.publicMetadata?.role === 'admin'
    
    if (!hasDeployAccess) {
      return NextResponse.json({ 
        error: 'Deployment requires Architect tier or higher', 
        requiresUpgrade: true,
        requiredTier: 'architect'
      }, { status: 403 })
    }

    const { code, pages, projectName, projectId } = await req.json()

    // Support both single-page (legacy) and multi-page projects
    if (!code && (!pages || pages.length === 0)) {
      return NextResponse.json({ error: 'No code or pages provided' }, { status: 400 })
    }

    // Sanitize and validate project name
    if (!projectName || typeof projectName !== 'string') {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }
    
    // Strip HTML/script tags and limit length
    const sanitizedName = projectName
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim()
      .slice(0, 100) // Limit length

    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Invalid project name' }, { status: 400 })
    }

    // Create user-scoped slug to prevent collisions between users
    // Use last 6 chars of userId for uniqueness while keeping URLs readable
    const userSuffix = userId.slice(-6).toLowerCase()
    const baseSlug = sanitizedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'site'
    
    // Check if the slug already ends with the user suffix (re-deploying existing project)
    // This prevents double-suffix issue when updating a deployed project
    const slug = baseSlug.endsWith(`-${userSuffix}`) ? baseSlug : `${baseSlug}-${userSuffix}`

    // Verify user has an active account subscription
    const client = await clerkClient()
    let userWithSub = await client.users.getUser(userId)
    let accountSubscription = userWithSub.publicMetadata?.accountSubscription as AccountSubscription | undefined

    // If no subscription found, wait and retry once (handles race condition after checkout)
    if (!accountSubscription || accountSubscription.status !== 'active') {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Refetch user data
      userWithSub = await client.users.getUser(userId)
      accountSubscription = userWithSub.publicMetadata?.accountSubscription as AccountSubscription | undefined
    }

    if (!accountSubscription || accountSubscription.status !== 'active') {
      return NextResponse.json({ 
        error: 'Architect subscription ($19/mo) required to deploy',
        requiresUpgrade: true,
        projectSlug: slug
      }, { status: 403 })
    }

    // Create the file structure for deployment
    const files = [
      {
        file: 'package.json',
        data: JSON.stringify({
          name: slug,
          version: '1.0.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          },
          dependencies: {
            next: '14.1.0',
            react: '18.2.0',
            'react-dom': '18.2.0',
            'framer-motion': '^11.0.0',
            'lucide-react': '^0.300.0'
          },
          devDependencies: {
            typescript: '^5.0.0',
            '@types/node': '^20.0.0',
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            tailwindcss: '^3.4.0',
            postcss: '^8.4.0',
            autoprefixer: '^10.4.0'
          }
        }, null, 2)
      },
      {
        file: 'next.config.js',
        data: `/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig`
      },
      {
        file: 'tailwind.config.js',
        data: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
      },
      {
        file: 'postcss.config.js',
        data: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
      },
      {
        file: 'tsconfig.json',
        data: JSON.stringify({
          compilerOptions: {
            target: 'es5',
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: false,
            noImplicitAny: false,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
            paths: { '@/*': ['./*'] }
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules']
        }, null, 2)
      },
      {
        file: 'app/layout.tsx',
        data: `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${projectName || 'My Site'}',
  description: 'Built with HatchIt.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
      },
      {
        file: 'app/globals.css',
        data: `@tailwind base;
@tailwind components;
@tailwind utilities;`
      },
      {
        file: 'app/not-found.tsx',
        data: `export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 mb-8">Page not found</p>
        <a href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
          Go Home
        </a>
      </div>
    </div>
  )
}`
      }
    ]
    
    // Known Lucide icons - comprehensive list for detection
    const LUCIDE_ICONS = new Set([
      'Activity', 'Airplay', 'AlertCircle', 'AlertOctagon', 'AlertTriangle', 'AlignCenter', 'AlignJustify', 'AlignLeft', 'AlignRight',
      'Anchor', 'Aperture', 'Archive', 'ArrowBigDown', 'ArrowBigLeft', 'ArrowBigRight', 'ArrowBigUp', 'ArrowDown', 'ArrowDownCircle',
      'ArrowDownLeft', 'ArrowDownRight', 'ArrowLeft', 'ArrowLeftCircle', 'ArrowRight', 'ArrowRightCircle', 'ArrowUp', 'ArrowUpCircle',
      'ArrowUpDown', 'ArrowUpLeft', 'ArrowUpRight', 'Asterisk', 'AtSign', 'Award', 'Axe', 'Backpack', 'BadgeAlert', 'BadgeCheck',
      'BadgeDollarSign', 'BadgeHelp', 'BadgeInfo', 'BadgeMinus', 'BadgePercent', 'BadgePlus', 'BadgeX', 'BaggageClaim', 'Ban',
      'Banknote', 'BarChart', 'BarChart2', 'BarChart3', 'BarChart4', 'Barcode', 'Baseline', 'Bath', 'Battery', 'BatteryCharging',
      'BatteryFull', 'BatteryLow', 'BatteryMedium', 'BatteryWarning', 'Beaker', 'Bean', 'BeanOff', 'Bed', 'BedDouble', 'BedSingle',
      'Beer', 'Bell', 'BellDot', 'BellMinus', 'BellOff', 'BellPlus', 'BellRing', 'Bike', 'Binary', 'Biohazard', 'Bird', 'Bitcoin',
      'Blend', 'Blinds', 'Blocks', 'Bluetooth', 'BluetoothConnected', 'BluetoothOff', 'BluetoothSearching', 'Bold', 'Bomb', 'Bone',
      'Book', 'BookCopy', 'BookDown', 'BookHeadphones', 'BookHeart', 'BookImage', 'BookKey', 'BookLock', 'BookMarked', 'BookMinus',
      'BookOpen', 'BookOpenCheck', 'BookOpenText', 'BookPlus', 'BookText', 'BookType', 'BookUp', 'BookUser', 'BookX', 'Bookmark',
      'BookmarkCheck', 'BookmarkMinus', 'BookmarkPlus', 'BookmarkX', 'BoomBox', 'Bot', 'Box', 'BoxSelect', 'Boxes', 'Braces',
      'Brackets', 'Brain', 'BrainCircuit', 'BrainCog', 'Briefcase', 'BringToFront', 'Brush', 'Bug', 'BugOff', 'BugPlay', 'Building',
      'Building2', 'Bus', 'BusFront', 'Cable', 'CableCar', 'Cake', 'CakeSlice', 'Calculator', 'Calendar', 'CalendarCheck',
      'CalendarCheck2', 'CalendarClock', 'CalendarDays', 'CalendarHeart', 'CalendarMinus', 'CalendarOff', 'CalendarPlus', 'CalendarRange',
      'CalendarSearch', 'CalendarX', 'CalendarX2', 'Camera', 'CameraOff', 'CandlestickChart', 'Candy', 'CandyCane', 'CandyOff',
      'Car', 'CarFront', 'CarTaxiFront', 'Caravan', 'Carrot', 'CaseLower', 'CaseSensitive', 'CaseUpper', 'Cast', 'Castle', 'Cat',
      'Check', 'CheckCheck', 'CheckCircle', 'CheckCircle2', 'CheckSquare', 'CheckSquare2', 'ChefHat', 'Cherry', 'ChevronDown',
      'ChevronDownCircle', 'ChevronDownSquare', 'ChevronFirst', 'ChevronLast', 'ChevronLeft', 'ChevronLeftCircle', 'ChevronLeftSquare',
      'ChevronRight', 'ChevronRightCircle', 'ChevronRightSquare', 'ChevronUp', 'ChevronUpCircle', 'ChevronUpSquare', 'ChevronsDown',
      'ChevronsDownUp', 'ChevronsLeft', 'ChevronsLeftRight', 'ChevronsRight', 'ChevronsRightLeft', 'ChevronsUp', 'ChevronsUpDown',
      'Chrome', 'Church', 'Cigarette', 'CigaretteOff', 'Circle', 'CircleDashed', 'CircleDollarSign', 'CircleDot', 'CircleDotDashed',
      'CircleEllipsis', 'CircleEqual', 'CircleOff', 'CircleSlash', 'CircleSlash2', 'CircleUser', 'CircleUserRound', 'CircuitBoard',
      'Citrus', 'Clapperboard', 'Clipboard', 'ClipboardCheck', 'ClipboardCopy', 'ClipboardEdit', 'ClipboardList', 'ClipboardPaste',
      'ClipboardPen', 'ClipboardSignature', 'ClipboardType', 'ClipboardX', 'Clock', 'Clock1', 'Clock10', 'Clock11', 'Clock12',
      'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9', 'Cloud', 'CloudCog', 'CloudDownload',
      'CloudDrizzle', 'CloudFog', 'CloudHail', 'CloudLightning', 'CloudMoon', 'CloudMoonRain', 'CloudOff', 'CloudRain', 'CloudRainWind',
      'CloudSnow', 'CloudSun', 'CloudSunRain', 'CloudUpload', 'Cloudy', 'Clover', 'Club', 'Code', 'Code2', 'CodeSquare', 'Codepen',
      'Codesandbox', 'Coffee', 'Cog', 'Coins', 'Columns', 'Columns2', 'Columns3', 'Columns4', 'Combine', 'Command', 'Compass',
      'Component', 'Computer', 'ConciergeBell', 'Cone', 'Construction', 'Contact', 'Contact2', 'Container', 'Contrast', 'Cookie',
      'Copy', 'CopyCheck', 'CopyMinus', 'CopyPlus', 'CopySlash', 'CopyX', 'Copyleft', 'Copyright', 'CornerDownLeft', 'CornerDownRight',
      'CornerLeftDown', 'CornerLeftUp', 'CornerRightDown', 'CornerRightUp', 'CornerUpLeft', 'CornerUpRight', 'Cpu', 'CreditCard',
      'Croissant', 'Crop', 'Cross', 'Crosshair', 'Crown', 'Cuboid', 'CupSoda', 'Currency', 'Database', 'DatabaseBackup', 'DatabaseZap',
      'Delete', 'Dessert', 'Diameter', 'Diamond', 'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6', 'Dices', 'Diff', 'Disc',
      'Disc2', 'Disc3', 'Divide', 'DivideCircle', 'DivideSquare', 'Dna', 'DnaOff', 'Dog', 'DollarSign', 'Donut', 'Door', 'DoorClosed',
      'DoorOpen', 'Dot', 'Download', 'DownloadCloud', 'DraftingCompass', 'Drama', 'Dribbble', 'Drill', 'Droplet', 'Droplets', 'Drum',
      'Drumstick', 'Dumbbell', 'Ear', 'EarOff', 'Egg', 'EggFried', 'EggOff', 'Equal', 'EqualNot', 'Eraser', 'Euro', 'Expand',
      'ExternalLink', 'Eye', 'EyeOff', 'Facebook', 'Factory', 'Fan', 'FastForward', 'Feather', 'FerrisWheel', 'Figma', 'File',
      'FileArchive', 'FileAudio', 'FileAudio2', 'FileAxis3d', 'FileBadge', 'FileBadge2', 'FileBarChart', 'FileBarChart2', 'FileBox',
      'FileCheck', 'FileCheck2', 'FileClock', 'FileCode', 'FileCode2', 'FileCog', 'FileCog2', 'FileDiff', 'FileDigit', 'FileDown',
      'FileEdit', 'FileHeart', 'FileImage', 'FileInput', 'FileJson', 'FileJson2', 'FileKey', 'FileKey2', 'FileLineChart', 'FileLock',
      'FileLock2', 'FileMinus', 'FileMinus2', 'FileMusic', 'FileOutput', 'FilePen', 'FilePenLine', 'FilePieChart', 'FilePlus',
      'FilePlus2', 'FileQuestion', 'FileScan', 'FileSearch', 'FileSearch2', 'FileSignature', 'FileSliders', 'FileSpreadsheet',
      'FileStack', 'FileSymlink', 'FileTerminal', 'FileText', 'FileType', 'FileType2', 'FileUp', 'FileVideo', 'FileVideo2', 'FileVolume',
      'FileVolume2', 'FileWarning', 'FileX', 'FileX2', 'Files', 'Film', 'Filter', 'FilterX', 'Fingerprint', 'Fire', 'FireExtinguisher',
      'Fish', 'FishOff', 'FishSymbol', 'Flag', 'FlagOff', 'FlagTriangleLeft', 'FlagTriangleRight', 'Flame', 'FlameKindling', 'Flashlight',
      'FlashlightOff', 'FlaskConical', 'FlaskConicalOff', 'FlaskRound', 'FlipHorizontal', 'FlipHorizontal2', 'FlipVertical', 'FlipVertical2',
      'Flower', 'Flower2', 'Focus', 'FoldHorizontal', 'FoldVertical', 'Folder', 'FolderArchive', 'FolderCheck', 'FolderClock', 'FolderClosed',
      'FolderCog', 'FolderCog2', 'FolderDot', 'FolderDown', 'FolderEdit', 'FolderGit', 'FolderGit2', 'FolderHeart', 'FolderInput',
      'FolderKanban', 'FolderKey', 'FolderLock', 'FolderMinus', 'FolderOpen', 'FolderOpenDot', 'FolderOutput', 'FolderPen', 'FolderPlus',
      'FolderRoot', 'FolderSearch', 'FolderSearch2', 'FolderSymlink', 'FolderSync', 'FolderTree', 'FolderUp', 'FolderX', 'Folders',
      'Footprints', 'Forklift', 'FormInput', 'Forward', 'Frame', 'Framer', 'Frown', 'Fuel', 'Fullscreen', 'FunctionSquare', 'GalleryHorizontal',
      'GalleryHorizontalEnd', 'GalleryThumbnails', 'GalleryVertical', 'GalleryVerticalEnd', 'Gamepad', 'Gamepad2', 'GanttChart',
      'GanttChartSquare', 'Gauge', 'GaugeCircle', 'Gavel', 'Gem', 'Ghost', 'Gift', 'GitBranch', 'GitBranchPlus', 'GitCommit',
      'GitCommitHorizontal', 'GitCommitVertical', 'GitCompare', 'GitCompareArrows', 'GitFork', 'GitGraph', 'GitMerge', 'GitPullRequest',
      'GitPullRequestArrow', 'GitPullRequestClosed', 'GitPullRequestCreate', 'GitPullRequestCreateArrow', 'GitPullRequestDraft', 'Github',
      'Gitlab', 'GlassWater', 'Glasses', 'Globe', 'Globe2', 'Goal', 'Grab', 'GraduationCap', 'Grape', 'Grid', 'Grid2x2', 'Grid3x3',
      'GripHorizontal', 'GripVertical', 'Group', 'Guitar', 'Hammer', 'Hand', 'HandMetal', 'HardDrive', 'HardDriveDownload', 'HardDriveUpload',
      'HardHat', 'Hash', 'Haze', 'HdmiPort', 'Heading', 'Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6',
      'Headphones', 'Heart', 'HeartCrack', 'HeartHandshake', 'HeartOff', 'HeartPulse', 'HelpCircle', 'HelpingHand', 'Hexagon', 'Highlighter',
      'History', 'Home', 'Hop', 'HopOff', 'Hospital', 'Hotel', 'Hourglass', 'IceCream', 'IceCream2', 'Image', 'ImageDown', 'ImageMinus',
      'ImageOff', 'ImagePlus', 'ImageUp', 'Import', 'Inbox', 'Indent', 'IndianRupee', 'Infinity', 'Info', 'Inspect', 'Instagram',
      'Italic', 'IterationCcw', 'IterationCw', 'JapaneseYen', 'Joystick', 'Kanban', 'KanbanSquare', 'KanbanSquareDashed', 'Key',
      'KeyRound', 'KeySquare', 'Keyboard', 'KeyboardMusic', 'Lamp', 'LampCeiling', 'LampDesk', 'LampFloor', 'LampWallDown', 'LampWallUp',
      'LandPlot', 'Landmark', 'Languages', 'Laptop', 'Laptop2', 'Lasso', 'LassoSelect', 'Laugh', 'Layers', 'Layers2', 'Layers3',
      'Layout', 'LayoutDashboard', 'LayoutGrid', 'LayoutList', 'LayoutPanelLeft', 'LayoutPanelTop', 'LayoutTemplate', 'Leaf', 'LeafyGreen',
      'Library', 'LibraryBig', 'LibrarySquare', 'LifeBuoy', 'Ligature', 'Lightbulb', 'LightbulbOff', 'LineChart', 'Link', 'Link2',
      'Link2Off', 'Linkedin', 'List', 'ListChecks', 'ListCollapse', 'ListEnd', 'ListFilter', 'ListMinus', 'ListMusic', 'ListOrdered',
      'ListPlus', 'ListRestart', 'ListStart', 'ListTodo', 'ListTree', 'ListVideo', 'ListX', 'Loader', 'Loader2', 'Locate', 'LocateFixed',
      'LocateOff', 'Lock', 'LockKeyhole', 'LockKeyholeOpen', 'LockOpen', 'LogIn', 'LogOut', 'Lollipop', 'Luggage', 'MSquare', 'Magnet',
      'Mail', 'MailCheck', 'MailMinus', 'MailOpen', 'MailPlus', 'MailQuestion', 'MailSearch', 'MailWarning', 'MailX', 'Mailbox', 'Mails',
      'Map', 'MapPin', 'MapPinOff', 'MapPinned', 'Martini', 'Maximize', 'Maximize2', 'Medal', 'Megaphone', 'MegaphoneOff', 'Meh', 'MemoryStick',
      'Menu', 'MenuSquare', 'Merge', 'MessageCircle', 'MessageCircleCode', 'MessageCircleDashed', 'MessageCircleHeart', 'MessageCircleMore',
      'MessageCircleOff', 'MessageCirclePlus', 'MessageCircleQuestion', 'MessageCircleReply', 'MessageCircleWarning', 'MessageCircleX',
      'MessageSquare', 'MessageSquareCode', 'MessageSquareDashed', 'MessageSquareDiff', 'MessageSquareDot', 'MessageSquareHeart',
      'MessageSquareMore', 'MessageSquareOff', 'MessageSquarePlus', 'MessageSquareQuote', 'MessageSquareReply', 'MessageSquareShare',
      'MessageSquareText', 'MessageSquareWarning', 'MessageSquareX', 'MessagesSquare', 'Mic', 'Mic2', 'MicOff', 'Microscope', 'Microwave',
      'Milestone', 'Milk', 'MilkOff', 'Minimize', 'Minimize2', 'Minus', 'MinusCircle', 'MinusSquare', 'Monitor', 'MonitorCheck',
      'MonitorDot', 'MonitorDown', 'MonitorOff', 'MonitorPause', 'MonitorPlay', 'MonitorSmartphone', 'MonitorSpeaker', 'MonitorStop',
      'MonitorUp', 'MonitorX', 'Moon', 'MoonStar', 'MoreHorizontal', 'MoreVertical', 'Mountain', 'MountainSnow', 'Mouse', 'MousePointer',
      'MousePointer2', 'MousePointerClick', 'MousePointerSquare', 'MousePointerSquareDashed', 'Move', 'Move3d', 'MoveDiagonal',
      'MoveDiagonal2', 'MoveDown', 'MoveDownLeft', 'MoveDownRight', 'MoveHorizontal', 'MoveLeft', 'MoveRight', 'MoveUp', 'MoveUpLeft',
      'MoveUpRight', 'MoveVertical', 'Music', 'Music2', 'Music3', 'Music4', 'Navigation', 'Navigation2', 'Navigation2Off', 'NavigationOff',
      'Network', 'Newspaper', 'Nfc', 'Notebook', 'NotebookPen', 'NotebookTabs', 'NotebookText', 'NotepadText', 'NotepadTextDashed', 'Nut',
      'NutOff', 'Octagon', 'OctagonAlert', 'OctagonPause', 'OctagonX', 'Option', 'Orbit', 'Outdent', 'Package', 'Package2', 'PackageCheck',
      'PackageMinus', 'PackageOpen', 'PackagePlus', 'PackageSearch', 'PackageX', 'PaintBucket', 'Paintbrush', 'Paintbrush2', 'Palette',
      'Palmtree', 'PanelBottom', 'PanelBottomClose', 'PanelBottomDashed', 'PanelBottomOpen', 'PanelLeft', 'PanelLeftClose', 'PanelLeftDashed',
      'PanelLeftOpen', 'PanelRight', 'PanelRightClose', 'PanelRightDashed', 'PanelRightOpen', 'PanelTop', 'PanelTopClose', 'PanelTopDashed',
      'PanelTopOpen', 'PanelsLeftBottom', 'PanelsRightBottom', 'PanelsTopLeft', 'Paperclip', 'Parentheses', 'ParkingCircle', 'ParkingCircleOff',
      'ParkingMeter', 'ParkingSquare', 'ParkingSquareOff', 'PartyPopper', 'Pause', 'PauseCircle', 'PauseOctagon', 'PawPrint', 'PcCase',
      'Pen', 'PenLine', 'PenSquare', 'PenTool', 'Pencil', 'PencilLine', 'PencilRuler', 'Pentagon', 'Percent', 'PercentCircle',
      'PercentDiamond', 'PercentSquare', 'PersonStanding', 'Phone', 'PhoneCall', 'PhoneForwarded', 'PhoneIncoming', 'PhoneMissed',
      'PhoneOff', 'PhoneOutgoing', 'Pi', 'PiSquare', 'Piano', 'Pickaxe', 'PictureInPicture', 'PictureInPicture2', 'PiggyBank', 'Pilcrow',
      'PilcrowSquare', 'Pill', 'Pin', 'PinOff', 'Pipette', 'Pizza', 'Plane', 'PlaneLanding', 'PlaneTakeoff', 'Play', 'PlayCircle',
      'PlaySquare', 'Plug', 'Plug2', 'PlugZap', 'PlugZap2', 'Plus', 'PlusCircle', 'PlusSquare', 'Pocket', 'PocketKnife', 'Podcast',
      'Pointer', 'PointerOff', 'Popcorn', 'Popsicle', 'PoundSterling', 'Power', 'PowerCircle', 'PowerOff', 'PowerSquare', 'Presentation',
      'Printer', 'Projector', 'Proportions', 'Puzzle', 'Pyramid', 'QrCode', 'Quote', 'Rabbit', 'Radar', 'Radiation', 'Radio',
      'RadioReceiver', 'RadioTower', 'Radius', 'RailSymbol', 'Rainbow', 'Rat', 'Ratio', 'Receipt', 'ReceiptCent', 'ReceiptEuro',
      'ReceiptIndianRupee', 'ReceiptJapaneseYen', 'ReceiptPoundSterling', 'ReceiptRussianRuble', 'ReceiptSwissFranc', 'ReceiptText',
      'RectangleEllipsis', 'RectangleHorizontal', 'RectangleVertical', 'Recycle', 'Redo', 'Redo2', 'RedoDot', 'RefreshCcw', 'RefreshCcwDot',
      'RefreshCw', 'RefreshCwOff', 'Refrigerator', 'Regex', 'RemoveFormatting', 'Repeat', 'Repeat1', 'Repeat2', 'Replace', 'ReplaceAll',
      'Reply', 'ReplyAll', 'Rewind', 'Ribbon', 'Rocket', 'RockingChair', 'RollerCoaster', 'Rotate3d', 'RotateCcw', 'RotateCcwSquare',
      'RotateCw', 'RotateCwSquare', 'Route', 'RouteOff', 'Router', 'Rows', 'Rows2', 'Rows3', 'Rows4', 'Rss', 'Ruler', 'RussianRuble',
      'Sailboat', 'Salad', 'Sandwich', 'Satellite', 'SatelliteDish', 'Save', 'SaveAll', 'SaveOff', 'Scale', 'Scale3d', 'Scaling', 'Scan',
      'ScanBarcode', 'ScanEye', 'ScanFace', 'ScanLine', 'ScanSearch', 'ScanText', 'ScatterChart', 'School', 'School2', 'Scissors',
      'ScissorsLineDashed', 'ScissorsSquare', 'ScissorsSquareDashedBottom', 'ScreenShare', 'ScreenShareOff', 'Scroll', 'ScrollText',
      'Search', 'SearchCheck', 'SearchCode', 'SearchSlash', 'SearchX', 'Send', 'SendHorizontal', 'SendToBack', 'SeparatorHorizontal',
      'SeparatorVertical', 'Server', 'ServerCog', 'ServerCrash', 'ServerOff', 'Settings', 'Settings2', 'Shapes', 'Share', 'Share2',
      'Sheet', 'Shell', 'Shield', 'ShieldAlert', 'ShieldBan', 'ShieldCheck', 'ShieldEllipsis', 'ShieldHalf', 'ShieldMinus', 'ShieldOff',
      'ShieldPlus', 'ShieldQuestion', 'ShieldX', 'Ship', 'ShipWheel', 'Shirt', 'ShoppingBag', 'ShoppingBasket', 'ShoppingCart', 'Shovel',
      'ShowerHead', 'Shrink', 'Shrub', 'Shuffle', 'Sigma', 'SigmaSquare', 'Signal', 'SignalHigh', 'SignalLow', 'SignalMedium', 'SignalZero',
      'Signpost', 'SignpostBig', 'Siren', 'SkipBack', 'SkipForward', 'Skull', 'Slack', 'Slash', 'Slice', 'Sliders', 'SlidersHorizontal',
      'SlidersVertical', 'Smartphone', 'SmartphoneCharging', 'SmartphoneNfc', 'Smile', 'SmilePlus', 'Snail', 'Snowflake', 'Sofa', 'Soup',
      'Space', 'Spade', 'Sparkle', 'Sparkles', 'Speaker', 'Speech', 'SpellCheck', 'SpellCheck2', 'Spline', 'Split', 'SplitSquareHorizontal',
      'SplitSquareVertical', 'SprayCan', 'Sprout', 'Square', 'SquareActivity', 'SquareAsterisk', 'SquareBottomDashedScissors', 'SquareCheck',
      'SquareCheckBig', 'SquareChevronDown', 'SquareChevronLeft', 'SquareChevronRight', 'SquareChevronUp', 'SquareCode', 'SquareDashedBottom',
      'SquareDashedBottomCode', 'SquareDashedKanban', 'SquareDashedMousePointer', 'SquareDivide', 'SquareDot', 'SquareEqual', 'SquareFunction',
      'SquareGanttChart', 'SquareKanban', 'SquareLibrary', 'SquareM', 'SquareMenu', 'SquareMinus', 'SquareMousePointer', 'SquareParking',
      'SquareParkingOff', 'SquarePen', 'SquarePercent', 'SquarePi', 'SquarePilcrow', 'SquarePlay', 'SquarePlus', 'SquarePower', 'SquareRadical',
      'SquareScissors', 'SquareSigma', 'SquareSlash', 'SquareSplitHorizontal', 'SquareSplitVertical', 'SquareStack', 'SquareTerminal',
      'SquareUser', 'SquareUserRound', 'SquareX', 'Squircle', 'Squirrel', 'Stamp', 'Star', 'StarHalf', 'StarOff', 'Stars', 'StepBack',
      'StepForward', 'Stethoscope', 'Sticker', 'StickyNote', 'Stop', 'StopCircle', 'Store', 'StretchHorizontal', 'StretchVertical',
      'Strikethrough', 'Subscript', 'Subtitles', 'Sun', 'SunDim', 'SunMedium', 'SunMoon', 'SunSnow', 'Sunrise', 'Sunset', 'Superscript',
      'SwatchBook', 'SwissFranc', 'SwitchCamera', 'Sword', 'Swords', 'Syringe', 'Table', 'Table2', 'TableCellsMerge', 'TableCellsSplit',
      'TableColumnsSplit', 'TableProperties', 'TableRowsSplit', 'Tablet', 'TabletSmartphone', 'Tablets', 'Tag', 'Tags', 'Tally1', 'Tally2',
      'Tally3', 'Tally4', 'Tally5', 'Tangent', 'Target', 'Telescope', 'Tent', 'TentTree', 'Terminal', 'TerminalSquare', 'TestTube',
      'TestTube2', 'TestTubes', 'Text', 'TextCursor', 'TextCursorInput', 'TextQuote', 'TextSearch', 'TextSelect', 'TextSelection',
      'Theater', 'Thermometer', 'ThermometerSnowflake', 'ThermometerSun', 'ThumbsDown', 'ThumbsUp', 'Ticket', 'TicketCheck', 'TicketMinus',
      'TicketPercent', 'TicketPlus', 'TicketSlash', 'TicketX', 'Timer', 'TimerOff', 'TimerReset', 'ToggleLeft', 'ToggleRight', 'Tornado',
      'Torus', 'Touchpad', 'TouchpadOff', 'TowerControl', 'ToyBrick', 'Tractor', 'TrafficCone', 'Train', 'TrainFront', 'TrainFrontTunnel',
      'TrainTrack', 'TramFront', 'Trash', 'Trash2', 'TreeDeciduous', 'TreePalm', 'TreePine', 'Trees', 'Trello', 'TrendingDown', 'TrendingUp',
      'Triangle', 'TriangleAlert', 'TriangleRight', 'Trophy', 'Truck', 'Turtle', 'Tv', 'Tv2', 'Twitch', 'Twitter', 'Type', 'Umbrella',
      'UmbrellaOff', 'Underline', 'Undo', 'Undo2', 'UndoDot', 'UnfoldHorizontal', 'UnfoldVertical', 'Ungroup', 'University', 'Unlink',
      'Unlink2', 'Unlock', 'UnlockKeyhole', 'Unplug', 'Upload', 'UploadCloud', 'Usb', 'User', 'User2', 'UserCheck', 'UserCheck2', 'UserCircle',
      'UserCircle2', 'UserCog', 'UserCog2', 'UserMinus', 'UserMinus2', 'UserPlus', 'UserPlus2', 'UserRound', 'UserRoundCheck', 'UserRoundCog',
      'UserRoundMinus', 'UserRoundPlus', 'UserRoundSearch', 'UserRoundX', 'UserSearch', 'UserSquare', 'UserSquare2', 'UserX', 'UserX2',
      'Users', 'Users2', 'UsersRound', 'Utensils', 'UtensilsCrossed', 'UtilityPole', 'Variable', 'Vault', 'Vegan', 'VenetianMask', 'Vibrate',
      'VibrateOff', 'Video', 'VideoOff', 'Videotape', 'View', 'Voicemail', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Vote', 'Wallet',
      'Wallet2', 'WalletCards', 'WalletMinimal', 'Wallpaper', 'Wand', 'Wand2', 'Warehouse', 'WashingMachine', 'Watch', 'Waves', 'Waypoints',
      'Webcam', 'Webhook', 'Weight', 'Wheat', 'WheatOff', 'WholeWord', 'Wifi', 'WifiOff', 'Wind', 'Wine', 'WineOff', 'Workflow', 'WrapText',
      'Wrench', 'X', 'XCircle', 'XOctagon', 'XSquare', 'Youtube', 'Zap', 'ZapOff', 'ZoomIn', 'ZoomOut'
    ])
    
    // Helper function to extract Lucide icons from code
    const extractLucideIcons = (codeStr: string): string[] => {
      const iconRegex = /<([A-Z][a-zA-Z0-9]*)\s/g
      const icons = new Set<string>()
      let match
      while ((match = iconRegex.exec(codeStr)) !== null) {
        const name = match[1]
        if (LUCIDE_ICONS.has(name)) {
          icons.add(name)
        }
      }
      // Also check for icon={IconName} patterns
      const iconPropRegex = /icon[=:]?\s*{?\s*([A-Z][a-zA-Z0-9]*)/g
      while ((match = iconPropRegex.exec(codeStr)) !== null) {
        const name = match[1]
        if (LUCIDE_ICONS.has(name)) {
          icons.add(name)
        }
      }
      return Array.from(icons)
    }
    
    // Common animation variants that may be duplicated across sections
    const COMMON_VARIANTS = [
      'containerVariants',
      'cardVariants',
      'itemVariants',
      'fadeVariants',
      'slideVariants',
      'scaleVariants',
      'staggerVariants'
    ]
    
    // Helper function to find the end of an object declaration (handles nested braces)
    const findObjectEnd = (code: string, startIndex: number): number => {
      let braceCount = 0
      let inString = false
      let stringChar = ''
      
      for (let i = startIndex; i < code.length; i++) {
        const char = code[i]
        const prevChar = i > 0 ? code[i - 1] : ''
        
        // Handle string detection (skip content inside strings)
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          if (!inString) {
            inString = true
            stringChar = char
          } else if (char === stringChar) {
            inString = false
          }
          continue
        }
        
        if (inString) continue
        
        if (char === '{') {
          braceCount++
        } else if (char === '}') {
          braceCount--
          if (braceCount === 0) {
            return i + 1 // Return position after closing brace
          }
        }
      }
      return -1 // Not found
    }
    
    // Helper function to deduplicate variable declarations
    const deduplicateVariables = (codeStr: string): string => {
      let result = codeStr
      
      for (const varName of COMMON_VARIANTS) {
        // Find all occurrences of this variable declaration
        const declarationRegex = new RegExp(`const\\s+${varName}\\s*=\\s*\\{`, 'g')
        const occurrences: { start: number; end: number }[] = []
        
        let match
        let searchStr = result
        let offset = 0
        
        while ((match = declarationRegex.exec(searchStr)) !== null) {
          const declStart = match.index + offset
          const objStart = declStart + match[0].length - 1 // Position of opening brace
          const objEnd = findObjectEnd(result, objStart)
          
          if (objEnd > 0) {
            occurrences.push({ start: declStart, end: objEnd })
          }
          
          // Continue searching after this match
          offset += match.index + match[0].length
          searchStr = result.slice(offset)
          declarationRegex.lastIndex = 0
        }
        
        // If more than one occurrence, remove all but the first
        if (occurrences.length > 1) {
          // Remove from last to first to preserve indices
          for (let i = occurrences.length - 1; i > 0; i--) {
            const { start, end } = occurrences[i]
            result = result.slice(0, start) + result.slice(end)
          }
        }
      }
      
      // Clean up any excessive newlines left behind
      result = result.replace(/\n{3,}/g, '\n\n')
      
      return result
    }
    
    // Helper function to prepare page code
    const preparePageCode = (pageCode: string) => {
      let prepared = pageCode
      
      // Deduplicate common animation variant declarations
      prepared = deduplicateVariables(prepared)
      
      // Add 'use client' if not present
      if (!prepared.includes("'use client'") && !prepared.includes('"use client"')) {
        prepared = `'use client'\n${prepared}`
      }
      
      // Handle naming conflicts between next/image and lucide-react
      // If both are used, rename the Lucide Image to ImageIcon
      const hasNextImage = prepared.includes("from 'next/image'") || prepared.includes('from "next/image"')
      const hasLucideImage = /\bImage\b/.test(prepared) && 
        (prepared.includes("from 'lucide-react'") || prepared.includes('from "lucide-react"'))
      
      if (hasNextImage && hasLucideImage) {
        // Rename Lucide Image to ImageIcon in imports
        prepared = prepared.replace(
          /import\s*\{([^}]*)\bImage\b([^}]*)\}\s*from\s*['"]lucide-react['"]/,
          (match, before, after) => {
            return `import {${before}Image as ImageIcon${after}} from 'lucide-react'`
          }
        )
        // Replace <Image usage that's NOT from next/image (Lucide icons are used as <Image />)
        // This is tricky - we look for Image used as a component with Lucide-style props
        prepared = prepared.replace(/<Image\s+className=/g, '<ImageIcon className=')
        prepared = prepared.replace(/icon=\{Image\}/g, 'icon={ImageIcon}')
      }
      
      // Extract and add Lucide icon imports if needed
      const usedIcons = extractLucideIcons(prepared)
      if (usedIcons.length > 0) {
        const hasLucideImport = prepared.includes("from 'lucide-react'") || prepared.includes('from "lucide-react"')
        
        if (hasLucideImport) {
          // Merge missing icons into existing import
          const existingImportMatch = prepared.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/)
          if (existingImportMatch) {
            const existingIcons = existingImportMatch[1].split(',').map(s => s.trim()).filter(Boolean)
            const allIcons = [...new Set([...existingIcons, ...usedIcons])]
            const newImport = `import { ${allIcons.join(', ')} } from 'lucide-react'`
            prepared = prepared.replace(/import\s*\{[^}]+\}\s*from\s*['"]lucide-react['"]/, newImport)
          }
        } else {
          // Add new lucide import after 'use client'
          const lucideImport = `import { ${usedIcons.join(', ')} } from 'lucide-react'`
          prepared = prepared.replace(
            /('use client'|'use client';|"use client"|"use client";)(\s*)/,
            `$1\n${lucideImport}\n`
          )
        }
      }
      
      // Add all required React imports if not present
      // Check if React is imported (single or double quotes)
      const hasReactImport = prepared.includes("from 'react'") || prepared.includes('from "react"')
      
      if (!hasReactImport) {
        // Add React imports after 'use client'
        // We look for the 'use client' directive and insert after it
        prepared = prepared.replace(
          /('use client'|'use client';|"use client"|"use client";)(\s+)/,
          "$1\nimport { useState, useEffect, useRef, useMemo, useCallback } from 'react'\n"
        )
      }
      
      // Ensure proper export default
      if (!prepared.includes('export default')) {
        prepared = prepared.replace(/function\s+\w+\s*\(/, 'function Component(')
        prepared = prepared + '\n\nexport default Component'
      }
      
      return prepared
    }
    
    // Add page files
    if (pages && pages.length > 0) {
      // Multi-page project - create a file for each page
      let hasRootPage = false
      
      pages.forEach((page: PageToDeploy) => {
        // Convert path to Next.js route
        // "/" -> "app/page.tsx"
        // "/about" -> "app/about/page.tsx"
        // "/contact" -> "app/contact/page.tsx"
        const filePath = page.path === '/' 
          ? 'app/page.tsx'
          : `app${page.path}/page.tsx`
        
        if (page.path === '/') hasRootPage = true
        
        files.push({
          file: filePath,
          data: preparePageCode(page.code)
        })
      })
      
      // If no root page, create a redirect to first page
      if (!hasRootPage && pages.length > 0) {
        const firstPagePath = pages[0].path
        files.push({
          file: 'app/page.tsx',
          data: `import { redirect } from 'next/navigation'

export default function Home() {
  redirect('${firstPagePath}')
}`
        })
      }
    } else {
      // Legacy single-page project
      files.push({
        file: 'app/page.tsx',
        data: preparePageCode(code)
      })
    }

    // Deploy to Vercel (HatchIt Sites team)
    const response = await fetch('https://api.vercel.com/v13/deployments?teamId=team_jFQEvL36dljJxRCn3ekJ9WdF', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: slug,
        files: files.map(f => ({
          file: f.file,
          data: Buffer.from(f.data).toString('base64'),
          encoding: 'base64'
        })),
        projectSettings: {
          framework: 'nextjs'
        },
        target: 'production',
        alias: [`${slug}.hatchit.dev`]
      })
    })

    const deployment = await response.json()

    if (!response.ok) {
      console.error('Vercel API error:', JSON.stringify(deployment, null, 2))
      console.error('Vercel API status:', response.status)
      console.error('Deployment slug:', slug)
      
      // If we have a projectId, save the error to the build record
      if (projectId) {
        try {
          const latestBuild = await getLatestBuild(projectId)
          if (latestBuild) {
            await updateBuildDeployStatus(latestBuild.id, 'failed', {
              error: deployment.error?.message || deployment.message || 'Vercel API error',
              logsUrl: `https://vercel.com/hatchitdev`
            })
          }
        } catch (e) {
          console.error('Failed to save error to build:', e)
        }
      }
      
      return NextResponse.json(
        { error: deployment.error?.message || deployment.message || 'Deployment failed' },
        { status: response.status }
      )
    }

    // Explicitly assign the alias to ensure it's set
    // The alias in deployment request sometimes doesn't work reliably
    const aliasUrl = `${slug}.hatchit.dev`
    try {
      const aliasResponse = await fetch(`https://api.vercel.com/v2/deployments/${deployment.id}/aliases?teamId=team_jFQEvL36dljJxRCn3ekJ9WdF`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alias: aliasUrl
        })
      })
      
      if (!aliasResponse.ok) {
        const aliasError = await aliasResponse.json()
        console.error('Failed to assign alias:', JSON.stringify(aliasError, null, 2))
        console.error('Alias URL attempted:', aliasUrl)
        console.error('Deployment ID:', deployment.id)
        // This is a critical issue - log it clearly
        console.error('⚠️ DOMAIN ALIAS FAILED - Site will be on .vercel.app instead of .hatchit.dev')
      } else {
        console.log(`✅ Alias ${aliasUrl} assigned to deployment ${deployment.id}`)
      }
    } catch (aliasErr) {
      console.error('Error assigning alias:', aliasErr)
    }

    // The deployed URL
    const url = `https://${slug}.hatchit.dev`

    // Store deployment in Supabase (builds table) if projectId provided
    // Track the deployment ID so we can check status and show errors properly
    if (projectId) {
      try {
        // Get the latest build for this project
        const latestBuild = await getLatestBuild(projectId)
        
        if (latestBuild) {
          // Update the build with deployed URL and deployment ID for tracking
          await updateBuildDeployment(latestBuild.id, url, deployment.id)
        }
        
        // Set deployed_slug so we know a deploy is in progress, but don't set status to 'deployed' yet
        // Status will be set to 'deployed' by /api/project/[id]/confirm-deploy after Vercel confirms
        await updateProjectDeploySlug(projectId, slug)
      } catch (err) {
        console.error('Failed to update Supabase with deployment:', err)
        // Don't fail - Clerk metadata is backup
      }
    }

    // Store the deployed project with code in Clerk metadata (backup/legacy)
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const existingDeployedProjects = (user.publicMetadata?.deployedProjects as DeployedProject[]) || []
      
      // Remove existing project with same slug if it exists, then add new one
      const updatedProjects = existingDeployedProjects.filter(p => p.slug !== slug)
      updatedProjects.push({
        slug,
        name: projectName || slug,
        code: pages && pages.length > 0 ? undefined : code,
        pages: pages && pages.length > 0 ? pages : undefined,
        deployedAt: new Date().toISOString()
      })

      await client.users.updateUser(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          deployedProjects: updatedProjects,
        },
      })
    } catch (err) {
      console.error('Failed to store deployed project in metadata:', err)
      // Don't fail the deployment if metadata update fails
    }
    
    // Track deployment
    await track('Site Deployed', { slug, isMultiPage: !!(pages && pages.length > 0) })
    
    return NextResponse.json({
      success: true,
      url,
      deploymentId: deployment.id
    })

  } catch (error) {
    console.error('Deploy error:', error)
    return NextResponse.json(
      { error: 'Deployment failed' },
      { status: 500 }
    )
  }
}