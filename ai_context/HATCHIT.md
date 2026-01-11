# HATCHIT - Complete Technical & Brand Reference
> Single source of truth for AI assistants and developers.  
> Last Updated: January 11, 2026

---

# PART 1: VISION & BRAND

## What HatchIt Is

AI-powered website builder. User describes what they want in plain English → Claude generates production-ready React + Tailwind code → User owns everything.

**Core Differentiator:** Full code ownership. Push to your GitHub. Deploy to your Vercel. Eject anytime. Not locked to our platform.

**Tagline:** "Describe it. Build it. Ship it."

**Elevator Pitch:** "Tell us what you want. We generate the code. You own it forever."

---

## Brand Identity

### The Name
"HatchIt" - things hatch into existence. The "It" is styled as a logo mark. No chicken mascots. No eggs. Just the concept of creation.

### Logo
- **LogoMark:** The stylized "It" - used as loading indicator, favicon, brand mark
- **Full Logo:** "Hatch" in text + the "It" mark
- Located: `components/Logo.tsx`, exports `LogoMark` and `Logo`

### Voice & Tone
| DO | DON'T |
|----|-------|
| Sparse, confident | Exclamation marks |
| Let actions speak | "Amazing!", "Revolutionary!" |
| Ownership emphasis | "Your AI companion" |
| Technical credibility | Vague marketing speak |
| Short sentences | Long feature dumps |

**Copy Examples:**
```
BAD:  "Your AI companion is ready to help manifest your digital vision!"
GOOD: "Ready."

BAD:  "Watch production-ready React materialize in real-time."
GOOD: "Describe it. Ship it. Own it."

BAD:  "Experience the magic of AI-powered website creation!"
GOOD: "Your code. Your repo. Your rules."
```

### Banned Words & Patterns
```
Manifest, Vision, Journey, Experience, Amazing, Revolutionary, Magic, 
Unleash, Empower, Seamless, Cutting-edge, Next-generation, Game-changing,
Best-in-class, World-class, State-of-the-art
```

Also banned:
- Pip mascot (archived in `components/Pip.tsx`)
- The Witness poetry feature (archived)
- Long feature lists in modals
- Gradient button backgrounds (except primary CTA)
- Generic "centered hero + gradient + 3 cards" layouts

---

## Design System

### Colors (Tailwind)
```css
/* Backgrounds */
bg-zinc-950      /* Page background - pure dark */
bg-zinc-900/30   /* Elevated surfaces */
bg-zinc-800/50   /* Cards, panels */

/* Borders */
border-zinc-800/60   /* Default borders */
border-zinc-700      /* Focused/hover borders */

/* Text */
text-white       /* Primary text */
text-zinc-400    /* Secondary text */
text-zinc-500    /* Tertiary/muted text */
text-zinc-600    /* Disabled text */

/* Emerald - ONLY for: */
text-emerald-500     /* CTAs, links, success states */
text-emerald-400     /* Hover states */
bg-emerald-500       /* Primary buttons */
bg-emerald-500/15    /* Button backgrounds (glass effect) */
border-emerald-500/40 /* CTA borders */
```

### Typography
```css
/* Headings */
font-sans font-semibold text-white  /* Inter by default */

/* Body */
font-sans text-zinc-400

/* Labels/Micro */
text-[10px] text-zinc-500 uppercase tracking-wider font-medium

/* Code/Status */
font-mono text-xs text-zinc-500
```

### Spacing Philosophy
- Generous whitespace
- `p-4` minimum for cards
- `space-y-6` for section content
- Mobile padding: `px-4`, Desktop: `px-6` or `px-8`

### Animation (Framer Motion)
```tsx
// Loading state - ONLY pattern
<motion.div 
  animate={{ opacity: [0.5, 1, 0.5] }} 
  transition={{ duration: 2, repeat: Infinity }}
>
  <LogoMark size={32} />
</motion.div>

// Page/Modal entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Exit
exit={{ opacity: 0, y: 10 }}
```

### Component Patterns

**Buttons:**
```tsx
// Primary CTA
className="px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/40 
           hover:bg-emerald-500/20 hover:border-emerald-500/50 
           text-white font-medium text-sm rounded-xl transition-all 
           shadow-[0_0_15px_rgba(16,185,129,0.15)]"

// Secondary
className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 
           text-zinc-200 font-medium text-sm rounded-xl transition-colors"

// Ghost/Text
className="text-sm text-zinc-400 hover:text-white transition-colors"
```

**Cards:**
```tsx
className="p-4 bg-zinc-900/50 border border-zinc-800/60 rounded-xl"
```

**Inputs:**
```tsx
className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl
           text-white placeholder-zinc-500 
           focus:outline-none focus:border-emerald-500/50 
           focus:ring-1 focus:ring-emerald-500/20"
```

---

# PART 2: USER JOURNEY

## Entry Points

### 1. Homepage (`/`)
**Component:** `app/page.tsx` + `HomepageWelcome.tsx`

