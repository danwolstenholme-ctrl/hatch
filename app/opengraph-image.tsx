import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'HatchIt - Describe it. Build it. Ship it.'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
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
        {/* Grid Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(to right, #18181b 1px, transparent 1px), linear-gradient(to bottom, #18181b 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            opacity: 0.3,
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, transparent, #10b981, transparent)',
          }}
        />

        {/* Glow Effect */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
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
          {/* "It" Logo */}
          <div
            style={{
              width: '100px',
              height: '100px',
              background: '#18181b',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              border: '1px solid #27272a',
              boxShadow: '0 0 60px rgba(16, 185, 129, 0.2)',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#10b981',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              It
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            HatchIt
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '28px',
              color: '#a1a1aa',
              marginBottom: '40px',
            }}
          >
            Describe it. Build it. Ship it.
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: '20px',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '12px 32px',
              borderRadius: '100px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            AI-assisted React websites → Your GitHub → Live
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
