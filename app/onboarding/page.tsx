'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Cpu, Mic, Sparkles, Wand2, Brain, Terminal } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [brandName, setBrandName] = useState('')
  const [description, setDescription] = useState('')
  const [archetype, setArchetype] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleNext = () => {
    if (step === 2) {
      setIsGenerating(true)
      setTimeout(() => {
        setIsGenerating(false)
        setStep(3)
      }, 3000)
    } else {
      setStep(prev => prev + 1)
    }
  }

  const handleComplete = () => {
    // Save onboarding data to localStorage so the dashboard or builder can pick it up
    if (typeof window !== 'undefined') {
      localStorage.setItem('hatch_onboarding_data', JSON.stringify({
        brandName,
        description,
        archetype,
        timestamp: Date.now()
      }))
    }
    router.push('/dashboard/agency')
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-zinc-500">SEQUENCE_PROGRESS</span>
          <span className="text-xs font-mono text-emerald-500">{step}/3</span>
        </div>
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold font-mono">IDENTITY_CALIBRATION</h1>
              <p className="text-zinc-400">Define the core parameters of your entity.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase">Entity Name</label>
                <input 
                  type="text" 
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
                  placeholder="e.g. NEXUS_CORP"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase">Core Directive (Description)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono h-32 resize-none"
                  placeholder="Describe your mission, products, or services..."
                />
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!brandName || !description}
              className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold font-mono rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              PROCEED
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold font-mono">VOICE_SYNTHESIS</h1>
              <p className="text-zinc-400">Select the tonal frequency for your communications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ArchetypeCard 
                title="THE_SAGE" 
                description="Wise, authoritative, and knowledgeable."
                icon={<Brain className="w-6 h-6" />}
                selected={archetype === 'sage'}
                onClick={() => setArchetype('sage')}
              />
              <ArchetypeCard 
                title="THE_REBEL" 
                description="Disruptive, bold, and revolutionary."
                icon={<Sparkles className="w-6 h-6" />}
                selected={archetype === 'rebel'}
                onClick={() => setArchetype('rebel')}
              />
              <ArchetypeCard 
                title="THE_RULER" 
                description="Commanding, structured, and powerful."
                icon={<Cpu className="w-6 h-6" />}
                selected={archetype === 'ruler'}
                onClick={() => setArchetype('ruler')}
              />
            </div>

            {isGenerating ? (
              <div className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center gap-3 text-emerald-500 font-mono animate-pulse">
                <Mic className="w-5 h-5 animate-bounce" />
                CALIBRATING_NEURAL_NET...
              </div>
            ) : (
              <button 
                onClick={handleNext}
                disabled={!archetype}
                className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold font-mono rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                INITIATE_SYNTHESIS
                <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-bold font-mono">ENTITY_INITIALIZED</h1>
              <p className="text-zinc-400">Your digital presence has been successfully instantiated.</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 mb-4">
                  <Terminal className="w-4 h-4" />
                  GENERATED_MANIFESTO.md
                </div>
                
                <p className="font-serif text-xl italic text-zinc-300 leading-relaxed">
                  "{brandName} exists not merely to compete, but to redefine the parameters of the possible. We are the architects of the new era, building bridges to a future that others can only imagine."
                </p>
                
                <div className="pt-4 flex items-center justify-between text-xs font-mono text-zinc-500 border-t border-zinc-800 mt-6">
                  <span>TONE: {archetype.toUpperCase()}</span>
                  <span>CONFIDENCE: 98.4%</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleComplete}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
            >
              ENTER_CONTROL_PLANE
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ArchetypeCard({ title, description, icon, selected, onClick }: { title: string; description: string; icon: ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-lg border text-left transition-all relative overflow-hidden group ${
        selected 
          ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50' 
          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
      }`}
    >
      <div className={`mb-4 p-3 rounded-lg w-fit transition-colors ${
        selected ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-950 text-zinc-400 group-hover:text-zinc-100'
      }`}>
        {icon}
      </div>
      <h3 className={`font-mono font-bold mb-2 transition-colors ${selected ? 'text-emerald-400' : 'text-zinc-100'}`}>{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
      
      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      )}
    </button>
  )
}
