'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Customer } from '@/types'

interface CustomersProps {
  customers: Customer[]
}

const FONT = "var(--font-barlow), 'Barlow Condensed', sans-serif"

// ── Per-offset visual config ─────────────────────────────────────────────────
interface CardCfg {
  width: number; height: number; scale: number
  opacity: number; zIndex: number
  border: string; boxShadow: string | undefined
}

function getConfig(absOff: number, isMobile: boolean): CardCfg {
  if (absOff === 0) return {
    width:     isMobile ? 160 : 200,
    height:    isMobile ? 90  : 110,
    scale:     1.2,
    opacity:   1,
    zIndex:    5,
    border:    '2px solid #C94C1A',
    boxShadow: '0 16px 48px rgba(201,76,26,0.4)',
  }
  if (absOff === 1) return {
    width:     isMobile ? 120 : 170,
    height:    isMobile ? 70  : 95,
    scale:     0.88,
    opacity:   isMobile ? 0.5 : 0.65,
    zIndex:    4,
    border:    '1px solid #e5e7eb',
    boxShadow: undefined,
  }
  return {
    width: 150, height: 80,
    scale: 0.72, opacity: 0.35, zIndex: 3,
    border: '1px solid #e5e7eb', boxShadow: undefined,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Customers({ customers }: CustomersProps) {
  const n = customers?.length ?? 0

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused,     setIsPaused]     = useState(false)
  const [pulseDone,    setPulseDone]    = useState(false)
  const [isMobile,     setIsMobile]     = useState(false)
  const touchStartX = useRef(0)

  // Responsive breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // Auto-advance
  useEffect(() => {
    if (isPaused || n <= 1) return
    const id = setInterval(() => setCurrentIndex((i) => (i + 1) % n), 3000)
    return () => clearInterval(id)
  }, [isPaused, n])

  if (n === 0) return null

  const SPACING    = isMobile ? 160 : 220  // px between card centres
  const MAX_OFFSET = isMobile ? 1   : 2    // cards visible each side of centre

  function prev() { setPulseDone(true); setCurrentIndex((i) => (i - 1 + n) % n) }
  function next() { setPulseDone(true); setCurrentIndex((i) => (i + 1) % n) }

  // Signed offset of customer[idx] relative to the centre card
  function signedOffset(idx: number): number {
    let off = (idx - currentIndex + n) % n
    if (off > Math.floor(n / 2)) off -= n
    return off
  }

  const arrowBtn = (
    side: 'left' | 'right',
    onClick: () => void,
  ): React.ReactElement => (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous customer' : 'Next customer'}
      className={pulseDone ? undefined : 'arrow-pulse'}
      style={{
        position:    'absolute',
        [side]:      8,
        top:         '50%',
        transform:   'translateY(-50%)',
        width:       isMobile ? 40 : 52,
        height:      isMobile ? 40 : 52,
        borderRadius: '50%',
        background:  '#C94C1A',
        color:       'white',
        border:      '2px solid rgba(255,255,255,0.2)',
        boxShadow:   pulseDone ? '0 8px 32px rgba(201,76,26,0.55)' : undefined,
        cursor:      'pointer',
        zIndex:      10,
        display:     'flex',
        alignItems:  'center',
        justifyContent: 'center',
        transition:  'background 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background  = '#E05A20'
        el.style.transform   = 'translateY(-50%) scale(1.1)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background  = '#C94C1A'
        el.style.transform   = 'translateY(-50%)'
      }}
    >
      {side === 'left'
        ? <ChevronLeft  size={isMobile ? 20 : 26} />
        : <ChevronRight size={isMobile ? 20 : 26} />}
    </button>
  )

  return (
    <section
      id="customers"
      style={{ background: '#F0EDE8', padding: '5rem 0', overflow: 'hidden' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{
          color: '#C94C1A', fontSize: '0.7rem', letterSpacing: '0.2em',
          textTransform: 'uppercase', fontFamily: FONT, fontWeight: 600, margin: '0 0 10px',
        }}>
          Who We Work With
        </p>
        <h2 style={{
          color: '#1A1F2E', fontSize: '2.8rem', fontFamily: FONT, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, lineHeight: 1,
        }}>
          Our Customers
        </h2>
        <div style={{ width: 60, height: 3, background: '#C94C1A', margin: '8px auto 0', borderRadius: 1.5 }} />
      </div>

      {/* ── Carousel ───────────────────────────────────────────────────────── */}
      <div
        style={{ position: 'relative', padding: '40px 80px' }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft')  prev()
          if (e.key === 'ArrowRight') next()
        }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const diff = e.changedTouches[0].clientX - touchStartX.current
          if (diff > 50) prev(); else if (diff < -50) next()
        }}
      >
        {arrowBtn('left',  prev)}
        {arrowBtn('right', next)}

        {/* Cards — all absolutely positioned relative to the centre line */}
        <div style={{
          position: 'relative',
          height:   isMobile ? 140 : 180,
        }}>
          {customers.map((c, idx) => {
            const off    = signedOffset(idx)
            const absOff = Math.abs(off)
            const cfg    = getConfig(absOff, isMobile)
            const visible = absOff <= MAX_OFFSET

            return (
              <div
                key={c.id}
                onClick={off !== 0 ? () => setCurrentIndex(idx) : undefined}
                aria-label={off !== 0 ? `View ${c.name}` : undefined}
                style={{
                  position:  'absolute',
                  left:      '50%',
                  top:       '50%',
                  width:     cfg.width,
                  height:    cfg.height,
                  // Lateral displacement + scale applied together
                  transform: `translate(calc(-50% + ${off * SPACING}px), -50%) scale(${cfg.scale})`,
                  opacity:   visible ? cfg.opacity : 0,
                  zIndex:    visible ? cfg.zIndex  : 0,
                  pointerEvents: visible && off !== 0 ? 'auto' : off === 0 ? 'auto' : 'none',
                  borderRadius:  10,
                  background:    'white',
                  border:        cfg.border,
                  boxShadow:     cfg.boxShadow,
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                  padding:       16,
                  cursor:        off === 0 ? 'default' : 'pointer',
                  // Spring transition — every positional/visual property animates
                  transition:    'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  flexShrink:    0,
                  overflow:      'hidden',
                }}
              >
                {c.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.logo}
                    alt={c.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(201,76,26,0.1)',
                    border: '1px solid rgba(201,76,26,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', fontWeight: 700,
                    color: '#C94C1A',
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Dots ───────────────────────────────────────────────────────────── */}
      {n > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: '1.5rem' }}>
          {customers.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width:        i === currentIndex ? 24 : 8,
                height:       8,
                borderRadius: i === currentIndex ? 4 : '50%',
                background:   i === currentIndex ? '#C94C1A' : 'rgba(26,31,46,0.25)',
                border:       'none',
                cursor:       'pointer',
                padding:      0,
                transition:   'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