**Flow:**
```
User lands on homepage
    ↓
First visit? → HomepageWelcome modal appears
    ↓
Modal shows: Logo, "Describe it. Build it. Ship it.", feature bullets
    ↓
User clicks "Start Building"
    ↓
Signed in? → /builder
Not signed in? → /demo
```

**Welcome Modal Logic:**
- Checks `localStorage.getItem('hatch_homepage_welcome_seen')`
- Shows once per device
- Detects cached work: shows "Resume" if user has previous session
- Signed-in users: links to `/builder?project=<id>`
- Guests: links to `/demo`

### 2. Demo Mode (`/demo`)
**Component:** `app/demo/page.tsx` + `DemoWelcome.tsx` + `BuildFlowController`

**What it is:** Full builder experience with localStorage persistence. No account needed.

**Flow:**
```
User hits /demo
    ↓
Auth check: signed in? → Redirect to /builder
    ↓
First visit? → DemoWelcome modal: "Sandbox Mode"
    ↓
BuildFlowController loads with isDemo=true
    ↓
User builds sections → Saved to localStorage (key: hatch_preview_*)
    ↓
User tries to Ship → HatchModal paywall appears
    ↓
"Sign up to deploy" → /sign-up → Returns to /builder with project migrated
```

**Demo Limitations:**
- 1 project (hero section only initially)
- Cannot deploy, export ZIP, or push to GitHub
- Work persists in localStorage (24hr expiry)
- Premium features show upgrade prompts

### 3. Builder (`/builder`)
**Component:** `app/builder/page.tsx` + `BuilderWelcome.tsx` + `BuildFlowController`

**What it is:** Authenticated builder with cloud sync.

**Flow:**
```
User hits /builder
    ↓
Auth check: not signed in? → Redirect to /demo
    ↓
Check URL params: ?project=<id> → Load existing project
No project param? → Show project selector or create new
    ↓
First visit? → BuilderWelcome modal: "Welcome back, [Name]"
    ↓
BuildFlowController loads with isDemo=false
    ↓
All changes sync to Supabase
```

---

## The Builder Experience

### Layout (Desktop)
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back                                              1/3   Ship ▼│  ← Top bar
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│ SECTIONS    │              BUILDING                             │
│ 0/3 built   │           Header/Navigation                       │
│             │                                                   │
│ • Header    │  ┌─────────────────────────────────────────────┐  │
│   ○ Hero    │  │  [Prompt input................................] │ Build │  │
│   ○ Footer  │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│ + Add Section │          Try: "Dark nav with glass effect..."   │
│             │                                                   │
│ AI TOOLS    │          ● Claude Sonnet 4.5 · React 19 · Tailwind│
│ □ AI Help   │                                                   │
│             │  ┌─ Live Preview ─────────────────────────────┐   │
│ ● Auto-fix  │  │                                             │   │
│             │  │         Build a section to see preview      │   │
│ Design      │  │                                             │   │
│ Settings    │  └─────────────────────────────────────────────┘   │
└─────────────┴───────────────────────────────────────────────────┘
```

### Layout (Mobile - 90% of traffic!)
```
┌─────────────────────────────────┐
│ ←              1/3         Ship │
├─────────────────────────────────┤
│  [  Build  ] [  Preview  ●  ]   │  ← Tab switcher
├─────────────────────────────────┤
│                                 │
│         BUILDING                │
│      Header/Navigation          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Prompt input............... │ │
│ │                      [Build]│ │
│ └─────────────────────────────┘ │
│                                 │
│ Try: "Dark nav with glass..."  │
│                                 │
│  ● Claude Sonnet 4.5           │
│                                 │
└─────────────────────────────────┘
```

### Key UI Elements

**Tab Switcher (Mobile):**
- Build tab: Prompt input, section list
- Preview tab: Live iframe preview
- Green dot on Preview when content exists
- Active state: `bg-white text-black`

**Prompt Input:**
- Minimum 10 characters to enable Build button
- Typewriter animation below shows context-aware suggestions
- "Try: 'Dark gradient hero with bold headline left, 3D mockup right'"
- Suggestions cycle every 4 seconds

**Section List (Sidebar):**
- Shows all sections for current page
- Blue dot: Selected/current
- Green dot: Completed
- Gray dot: Not started
- Drag to reorder (desktop only)

**Ship Dropdown:**
```
┌─────────────────────────────┐
│ 🚀 Deploy to HatchIt        │  → Creates hatchit.dev subdomain
│ 🐙 Push to GitHub           │  → OAuth flow, creates repo, pushes full Next.js
│ 📦 Download ZIP             │  → Full source code, ready to run
│ 🌐 Custom Domain            │  → Visionary+ only, connects user's domain
└─────────────────────────────┘
```

---

## Build Flow State Machine

```
                    ┌──────────────┐
                    │    INPUT     │  User entering prompt
                    │  (no code)   │
                    └──────┬───────┘
                           │ User clicks "Build"
                           ▼
                    ┌──────────────┐
                    │  GENERATING  │  Claude streaming code
                    │              │  Shows: glow ring, progress dots
                    └──────┬───────┘
                           │ Stream complete
                           ▼
                    ┌──────────────┐
                    │   COMPLETE   │  Code ready, preview showing
                    │              │  Shows: AI understood summary
                    └──────┬───────┘
                           │ User enters refinement
                           ▼
                    ┌──────────────┐
                    │   REFINING   │  Claude making changes
                    │              │  Previous code visible
                    └──────────────┘
