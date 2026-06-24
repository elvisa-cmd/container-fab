'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronRight, Clock, Tag, CheckCircle,
  ArrowLeft, Phone, X,
} from 'lucide-react'
import type { Service } from '@/types'

interface Props {
  service: Service
  related: Service[]
}

export default function ServiceDetail({ service, related }: Props) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const hasGallery = Array.isArray(service.gallery) && service.gallery.length > 0
  const hasCover   = Boolean(service.cover_image)

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section
        aria-label={`${service.title} hero`}
        className="relative flex items-center"
        style={{ minHeight: '70vh', background: '#1A1F2E' }}
      >
        {hasCover && (
          <>
            <Image
              src={service.cover_image}
              alt={`${service.title} — Container Fabricators Kenya`}
              fill
              className="object-cover"
              style={{ objectFit: 'cover' }}
              priority
              unoptimized
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-steel/80" />
          </>
        )}
        {!hasCover && (
          <div
            className="hidden lg:block absolute right-0 top-0 bottom-0 w-[6px] opacity-[0.85] z-10"
            style={{ background: '#C94C1A', clipPath: 'polygon(40% 0, 100% 0, 60% 100%, 0% 100%)' }}
          />
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/50 text-sm font-barlow mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">{service.title}</span>
          </nav>

          <div className="text-5xl mb-4" aria-hidden="true">{service.icon}</div>
          <h1
            className="font-barlow font-800 text-white uppercase leading-none mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
          >
            {service.title}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mb-10 leading-relaxed">
            {service.description}
          </p>

          {/* Stat badges */}
          <div className="flex flex-wrap gap-3 mb-10">
            {service.starting_price && (
              <div className="flex items-center gap-2 bg-rust px-4 py-2 text-white font-barlow font-700 text-sm uppercase tracking-wider">
                <Tag className="w-4 h-4" aria-hidden="true" />
                {service.starting_price}
              </div>
            )}
            {service.delivery_time && (
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 text-white font-barlow font-600 text-sm uppercase tracking-wider">
                <Clock className="w-4 h-4" aria-hidden="true" />
                {service.delivery_time}
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-8 py-4 hover:bg-rust-lt transition-colors"
            >
              Get a Free Quote
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-barlow font-700 text-sm uppercase tracking-widest px-6 py-4 hover:border-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── DESCRIPTION + FEATURES ────────────────────────────────────────── */}
      <section aria-label="Service description and features" className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Left — description + process */}
            <div className="lg:col-span-3 space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-0.5 bg-rust" />
                  <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">
                    About This Service
                  </span>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {service.full_description || service.description}
                </p>
              </div>

              {service.process && (
                <div>
                  <h2 className="font-barlow font-800 text-2xl text-steel uppercase tracking-widest mb-4">
                    How It Works
                  </h2>
                  <div className="border-l-4 border-rust pl-6 py-2">
                    <p className="text-gray-600 leading-relaxed">{service.process}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right — features card */}
            <div className="lg:col-span-2">
              <div className="bg-steel p-8 sticky top-24">
                <h3 className="font-barlow font-800 text-lg text-white uppercase tracking-widest mb-6">
                  Key Features
                </h3>
                <ul className="space-y-3 mb-8">
                  {(service.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-rust shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-200 text-sm leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-white/10 pt-6 space-y-3 mb-8">
                  {service.starting_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs font-barlow uppercase tracking-wider">Starting From</span>
                      <span className="font-barlow font-800 text-rust text-lg">{service.starting_price}</span>
                    </div>
                  )}
                  {service.delivery_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs font-barlow uppercase tracking-wider">Delivery Time</span>
                      <span className="text-white text-sm font-barlow font-600">{service.delivery_time}</span>
                    </div>
                  )}
                </div>

                <Link
                  href="/#contact"
                  className="w-full flex items-center justify-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest py-4 hover:bg-rust-lt transition-colors"
                >
                  Request a Quote
                </Link>
                <a
                  href="https://api.whatsapp.com/send?phone=254715296324"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 mt-3 border border-white/20 text-white/70 font-barlow font-600 text-sm uppercase tracking-widest py-3 hover:border-white hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────────────────────────────── */}
      <section aria-label="Project gallery" className="py-16" style={{ background: '#F0EDE8' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-0.5 bg-rust" />
            <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">
              Project Gallery
            </span>
          </div>
          <h2 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest mb-8">
            Our Work
          </h2>

          {hasGallery ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {service.gallery.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`${service.title} project by Container Fabricators Kenya — photo ${i + 1}`}
                  onClick={() => setLightboxUrl(url)}
                  style={{
                    width: '100%', height: 240,
                    objectFit: 'cover', borderRadius: 8, cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-12 text-center">
              Gallery coming soon — check back after we upload project photos.
            </p>
          )}
        </div>
      </section>

      {/* ── RELATED SERVICES ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section aria-label="Related services" className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <h2 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest mb-10">
              Other Services
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="group relative bg-white border border-gray-100 p-8 hover:border-rust hover:shadow-[0_0_0_1px_#C94C1A] transition-all duration-300 overflow-hidden block"
                >
                  <div className="absolute top-4 right-4 font-barlow font-800 text-7xl text-gray-50 leading-none select-none pointer-events-none group-hover:text-rust/10 transition-colors">
                    {s.number}
                  </div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-4" aria-hidden="true">{s.icon}</div>
                    <h3 className="font-barlow font-700 text-lg uppercase tracking-widest text-steel mb-3">
                      {s.title}
                    </h3>
                    <p className="text-sm text-mid-gray leading-relaxed mb-4">{s.description}</p>
                    <span className="text-rust text-xs font-barlow uppercase tracking-widest font-700 flex items-center gap-1">
                      Learn More <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section aria-label="Call to action" className="bg-steel py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-barlow font-800 text-4xl lg:text-5xl text-white uppercase leading-tight mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Contact us today for a free consultation and quote on your{' '}
            {service.title.toLowerCase()} project.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-8 py-4 hover:bg-rust-lt transition-colors"
            >
              Get a Quote
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=254715296324"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-barlow font-700 text-sm uppercase tracking-widest px-8 py-4 text-white transition-colors"
              style={{ background: '#25D366' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1ebe5a')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#25D366')}
            >
              <Phone className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ── GALLERY LIGHTBOX ───────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/92"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close gallery"
          >
            <X className="w-9 h-9" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Gallery full size"
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
