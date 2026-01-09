'use client'

import { forwardRef, ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// =============================================================================
// BUTTON - Core design system component
// Follows "Confident Restraint" philosophy
// 
// VARIANTS:
// - primary: Glass + shimmer (hero CTAs, 1-2 per page max)
// - secondary: Solid zinc (supporting actions)
// - ghost: Transparent (navigation, low priority)
// - danger: Red (destructive actions)
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  shimmer?: boolean // Enable shimmer animation on primary
  children: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  // Primary: Glass emerald with glow (matches homepage)
  primary: 'bg-emerald-500/20 backdrop-blur-2xl border border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]',
  // Secondary: Solid zinc
  secondary: 'bg-zinc-800/50 backdrop-blur-xl hover:bg-zinc-800/60 text-zinc-200 border border-zinc-700/50 hover:border-zinc-600',
  // Ghost: Minimal
  ghost: 'bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200',
  // Danger: Destructive
  danger: 'bg-red-500/15 backdrop-blur-xl border border-red-500/40 hover:bg-red-500/20 text-red-400',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-base gap-2.5',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  shimmer = true,
  disabled,
  className = '',
  children,
  ...props
}, ref) => {
  const isDisabled = disabled || loading
  const isPrimary = variant === 'primary'

  return (
    <motion.button
      ref={ref}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      disabled={isDisabled}
      className={`
        group relative inline-flex items-center justify-center font-semibold rounded-lg
        transition-all duration-200 overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Glass gradient overlay for primary */}
      {isPrimary && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-lg pointer-events-none" />
      )}
      
      {/* Shimmer effect for primary */}
      {isPrimary && shimmer && !isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      {loading ? (
        <>
          <Loader2 className="relative w-4 h-4 animate-spin" />
          <span className="relative">Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="relative">{icon}</span>}
          <span className="relative">{children}</span>
          {icon && iconPosition === 'right' && <span className="relative group-hover:translate-x-0.5 transition-transform">{icon}</span>}
        </>
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button
