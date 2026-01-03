'use client'

import { Terminal, Zap, Code2, Share2, Linkedin, Twitter, Layout, Cpu, Globe, ArrowRight } from 'lucide-react'

export default function MarketingAssetsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* HEADER */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              MARKETING CODEX
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Strategy, Creatives, and Signals for the V2 Launch.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-mono text-zinc-500">
            <span className="px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">CPC: €0.20 (Good)</span>
            <span className="px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">CTR: 0.36% (Target: 0.5%+)</span>
            <span className="px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">Status: SCALING</span>
          </div>
        </div>

        {/* SECTION 1: REDDIT ADS */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-[#FF4500]/10 rounded-xl border border-[#FF4500]/20">
              <Share2 className="w-6 h-6 text-[#FF4500]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Reddit Campaign: "The Anti-Builder"</h2>
              <p className="text-zinc-400">Targeting: r/webdev, r/reactjs, r/SideProject, r/SaaS</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AD VARIANT A: The "Code First" (High Tech) */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="p-6 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded">PROMOTED</span>
                  <span className="text-xs text-zinc-500">u/HatchIt_Dev</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Stop fighting drag-and-drop. Speak your code.</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  HatchIt V2 builds real Next.js 16 + Tailwind 4 apps. No black boxes. No vendor lock-in. 
                  Export clean, production-ready code you can actually read.
                </p>
                <div className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center">
                  {/* CSS Art: Code Hologram */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950/80 to-zinc-950" />
                  <div className="relative z-10 font-mono text-xs text-emerald-500/50 p-4 leading-relaxed">
                    &lt;motion.div initial=&#123;&#123; opacity: 0 &#125;&#125;&gt;<br/>
                    &nbsp;&nbsp;&lt;h1 className="text-4xl font-bold"&gt;<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;Hello World<br/>
                    &nbsp;&nbsp;&lt;/h1&gt;<br/>
                    &lt;/motion.div&gt;
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_2px,rgba(0,0,0,0.5)_2px)] bg-[size:100%_4px] pointer-events-none opacity-50" />
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-zinc-800 text-white text-sm font-bold rounded-full hover:bg-zinc-700">Learn More</button>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/30">
                <p className="text-xs font-mono text-zinc-500">STRATEGY: Appeal to devs tired of Wix/Squarespace limitations.</p>
              </div>
            </div>

            {/* AD VARIANT B: The "Speed" (Productivity) */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-teal-500/30 transition-all">
              <div className="p-6 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-teal-500 px-2 py-1 bg-teal-500/10 rounded">PROMOTED</span>
                  <span className="text-xs text-zinc-500">u/HatchIt_Dev</span>
                </div>
                <h3 className="text-xl font-bold mb-2">I built this landing page in 45 seconds.</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Describe your vision. HatchIt synthesizes the React components, styles, and copy instantly. 
                  Try the new Guest Mode: 3 builds, 3 refinements, 0 signup required.
                </p>
                <div className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center">
                  {/* CSS Art: Speed/Zap */}
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(20,184,166,0.1)_0deg,transparent_60deg,transparent_300deg,rgba(20,184,166,0.1)_360deg)] animate-spin-[10s_linear_infinite]" />
                  <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/30 shadow-[0_0_40px_rgba(20,184,166,0.2)]">
                    <Zap className="w-12 h-12 text-teal-400" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-full hover:bg-teal-500">Try Guest Mode</button>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/30">
                <p className="text-xs font-mono text-zinc-500">STRATEGY: Low friction entry. "0 signup" is a huge click driver.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: LINKEDIN ASSETS */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-[#0077b5]/10 rounded-xl border border-[#0077b5]/20">
              <Linkedin className="w-6 h-6 text-[#0077b5]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">LinkedIn Strategy</h2>
              <p className="text-zinc-400">Professional, Visionary, "Building in Public"</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* The Post */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">The "V2 is Ready" Post</h3>
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 font-sans text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {`Yesterday I teased V2. I was excited. Maybe a bit too excited. 😅

But today? The engine is actually humming. 

We just pushed HatchIt V2 live. It's not just a UI refresh. It's a complete architectural overhaul.

Here is what is under the hood:

🚀 Live Babel Sandbox: We are compiling TSX client-side. You see exactly what runs. No smoke and mirrors.
🛡️ Sandboxed Execution: Safer previews, sanitized data-URIs, and auto-named exports.
⚡ The Stack: Next.js 16 + Tailwind 4 + Framer Motion. The bleeding edge, standard.

And the biggest change? 

We opened the gates. 
Guest Mode is live. 
3 Builds. 3 Refinements. 3 Dreams. 
No credit card. No signup. Just build.

We are not trying to trap you in a walled garden. We want you to export the code and own it.

Give it a spin and break it (if you can).

Link in comments 👇

#buildinpublic #nextjs #ai #webdev #startup`}
              </div>
              <button className="text-xs text-emerald-400 hover:underline">Copy to Clipboard</button>
            </div>

            {/* The Banners (No Text) */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Banner Concepts (No Text)</h3>
              
              {/* Banner 1: The Void */}
              <div className="w-full aspect-[4/1] bg-black border border-zinc-800 rounded-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-2 right-2 text-[10px] text-zinc-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Concept: The Singularity</div>
              </div>

              {/* Banner 2: The Grid */}
              <div className="w-full aspect-[4/1] bg-zinc-950 border border-zinc-800 rounded-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,black_100%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 border border-zinc-800 rotate-45 opacity-20" />
                  <div className="w-32 h-32 border border-zinc-800 rotate-45 opacity-20 absolute top-0 left-0 animate-pulse" />
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] text-zinc-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Concept: Structure</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: TWITTER / X STORM */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <Twitter className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">X / Twitter Storm</h2>
              <p className="text-zinc-400">Schedule these 1 hour apart.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "We didn't build a website builder. We built a code synthesizer. \n\nNext.js 16. Tailwind 4. \n\nIt dreams in code so you don't have to. \n\nhttps://hatchit.dev",
              "Templates are dead. \n\nWhy start with someone else's bloat when you can generate exactly what you need in 30 seconds? \n\n#NoCode is over. #CodeGeneration is here.",
              "V2 Update: \n\n- Live Babel Sandbox 🧪\n- Guest Mode (No Signup) 👻\n- Mobile-first UI 📱\n\nTry it before we realize giving away this much compute for free is a bad idea. \n\nhttps://hatchit.dev",
              "Most AI builders give you a PNG and a 'good luck'. \n\nHatchIt gives you a repo. \n\nOwn your code.",
              "POV: You just built a SaaS landing page in the time it took to read this tweet. \n\nhttps://hatchit.dev/builder",
              "Designers 🤝 Developers \n\nHatchIt is the bridge. \n\nDescribe the vibe. Get the code. Tweak the props. Ship.",
              "If your website builder doesn't export to clean React code, you don't own your website. You're renting pixels.",
              "Building in public is terrifying. \n\nEspecially when you ship V2 and realize you broke the auth flow. \n\nFixed now. We sleep when the AI sleeps (never).",
              "The Singularity isn't coming. It's here. \n\nAnd it's building websites.",
            ].map((tweet, i) => (
              <div key={i} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors relative group">
                <div className="absolute top-4 right-4 text-xs font-mono text-zinc-600">#{i + 1}</div>
                <p className="text-zinc-300 text-sm whitespace-pre-wrap">{tweet}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-xs text-zinc-500">0 chars</span>
                  <button className="text-xs text-sky-400 hover:text-sky-300">Copy</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: STRATEGIC BRIEF */}
        <section className="space-y-8 bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold">Strategic Brief: The Path to VC</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">The Metrics Story</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Your CPC (€0.20) is excellent. This proves the "Code First" messaging resonates. 
                The market is tired of Framer/Webflow lock-in. They want <strong>ownership</strong>.
                <br/><br/>
                To raise VC, we need to prove <strong>Retention</strong> and <strong>Conversion</strong>.
                The new "Guest Mode" (3/3/3) is the key. It lowers CAC (Customer Acquisition Cost) by letting the product sell itself before the paywall hits.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Next Steps</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Scale the "Code First" ads (they are winning).
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Monitor the "Guest -&gt; Signup" conversion rate closely.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Gather user testimonials from the free tier for social proof.
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
