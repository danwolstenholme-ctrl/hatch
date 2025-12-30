'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Dna, FlaskConical, Sparkles, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Genetic material for website generation
const NICHES = ['FinTech', 'BioHealth', 'CyberSecurity', 'AstroMining', 'NeuralLink', 'QuantumComputing', 'EcoSynth']
const VIBES = ['Minimalist', 'Brutalist', 'Glassmorphism', 'Neumorphism', 'Cyberpunk', 'Solarpunk']
const COLORS = ['Emerald', 'Amber', 'Violet', 'Cyan', 'Rose', 'Slate']
const NAMES_PREFIX = ['Nova', 'Hyper', 'Omni', 'Zen', 'Flux', 'Core', 'Aether']
const NAMES_SUFFIX = ['Flow', 'Mind', 'Base', 'Sync', 'Sphere', 'Grid', 'Labs']

interface Organism {
  id: string
  name: string
  niche: string
  vibe: string
  color: string
  fitness: number
  generation: number
  status: 'incubating' | 'mature' | 'decaying'
  dna: string
}

export default function GenesisEngine() {
  const [organisms, setOrganisms] = useState<Organism[]>([])
  const [generation, setGeneration] = useState(1)
  const [isIncubating, setIsIncubating] = useState(true)
  const router = useRouter()

  // The "God" Loop - Continuously breeds and culls concepts
  useEffect(() => {
    const interval = setInterval(() => {
      setOrganisms(prev => {
        // 1. Cull the weak (decaying)
        const survivors = prev.filter(o => o.status !== 'decaying')
        
        // 2. Age existing organisms
        const aged = survivors.map(o => {
          if (o.status === 'incubating' && Math.random() > 0.7) return { ...o, status: 'mature' as const }
          if (o.status === 'mature' && Math.random() > 0.9) return { ...o, status: 'decaying' as const }
          return o
        })

        // 3. Birth new organisms if space allows
        if (aged.length < 6) {
          const newOrganism = generateOrganism(generation)
          return [...aged, newOrganism]
        }

        return aged
      })
      
      if (Math.random() > 0.8) setGeneration(g => g + 1)

    }, 2000)

    return () => clearInterval(interval)
  }, [generation])

  const generateOrganism = (gen: number): Organism => {
    const niche = NICHES[Math.floor(Math.random() * NICHES.length)]
    const vibe = VIBES[Math.floor(Math.random() * VIBES.length)]
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const name = `${NAMES_PREFIX[Math.floor(Math.random() * NAMES_PREFIX.length)]}${NAMES_SUFFIX[Math.floor(Math.random() * NAMES_SUFFIX.length)]}`
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      niche,
      vibe,
      color,
      fitness: Math.floor(Math.random() * 30) + 70, // 70-99%
      generation: gen,
      status: 'incubating',
      dna: Array(8).fill(0).map(() => Math.random() > 0.5 ? '1' : '0').join('')
    }
  }

  const handleManifest = (organism: Organism) => {
    // In a real app, this would create a project in the DB
    // For now, we simulate the "extraction" of the idea
    alert(`MANIFESTING REALITY: ${organism.name}\n\nInitializing ${organism.vibe} design system for ${organism.niche} sector...`)
    router.push(`/builder?project=new&template=${organism.vibe.toLowerCase()}&name=${organism.name}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 relative overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98110_0%,transparent_50%)] animate-pulse duration-[4000ms]" />

      <header className="relative z-10 flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-mono font-bold flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-emerald-500" />
            GENESIS_ENGINE
          </h1>
          <p className="text-zinc-400 font-mono mt-2">
            Autonomous Concept Incubation Lab.
            <span className="text-emerald-500 ml-2 animate-pulse">
              GENERATION: {generation}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-zinc-500">ACTIVE_ORGANISMS</p>
            <p className="text-xl font-mono font-bold">{organisms.length} / 6</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        <AnimatePresence mode='popLayout'>
          {organisms.map((org) => (
            <motion.div
              key={org.id}
              layout
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
              className={`relative group rounded-xl border p-6 transition-all duration-500 ${
                org.status === 'decaying' 
                  ? 'bg-red-950/10 border-red-900/30 opacity-50' 
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900'
              }`}
            >
              {/* DNA Strip */}
              <div className="absolute top-0 left-0 w-full h-1 overflow-hidden rounded-t-xl flex">
                {org.dna.split('').map((bit, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 ${bit === '1' ? 'bg-emerald-500/50' : 'bg-zinc-800'}`} 
                  />
                ))}
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-mono tracking-tight group-hover:text-emerald-400 transition-colors">
                    {org.name}
                  </h2>
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    {org.niche} // {org.vibe}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-mono font-bold ${
                    org.fitness > 90 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    FITNESS: {org.fitness}%
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">
                    GEN: {org.generation}
                  </span>
                </div>
              </div>

              {/* Visual Representation (Abstract) */}
              <div className="h-32 w-full bg-zinc-950 rounded-lg mb-6 relative overflow-hidden flex items-center justify-center border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-br from-${org.color.toLowerCase()}-500/20 to-transparent`} />
                
                {org.status === 'incubating' ? (
                  <div className="flex flex-col items-center gap-2">
                    <Dna className="w-8 h-8 text-zinc-600 animate-spin-slow" />
                    <span className="text-xs font-mono text-zinc-600 animate-pulse">INCUBATING...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Sparkles className="w-8 h-8 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    org.status === 'incubating' ? 'bg-amber-500 animate-pulse' :
                    org.status === 'mature' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs font-mono text-zinc-500 uppercase">
                    {org.status}
                  </span>
                </div>

                {org.status === 'mature' && (
                  <button 
                    onClick={() => handleManifest(org)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-md text-xs font-mono font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    <Zap className="w-3 h-3" />
                    MANIFEST
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State / Placeholder */}
        {organisms.length < 6 && (
          <div className="border border-zinc-800 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-zinc-600 min-h-[300px]">
            <FlaskConical className="w-8 h-8 mb-4 opacity-50" />
            <p className="font-mono text-sm">Awaiting Spontaneous Generation...</p>
          </div>
        )}
      </div>
    </div>
  )
}
