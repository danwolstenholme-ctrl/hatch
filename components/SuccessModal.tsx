'use client'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="text-6xl mb-6 animate-bounce">🐣</div>

        <h2 className="text-3xl font-bold text-white mb-3">
          You&apos;re <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Hatched!</span>
        </h2>
        
        <p className="text-zinc-400 mb-8">
          Welcome to the flock. All premium features are now unlocked.
        </p>

        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-zinc-300 mb-3">You now have access to:</p>
          <div className="space-y-2">
            {[
              '🚀 Deploy to live URL',
              '🌐 Custom domains',
              '💻 Full code access',
              '📦 Download projects',
              '⚡ Unlimited generations',
              '🔄 Unlimited updates'
            ].map((feature, i) => (
              <div key={i} className="text-sm text-zinc-400">{feature}</div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all"
        >
          Start Building
        </button>
      </div>
    </div>
  )
}