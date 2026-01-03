'use client'

import { CheckCircle2, Terminal, Shield, Zap } from 'lucide-react'

export default function StripeAssetsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center">Stripe Product Assets</h1>
        
        <div className="grid gap-16">
          
          {/* ARCHITECT ($19) */}
          <div className="border border-zinc-800 rounded-2xl p-8 bg-zinc-900/50">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Visual Asset for Screenshot */}
              <div className="w-[400px] h-[300px] bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/50 via-zinc-950/50 to-zinc-950" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 border border-zinc-700 shadow-2xl">
                    <Terminal className="w-12 h-12 text-zinc-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-zinc-200 tracking-tight">Architect</h2>
                  <p className="text-zinc-500 font-mono text-sm mt-2 tracking-wider">INITIATE</p>
                </div>
              </div>

              {/* Copy */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Product Name</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm select-all">Architect</div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Description</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm select-all">
                    Begin the transformation. Access the Singularity Engine and build unlimited AI-generated sites.
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Features List</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm whitespace-pre-wrap select-all">
                    • Singularity Engine Access{'\n'}
                    • Unlimited AI Generations{'\n'}
                    • Live Neural Preview{'\n'}
                    • Deploy to hatchitsites.dev
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VISIONARY ($49) */}
          <div className="border border-emerald-500/30 rounded-2xl p-8 bg-zinc-900/50">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Visual Asset for Screenshot */}
              <div className="w-[400px] h-[300px] bg-zinc-900 border border-emerald-500/30 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950/50 to-zinc-950" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Zap className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Visionary</h2>
                  <p className="text-emerald-500/70 font-mono text-sm mt-2 tracking-wider">UNLIMITED</p>
                </div>
              </div>

              {/* Copy */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Product Name</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm select-all">Visionary</div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Description</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm select-all">
                    Total creative control. Export full source code, deploy to custom domains, and remove branding.
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Features List</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm whitespace-pre-wrap select-all">
                    • Unlimited AI Generations{'\n'}
                    • Full Source Code Export{'\n'}
                    • Custom Domain Deployment{'\n'}
                    • White Label (No Branding){'\n'}
                    • Commercial License{'\n'}
                    • Priority Neural Processing
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SINGULARITY ($199) */}
          <div className="border border-violet-500/30 rounded-2xl p-8 bg-zinc-900/50">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Visual Asset for Screenshot */}
              <div className="w-[400px] h-[300px] bg-zinc-900 border border-violet-500/30 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-zinc-950/50 to-zinc-950" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <Shield className="w-12 h-12 text-violet-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Singularity</h2>
                  <p className="text-violet-500/70 font-mono text-sm mt-2 tracking-wider">GOD MODE</p>
                </div>
              </div>

              {/* Copy */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Product Name</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm select-all">Singularity</div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Description</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm select-all">
                    For those who build worlds. Unlimited projects, direct founder access, and dedicated infrastructure.
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">Features List</h3>
                  <div className="p-4 bg-black rounded-lg font-mono text-sm whitespace-pre-wrap select-all">
                    • Everything in Visionary{'\n'}
                    • Unlimited Projects{'\n'}
                    • Direct Line to Founders{'\n'}
                    • Early Access to New Models{'\n'}
                    • API Access (Coming Soon){'\n'}
                    • Dedicated Infrastructure
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
