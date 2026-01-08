'use client';

import Link from 'next/link';

// =============================================================================
// HATCHIT LOGO SYSTEM
// 
// Two versions:
// 1. LogoMark - Square "It" icon (for favicons, app icons, profile pics)
// 2. LogoWordmark - Full "HatchIt" text (for headers, footers)
// =============================================================================

// Square "It" mark - matches the "It" from the wordmark exactly
export const LogoMark = ({ size = 32, className = "" }: { size?: number; className?: string }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={className}
      aria-label="HatchIt"
    >
      <defs>
        <linearGradient id="mark-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18181b"/>
          <stop offset="100%" stopColor="#09090b"/>
        </linearGradient>
        <linearGradient id="mark-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#34d399"/>
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="32" height="32" rx="7" fill="url(#mark-bg)"/>
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" fill="none" stroke="#27272a" strokeWidth="1"/>
      
      {/* "It" text - properly centered */}
      <text 
        x="50%" 
        y="50%" 
        dominantBaseline="central"
        textAnchor="middle" 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
        fontWeight="700" 
        fontSize="16" 
        letterSpacing="-0.02em" 
        fill="url(#mark-emerald)"
      >It</text>
    </svg>
  );
};

// Full wordmark - "HatchIt" text
export const LogoWordmark = ({ className = "" }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 120 28" 
      className={`h-7 ${className}`}
      aria-label="HatchIt"
    >
      <defs>
        <linearGradient id="wordmark-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <text 
        x="0" 
        y="22" 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
        fontWeight="700" 
        fontSize="24"
        letterSpacing="-0.02em"
      >
        <tspan fill="white">Hatch</tspan>
        <tspan fill="url(#wordmark-grad)">It</tspan>
      </text>
    </svg>
  );
};

// Default export - just the wordmark for navigation
export const Logo = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} className="flex items-center group">
      <LogoWordmark className="group-hover:opacity-80 transition-opacity" />
    </Link>
  );
};

