'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Service } from '@/types'

export default function Services({ services }: { services: Service[] }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" ref={ref} className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="reveal text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-rust" />
            <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">
              What We Do
            </span>
            <div className="w-8 h-0.5 bg-rust" />
          </div>
          <h2 className="font-barlow font-800 text-4xl lg:text-5xl text-steel uppercase leading-tight">
            Our Services
          </h2>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className={`reveal reveal-delay-${Math.min(i + 1, 5)} group relative bg-white border border-gray-100 p-8 hover:border-rust hover:shadow-[0_0_0_1px_#C94C1A] transition-all duration-300 overflow-hidden block`}
            >
              {/* Ghost number */}
              <div className="absolute top-4 right-4 font-barlow font-800 text-7xl text-gray-50 leading-none select-none pointer-events-none group-hover:text-rust/10 transition-colors">
                {s.number}
              </div>

              <div className="relative z-10">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="service-underline font-barlow font-700 text-lg uppercase tracking-widest text-steel mb-3 inline-block">
                  {s.title}
                </h3>
                <p className="text-sm text-mid-gray leading-relaxed mb-4">{s.description}</p>
                {/* Learn more — always visible, reinforces clickability */}
                <span className="flex items-center gap-1 text-rust text-xs font-barlow font-700 uppercase tracking-widest">
                  Learn More <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