```

### Build Stages (code)
```typescript
type BuildStage = 'input' | 'generating' | 'complete' | 'refining'

// State in BuildFlowController
const [buildState, setBuildState] = useState<{
  currentStage: BuildStage
  sectionCode: Record<string, string>  // sectionId → generated code
  completedSections: string[]           // array of sectionIds
  error: string | null
}>
```

---

## Section Generation

### API Route: `/api/build-section`
**Model:** Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)

**Request:**
```typescript
{
  projectId: string,
  sectionId: string,
  sectionType: 'header' | 'hero' | 'features' | 'pricing' | etc,
  sectionName: string,
  sectionDescription: string,
  userPrompt: string,
  previousSections: Record<string, string>,  // For style consistency
  brandConfig: {
    brandName: string,
    colors: { primary, secondary, accent },
    fontStyle: 'modern' | 'classic' | 'playful' | 'technical',
    styleVibe: 'professional' | 'creative' | 'minimal' | 'bold' | 'elegant' | 'friendly'
  }
}
```

**Response:**
```typescript
{
  code: string,      // Full React component
  reasoning: string  // AI's design choices explanation
}
```

### System Prompt Structure
1. **Role:** "You are The Architect. You build high-quality, production-ready React components."
2. **Component Reference:** Section-specific patterns from `lib/components.ts`
3. **Tech Stack:** React 19, Tailwind 4, Lucide, Framer Motion, Next/Image
4. **Brand Config:** User's colors, fonts, vibe
5. **Chronosphere (Style DNA):** User's learned preferences from past builds
6. **Previous Sections:** Code snippets for visual consistency
7. **Forbidden Elements:** Per section type (e.g., hero can't include pricing table)
8. **Sparse Input Detection:** If prompt is vague, Claude invents compelling content

### Sparse Input Handling
**Detection Logic:**
```typescript
const lowEffortKeywords = ['test', 'testing', 'demo', 'example', 'sample', 
  'website', 'site', 'page', 'something', 'anything', 'stuff', 'thing', 
  'cool', 'nice', 'good', 'idk', 'dunno', 'whatever']

const isSparseInput = userPrompt.length < 30 || 
  (userPrompt.split(/\s+/).length < 5 && containsLowEffort)
```

When detected, Claude receives:
```
## CRITICAL: LOW-EFFORT INPUT DETECTED
DO NOT create something bland or generic. Instead:
1. Pick ONE compelling use case: A luxury travel agency, a cutting-edge AI startup, 
   a boutique design studio, or a high-end restaurant.
2. INVENT specific, premium content: Company name, specific services, 
   real-sounding testimonials, concrete pricing.
