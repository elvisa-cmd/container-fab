'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import type { ReeferContent } from '@/types'

export default function Reefers({ data }: { data: ReeferContent }) {
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

  const features = [data.feature1, data.feature2, data.feature3, data.feature4]

  return (
    <section ref={ref} className="bg-steel py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="reveal relative aspect-[4/3] overflow-hidden">
            {data.image_url ? (
              <Image
                src={data.image_url}
                alt="Reefer container"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-steel/80 flex items-center justify-center">
                <span className="text-white/20 text-8xl select-none">🏭</span>
              </div>
            )}
            <div className="absolute inset-0 bg-steel/30" />
          </div>

          {/* Content */}
          <div>
            <div className="reveal flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-rust" />
              <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">
                {data.subheading}
              </span>
            </div>

            <h2 className="reveal font-barlow font-800 text-4xl lg:text-5xl text-white uppercase leading-tight mb-6">
              {data.heading}
            </h2>

            <p className="reveal text-gray-300 leading-relaxed mb-10">{data.description}</p>

            <ul className="space-y-4 mb-10">
              {features.map((f, i) => (
                <li
                  key={i}
                  className={`reveal reveal-delay-${i + 1} flex items-start gap-3`}
                >
                  <CheckCircle className="w-5 h-5 text-rust shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="reveal inline-flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-6 py-3 hover:bg-rust-lt transition-colors"
            >
              Get a Quote <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
