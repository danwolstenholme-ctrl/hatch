'use client'

export default function BuilderLoading() {
  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div className="text-3xl font-black">
            <span className="text-white">
              Hatch
            </span>
            <span className="bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">
              It
            </span>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 -z-10 animate-ping opacity-20">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl" />
          </div>
        </div>
        
        {/* Loading bar */}
        <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse loading-bar" />
        </div>
        
        <p className="text-zinc-400 font-medium text-sm">Loading builder...</p>
      </div>
      
      <style jsx>{`
        .loading-bar {
          animation: loading 1.5s ease-in-out infinite;
        }
        @keyframes loading {
          0% { width: 0%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}
