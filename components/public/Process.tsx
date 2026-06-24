'use client'

import { useEffect, useRef } from 'react'
import { MessageSquare, PenTool, Hammer, Truck } from 'lucide-react'

const steps = [
  {
    num: '01',
    title: 'Consultation',
    description: 'We meet to understand your vision, site, budget, and timeline. Free of charge.',
    Icon: MessageSquare,
  },
  {
    num: '02',
    title: 'Design & Quote',
    description: 'Our team produces detailed drawings and a transparent, itemised quote.',
    Icon: PenTool,
  },
  {
    num: '03',
    title: 'Fabrication',
    description: 'Build begins at our Nairobi workshop. You receive progress updates weekly.',
    Icon: Hammer,
  },
  {
    num: '04',
    title: 'Delivery',
    description: 'Your unit is transported and installed on-site. Final walk-through and handover.',
    Icon: Truck,
  },
]

export default function Process() {
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
    <section ref={ref} className="bg-concrete py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="reveal text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-0.5 bg-rust" />
            <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">
              How It Works
            </span>
            <div className="w-8 h-0.5 bg-rust" />
          </div>
          <h2 className="font-barlow font-800 text-4xl lg:text-5xl text-steel uppercase leading-tight">
            Our Process
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-rust/30" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`reveal reveal-delay-${i + 1} flex flex-col items-center text-center`}
              >
                {/* Circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-steel border-4 border-rust flex items-center justify-center z-10 relative">
                    <step.Icon className="w-7 h-7 text-rust" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-rust flex items-center justify-center">
                    <span className="font-barlow font-800 text-white text-xs">{step.num}</span>
                  </div>
                </div>

                <h3 className="font-barlow font-700 text-lg uppercase tracking-widest text-steel mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-mid-gray leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
