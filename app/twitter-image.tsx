import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'HatchIt - The Singularity Interface'
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
          fontFamily: 'sans-serif',
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
            opacity: 0.2,
          }}
        />

        {/* Glow Effect */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
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
          {/* Logo / Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
              boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          {/* Title - REMOVED */}
          {/* 
          <div
            style={{
              fontSize: '80px',
              fontWeight: 800,
              color: 'white',
              marginBottom: '10px',
              letterSpacing: '-0.05em',
              textShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
            }}
          >
            HatchIt
          </div>
          */}

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: '#a1a1aa',
              marginBottom: '40px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            The Singularity Interface
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '24px',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '10px 30px',
              borderRadius: '100px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            Speak your intent. Watch the code evolve.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