3. Make it look like a $10,000 custom website - not a template.
4. Use SPECIFIC text, not "Lorem ipsum" or "[Your Text Here]".
```

### Rate Limiting
- **Limit:** 20 requests per minute per user
- **Key:** userId for authenticated, IP address for guests
- **Response:** 429 with "Rate limit exceeded. Maximum 20 requests per minute."

### Output Format
Claude returns JSON:
```json
{
  "code": "// Full React component code",
  "reasoning": "I chose a grid layout because..."
}
```

**Response Parsing (3 fallback strategies):**
1. Direct JSON parse (clean markdown blocks first)
2. Extract JSON from ```json code blocks
3. Extract raw code from ```tsx blocks or detect `export default function`

### Design Philosophy (in system prompt)
```
- "God is in the details." - Mies van der Rohe
- Make it feel expensive.
- Use subtle animations (fade-in, slide-up) with Framer Motion.
- Ensure high contrast and readability.
- AVOID: Generic centered hero + gradient background + 3 cards layout
```

### Section Type Constraints
Each section type has forbidden elements to prevent scope creep:
```typescript
const forbiddenBySectionType = {
  header: ['hero banner', 'pricing table', 'testimonials', 'footer', 'contact form', 'services grid', 'team section', 'FAQ accordion'],
  hero: ['navigation menu', 'footer', 'pricing table', 'testimonials', 'contact form', 'FAQ accordion', 'team section'],
  services: ['navigation', 'hero banner', 'footer', 'pricing table', 'contact form', 'testimonials'],
  features: ['navigation', 'hero banner', 'footer', 'pricing table', 'contact form', 'testimonials'],
  pricing: ['navigation', 'hero banner', 'footer', 'contact form', 'testimonials', 'services grid'],
  testimonials: ['navigation', 'hero banner', 'footer', 'pricing table', 'contact form', 'services grid'],
  contact: ['navigation', 'hero banner', 'footer', 'pricing table', 'testimonials', 'services grid'],
  footer: ['navigation menu', 'hero banner', 'pricing table', 'testimonials', 'contact form', 'services grid'],
  about: ['navigation', 'footer', 'pricing table', 'contact form'],
  team: ['navigation', 'footer', 'pricing table', 'contact form', 'hero banner'],
  faq: ['navigation', 'footer', 'pricing table', 'hero banner', 'services grid'],
  cta: ['navigation', 'footer', 'full pricing table', 'testimonials grid', 'services grid'],
  gallery: ['navigation', 'footer', 'pricing table', 'contact form', 'hero banner'],
}
```

### Component Library Reference
Claude receives section-specific component patterns from `lib/components.ts`:
```typescript
// Mapped by section type:
hero     → heroes.variants + buttons.variants
header   → navs.variants
features → features.variants + cards.variants
pricing  → pricing.variants
testimonials → testimonials.variants
footer   → footers.variants
contact/cta → ctas.variants + forms.variants
default  → cards.variants
```

### Demo Project Bypass
Projects with IDs starting with `demo-` skip:
- Project ownership verification
- Database saves
- User generation limits

---

## Refinement Flow

### API Route: `/api/refine-section`
**Model:** Claude Sonnet 4.5

**Request:**
```typescript
{
  projectId: string,
  sectionId: string,
  currentCode: string,      // Existing generated code
  userPrompt: string,       // "Make it darker", "Add more spacing"
  brandConfig: BrandConfig
}
```

**How it works:**
1. User types refinement in the input bar after section is complete
2. Claude receives current code + change request
3. Returns modified code preserving structure
4. Preview updates immediately

---

## Preview System

### Live Preview (`components/SectionPreview.tsx`)
- Renders generated code in sandboxed iframe
- Uses srcdoc with inline Tailwind CDN
- Updates in real-time as code streams

### Full Site Preview (`components/builder/FullSitePreviewFrame.tsx`)
- Combines all sections into single preview
- Device modes: Mobile (375px), Tablet (768px), Desktop (100%)
- Edit mode: Tap (mobile) or double-click (desktop) text to edit inline (contentEditable)

### TypeScript Stripping
Generated code may include TypeScript annotations that break the preview:
```typescript
// Stripped from preview iframe:
: string
: number
: boolean
as any
as const
```
Regex in FullSitePreviewFrame handles this.

### Lucide Icon Handling
Claude sometimes imports non-existent Lucide components. Blocklist:
```typescript
const nonIconComponents = [
  'AnimatePresence', 'Image', 'Link', 'Component', 'Fragment',
  'Icon', 'Icons', 'Button', 'Card', 'Section', 'Header', 'Footer',
  'Nav', 'Main', 'Div', 'Span', 'Container', 'Wrapper', 'Box',
  'Text', 'Title', 'Input', 'Form', 'Label', 'Modal', 'Dialog'
]
```

---

## Ship/Deploy Flow

### Deploy to HatchIt
```
User clicks "Deploy to HatchIt"
    ↓
All section code combined into single page.tsx
    ↓
POST /api/deploy with wrapped code
    ↓
Vercel API creates deployment to hatchit.dev
    ↓
2-second delay → Redirect to /dashboard/projects/[id]?deployed=true&deploymentId=xxx
    ↓
Project page polls /api/deploy/status every 4s
    ↓
Status banner: "Building..." → "Live at [url]" or "Failed: [error]"
```

### Push to GitHub
```
User clicks "Push to GitHub"
    ↓
Not connected? → OAuth flow via /api/github/auth
    ↓
Connected? → POST /api/github/push
    ↓
Creates new repo: hatchit-[project-slug]
    ↓
Pushes full Next.js project (scaffold from lib/scaffold.ts)
    ↓
Success → Shows repo URL, clone instructions
```

### Download ZIP
```
User clicks "Download ZIP"
    ↓
POST /api/export
    ↓
Server generates full Next.js project
    ↓
Returns ZIP blob
    ↓
Browser downloads: [project-name].zip
```

### Custom Domain (Visionary+)
```
User clicks "Custom Domain"
    ↓
POST /api/domain
    ↓
Returns DNS instructions (CNAME to hatchit.dev)
    ↓
User configures DNS
    ↓
