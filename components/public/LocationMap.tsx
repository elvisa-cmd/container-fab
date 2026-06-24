'use client'

import { MapPin, Phone, Mail, Clock, ExternalLink, MessageCircle } from 'lucide-react'
import type { LocationData } from '@/types'

interface Props { location: LocationData }

// ── L-shaped corner accent ─────────────────────────────────────────────────
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 24, height: 24,
    pointerEvents: 'none',
    zIndex: 3,
  }
  const variants: Record<string, React.CSSProperties> = {
    tl: { top: 12,  left: 12,  borderTop:    '3px solid #C94C1A', borderLeft:   '3px solid #C94C1A' },
    tr: { top: 12,  right: 12, borderTop:    '3px solid #C94C1A', borderRight:  '3px solid #C94C1A' },
    bl: { bottom: 12, left: 12,  borderBottom: '3px solid #C94C1A', borderLeft: '3px solid #C94C1A' },
    br: { bottom: 12, right: 12, borderBottom: '3px solid #C94C1A', borderRight:'3px solid #C94C1A' },
  }
  return <div style={{ ...base, ...variants[pos] }} />
}

// ── Info row ────────────────────────────────────────────────────────────────
function InfoRow({ Icon, label, children }: {
  Icon: React.ElementType; label: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{
        width: 44, height: 44, flexShrink: 0,
        border: '1.5px solid rgba(201,76,26,0.4)',
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} style={{ color: '#C94C1A' }} />
      </div>
      <div>
        <p style={{
          textTransform: 'uppercase', fontSize: '0.65rem',
          letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)',
          marginBottom: 3,
          fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
          fontWeight: 600,
        }}>
          {label}
        </p>
        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.55 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LocationMap({ location }: Props) {
  const { lat, lng } = location

  const mapSrc =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${lng - 0.008},${lat - 0.008},${lng + 0.008},${lat + 0.008}` +
    `&layer=mapnik&marker=${lat},${lng}`

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  // Coordinates badge string (S for southern, E for eastern hemisphere)
  const coordLabel = `${Math.abs(lat).toFixed(4)}° ${lat < 0 ? 'S' : 'N'}  ${Math.abs(lng).toFixed(4)}° ${lng > 0 ? 'E' : 'W'}`

  return (
    <section id="location" aria-label="Our location" style={{ background: '#1A1F2E' }}>

      {/* Rust gradient divider */}
      <div style={{
        height: 4,
        background: 'linear-gradient(to right, transparent 0%, #C94C1A 20%, #C94C1A 80%, transparent 100%)',
      }} />

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 560 }}>

        {/* ── LEFT — Info panel ─────────────────────────────────────────── */}
        <div
          className="w-full lg:w-[42%] shrink-0"
          style={{
            background: '#111620',
            padding: 'clamp(2.5rem,5vw,5rem) clamp(1.5rem,4vw,3.5rem)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p style={{
            color: '#C94C1A', fontSize: '0.7rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
            fontWeight: 600, marginBottom: '0.5rem',
          }}>
            Find Us
          </p>

          <h2 style={{
            fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
            fontWeight: 800, fontSize: 'clamp(2rem,3vw,2.8rem)',
            lineHeight: 0.95, marginBottom: '2rem',
          }}>
            <span style={{ display: 'block', color: '#ffffff' }}>Visit Our</span>
            <span style={{ display: 'block', color: '#C94C1A' }}>Fabrication Yard</span>
          </h2>

          <div style={{ width: 60, height: 3, background: '#C94C1A', marginBottom: '2rem' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <InfoRow Icon={MapPin} label="Address">
              {location.address}
            </InfoRow>
            <InfoRow Icon={Phone} label="Phone">
              <a href={`tel:${location.phone1.replace(/\s/g, '')}`}
                style={{ color: '#fff', textDecoration: 'none' }}>
                {location.phone1}
              </a>
              {location.phone2 && (
                <><br />
                  <a href={`tel:${location.phone2.replace(/\s/g, '')}`}
                    style={{ color: '#fff', textDecoration: 'none' }}>
                    {location.phone2}
                  </a>
                </>
              )}
            </InfoRow>
            <InfoRow Icon={Mail} label="Email">
              <a href={`mailto:${location.email}`}
                style={{ color: '#fff', textDecoration: 'none' }}>
                {location.email}
              </a>
            </InfoRow>
            <InfoRow Icon={Clock} label="Hours">
              {location.hours_weekday}
              <br />{location.hours_saturday}
            </InfoRow>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#C94C1A', color: '#fff',
                padding: '12px 24px', borderRadius: 2,
                fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
                fontWeight: 700, fontSize: '0.85rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#E05A20')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#C94C1A')}
            >
              Get Directions <ExternalLink size={14} />
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=254715296324"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: '#fff',
                padding: '12px 24px', borderRadius: 2,
                border: '1.5px solid rgba(255,255,255,0.2)',
                fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
                fontWeight: 700, fontSize: '0.85rem',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>

        {/* ── RIGHT — Map ───────────────────────────────────────────────── */}
        <div
          className="w-full lg:flex-1 order-first lg:order-last"
          style={{ position: 'relative', minHeight: 320 }}
        >
          {/* Left gradient — blends with info panel (desktop only) */}
          <div
            className="hidden lg:block"
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 80,
              background: 'linear-gradient(to right, #111620, transparent)',
              pointerEvents: 'none', zIndex: 2,
            }}
          />

          {/* Corner accents */}
          <Corner pos="tl" />
          <Corner pos="tr" />
          <Corner pos="bl" />
          <Corner pos="br" />

          {/* OpenStreetMap iframe */}
          <iframe
            src={mapSrc}
            title="Container Fabricators Kenya Location"
            style={{
              width: '100%', height: '100%',
              minHeight: 320,
              border: 'none',
              display: 'block',
              filter: 'contrast(1.05) saturate(0.9)',
            }}
            loading="lazy"
          />

          {/* Brand badge — top-right */}
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 4,
            background: 'rgba(17,22,32,0.92)',
            border: '1.5px solid rgba(201,76,26,0.6)',
            borderRadius: 4, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            pointerEvents: 'none',
          }}>
            <MapPin size={16} style={{ color: '#C94C1A', flexShrink: 0 }} />
            <div>
              <p style={{
                color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                margin: 0, lineHeight: 1.2,
                fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
              }}>Container Fabricators</p>
              <p style={{
                color: '#C94C1A', fontSize: '0.7rem',
                margin: 0, lineHeight: 1.2,
                fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
              }}>
                {location.city}, {location.country}
              </p>
            </div>
          </div>

          {/* Coordinates badge — bottom-left (offset to avoid left gradient) */}
          <div style={{
            position: 'absolute', bottom: 16, left: 90, zIndex: 4,
            background: 'rgba(17,22,32,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4, padding: '6px 12px',
            fontSize: '0.7rem', letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.5)',
            pointerEvents: 'none',
            fontFamily: 'monospace',
          }}>
            {coordLabel}
          </div>
        </div>

      </div>
    </section>
  )
}
