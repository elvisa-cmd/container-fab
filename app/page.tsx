export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import { getContent, getCustomers, readLocation } from '@/lib/data'
import { generateLocalBusinessSchema } from '@/lib/structured-data'
import Navbar from '@/components/public/Navbar'
import Hero from '@/components/public/Hero'
import About from '@/components/public/About'
import Customers from '@/components/public/Customers'
import Services from '@/components/public/Services'
import Process from '@/components/public/Process'
import Reefers from '@/components/public/Reefers'
import Projects from '@/components/public/Projects'
import ContactForm from '@/components/public/ContactForm'
import LocationMap from '@/components/public/LocationMap'
import Footer from '@/components/public/Footer'

export const metadata: Metadata = {
  title: {
    absolute:
      'Container Fabricators Kenya | Shipping Container Offices, Homes & Storage Nairobi',
  },
  description:
    'Classic Container Fabricators Kenya builds custom shipping container offices, homes, shops and storage units in Nairobi. 10+ years experience. Call +254 715 296324 for a free quote.',
  alternates: {
    canonical: 'https://containerfabricators.co.ke',
  },
}

export default async function HomePage() {
  const [{ hero, about, reefer, services, projects }, allCustomers, location] =
    await Promise.all([getContent(), getCustomers(), readLocation()])

  const customers = allCustomers
    .filter((c) => c.featured)
    .sort((a, b) => a.order - b.order)

  // Homepage shows only featured projects, sorted by order
  const featuredProjects = projects
    .filter((p) => p.featured)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {/* LocalBusiness JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateLocalBusinessSchema()) }}
      />

      <Navbar />
      <main>
        <Hero data={hero} />
        <About data={about} />
        <Customers customers={customers} />
        <Services services={services} />
        <Process />
        <Reefers data={reefer} />
        <Projects projects={featuredProjects} />
        <ContactForm />
        <LocationMap location={location} />
      </main>
      <Footer />
    </>
  )
}