Domain verifies → SSL provisioned
```

---

# PART 3: ARCHITECTURE

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.1.1 |
| React | React | 19.2.3 |
| Styling | Tailwind CSS | 4.1.18 |
| Animation | Framer Motion | 12.x |
| Auth | Clerk | Latest |
| Database | Supabase (Postgres) | Latest |
| Payments | Stripe | Latest |
| AI (Generation) | Claude Sonnet 4.5 | claude-sonnet-4-5-20250929 |
| AI (Refiner) | Claude Opus 4 | claude-opus-4-20250514 |
| AI (Replicator) | Gemini 2.0 Flash | Latest |
| Hosting | Vercel | Latest |

## File Structure

```
HatchIt/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout (Clerk, analytics)
│   ├── globals.css                 # Global styles
│   ├── demo/page.tsx               # Guest sandbox
│   ├── builder/page.tsx            # Auth builder
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard home
│   │   ├── projects/
│   │   │   ├── page.tsx            # Project list
│   │   │   ├── new/page.tsx        # 5-step wizard
│   │   │   └── [id]/page.tsx       # Project detail
│   │   └── billing/page.tsx        # Subscription management
│   ├── api/
│   │   ├── build-section/route.ts  # Claude generation
│   │   ├── refine-section/route.ts # Claude refinement
│   │   ├── assistant/route.ts      # AI Help chat
│   │   ├── deploy/route.ts         # Vercel deployment
│   │   ├── deploy/status/route.ts  # Deployment polling
│   │   ├── export/route.ts         # ZIP download
│   │   ├── github/                 # GitHub OAuth + push
│   │   ├── project/                # Project CRUD
│   │   ├── checkout/route.ts       # Stripe checkout
│   │   └── webhook/route.ts        # Stripe webhooks
│   └── [marketing pages]/          # /features, /pricing, /faq, etc.
│
├── components/
│   ├── BuildFlowController.tsx     # Main builder orchestrator (~2500 lines)
│   ├── SectionBuilder.tsx          # Generation UI (~2000 lines)
│   ├── SectionPreview.tsx          # Live iframe preview
│   ├── HomepageWelcome.tsx         # Homepage modal
│   ├── DemoWelcome.tsx             # Demo modal
│   ├── BuilderWelcome.tsx          # Builder modal
│   ├── HatchModal.tsx              # Paywall modal
│   ├── Logo.tsx                    # LogoMark and Logo
│   ├── Navigation.tsx              # Site navigation
│   ├── Footer.tsx                  # Site footer
│   ├── builder/
│   │   ├── LiveSidebar.tsx         # Section list, AI tools
│   │   ├── FullSitePreviewFrame.tsx# Full site preview
│   │   ├── HatchModal.tsx          # AI Help assistant modal
│   │   └── GeneratingModal.tsx     # Generation progress
│   └── singularity/                # UI kit
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── LogoMark.tsx
│
├── lib/
│   ├── supabase.ts                 # DB client + types
│   ├── components.ts               # AI component library
│   ├── templates.ts                # Site templates
│   ├── scaffold.ts                 # Project scaffolding for export
│   ├── chronosphere.ts             # User style DNA
│   └── db/                         # DB operations
│
├── hooks/
│   ├── useProjects.ts              # Project CRUD hook
│   └── useGitHub.ts                # GitHub integration hook
│
├── contexts/
│   └── SubscriptionContext.tsx     # User tier state
│
├── types/
│   ├── builder.ts                  # Builder types
│   └── subscriptions.ts            # Tier types
│
└── ai_context/
    └── HATCHIT.md                  # This file
```

## Database Schema (Supabase)

### Tables

**users**
```sql
id            UUID PRIMARY KEY
clerk_id      TEXT UNIQUE NOT NULL
email         TEXT
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

**projects**
```sql
id            UUID PRIMARY KEY
user_id       TEXT REFERENCES users(clerk_id)
name          TEXT NOT NULL
slug          TEXT UNIQUE
description   TEXT
template_id   TEXT
brand_config  JSONB
status        TEXT DEFAULT 'draft'
deployed_url  TEXT
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

**sections**
```sql
id            UUID PRIMARY KEY
project_id    UUID REFERENCES projects(id)
section_type  TEXT NOT NULL
section_name  TEXT
code          TEXT
prompt        TEXT
order_index   INTEGER
page_path     TEXT DEFAULT '/'
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

**subscriptions**
```sql
id                    UUID PRIMARY KEY
user_id               TEXT REFERENCES users(clerk_id)
stripe_customer_id    TEXT
stripe_subscription_id TEXT
tier                  TEXT DEFAULT 'free'
status                TEXT
current_period_end    TIMESTAMP
created_at            TIMESTAMP
```

---

## API Routes Reference

### AI Generation
| Route | Method | Model | Purpose |
|-------|--------|-------|---------|
| `/api/build-section` | POST | Claude Sonnet 4.5 | Generate section code |
| `/api/refine-section` | POST | Claude Opus 4 | Refine code + conversational help |
| `/api/audit` | POST | Claude Sonnet 4.5 | Quality check (Visionary+) |
| `/api/replicator` | POST | Gemini 2.0 Flash | Clone URL (Singularity) |
| `/api/prompt-helper` | POST | Gemini 2.0 Flash | Enhance prompts |

### Deploy & Export
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/deploy` | POST | Deploy to Vercel |
| `/api/deploy/status` | GET | Check deployment status |
| `/api/export` | POST | Download ZIP |
| `/api/domain` | POST/GET | Custom domain management |

### GitHub
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/github/auth` | GET | Initiate OAuth |
| `/api/github/callback` | GET | OAuth callback |
| `/api/github/push` | POST | Create repo + push |
| `/api/github/status` | GET | Connection status |
| `/api/github/disconnect` | POST | Remove connection |

