'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Terminal, Cpu, Zap, Code2, ArrowRight, Database, Layers, ShieldCheck } from 'lucide-react'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const transition = (delay = 0) => ({
  duration: 0.5,
  delay,
  ease: "easeOut" as const
});

const Phase = ({ icon: Icon, phase, title, description, delay = 0 }: { icon: any, phase: string, title: string, description: string, delay?: number }) => (
  <motion.div
    className="flex flex-col items-start text-left group"
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={transition(delay)}
  >
    <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 mb-6 group-hover:bg-emerald-500/20 transition-colors">
      <Icon className="w-6 h-6 text-emerald-400" />
    </div>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-mono text-emerald-500/60">PHASE_{phase}</span>
      <div className="h-px w-8 bg-emerald-500/20"></div>
    </div>
    <h3 className="text-xl font-bold mb-3 font-mono text-white">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed font-mono">{description}</p>
  </motion.div>
);

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Ambient void background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#10b98115,transparent)] pointer-events-none" />

      {/* Hero */}
      <div className="relative px-6 pt-24 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 text-emerald-400 mb-6 font-mono text-sm"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={transition()}
          >
            <Terminal className="w-4 h-4" />
            <span>EXECUTION_SEQUENCE</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-mono tracking-tight"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={transition(0.1)}
          >
            From Concept to <span className="text-emerald-400">Entity</span>
            <br />
            <span className="text-zinc-500">in T-Minus Seconds</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-zinc-400 max-w-2xl font-mono leading-relaxed"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={transition(0.2)}
          >
            The System streamlines the materialization process by converting natural language directives into production-grade architecture.
          </motion.p>
        </div>
      </div>

      {/* Phases */}
      <div className="px-6 py-24 border-y border-zinc-800/50 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 md:gap-16 items-start relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-6 left-0 w-full h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0"></div>

            <Phase 
              icon={Layers}
              phase="01"
              title="Initialization"
              description="Select a template vector (Website, Portfolio, SaaS). Define brand parameters: color hex codes, typography, and entity identity. The System enforces these constraints globally."
              delay={0}
            />
            <Phase 
              icon={Cpu}
              phase="02"
              title="Fabrication"
              description="Execute section generation sequentially. If input data is sparse, the Architect Interface Entity will extrapolate prompts. Architect constructs. Architect refines."
              delay={0.1}
            />
            <Phase 
              icon={Zap}
              phase="03"
              title="Deployment"
              description="Instant compilation to live URL via Vercel Edge Network. Domain binding available. Full source code ownership retained by the Architect. No platform dependency."
              delay={0.2}
            />
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="relative"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition(0.1)}
          >
            <div className="flex items-center gap-2 mb-12">
              <Database className="w-5 h-5 text-emerald-500" />
              <h2 className="text-2xl font-bold font-mono">System Architecture V3.0</h2>
            </div>

            <div className="grid gap-6">
              <div className="group p-6 bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 transition-colors rounded-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1 font-mono text-emerald-500 text-xs">[01]</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 font-mono text-white group-hover:text-emerald-400 transition-colors">Hybrid Intelligence Core</h3>
                    <p className="text-zinc-400 text-sm font-mono leading-relaxed">
                      Not a simple builder. A symbiotic AI partner. You retain full control over the creative direction while the System handles the heavy lifting of code generation and optimization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 transition-colors rounded-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1 font-mono text-emerald-500 text-xs">[02]</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 font-mono text-white group-hover:text-emerald-400 transition-colors">Supabase Integration</h3>
                    <p className="text-zinc-400 text-sm font-mono leading-relaxed">
                      Enterprise-grade backend infrastructure. Secure authentication, real-time databases, and scalable storage are woven into the fabric of your construct from inception.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 transition-colors rounded-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1 font-mono text-emerald-500 text-xs">[03]</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 font-mono text-white group-hover:text-emerald-400 transition-colors">Chronosphere Versioning</h3>
                    <p className="text-zinc-400 text-sm font-mono leading-relaxed">
                      Every iteration is logged. Every prompt is archived. The Chronosphere allows for instant rollback and branching, ensuring no creative spark is ever lost to the void.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-6 bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/30 transition-colors rounded-sm">
                <div className="flex items-start gap-4">
                  <div className="mt-1 font-mono text-emerald-500 text-xs">[04]</div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 font-mono text-white group-hover:text-emerald-400 transition-colors">Sovereign Security</h3>
                    <p className="text-zinc-400 text-sm font-mono leading-relaxed">
                      Your data. Your code. Your rules. We employ industry-standard encryption and security protocols. Export your entire project at any time. Zero lock-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 py-24 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="relative p-12 bg-zinc-900/30 border border-zinc-800 rounded-sm overflow-hidden group"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={transition(0.2)}
          >
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-mono relative z-10">Ready to Initialize?</h2>
            <p className="text-zinc-400 mb-8 font-mono relative z-10">Cease manual coding. Begin materialization.</p>
            
            <Link href="/builder" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded-sm font-bold text-lg font-mono transition-all">
              <Code2 className="w-5 h-5" />
              <span>INIT_BUILDER</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
