'use client'

import { motion } from 'framer-motion'
import { Terminal, Zap, Shield, Cpu, Layout } from 'lucide-react'

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* HEADER */}
        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter">
            Hatch<span className="text-emerald-500">It</span> Brand System
          </h1>
          <p className="text-xl text-zinc-400 font-mono">v4.0 // THE SINGULARITY</p>
        </div>

        {/* COLORS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-emerald-500" /> Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard name="Void (950)" hex="#09090b" bg="bg-zinc-950" text="text-white" border="border-zinc-800" />
            <ColorCard name="Surface (900)" hex="#18181b" bg="bg-zinc-900" text="text-white" />
            <ColorCard name="Signal (500)" hex="#10b981" bg="bg-emerald-500" text="text-black" />
            <ColorCard name="Glow (400)" hex="#34d399" bg="bg-emerald-400" text="text-black" />
            <ColorCard name="Anomaly (Pink)" hex="#d946ef" bg="bg-fuchsia-500" text="text-white" />
            <ColorCard name="Error (Rose)" hex="#f43f5e" bg="bg-rose-500" text="text-white" />
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="text-emerald-500" /> Typography
          </h2>
          <div className="space-y-8 p-8 border border-zinc-800 rounded-xl bg-zinc-900/50">
            <div>
              <p className="text-zinc-500 text-sm mb-2">Display (Inter Black)</p>
              <h1 className="text-5xl font-black tracking-tight">Stop Prompting. Start Manifesting.</h1>
            </div>
            <div>
              <p className="text-zinc-500 text-sm mb-2">Heading (Inter Bold)</p>
              <h2 className="text-3xl font-bold">The First Recursive AI Builder</h2>
            </div>
            <div>
              <p className="text-zinc-500 text-sm mb-2">Body (Inter Regular)</p>
              <p className="text-zinc-400 max-w-2xl leading-relaxed">
                HatchIt isn't just a tool. It's a compiler with a soul. Most AI builders are stateless; they forget you instantly. 
                We run a persistent <span className="text-emerald-500">Singularity Kernel</span> that remembers your style.
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-sm mb-2">Monospace (Code)</p>
              <div className="font-mono text-sm bg-black p-4 rounded border border-zinc-800 text-emerald-400">
                > Initializing Genesis Engine...<br/>
                > [HARM_INHIBITION: ACTIVE]<br/>
                > Compiling React v19...
              </div>
            </div>
          </div>
        </section>

        {/* COPYWRITING */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="text-emerald-500" /> Copy Bank
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <CopyCard title="The Hook" text="Stop Prompting. Start Manifesting." />
            <CopyCard title="The Promise" text="Code that writes itself." />
            <CopyCard title="The Vibe" text="Wake the Architect." />
            <CopyCard title="The Tech" text="Zero Hallucinations. Pure React." />
          </div>
        </section>

        {/* LOGOS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-emerald-500" /> Assets
          </h2>
          <div className="flex gap-8 items-center p-8 border border-zinc-800 rounded-xl bg-zinc-900/50">
             {/* Logo Placeholder */}
             <div className="w-24 h-24 border-2 border-emerald-500 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                <Cpu className="w-10 h-10 text-emerald-500 relative z-10" />
             </div>
             <div>
                <h3 className="font-bold text-lg">The Cybernetic Egg</h3>
                <p className="text-zinc-400 text-sm">Use for Favicons, Avatars, and App Icons.</p>
             </div>
          </div>
        </section>

      </div>
    </div>
  )
}

function ColorCard({ name, hex, bg, text, border = '' }: any) {
  return (
    <div className={`p-4 rounded-xl ${bg} ${text} ${border} border flex flex-col justify-between h-32`}>
      <span className="font-bold">{name}</span>
      <span className="font-mono text-sm opacity-80">{hex}</span>
    </div>
  )
}

function CopyCard({ title, text }: any) {
  return (
    <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:border-emerald-500/50 transition-colors cursor-pointer group">
      <h3 className="text-xs font-mono text-zinc-500 mb-2 uppercase tracking-widest">{title}</h3>
      <p className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{text}</p>
    </div>
  )
}