### Project & User
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/project` | GET/POST | List/Create projects |
| `/api/project/[id]` | GET/PUT/DELETE | Single project |
| `/api/project/[id]/sections` | GET/POST | Section management |
| `/api/checkout` | POST | Stripe checkout session |
| `/api/subscription/sync` | POST | Sync subscription status |
| `/api/webhook` | POST | Stripe webhooks |

---

# PART 4: SUBSCRIPTION TIERS

## Tier Matrix

| Feature | Free | Architect ($19/mo) | Visionary ($49/mo) | Singularity ($199/mo) |
|---------|------|--------------------|--------------------|----------------------|
| AI Generations | Unlimited | Unlimited | Unlimited | Unlimited |
| Live Preview | ✅ | ✅ | ✅ | ✅ |
| Projects | 1 | 3 | Unlimited | Unlimited |
| Deploy to HatchIt | ❌ | ✅ | ✅ | ✅ |
| ZIP Export | ❌ | ✅ | ✅ | ✅ |
| Push to GitHub | ❌ | ✅ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ | ✅ |
| Remove Branding | ❌ | ❌ | ✅ | ✅ |
| The Auditor | ❌ | ❌ | ✅ | ✅ |
| The Healer | ❌ | ❌ | ✅ | ✅ |
| The Replicator | ❌ | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |

## Feature Descriptions

**The Auditor (Visionary+):**
AI quality check that reviews generated code for accessibility, performance, mobile responsiveness, and design consistency. Returns scores and auto-fixes issues.

**The Healer (Visionary+):**
Auto-fix runtime errors. When preview fails, Claude Haiku analyzes the error and regenerates the failing section automatically. Indicator shows in sidebar: "● Auto-fix enabled"

**The Replicator (Singularity):**
Clone any public website by URL. Gemini 2.0 Flash analyzes the page and generates matching React components. For agencies rebuilding client sites.

---

# PART 5: COMPONENT DEEP DIVES

## BuildFlowController.tsx (~2500 lines)
**Location:** `components/BuildFlowController.tsx`

The main orchestrator. Manages:
- Project state (sections, code, build status)
- Demo vs authenticated mode
- Section selection and navigation
- Preview device switching
- Ship dropdown actions
- AI tool modals

**Key State:**
```typescript
const [project, setProject] = useState<DbProject | null>(null)
const [sections, setSections] = useState<Section[]>([])
const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
const [buildState, setBuildState] = useState<BuildState>({
  currentStage: 'input',
  sectionCode: {},
  completedSections: [],
  error: null
})
const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
const [demoMode, setDemoMode] = useState(isDemo)
```

**Props:**
```typescript
interface BuildFlowControllerProps {
  existingProjectId?: string
  initialPrompt?: string
  isDemo?: boolean
}
```

## SectionBuilder.tsx (~2000 lines)
**Location:** `components/SectionBuilder.tsx`

Handles the generation UI:
- Prompt input with typewriter suggestions
- Generation progress animation
- AI understood summary
- Refinement input
- Error display

**Typewriter Suggestions:**
Context-aware suggestions based on section type:
```typescript
const suggestions: Record<string, string[]> = {
  'Header': [
    'Minimal dark nav with logo left, links right, glass effect on scroll',
    'Transparent header with centered logo and hamburger menu',
    ...
  ],
  'Hero': [
    'Dark gradient hero with bold headline left, 3D mockup right',
    'Full-screen hero with centered text, animated gradient mesh',
    ...
  ],
  // etc for each section type
}
```

## LiveSidebar.tsx
**Location:** `components/builder/LiveSidebar.tsx`

The left panel showing:
- Section list with completion status
- Add Section button
- AI Tools section (AI Help)
- Auto-fix indicator (Visionary+)
- Design Controls (collapsed by default)
- Settings link

## AI Help Modal
**Location:** `components/builder/HatchModal.tsx`

The AI assistant accessible from sidebar:
- Clean intro: "How can I help?"
- Quick actions: Ideas, Fix issue, Style tips, Enhance
- Chat interface with Claude Haiku 4.5
- "Use as prompt" button to apply suggestions
- HatchIt-aware system prompt (won't suggest leaving HatchIt)

---

# PART 6: MOBILE CONSIDERATIONS

**90% of traffic is mobile.** Every feature must work on touch.

## Mobile Patterns

**Touch Targets:**
- Minimum `py-3.5` for buttons (was `py-2`)
- Active states: `active:bg-*` for immediate feedback
- No hover-only interactions

**Tab Switcher:**
```tsx
// Build | Preview tabs
<button className={`px-4 py-2 rounded-lg ${
  activeTab === 'build' 
    ? 'bg-white text-black' 
    : 'text-zinc-400'
}`}>
```

**Scrollable Areas:**
```tsx
className="-mx-1 px-1 overflow-x-auto scrollbar-hide"
```

**Full-width Inputs:**
```tsx
className="w-full px-4 py-4 ..."  // py-4 not py-3 on mobile
```

## Responsive Breakpoints
```css
/* Mobile first */
@media (min-width: 640px) { /* sm: */ }
@media (min-width: 1024px) { /* lg: Desktop layout splits */ }
@media (min-width: 1280px) { /* xl: Sidebar always visible */ }
```

---

# PART 7: ENVIRONMENT VARIABLES

```env
# AI
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ARCHITECT_PRICE_ID=price_...
STRIPE_VISIONARY_PRICE_ID=price_...
STRIPE_SINGULARITY_PRICE_ID=price_...

