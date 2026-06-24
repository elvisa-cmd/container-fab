import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getServices } from '@/lib/data'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Services | Container Fabricators Kenya',
  description:
    'Explore all container fabrication services by Classic Container Fabricators Kenya — offices, homes, commercial spaces, storage, reefers and custom designs in Nairobi.',
  alternates: {
    canonical: 'https://containerfabricators.co.ke/services',
  },
}

export default async function ServicesPage() {
  const services = await getServices()
  const active = services.filter((s) => s.active).sort((a, b) => a.order - b.order)

  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-steel pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <nav className="flex items-center gap-2 text-white/50 text-sm font-barlow mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white/80">Services</span>
            </nav>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-rust" />
              <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">What We Do</span>
            </div>
            <h1 className="font-barlow font-800 text-5xl lg:text-7xl text-white uppercase leading-none mb-6">
              Our Services
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              From premium used containers to fully custom-built offices, homes, and commercial spaces —
              we deliver container solutions across Kenya and East Africa.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="bg-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {active.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className={`group relative bg-white border border-gray-100 p-8 hover:border-rust hover:shadow-[0_0_0_1px_#C94C1A] transition-all duration-300 overflow-hidden block reveal reveal-delay-${Math.min(i + 1, 5)}`}
                >
                  {/* Ghost number */}
                  <div className="absolute top-4 right-4 font-barlow font-800 text-7xl text-gray-50 leading-none select-none pointer-events-none group-hover:text-rust/10 transition-colors">
                    {s.number}
                  </div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-4">{s.icon}</div>
                    <h2 className="service-underline font-barlow font-700 text-lg uppercase tracking-widest text-steel mb-3 inline-block">
                      {s.title}
                    </h2>
                    <p className="text-sm text-mid-gray leading-relaxed mb-4">{s.description}</p>
                    {s.starting_price && (
                      <p className="text-rust text-xs font-barlow font-700 uppercase tracking-wider mb-4">
                        {s.starting_price}
                      </p>
                    )}
                    <span className="text-rust text-xs font-barlow uppercase tracking-widest font-700 flex items-center gap-1 mt-auto">
                      Learn More <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-steel py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="font-barlow font-800 text-4xl text-white uppercase leading-tight mb-4">
              Not Sure Which Service?
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
              Talk to us — we&apos;ll recommend the best solution for your needs and budget.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-8 py-4 hover:bg-rust-lt transition-colors"
            >
              Contact Us Today
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
