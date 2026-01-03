'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Bot, Brain, Cpu, Globe, Shield, Terminal, Zap, Copy, Plus, ArrowRight, Layout, ExternalLink, Edit3, Trash2, X, Rocket, Sparkles, Code2, HelpCircle } from 'lucide-react'
import ReplicatorModal from '@/components/ReplicatorModal'
import { useRouter } from 'next/navigation'
import { useProjects } from '@/hooks/useProjects'
import Link from 'next/link'

// =============================================================================
// WELCOME BANNER - Explains what HatchIt does for new users
// =============================================================================
function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6 md:p-8 mb-8 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <button 
        onClick={onDismiss}
        className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Welcome to HatchIt 👋</h2>
        </div>
        
        <p className="text-zinc-300 mb-6 max-w-2xl leading-relaxed">
          <strong className="text-white">Build websites with AI in minutes.</strong> Describe what you want in plain English, and our AI builds it for you — no coding required.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="p-1.5 bg-blue-500/10 rounded-lg shrink-0">
              <Code2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-1">1. Describe</h3>
              <p className="text-xs text-zinc-400">Tell AI what you want to build</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="p-1.5 bg-purple-500/10 rounded-lg shrink-0">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-1">2. Generate</h3>
              <p className="text-xs text-zinc-400">AI creates your website instantly</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg shrink-0">
              <Rocket className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-1">3. Deploy</h3>
              <p className="text-xs text-zinc-400">Go live with one click</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            href="/builder"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Start Building
          </Link>
          <button
            onClick={onDismiss}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all text-sm border border-zinc-700"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function AgencyDashboard() {
  const [systemLoad, setSystemLoad] = useState(0)
  const [activeAgents, setActiveAgents] = useState(0)
  const [showReplicator, setShowReplicator] = useState(false)
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const router = useRouter()
  const { projects, deleteProject } = useProjects()
  const [projectsLoading, setProjectsLoading] = useState(true)

  // Show welcome banner for new users (no projects)
  useEffect(() => {
    const welcomeDismissed = localStorage.getItem('hatch_welcome_banner_dismissed')
    // Show welcome if user hasn't dismissed it AND has no projects
    if (!welcomeDismissed && projects.length === 0 && !projectsLoading) {
      setShowWelcome(true)
    }
  }, [projects.length, projectsLoading])

  const handleDismissWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('hatch_welcome_banner_dismissed', 'true')
  }

  useEffect(() => {
    // Simulate loading state since useProjects doesn't expose it directly yet
    // In reality, useProjects loads from localStorage which is instant, 
    // but we want a smooth UI transition
    const timer = setTimeout(() => setProjectsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    const data = localStorage.getItem('hatch_onboarding_data')
    if (data) {
      try {
        setOnboardingData(JSON.parse(data))
      } catch (e) {
        console.error('Failed to parse onboarding data', e)
      }
    }
  }, [])

  useEffect(() => {
    // Simulate system activity
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))))
      setActiveAgents(prev => Math.floor(Math.random() * 3) + 12)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleReplication = (data: any) => {
    const encodedPrompt = encodeURIComponent(JSON.stringify(data))
    router.push(`/builder?mode=replicate&data=${encodedPrompt}`)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <ReplicatorModal 
        isOpen={showReplicator} 
        onClose={() => setShowReplicator(false)}
        onReplicate={handleReplication}
      />

      {/* Welcome Banner for New Users */}
      <AnimatePresence>
        {showWelcome && <WelcomeBanner onDismiss={handleDismissWelcome} />}
      </AnimatePresence>

      {/* Stats Grid - More compact on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          title="ACTIVE_PROJECTS" 
          value={projects.length.toString()} 
          icon={<Layout className="w-5 h-5 text-emerald-400" />}
          trend={projects.length > 0 ? "ONLINE" : "IDLE"}
        />
        <StatCard 
          title="SYSTEM_LOAD" 
          value={`${Math.round(systemLoad)}%`} 
          icon={<Cpu className="w-5 h-5 text-amber-400" />}
          trend="STABLE"
        />
        <StatCard 
          title="GLOBAL_REACH" 
          value="142" 
          icon={<Globe className="w-5 h-5 text-blue-400" />}
          trend="NODES"
        />
        <StatCard 
          title="THREAT_LEVEL" 
          value="LOW" 
          icon={<Shield className="w-5 h-5 text-emerald-400" />}
          trend="SECURE"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Feed - Now Project List */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 md:p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-mono font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                <span className="hidden sm:inline">ACTIVE_OPERATIONS</span>
                <span className="sm:hidden">MY PROJECTS</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-zinc-500 hidden sm:inline">SYNCED</span>
              </div>
            </div>
            
            <div className="space-y-3 md:space-y-4 font-mono text-sm min-h-[200px] md:min-h-[300px] max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {projectsLoading ? (
                <div className="flex items-center justify-center h-32 text-zinc-500">
                  <Cpu className="w-5 h-5 animate-spin mr-2" />
                  INITIALIZING_LINK...
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  <p className="mb-4">NO_ACTIVE_OPERATIONS</p>
                  <button 
                    onClick={() => router.push('/builder')}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors"
                  >
                    INITIALIZE_NEW
                  </button>
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="group flex items-center justify-between p-3 md:p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-lg hover:border-emerald-500/30 transition-all">
                    <Link href={`/builder?project=${project.id}`} className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-900 rounded flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 transition-colors shrink-0">
                        <Layout className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm md:text-base text-zinc-200 group-hover:text-white truncate">{project.name}</h3>
                        <p className="text-[10px] md:text-xs text-zinc-500 truncate">ID: {project.id.slice(0, 8)}...</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1 md:gap-2 ml-2 shrink-0">
                      {project.deployedSlug && (
                        <a 
                          href={`https://${project.deployedSlug}.hatchit.dev`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-emerald-400"
                          title="View Live Site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => deleteProject()}
                        className="p-2 hover:bg-red-900/20 rounded text-zinc-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {onboardingData && (
              <ActionCard 
                title="CONTINUE_SETUP" 
                description={`Initialize ${onboardingData.brandName || 'Entity'}`}
                icon={<ArrowRight className="w-6 h-6 text-emerald-400" />}
                onClick={() => router.push('/builder?mode=onboarding')}
              />
            )}
            <ActionCard 
              title="NEW_PROJECT" 
              description="Initialize a new blank entity."
              icon={<Plus className="w-6 h-6 text-blue-400" />}
              onClick={() => router.push('/builder')}
            />
            <ActionCard 
              title="THE_REPLICATOR" 
              description="Clone any website's DNA instantly."
              icon={<Copy className="w-6 h-6 text-purple-400" />}
              onClick={() => setShowReplicator(true)}
            />
            <ActionCard 
              title="RUN_DIAGNOSTICS" 
              description="Perform full system integrity check."
              icon={<Activity className="w-6 h-6 text-amber-400" />}
            />
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="text-lg font-mono font-bold flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-purple-500" />
              NEURAL_STATUS
            </h2>
            
            <div className="space-y-6">
              <StatusBar label="Cognitive Load" value={45} color="bg-purple-500" />
              <StatusBar label="Memory Usage" value={72} color="bg-blue-500" />
              <StatusBar label="Network Traffic" value={28} color="bg-emerald-500" />
              <StatusBar label="Processing Power" value={60} color="bg-amber-500" />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
            <h2 className="text-lg font-mono font-bold flex items-center gap-2 mb-4 relative z-10">
              <Zap className="w-5 h-5 text-yellow-400" />
              GOD_MODE
            </h2>
            <p className="text-sm text-zinc-400 mb-6 relative z-10">
              Override all safety protocols and enable direct neural interface.
            </p>
            <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-emerald-500 text-zinc-100 font-mono text-sm transition-all relative z-10 group">
              <span className="group-hover:text-emerald-400">ENABLE_OVERRIDE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: { title: string; value: string; icon: ReactNode; trend: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 md:p-6 backdrop-blur-sm hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <span className="text-[10px] md:text-xs font-mono text-zinc-500 truncate">{title}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-xl md:text-2xl font-bold font-mono">{value}</span>
        <span className="text-[10px] md:text-xs font-mono text-emerald-500 bg-emerald-500/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full truncate">{trend}</span>
      </div>
    </div>
  )
}

function LogEntry({ time, level, message }: { time: string; level: string; message: string }) {
  const color = level === 'ERROR' ? 'text-red-400' : level === 'WARN' ? 'text-amber-400' : level === 'SUCCESS' ? 'text-emerald-400' : 'text-blue-400'
  
  return (
    <div className="flex items-start gap-4 border-b border-zinc-800/50 pb-2 last:border-0">
      <span className="text-zinc-600 shrink-0">{time}</span>
      <span className={`font-bold w-16 shrink-0 ${color}`}>{level}</span>
      <span className="text-zinc-300">{message}</span>
    </div>
  )
}

function ActionCard({ title, description, icon, onClick }: { title: string; description: string; icon: ReactNode; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 md:p-6 backdrop-blur-sm hover:bg-zinc-800/50 hover:border-emerald-500/50 transition-all text-left group w-full"
    >
      <div className="mb-3 md:mb-4 p-2 md:p-3 bg-zinc-950 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300 border border-zinc-800 group-hover:border-emerald-500/30">
        {icon}
      </div>
      <h3 className="font-mono font-bold text-sm md:text-base text-zinc-100 mb-1 md:mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-xs md:text-sm text-zinc-500 line-clamp-2">{description}</p>
    </button>
  )
}

function StatusBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300">{value}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}