# Vercel (for deployments)
VERCEL_TOKEN=...
VERCEL_TEAM_ID=team_...

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23...
GITHUB_CLIENT_SECRET=...

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

---

# PART 8: WHAT'S SHIPPED

As of January 11, 2026:

- ✅ Full AI generation pipeline (Claude Sonnet 4.5)
- ✅ AI Help assistant (Claude Haiku 4.5)
- ✅ Typewriter prompt suggestions (context-aware)
- ✅ AI understood summary post-generation
- ✅ 5-step new project wizard
- ✅ Multi-page site support
- ✅ Device preview toggle (mobile/tablet/desktop)
- ✅ Ship dropdown (Deploy, GitHub, ZIP, Custom Domain)
- ✅ GitHub integration (OAuth + push)
- ✅ Vercel deployment (hatchit.dev subdomains)
- ✅ Deployment status polling
- ✅ ZIP export with full Next.js project
- ✅ Self-Healing auto-fix (Visionary+)
- ✅ Self-healing indicator in sidebar
- ✅ Auditor quality check (Visionary+)
- ✅ Replicator URL cloning (Singularity)
- ✅ Stripe subscriptions (3 paid tiers)
- ✅ Custom domains (Visionary+)
- ✅ Text editing in preview (tap on mobile, double-click on desktop)
- ✅ TypeScript stripping for preview
- ✅ Mobile-optimized builder

---

# PART 9: WHAT'S NEXT

See `/app/roadmap/page.tsx` for public roadmap.

**Priority Items:**
- Component library (save/reuse sections)
- Team collaboration
- E-commerce templates
- CMS integration
- Version history

---

# PART 10: TROUBLESHOOTING

## Common Issues

**Preview not showing:**
- Section still generating (wait for green checkmark)
- TypeScript syntax in code (should be auto-stripped)
- Invalid Lucide import (check blocklist)

**Black screen in preview:**
- Complex code with unstripped TypeScript
- Solution: Regenerate with simpler prompt

**Deploy fails:**
- Invalid Lucide imports (Icon, Button, Card, etc.)
- TypeScript annotations not stripped
- Check Vercel logs via /api/deploy/status

**GitHub push fails:**
- OAuth expired → Reconnect
- Repo name conflict → Will create unique name

**Stripe subscription not showing:**
- Webhook not received → Check webhook logs
- Clerk metadata not synced → Call /api/subscription/sync

---

# PART 11: THE 5-STEP WIZARD

Located at `/app/dashboard/projects/new/page.tsx`

### Step 1: What's Your Site?
**Purpose:** Project naming and type selection

**Fields:**
- Project name (text input)
- Site type dropdown: Landing Page, Portfolio, Blog, E-commerce, SaaS, Agency, Other

**Validation:**
- Name required, 3-50 characters
- Type selection required

### Step 2: Brand Identity
**Purpose:** Core brand configuration

**Fields:**
- Brand name (if different from project)
- Color scheme: Primary, Secondary, Accent (hex pickers)
- Font style: Modern, Classic, Playful, Technical
- Style vibe: Professional, Creative, Minimal, Bold, Elegant, Friendly

**Defaults:**
- Primary: `#10B981` (emerald-500)
- Secondary: `#1E293B` (slate-800)
- Accent: `#F59E0B` (amber-500)

### Step 3: Pages Structure
**Purpose:** Define site pages and sections

**Default Pages:**
```typescript
[
  { name: 'Home', path: '/', sections: ['header', 'hero', 'features', 'cta', 'footer'] },
]
```

**Section Types:**
- header, hero, features, pricing, testimonials, faq, cta, footer, about, contact, gallery, team, stats, portfolio, blog, timeline

**UI:**
- Add/remove pages
- Drag to reorder sections
- Section type selector dropdown

### Step 4: Content Direction
**Purpose:** Brief for AI generation

**Fields:**
- Target audience (text)
- Key message (textarea)
- Competitor examples (optional URL list)
- Content tone: Professional, Friendly, Casual, Authoritative, Playful

**Example prompts:**
```
Target: "Tech-savvy entrepreneurs aged 25-45"
Message: "Ship faster with AI. Own your code."
Competitors: "framer.com, webflow.com"
```

### Step 5: Review & Create
**Purpose:** Confirmation before project creation

