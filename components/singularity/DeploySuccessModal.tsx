'use client'

import { ExternalLink, Rocket } from 'lucide-react'
import Modal from './Modal'
import { LogoMark } from '../Logo'

// =============================================================================
// DEPLOY SUCCESS MODAL - Shows after successful deploy
// Same style as all other modals. Minimal. One CTA.
// =============================================================================

interface DeploySuccessModalProps {
  isOpen: boolean
  onClose: () => void
  deployedUrl: string
  projectName: string
}

export default function DeploySuccessModal({ 
  isOpen, 
  onClose, 
  deployedUrl,
  projectName 
}: DeploySuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        {/* Logo */}
        <div className="mb-4">
          <LogoMark size={48} className="w-12 h-12 mx-auto" />
        </div>
        
        <h2 className="text-lg font-semibold text-white mb-2">
          {projectName} is Live
        </h2>
        <p className="text-sm text-zinc-400 mb-5">
          Your site is deployed and ready to share.
        </p>

        <div className="space-y-3">
          <a
            href={deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white font-medium text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            View Live Site
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm rounded-xl transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </Modal>
  )
}
