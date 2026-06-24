export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound } from 'next/navigation'
import { getServiceBySlug, getServices } from '@/lib/data'
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/structured-data'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import ServiceDetail from '@/components/public/ServiceDetail'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

// ── SEO metadata ────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return { title: 'Service Not Found' }

  const rawDesc = service.full_description || service.description
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 152) + '…' : rawDesc

  return {
    title: { absolute: `${service.title} in Nairobi Kenya | Container Fabricators` },
    description,
    keywords: [
      `${service.title.toLowerCase()} kenya`,
      `${service.title.toLowerCase()} nairobi`,
      `container ${service.title.toLowerCase()}`,
      `shipping container ${service.title.toLowerCase()} kenya`,
      'container fabricators kenya',
    ],
    openGraph: {
      title: `${service.title} | Container Fabricators Kenya`,
      description: service.description,
      images: service.cover_image
        ? [{ url: service.cover_image, width: 1200, height: 630, alt: `${service.title} by Container Fabricators Kenya` }]
        : [],
      type: 'website',
    },
    alternates: {
      canonical: `https://containerfabricators.co.ke/services/${service.slug}`,
    },
  }
}

// Pre-generate routes at build time (SSG for SEO)
export async function generateStaticParams() {
  const services = await getServices()
  const seen = new Set<string>()
  return services
    .filter((s) => s.active && s.slug && !seen.has(s.slug) && (seen.add(s.slug), true))
    .map((s) => ({ slug: s.slug }))
}

// ── Page — server component, zero event handlers ────────────────────────────
export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
  ])

  if (!service) notFound()

  const related = allServices
    .filter((s) => s.active && s.slug !== slug)
    .slice(0, 3)

  const breadcrumbItems = [
    { label: 'Home',     href: '/' },
    { label: 'Services', href: '/services' },
    { label: service.title },
  ]

  return (
    <>
      {/* Structured data — server-rendered for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateServiceSchema(service)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbItems)) }}
      />

      <Navbar />
      <main>
        {/* All interactive content lives in a Client Component */}
        <ServiceDetail service={service} related={related} />
      </main>
      <Footer />
    </>
  )
}
