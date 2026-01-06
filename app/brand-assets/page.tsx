'use client';

import { useEffect, useState } from 'react';

export default function BrandAssetsPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">HatchIt Brand Assets</h1>
          <p className="text-zinc-400">Social media banners - wordmark forward, sprite as subtle accent</p>
        </div>

        {/* LinkedIn Company Cover - 1128x191 */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-semibold">LinkedIn Company Cover</h2>
            <span className="text-zinc-500 text-sm">1128 × 191 px</span>
          </div>
          <p className="text-zinc-400 text-sm">Ultra-wide. Centered wordmark, sprite as corner accent.</p>
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <LinkedInBanner />
          </div>
          <a 
            href="/assets/banners/linkedin-cover.svg" 
            download
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            Download SVG
          </a>
        </section>

        {/* Reddit Desktop Banner - 1920x384 */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-semibold">Reddit Desktop Banner</h2>
            <span className="text-zinc-500 text-sm">1920 × 384 px</span>
          </div>
          <p className="text-zinc-400 text-sm">Desktop subreddit header. Wordmark dominant.</p>
          <div className="rounded-lg overflow-hidden">
            <RedditDesktopBanner />
          </div>
          <a 
            href="/assets/banners/reddit-desktop.svg" 
            download
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            Download SVG
          </a>
        </section>

        {/* Reddit Mobile Banner - 1600x480 */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-semibold">Reddit Mobile Banner</h2>
            <span className="text-zinc-500 text-sm">1600 × 480 px</span>
          </div>
          <p className="text-zinc-400 text-sm">Mobile-optimized. Stacked layout, tighter spacing.</p>
          <div className="rounded-lg overflow-hidden">
            <RedditMobileBanner />
          </div>
          <a 
            href="/assets/banners/reddit-mobile.svg" 
            download
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            Download SVG
          </a>
        </section>

        {/* Twitter/X Header - 1500x500 */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-semibold">X (Twitter) Header</h2>
            <span className="text-zinc-500 text-sm">1500 × 500 px</span>
          </div>
          <p className="text-zinc-400 text-sm">Profile header. Centered, balanced.</p>
          <div className="rounded-lg overflow-hidden">
            <TwitterBanner />
          </div>
          <a 
            href="/assets/banners/twitter-header.svg" 
            download
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            Download SVG
          </a>
        </section>

        {/* Square Profile - 400x400 */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-semibold">Profile Picture</h2>
            <span className="text-zinc-500 text-sm">400 × 400 px</span>
          </div>
          <p className="text-zinc-400 text-sm">Avatar. Just the sprite - this is his moment.</p>
          <div className="rounded-lg overflow-hidden inline-block">
            <ProfilePic />
          </div>
          <div className="block">
            <a 
              href="/assets/banners/profile-pic.svg" 
              download
              className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
            >
              Download SVG
            </a>
          </div>
        </section>

        {/* Open Graph / Social Share - 1200x630 */}
        <section className="space-y-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-semibold">Open Graph / Social Share</h2>
            <span className="text-zinc-500 text-sm">1200 × 630 px</span>
          </div>
          <p className="text-zinc-400 text-sm">Link previews. ~1.9:1 ratio.</p>
          <div className="rounded-lg overflow-hidden">
            <OpenGraphBanner />
          </div>
          <a 
            href="/assets/banners/og-image.svg" 
            download
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            Download SVG
          </a>
        </section>

        {/* Footer */}
        <footer className="text-center text-zinc-500 text-sm pt-8 border-t border-zinc-800">
          <p>Wordmark-forward design. Sprite as subtle accent (except profile pic where he&apos;s the star).</p>
        </footer>
      </div>
    </div>
  );
}

// ============================================
// LINKEDIN COVER - 1128x191 (super wide)
// Centered wordmark, small sprite top-right
// ============================================
function LinkedInBanner() {
  return (
    <svg width="100%" viewBox="0 0 1128 191" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="li-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="li-cheek" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
        <radialGradient id="li-bg-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="li-body" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="60%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </radialGradient>
        <radialGradient id="li-inner" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="1128" height="191" fill="#09090b"/>
      <rect width="1128" height="191" fill="url(#li-bg-glow)"/>

      {/* Wordmark - centered */}
      <text 
        x="564" 
        y="82" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, sans-serif" 
        fontWeight="700" 
        fontSize="52"
        letterSpacing="-0.03em"
      >
        <tspan fill="white">Hatch</tspan><tspan fill="#10b981">It</tspan>
      </text>

      {/* Tagline */}
      <text 
        x="564" 
        y="105" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif" 
        fontWeight="400" 
        fontSize="14"
        fill="#71717a"
        letterSpacing="0.02em"
      >
        Ship your ideas. Fast.
      </text>
    </svg>
  );
}

// ============================================
// REDDIT DESKTOP - 1920x384
// Centered wordmark, small sprite accent
// ============================================
function RedditDesktopBanner() {
  return (
    <svg width="100%" viewBox="0 0 1920 384" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="rd-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="rd-cheek" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
        <radialGradient id="rd-bg-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="rd-body" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="60%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </radialGradient>
        <radialGradient id="rd-inner" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="1920" height="384" fill="#09090b"/>
      <rect width="1920" height="384" fill="url(#rd-bg-glow)"/>

      {/* Centered wordmark */}
      <text 
        x="960" 
        y="175" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, sans-serif" 
        fontWeight="700" 
        fontSize="86"
        letterSpacing="-0.03em"
      >
        <tspan fill="white">Hatch</tspan><tspan fill="#10b981">It</tspan>
      </text>

      {/* Tagline */}
      <text 
        x="960" 
        y="205" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif" 
        fontWeight="400" 
        fontSize="20"
        fill="#71717a"
        letterSpacing="0.01em"
      >
        Ship your ideas. Fast.
      </text>
    </svg>
  );
}

// ============================================
// REDDIT MOBILE - 1600x480 (taller)
// Stacked layout, tighter spacing
// ============================================
function RedditMobileBanner() {
  return (
    <svg width="100%" viewBox="0 0 1600 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="rm-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="rm-cheek" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
        <radialGradient id="rm-bg-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="rm-body" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="60%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </radialGradient>
        <radialGradient id="rm-inner" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="1600" height="480" fill="#09090b"/>
      <rect width="1600" height="480" fill="url(#rm-bg-glow)"/>

      {/* Centered wordmark */}
      <text 
        x="800" 
        y="220" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, sans-serif" 
        fontWeight="700" 
        fontSize="72"
        letterSpacing="-0.03em"
      >
        <tspan fill="white">Hatch</tspan><tspan fill="#10b981">It</tspan>
      </text>

      {/* Tagline */}
      <text 
        x="800" 
        y="252" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif" 
        fontWeight="400" 
        fontSize="20"
        fill="#71717a"
        letterSpacing="0.01em"
      >
        Ship your ideas. Fast.
      </text>
    </svg>
  );
}

// ============================================
// TWITTER/X HEADER - 1500x500
// Centered wordmark, subtle sprite
// ============================================
function TwitterBanner() {
  return (
    <svg width="100%" viewBox="0 0 1500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="tw-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="tw-cheek" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
        <radialGradient id="tw-bg-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="tw-body" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="60%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </radialGradient>
        <radialGradient id="tw-inner" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="1500" height="500" fill="#09090b"/>
      <rect width="1500" height="500" fill="url(#tw-bg-glow)"/>

      {/* Centered wordmark */}
      <text 
        x="750" 
        y="230" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, sans-serif" 
        fontWeight="700" 
        fontSize="92"
        letterSpacing="-0.03em"
      >
        <tspan fill="white">Hatch</tspan><tspan fill="#10b981">It</tspan>
      </text>

      {/* Tagline */}
      <text 
        x="750" 
        y="265" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif" 
        fontWeight="400" 
        fontSize="22"
        fill="#71717a"
        letterSpacing="0.01em"
      >
        Ship your ideas. Fast.
      </text>
    </svg>
  );
}

// ============================================
// PROFILE PIC - 400x400 (just sprite)
// ============================================
function ProfilePic() {
  return (
    <svg width="200" height="200" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="pp-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="pp-cheek" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3"/>
        </filter>
        <radialGradient id="pp-bg-glow" cx="50%" cy="45%" r="40%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="pp-body" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="60%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </radialGradient>
        <radialGradient id="pp-inner" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="400" height="400" fill="#09090b"/>
      <rect width="400" height="400" fill="url(#pp-bg-glow)"/>

      {/* Sprite centered */}
      <g transform="translate(200, 200) scale(3.2)">
        <ellipse cx="0" cy="4" rx="22" ry="24" fill="#10b981" opacity="0.15" filter="url(#pp-glow)"/>
        <path 
          d="M0 -22 C 15 -16, 19 0, 18 13 C 16 24, 8 30, 0 30 C -8 30, -16 24, -18 13 C -19 0, -15 -16, 0 -22 Z" 
          fill="url(#pp-body)" 
          filter="url(#pp-glow)"
        />
        <ellipse cx="0" cy="3" rx="10" ry="14" fill="url(#pp-inner)"/>
        <ellipse cx="0" cy="-16" rx="4" ry="2" fill="white" opacity="0.3"/>
        <ellipse cx="-12" cy="8" rx="4" ry="3" fill="#fca5a5" opacity="0.25" filter="url(#pp-cheek)"/>
        <ellipse cx="12" cy="8" rx="4" ry="3" fill="#fca5a5" opacity="0.25" filter="url(#pp-cheek)"/>
        <g transform="translate(-1, 4)">
          <ellipse cx="-6" cy="0" rx="2.5" ry="3" fill="#09090b" opacity="0.9"/>
          <circle cx="-6.5" cy="0.8" r="0.9" fill="white" opacity="0.9"/>
          <ellipse cx="6" cy="0" rx="2.5" ry="3" fill="#09090b" opacity="0.9"/>
          <circle cx="5.5" cy="0.8" r="0.9" fill="white" opacity="0.9"/>
        </g>
        <path d="M-3 12 Q 0 14, 3 12" stroke="#09090b" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/>
      </g>
    </svg>
  );
}

// ============================================
// OPEN GRAPH - 1200x630 (social share)
// Centered wordmark, sprite as subtle accent
// ============================================
function OpenGraphBanner() {
  return (
    <svg width="100%" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="og-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="og-cheek" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
        <radialGradient id="og-bg-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="og-body" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="60%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </radialGradient>
        <radialGradient id="og-inner" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="1200" height="630" fill="#09090b"/>
      <rect width="1200" height="630" fill="url(#og-bg-glow)"/>

      {/* Centered wordmark */}
      <text 
        x="600" 
        y="295" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, sans-serif" 
        fontWeight="700" 
        fontSize="100"
        letterSpacing="-0.03em"
      >
        <tspan fill="white">Hatch</tspan><tspan fill="#10b981">It</tspan>
      </text>

      {/* Tagline */}
      <text 
        x="600" 
        y="335" 
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif" 
        fontWeight="400" 
        fontSize="26"
        fill="#71717a"
        letterSpacing="0.01em"
      >
        Ship your ideas. Fast.
      </text>
    </svg>
  );
}
