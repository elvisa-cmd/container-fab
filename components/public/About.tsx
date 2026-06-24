'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { Shield, Clock, Wrench, ArrowRight } from 'lucide-react'
import type { AboutContent } from '@/types'

const pillarIcons = [Shield, Clock, Wrench]

export default function About({ data }: { data: AboutContent }) {
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

  const pillars = [
    { title: data.pillar1_title, text: data.pillar1_text, Icon: pillarIcons[0] },
    { title: data.pillar2_title, text: data.pillar2_text, Icon: pillarIcons[1] },
    { title: data.pillar3_title, text: data.pillar3_text, Icon: pillarIcons[2] },
  ]

  return (
    <section id="about" ref={ref} className="bg-concrete py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image column */}
          <div className="reveal relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              {data.image_url ? (
                <Image
                  src={data.image_url}
                  alt="Classic Container Fabricators Kenya workshop"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-steel flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-barlow font-800 text-white/20 text-6xl uppercase tracking-widest">CF</div>
                    <div className="font-barlow text-white/10 text-xs uppercase tracking-[0.3em] mt-2">Container Fabricators</div>
                  </div>
                </div>
              )}
            </div>
            {/* Badge */}
            <div className="absolute -bottom-6 -right-6 bg-rust text-white w-32 h-32 flex flex-col items-center justify-center">
              <span className="font-barlow font-800 text-4xl leading-none">{data.badge_number}</span>
              <span className="font-barlow font-600 text-xs uppercase tracking-widest text-center mt-1 leading-tight px-2">
                {data.badge_label}
              </span>
            </div>
          </div>

          {/* Text column */}
          <div className="lg:pl-8">
            <div className="reveal flex items-center gap-3 mb-6">
              <div className="w-8 h-0.5 bg-rust" />
              <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">
                Our Story
              </span>
            </div>

            <h2 className="reveal font-barlow font-800 text-4xl lg:text-5xl text-steel uppercase leading-tight mb-8">
              {data.heading}
            </h2>

            <p className="reveal text-mid-gray leading-relaxed mb-5">{data.paragraph1}</p>
            <p className="reveal text-mid-gray leading-relaxed mb-10">{data.paragraph2}</p>

            {/* Pillars */}
            <div className="space-y-4 mb-10">
              {pillars.map(({ title, text, Icon }, i) => (
                <div
                  key={title}
                  className={`reveal reveal-delay-${i + 1} flex gap-4 p-4 bg-white border-l-4 border-rust`}
                >
                  <Icon className="w-5 h-5 text-rust shrink-0 mt-0.5" />
                  <div>
                    <div className="font-barlow font-700 text-sm uppercase tracking-widest text-steel mb-1">
                      {title}
                    </div>
                    <div className="text-sm text-mid-gray leading-relaxed">{text}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className="reveal inline-flex items-center gap-2 bg-steel text-white font-barlow font-700 text-sm uppercase tracking-widest px-6 py-3 hover:bg-rust transition-colors"
            >
              Work With Us <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
