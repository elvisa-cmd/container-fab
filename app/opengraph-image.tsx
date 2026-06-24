import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Container Fabricators Kenya — Shipping Container Offices, Homes & Commercial Spaces'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1F2E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Rust accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#C94C1A',
          }}
        />

        {/* CF mark */}
        <div
          style={{
            width: 72,
            height: 72,
            background: '#C94C1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <span style={{ color: 'white', fontSize: 28, fontWeight: 900, letterSpacing: '0.1em' }}>
            CF
          </span>
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          CONTAINER FABRICATORS
        </div>

        <div
          style={{
            fontSize: 36,
            color: '#C94C1A',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 40,
          }}
        >
          KENYA
        </div>

        <div
          style={{
            width: 60,
            height: 3,
            background: '#C94C1A',
            marginBottom: 40,
          }}
        />

        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.65)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Shipping Container Offices, Homes &amp; Commercial Spaces in Nairobi
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 16,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.05em',
          }}
        >
          containerfabricators.co.ke &nbsp;|&nbsp; +254 715 296324
        </div>
      </div>
    ),
    { ...size },
  )
}