**Shows:**
- All selections from steps 1-4
- Estimated section count
- "Edit" buttons to go back

**On Submit:**
1. POST to `/api/project` with full config
2. Creates project in Supabase
3. Creates all sections (empty code)
4. Redirects to `/builder?project=[id]`

---

# PART 12: DO'S AND DON'TS

## DO

**Code Generation:**
- Generate complete, runnable React components
- Use only Tailwind classes (no custom CSS)
- Include all imports at the top
- Use Lucide icons only (verified from lucide-react)
- Make everything responsive (mobile-first)
- Generate specific, compelling copy (not placeholder)

**UI Design:**
- Generous whitespace
- High contrast text (white on dark)
- Emerald accent sparingly
- Subtle animations (opacity, translate)
- Touch-friendly targets on mobile
- Glass effects with backdrop-blur

**Copy Writing:**
- Short, punchy sentences
- Action verbs
- Technical credibility
- Ownership emphasis
- Sparse punctuation (no !)

## DON'T

**Code Generation:**
- Don't include TypeScript types in component output
- Don't import from non-existent packages
- Don't use CSS modules or styled-components
- Don't hardcode dimensions (use Tailwind responsive)
- Don't use Lorem ipsum (invent real content)

**UI Design:**
- Don't use gradient backgrounds except for special effects
- Don't make buttons too small (min 44px touch target)
- Don't hide essential features behind hover states
- Don't use multiple accent colors
- Don't overuse animation

**Copy Writing:**
- Don't use banned words (manifest, journey, etc.)
- Don't use exclamation marks
- Don't make vague promises
- Don't oversell features
- Don't use jargon without explanation

---

# PART 13: KEY BUSINESS METRICS

As of January 2026:
- **API costs:** ~$300/month metered usage
- **Subscriptions:** ~$43/month recurring
- **Traffic split:** 90% mobile, 10% desktop
- **Primary conversion path:** Demo → Sign up → Architect tier

---

# PART 14: AUTHENTICATION FLOW

## Clerk Integration

**Protected Routes:**
- `/dashboard/*` - Requires auth
- `/builder` - Requires auth (redirects to `/demo` if not)
- `/api/project/*` - Requires auth header

**Public Routes:**
- `/` - Homepage
- `/demo` - Guest sandbox
- `/features`, `/pricing`, `/faq`, etc. - Marketing pages

**Auth Components:**
```tsx
// Root layout includes ClerkProvider
<ClerkProvider>
  {children}
</ClerkProvider>

// Protected pages use middleware
// middleware.ts
export default clerkMiddleware()

// Sign in/up pages at:
/sign-in
/sign-up

// After auth, user synced to Supabase via:
/api/auth/sync
```

**User Sync:**
When user signs in:
1. Clerk webhook fires
2. `/api/webhook/clerk` receives event
3. Upserts user to Supabase `users` table
4. Links `clerk_id` to internal user

---

# PART 15: LOCALSTORAGE KEYS

Used for persistence and state:

| Key | Purpose | Scope |
|-----|---------|-------|
| `hatch_homepage_welcome_seen` | Skip homepage modal | Permanent |
| `hatch_demo_welcome_seen` | Skip demo modal | Session only |
| `hatch_builder_welcome_seen` | Skip builder modal | Permanent |
| `hatch_preview_*` | Demo mode code storage | 24hr expiry |
| `hatch_project_cache` | Project state backup | Session |
| `hatch_github_pending_push` | Resume after OAuth | Short-lived |

---

# PART 16: ERROR HANDLING

## User-Facing Errors

**Generation Errors:**
```tsx
// Shown inline in SectionBuilder
<div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
  <p className="text-red-400">Generation failed. Try a simpler prompt.</p>
  <button>Retry</button>
</div>
```

**Deployment Errors:**
- Shown in deployment status banner
- "Deployment failed: [reason]"
- Link to retry

**Preview Errors:**
- Self-Healing (Visionary+) auto-retries
- Shows "Fixing..." indicator
- Falls back to error display if unfixable

## API Error Responses

Standard format:
```typescript
// 4xx/5xx responses
{
  error: string,
  code?: string,
  details?: any
}

// Success responses
{
  success: true,
  data: any
}
```

---

# PART 17: TESTING CHECKLIST

Before shipping any change:

**Functional:**
- [ ] Demo mode works without auth
- [ ] Builder loads with existing project
- [ ] Generation produces valid code
- [ ] Preview renders generated code
- [ ] Refinement modifies code correctly
- [ ] Ship dropdown all options work
- [ ] Mobile layout doesn't break

**Visual:**
- [ ] Dark theme consistent
- [ ] Emerald accent used correctly
- [ ] No UI overflow on mobile
- [ ] Touch targets large enough
- [ ] Loading states show LogoMark

**Performance:**
- [ ] Build completes without TypeScript errors
- [ ] No console errors in production
- [ ] Lighthouse mobile score > 80

---

*End of comprehensive HatchIt reference.*
*Total sections: 17*
*Last updated: January 11, 2026*
