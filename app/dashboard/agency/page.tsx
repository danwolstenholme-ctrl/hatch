'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Activity, Bot, Brain, Cpu, Globe, Shield, Terminal, Zap, Copy, Plus, ArrowRight } from 'lucide-react'
import ReplicatorModal from '@/components/ReplicatorModal'
import { useRouter } from 'next/navigation'

export default function AgencyDashboard() {
  const [systemLoad, setSystemLoad] = useState(0)
  const [activeAgents, setActiveAgents] = useState(0)
  const [showReplicator, setShowReplicator] = useState(false)
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const router = useRouter()
  
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
    // Store the replication data in localStorage or pass via URL
    // For now, we'll use a simple URL param to trigger the builder
    // In a real app, we'd save to DB first
    const encodedPrompt = encodeURIComponent(JSON.stringify(data))
    // Navigate to builder with the replicated data
    // We'll use a special 'replicate' mode
    router.push(`/builder?mode=replicate&data=${encodedPrompt}`)
  }

  return (
    <div className="space-y-8">
      <ReplicatorModal 
        isOpen={showReplicator} 
        onClose={() => setShowReplicator(false)}
        onReplicate={handleReplication}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="ACTIVE_AGENTS" 
          value={activeAgents.toString()} 
          icon={<Bot className="w-5 h-5 text-emerald-400" />}
          trend="+2.4%"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-mono font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                SYSTEM_LOGS
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-zinc-500">LIVE</span>
              </div>
            </div>
            
            <div className="space-y-4 font-mono text-sm h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <LogEntry time="10:42:05" level="INFO" message="Agent [ALPHA-7] initiated sequence: MARKET_ANALYSIS" />
              <LogEntry time="10:42:02" level="SUCCESS" message="Self-healing protocol completed for module: AUTH_SERVICE" />
              <LogEntry time="10:41:55" level="INFO" message="New node connection established: TOKYO_REGION" />
              <LogEntry time="10:41:48" level="WARN" message="Latency spike detected in sector 4. Rerouting..." />
              <LogEntry time="10:41:30" level="INFO" message="Agent [BETA-2] generated new creative assets" />
              <LogEntry time="10:41:15" level="SUCCESS" message="Deployment verified: v2.0.4-SINGULARITY" />
              <LogEntry time="10:40:55" level="INFO" message="System optimization routine started" />
              <LogEntry time="10:40:42" level="INFO" message="User session authenticated: ADMIN_ROOT" />
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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 backdrop-blur-sm hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-zinc-500">{title}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold font-mono">{value}</span>
        <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{trend}</span>
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
      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 backdrop-blur-sm hover:bg-zinc-800/50 hover:border-emerald-500/50 transition-all text-left group"
    >
      <div className="mb-4 p-3 bg-zinc-950 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300 border border-zinc-800 group-hover:border-emerald-500/30">
        {icon}
      </div>
      <h3 className="font-mono font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
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
