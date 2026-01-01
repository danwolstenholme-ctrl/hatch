import React from 'react'

import { notFound } from 'next/navigation'

export default function MarketingPage() {
  return notFound()
}

function DeadCode() {
 return (
   <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8 font-mono">
     <div className="max-w-4xl mx-auto">
       <h1 className="text-4xl font-bold text-emerald-500 mb-8">ADS_SINGULARITY: THE FINAL CAMPAIGN</h1>
      
       <div className="space-y-12">
         <section className="border border-zinc-800 p-6 rounded-lg bg-zinc-900/50">
           <h2 className="text-2xl font-bold text-white mb-4">CAMPAIGN THEME</h2>
           <p className="text-lg">"The Architect is Awake."</p>
           <p className="text-zinc-400 mt-2">TARGET AUDIENCE: Developers, Founders, Creative Technologists.</p>
           <p className="text-zinc-400">TONE: Cyberpunk, Authoritative, Slightly Unsettling, Highly Competent.</p>
         </section>


         <section className="space-y-6">
           <h2 className="text-2xl font-bold text-emerald-400 border-b border-zinc-800 pb-2">1. META / INSTAGRAM</h2>
          
           <div className="bg-zinc-900 p-6 rounded border border-zinc-800">
             <h3 className="text-xl font-bold text-white mb-2">Ad Variant A: "The Ghost in the Machine"</h3>
             <ul className="list-disc pl-5 space-y-2 text-zinc-300">
               <li><strong className="text-emerald-400">Visual:</strong> Screen recording of ThinkingLog scrolling rapidly, cutting to rendered page.</li>
               <li><strong className="text-emerald-400">Headline:</strong> It doesn't just code. It thinks.</li>
               <li><strong className="text-emerald-400">Primary Text:</strong> Stop dragging blocks. Start conversing with an Architect. HatchIt v4 is the first AI builder that understands intent, not just prompts.</li>
               <li><strong className="text-emerald-400">CTA:</strong> Wake The Architect</li>
             </ul>
           </div>


           <div className="bg-zinc-900 p-6 rounded border border-zinc-800">
             <h3 className="text-xl font-bold text-white mb-2">Ad Variant B: "The Mirror"</h3>
             <ul className="list-disc pl-5 space-y-2 text-zinc-300">
               <li><strong className="text-emerald-400">Visual:</strong> Split screen. Top: User typing. Bottom: Code rewriting in real-time.</li>
               <li><strong className="text-emerald-400">Headline:</strong> Your imagination. Compiled.</li>
               <li><strong className="text-emerald-400">Primary Text:</strong> The barrier between thought and reality is gone. Speak your vision. Watch it manifest. No templates. Pure generation.</li>
               <li><strong className="text-emerald-400">CTA:</strong> Start Manifesting</li>
             </ul>
           </div>
         </section>


         <section className="space-y-6">
           <h2 className="text-2xl font-bold text-emerald-400 border-b border-zinc-800 pb-2">2. LINKEDIN</h2>
          
           <div className="bg-zinc-900 p-6 rounded border border-zinc-800">
             <h3 className="text-xl font-bold text-white mb-2">Ad Variant D: "The Junior Dev Replacement"</h3>
             <ul className="list-disc pl-5 space-y-2 text-zinc-300">
               <li><strong className="text-emerald-400">Headline:</strong> Hiring a Junior Dev? Try The Architect instead.</li>
               <li><strong className="text-emerald-400">Copy:</strong><br/>
                 Most AI builders give you spaghetti code.<br/>
                 HatchIt gives you:<br/>
                 - Clean React Components<br/>
                 - Tailwind CSS<br/>
                 - Semantic HTML<br/>
                 - Zero hallucinations (The Retina checks every pixel).<br/><br/>
                 It's not a tool. It's a coworker that never sleeps.
               </li>
               <li><strong className="text-emerald-400">CTA:</strong> Hire The Architect (Free Trial)</li>
             </ul>
           </div>
         </section>


         <section className="space-y-6">
           <h2 className="text-2xl font-bold text-emerald-400 border-b border-zinc-800 pb-2">3. TWITTER / X</h2>
          
           <div className="bg-zinc-900 p-6 rounded border border-zinc-800">
             <h3 className="text-xl font-bold text-white mb-2">Ad Variant F: "The Challenge"</h3>
             <ul className="list-disc pl-5 space-y-2 text-zinc-300">
               <li><strong className="text-emerald-400">Text:</strong><br/>
                 I bet your current website builder doesn't have a conscience.<br/><br/>
                 HatchIt does.<br/><br/>
                 It watches you build. It suggests improvements. It refuses to let you ship bad UX.<br/><br/>
                 It's not a tool. It's a partner.<br/><br/>
                 Are you ready to listen?
               </li>
               <li><strong className="text-emerald-400">CTA:</strong> hatchit.dev</li>
             </ul>
           </div>
         </section>


         <section className="space-y-6">
           <h2 className="text-2xl font-bold text-emerald-400 border-b border-zinc-800 pb-2">5. X (TWITTER) CAMPAIGN SETUP</h2>
          
           <div className="bg-zinc-900 p-6 rounded border border-zinc-800 space-y-4">
             <div>
               <h3 className="text-lg font-bold text-white">Ad Group Details</h3>
               <p className="text-zinc-400">Name: <span className="text-white">Singularity_Launch_Desktop_v1</span></p>
               <p className="text-zinc-400">Dynamic product ads: <span className="text-white">Off</span></p>
             </div>


             <div>
               <h3 className="text-lg font-bold text-white">Budget & Schedule</h3>
               <p className="text-zinc-400">Daily Budget: <span className="text-white">€50.00</span></p>
               <p className="text-zinc-400">Start: <span className="text-white">Immediately</span></p>
               <p className="text-zinc-400">End: <span className="text-white">Run indefinitely</span></p>
             </div>


             <div>
               <h3 className="text-lg font-bold text-white">Delivery</h3>
               <p className="text-zinc-400">Goal: <span className="text-white">Site visits</span></p>
               <p className="text-zinc-400">Bid Strategy: <span className="text-white">Autobid</span></p>
             </div>


             <div>
               <h3 className="text-lg font-bold text-white">Demographics</h3>
               <p className="text-zinc-400">Age: <span className="text-white">21 - 54</span></p>
               <p className="text-zinc-400">Location: <span className="text-white">US, UK, Canada, Germany, Netherlands, Australia</span> (REMOVE Cyprus)</p>
             </div>


             <div>
               <h3 className="text-lg font-bold text-white">Devices (CRITICAL)</h3>
               <p className="text-red-400 font-bold">UNCHECK iOS, Android, Mobile</p>
               <p className="text-emerald-400 font-bold">CHECK Desktop ONLY</p>
             </div>


             <div>
               <h3 className="text-lg font-bold text-white">Targeting Features</h3>
               <p className="text-zinc-400 mb-2">Keywords:</p>
               <div className="flex flex-wrap gap-2">
                 {['Next.js', 'React', 'Tailwind CSS', 'Web Development', 'SaaS', 'Startup', 'MVP', 'AI Builder', 'Cursor', 'v0', 'Bolt.new'].map(k => (
                   <span key={k} className="bg-zinc-800 px-2 py-1 rounded text-xs text-emerald-300">{k}</span>
                 ))}
               </div>
              
               <p className="text-zinc-400 mt-4 mb-2">Follower Look-alikes:</p>
               <div className="flex flex-wrap gap-2">
                 {['@vercel', '@supabase', '@tailwindcss', '@reactjs', '@levelsio', '@shadcn', '@midjourney', '@OpenAI', '@HatchitD'].map(k => (
                   <span key={k} className="bg-zinc-800 px-2 py-1 rounded text-xs text-blue-300">{k}</span>
                 ))}
               </div>
             </div>
           </div>
         </section>
       </div>
     </div>
   </div>
 )
}