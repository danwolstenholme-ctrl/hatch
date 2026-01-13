import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'HatchIt - Describe it. Build it. Ship it.'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'

// Inline the favicon SVG as a data URL
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="emerald" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#6ee7b7"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="55%" r="45%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="#10b981" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="none" stroke="#27272a" stroke-opacity="0.8"/>
  <ellipse cx="16" cy="17" rx="11" ry="9" fill="url(#glow)"/>
  <text x="16" y="21" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="15" letter-spacing="-0.5" fill="url(#emerald)">It</text>
</svg>`

const faviconDataUrl = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Actual favicon */}
          <img
            src={faviconDataUrl}
            width={80}
            height={80}
            style={{
              marginBottom: '32px',
              boxShadow: '0 0 80px rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              display: 'flex',
            }}
          >
            <span style={{ color: 'white' }}>Hatch</span>
            <span style={{ color: '#10b981' }}>It</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '24px',
              color: '#71717a',
            }}
          >
            Describe it. Build it. Ship it.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
