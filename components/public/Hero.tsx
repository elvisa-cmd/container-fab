'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'
import HeroSlider from './HeroSlider'
import type { HeroContent } from '@/types'

const SLIDE_DURATION = 7000 // ms between slides

export default function Hero({ data }: { data: HeroContent }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Build slides from data.slides; fall back to single image_url
  const slides: string[] = (
    data.slides?.length
      ? data.slides.map((s) => s.image_url)
      : [data.image_url]
  ).filter(Boolean) as string[]

  const total = slides.length

  // Auto-advance
  useEffect(() => {
    if (total <= 1) return
    const id = setInterval(() => setCurrentSlide((i) => (i + 1) % total), SLIDE_DURATION)
    return () => clearInterval(id)
  }, [total])

  // Shared animation style helpers
  const anim = (name: 'fadeInDown' | 'fadeInUp', delay: number): React.CSSProperties => ({
    animationName:           name,
    animationDuration:       name === 'fadeInDown' ? '0.6s' : '0.7s',
    animationTimingFunction: 'ease-out',
    animationFillMode:       'both',
    animationDelay:          `${delay}s`,
  })

  const stats = [
    { value: data.stat_years,    label: 'Years Experience' },
    { value: data.stat_projects, label: 'Projects Completed' },
    { value: data.stat_warranty, label: 'Warranty' },
  ].filter((s) => s.value)

  const padSlide = (n: number) => String(n).padStart(2, '0')

  return (
    <section
      id="hero"
      style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}
    >
      {/* ── Background slider ─────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <HeroSlider images={slides} currentIndex={currentSlide} />
      </div>

      {/* ── Gradient overlay ─────────────────────────────────────────────── */}
      {/* Mobile: uniform dark */}
      <div
        className="md:hidden"
        style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(15,18,30,0.85)' }}
      />
      {/* Desktop: left-to-right fade so image shows on right */}
      <div
        className="hidden md:block"
        style={{
          position: 'absolute',
          inset:    0,
          zIndex:   1,
          background:
            'linear-gradient(to right, rgba(15,18,30,0.88) 0%, rgba(15,18,30,0.75) 40%, rgba(15,18,30,0.35) 70%, rgba(15,18,30,0.1) 100%)',
        }}
      />

      {/* ── Text content ─────────────────────────────────────────────────── */}
      <div
        style={{
          position:     'relative',
          zIndex:       2,
          paddingLeft:  '5vw',
          paddingRight: '5vw',
          paddingBottom: 80,
          maxWidth:     700,
        }}
        className="pt-[100px] md:pt-[140px]"
      >
        {/* Eyebrow */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, ...anim('fadeInDown', 0.2) }}
        >
          <div style={{ width: 48, height: 2, background: '#C94C1A', flexShrink: 0 }} />
          <span
            style={{
              fontSize:      '0.75rem',
              letterSpacing: '0.2em',
              color:         '#C94C1A',
              fontWeight:    600,
              textTransform: 'uppercase',
              fontFamily:    "var(--font-barlow), 'Barlow Condensed', sans-serif",
            }}
          >
            Nairobi, Kenya
          </span>
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontFamily:    "var(--font-barlow), 'Barlow Condensed', sans-serif",
            fontWeight:    900,
            textTransform: 'uppercase',
            lineHeight:    0.92,
            marginBottom:  28,
            ...anim('fadeInUp', 0.3),
          }}
          className="text-[clamp(2.5rem,10vw,4rem)] md:text-[clamp(3rem,7vw,6.5rem)]"
        >
          <span style={{ display: 'block', color: '#ffffff' }}>{data.headline_line1}</span>
          <span style={{ display: 'block', color: '#C94C1A' }}>{data.headline_accent}</span>
          <span style={{ display: 'block', color: '#ffffff' }}>{data.headline_line2}</span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize:      'clamp(1rem, 1.5vw, 1.15rem)',
            color:         'rgba(255,255,255,0.75)',
            lineHeight:    1.7,
            maxWidth:      580,
            marginBottom:  40,
            ...anim('fadeInUp', 0.5),
          }}
        >
          {data.subtext}
        </p>

        {/* Buttons */}
        <div
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', ...anim('fadeInUp', 0.7) }}
          className="flex-col sm:flex-row"
        >
          <a
            href="#services"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              background:     '#C94C1A',
              color:          'white',
              padding:        '14px 28px',
              fontFamily:     "var(--font-barlow), 'Barlow Condensed', sans-serif",
              fontWeight:     700,
              fontSize:       '0.9rem',
              letterSpacing:  '0.1em',
              textTransform:  'uppercase',
              borderRadius:   2,
              textDecoration: 'none',
              transition:     'background 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = '#E05A20'
              el.style.transform  = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = '#C94C1A'
              el.style.transform  = 'translateY(0)'
            }}
          >
            View Services <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#projects"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            8,
              background:     'transparent',
              color:          'white',
              padding:        '14px 28px',
              fontFamily:     "var(--font-barlow), 'Barlow Condensed', sans-serif",
              fontWeight:     700,
              fontSize:       '0.9rem',
              letterSpacing:  '0.1em',
              textTransform:  'uppercase',
              border:         '1.5px solid rgba(255,255,255,0.5)',
              borderRadius:   2,
              textDecoration: 'none',
              transition:     'border-color 0.2s ease, background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'white'
              el.style.background  = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.borderColor = 'rgba(255,255,255,0.5)'
              el.style.background  = 'transparent'
            }}
          >
            View Projects
          </a>
        </div>

        {/* Stats row — hidden on mobile */}
        {stats.length > 0 && (
          <div
            className="hidden md:flex"
            style={{
              marginTop:    48,
              paddingTop:   32,
              borderTop:    '1px solid rgba(255,255,255,0.15)',
              gap:          40,
              ...anim('fadeInUp', 0.9),
            }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontFamily:  "var(--font-barlow), 'Barlow Condensed', sans-serif",
                    fontWeight:  800,
                    fontSize:    '2rem',
                    color:       '#C94C1A',
                    lineHeight:  1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize:      '0.7rem',
                    letterSpacing: '0.12em',
                    color:         'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    marginTop:     4,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Slide dots ───────────────────────────────────────────────────── */}
      {total > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom:   32,
            left:     '5vw',
            zIndex:   10,
            display:  'flex',
            gap:      8,
          }}
          className="bottom-4 md:bottom-8"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrentSlide(i)}
              style={{
                width:        i === currentSlide ? 28 : 8,
                height:       8,
                borderRadius: i === currentSlide ? 4 : '50%',
                background:   i === currentSlide ? '#C94C1A' : 'rgba(255,255,255,0.3)',
                border:       'none',
                padding:      0,
                cursor:       'pointer',
                transition:   'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* ── Slide counter ────────────────────────────────────────────────── */}
      {total > 1 && (
        <div
          style={{
            position:      'absolute',
            bottom:        36,
            right:         '5vw',
            zIndex:        10,
            fontSize:      '0.8rem',
            color:         'rgba(255,255,255,0.35)',
            letterSpacing: '0.1em',
            fontFamily:    "var(--font-barlow), 'Barlow Condensed', sans-serif",
          }}
        >
          {padSlide(currentSlide + 1)} / {padSlide(total)}
        </div>
      )}

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <div
        style={{
          position:  'absolute',
          bottom:    28,
          left:      '50%',
          transform: 'translateX(-50%)',
          zIndex:    10,
        }}
      >
        <a
          href="#about"
          aria-label="Scroll down"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <span
            style={{
              fontSize:      '0.65rem',
              color:         'rgba(255,255,255,0.35)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily:    "var(--font-barlow), 'Barlow Condensed', sans-serif",
            }}
          >
            Scroll
          </span>
          <ChevronDown
            className="w-5 h-5"
            style={{
              color:     'rgba(255,255,255,0.4)',
              animation: 'heroScrollBounce 1.5s ease-in-out infinite',
            }}
          />
        </a>
      </div>
    </section>
  )
}
