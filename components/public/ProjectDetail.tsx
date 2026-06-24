'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronRight, ChevronLeft, X, MapPin, Calendar,
  User, CheckCircle, Clock, Phone,
} from 'lucide-react'
import type { Project } from '@/types'

interface Props {
  project: Project
  related: Project[]
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    'Completed': { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    'Ongoing':   { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
    'Planning':  { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  }
  const s = cfg[status] ?? cfg['Planning']
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 3, padding: '3px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
      {status}
    </span>
  )
}

export default function ProjectDetail({ project, related }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const allImgs = [
    ...(project.cover_image ? [project.cover_image] : []),
    ...(project.gallery ?? []),
  ]

  const openLightbox = (idx: number) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)

  const goPrev = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i - 1 + allImgs.length) % allImgs.length))
  }, [allImgs.length])

  const goNext = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i + 1) % allImgs.length))
  }, [allImgs.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'Escape')     closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx, goPrev, goNext])

  // Prevent body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxIdx])

  const hasGallery = allImgs.length > 0

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxIdx !== null && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            style={{ position: 'absolute', top: 20, right: 20, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', background: 'none', border: 'none' }}
            onClick={closeLightbox}
          >
            <X size={32} />
          </button>

          {/* Counter */}
          <p style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            {lightboxIdx + 1} / {allImgs.length}
          </p>

          {/* Prev */}
          {allImgs.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={allImgs[lightboxIdx]}
            alt={`${project.title} — photo ${lightboxIdx + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 4 }}
          />

          {/* Next */}
          {allImgs.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative', minHeight: '70vh',
          background: '#1A1F2E', display: 'flex', alignItems: 'flex-end',
        }}
      >
        {project.cover_image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover_image}
              alt={project.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,18,30,0.6)' }} />
          </>
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{project.title}</span>
          </nav>

          <p style={{ color: '#C94C1A', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif", fontWeight: 600, marginBottom: 10 }}>
            {project.category}
          </p>
          <h1
            className="font-barlow font-800 text-white uppercase mb-8"
            style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 0.95 }}
          >
            {project.title}
          </h1>

          {/* Pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { Icon: MapPin,      val: project.location },
              { Icon: Calendar,    val: project.year },
              { Icon: CheckCircle, val: project.status },
            ].filter((x) => x.val).map(({ Icon, val }) => (
              <span key={val} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 2, padding: '4px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon size={13} /> {val}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECT INFO ───────────────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Left */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <p style={{ color: '#C94C1A', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif", fontWeight: 600, marginBottom: 12 }}>
                  About This Project
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">{project.description}</p>
              </div>
              {project.client && (
                <p className="text-gray-500 text-sm">Client: <strong className="text-steel">{project.client}</strong></p>
              )}
              <StatusBadge status={project.status} />
            </div>

            {/* Right */}
            <div className="lg:col-span-2">
              <div className="bg-steel p-8">
                <h3 className="font-barlow font-800 text-lg text-white uppercase tracking-widest mb-6">Project Details</h3>
                <div className="space-y-4 mb-8">
                  {[
                    { label: 'Category', val: project.category, Icon: null },
                    { label: 'Location', val: project.location, Icon: MapPin },
                    { label: 'Year',     val: project.year,     Icon: Calendar },
                    { label: 'Status',   val: project.status,   Icon: Clock },
                    { label: 'Client',   val: project.client,   Icon: User },
                  ].filter((r) => r.val).map(({ label, val, Icon }) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <span className="text-gray-400 text-xs font-barlow uppercase tracking-wider shrink-0 flex items-center gap-1.5">
                        {Icon && <Icon size={12} />} {label}
                      </span>
                      <span className="text-white text-sm text-right">{val}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/#contact"
                  className="w-full flex items-center justify-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest py-4 hover:bg-rust-lt transition-colors"
                >
                  Start a Similar Project
                </Link>
                <a
                  href="https://api.whatsapp.com/send?phone=254715296324"
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 mt-3 border border-white/20 text-white/70 font-barlow font-600 text-sm uppercase tracking-widest py-3 hover:border-white hover:text-white transition-colors"
                >
                  <Phone size={14} /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────────────────────────────── */}
      {hasGallery && (
        <section className="py-16" style={{ background: '#F0EDE8' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-0.5 bg-rust" />
              <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">Project Gallery</span>
            </div>
            <h2 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest mb-1">Photos</h2>
            <p className="text-gray-400 text-sm mb-8">{allImgs.length} photo{allImgs.length !== 1 ? 's' : ''} · Click to expand</p>

            {/* First image full-width */}
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allImgs[0]}
                alt={`${project.title} — main photo`}
                onClick={() => openLightbox(0)}
                style={{ width: '100%', height: 480, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', display: 'block' }}
              />
            </div>

            {/* Remaining in 3-col grid */}
            {allImgs.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allImgs.slice(1).map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`${project.title} — photo ${i + 2}`}
                    onClick={() => openLightbox(i + 1)}
                    style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', display: 'block', transition: 'filter 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = '')}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── RELATED PROJECTS ───────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest mb-10">More Projects</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="block relative overflow-hidden rounded-[4px] group"
                  style={{ aspectRatio: '4/3' }}
                >
                  {p.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.cover_image} alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }}
                      className="group-hover:scale-105"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#1A1F2E' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,18,30,0.9) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.2rem' }}>
                    <p style={{ color: '#C94C1A', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif", fontWeight: 600, marginBottom: 3 }}>
                      {p.category}
                    </p>
                    <h3 style={{ color: '#fff', fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase' }}>
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="bg-steel py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-barlow font-800 text-4xl text-white uppercase leading-tight mb-3">
            Inspired by This Project?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Let&apos;s build something amazing together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/#contact" className="inline-flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-8 py-4 hover:bg-rust-lt transition-colors">
              Get a Quote
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=254715296324"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-barlow font-700 text-sm uppercase tracking-widest px-8 py-4 text-white transition-colors"
              style={{ background: '#25D366' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1ebe5a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#25D366')}
            >
              <Phone size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
