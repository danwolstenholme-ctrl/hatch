'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
          </h1>
          <div className="flex items-center gap-6">
            <a href="#products" className="text-zinc-400 hover:text-white transition-colors hidden sm:block">Products</a>
            <a href="#features" className="text-zinc-400 hover:text-white transition-colors hidden sm:block">Features</a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors hidden sm:block">Pricing</a>
            <Link href="/builder" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-sm transition-all">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-20 pb-32">
        <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-zinc-400">Two products. One platform.</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Hatch
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                It
              </span>
              <span className="text-zinc-600">.</span>
            </h1>
            
            <div className="text-3xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-zinc-300 to-zinc-500 bg-clip-text text-transparent">Build. </span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Design. Ship.</span>
            </div>
            
            <p className="text-xl md:text-2xl text-zinc-400 max-w-4xl mx-auto leading-relaxed mb-4">
              AI-powered tools that turn your ideas into reality.
            </p>
            <p className="text-lg text-zinc-500 max-w-3xl mx-auto mb-12">
              Build React components with conversation. Design on a collaborative canvas. Export clean code.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/builder" className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/20">
              Open Builder
            </Link>
            <Link href="/canvas" className="px-10 py-5 bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-800/80 border border-zinc-700 hover:border-zinc-600 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              Try Canvas
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-zinc-500 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">●</span>
              <span>Live Now</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔧</span>
              <span>Auto-fixes broken code</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Powered by Claude</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="relative px-8 py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">Two tools. Infinite possibilities.</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Choose your workflow. Build components with AI, or design freely on a canvas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Builder Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full hover:border-zinc-700 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 text-2xl">
                  ⚡
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">HatchIt Builder</h3>
                <p className="text-zinc-400 mb-6">
                  Describe what you want in plain English. Get production-ready React components with Tailwind CSS. Iterate through conversation.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-zinc-500">
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> AI-powered generation</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Live preview</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Auto-fix errors</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Undo/rollback</li>
                </ul>
                <Link href="/builder" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all transform hover:scale-105">
                  <span>Open Builder</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Canvas Card */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full hover:border-zinc-700 transition-all">
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-4">
                  <span className="text-green-400 text-xs font-semibold">Built with Builder</span>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 text-2xl">
                  🎨
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">HatchIt Canvas</h3>
                <p className="text-zinc-400 mb-6">
                  A collaborative whiteboard for visual thinking. Draw, design, and brainstorm. Built entirely through conversation with HatchIt Builder.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-zinc-500">
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Drawing tools</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Shapes & text</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Layers panel</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Colors & fill</li>
                </ul>
                <Link href="/canvas" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-semibold transition-all transform hover:scale-105">
                  <span>Try Canvas</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="relative px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">Not another AI toy.</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Other tools give you throwaway code. HatchIt gives you a platform to build real products.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all">
              <div className="text-red-400 text-sm font-semibold mb-4">❌ Others</div>
              <h3 className="text-xl font-bold text-zinc-300 mb-3">Generate & Forget</h3>
              <p className="text-zinc-500">Copy code, paste somewhere else, lose context, start over every time.</p>
            </div>
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 ring-1 ring-purple-500/20">
              <div className="text-green-400 text-sm font-semibold mb-4">✓ HatchIt</div>
              <h3 className="text-xl font-bold text-white mb-3">Build & Iterate</h3>
              <p className="text-zinc-400">Keep context. Undo mistakes. Auto-fix errors. Ship when ready.</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all">
              <div className="text-red-400 text-sm font-semibold mb-4">❌ Others</div>
              <h3 className="text-xl font-bold text-zinc-300 mb-3">Broken Output</h3>
              <p className="text-zinc-500">Syntax errors, missing brackets, code that doesn't run.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-8 py-32 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Everything you need to ship
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              From idea to working product, all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {[
              {
                icon: "⚡",
                title: "Instant Generation",
                description: "Describe in plain English, get production React + Tailwind in seconds.",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: "👁️",
                title: "Live Preview",
                description: "See your creation render in real-time. Responsive breakpoints included.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: "🔧",
                title: "Auto-Fix",
                description: "Broken code? We detect it and fix it automatically. No more white screens.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: "↩️",
                title: "Undo & Rollback",
                description: "Made a mistake? Roll back to any previous version instantly.",
                gradient: "from-blue-500 to-cyan-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl blur from-zinc-600 to-zinc-800"></div>
                <div className="relative bg-zinc-900/90 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-zinc-100 mb-4">{feature.title}</h4>
                  <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative px-8 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Three steps to launch
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Describe", desc: "Tell us what you want to build. A landing page, a dashboard, a whiteboard — anything.", color: "from-blue-500 to-cyan-500" },
              { step: "02", title: "Iterate", desc: "Refine with conversation. 'Add a sidebar.' 'Make it darker.' 'Add copy/paste.' We build it.", color: "from-purple-500 to-pink-500" },
              { step: "03", title: "Ship", desc: "Export clean code. Drop it in your project. Done.", color: "from-orange-500 to-red-500" }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-4 group-hover:scale-110 transition-all duration-300 shadow-2xl`}>
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-zinc-700 to-transparent"></div>
                  )}
                </div>
                <h4 className="text-2xl font-bold text-zinc-200 mb-4">{item.title}</h4>
                <p className="text-zinc-400 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative px-8 py-24 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Simple pricing
            </h2>
            <p className="text-xl text-zinc-400">
              Free while in beta. Seriously.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {/* Free Tier */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-purple-500/30 rounded-2xl p-8 ring-1 ring-purple-500/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                BETA
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-zinc-400 mb-6">Everything. No limits. For now.</p>
              <div className="text-4xl font-black text-white mb-6">$0<span className="text-lg text-zinc-500 font-normal">/month</span></div>
              <ul className="space-y-3 mb-8">
                {["Builder: Unlimited generations", "Canvas: Full access", "Live preview", "Auto-fix errors", "Undo/rollback", "Code export"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/builder" className="block w-full py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold transition-all">
                Start Building
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-8 py-32">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-lg opacity-30"></div>
            <div className="relative bg-zinc-900/90 backdrop-blur-sm p-16 rounded-3xl border border-zinc-800 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  Ready to build something?
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto">
                Stop thinking. Start building. Ship today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/builder" className="inline-block px-12 py-5 bg-gradient-to-r from-white to-zinc-100 text-zinc-900 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl">
                  Open Builder
                </Link>
                <Link href="/canvas" className="inline-block px-12 py-5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105">
                  Try Canvas
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap justify-center items-center gap-8 text-zinc-500">
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>No account needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Free during beta</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>Export clean code</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-8 py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">
                <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Hatch</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">It</span>
              </h1>
            </div>
            <div className="flex items-center gap-8 text-zinc-500 text-sm">
              <Link href="/builder" className="hover:text-white transition-colors">Builder</Link>
              <Link href="/canvas" className="hover:text-white transition-colors">Canvas</Link>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>
            <p className="text-zinc-600 text-sm">© 2025 HatchIt. Built with HatchIt.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}