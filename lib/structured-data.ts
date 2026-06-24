// Reusable JSON-LD structured data for SEO

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://containerfabricators.co.ke',
    name: 'Classic Container Fabricators Kenya',
    image: 'https://containerfabricators.co.ke/og-image.jpg',
    description: 'We transform shipping containers into bespoke offices, homes, storage units, and commercial spaces.',
    url: 'https://containerfabricators.co.ke',
    telephone: '+254715296324',
    email: 'info@containerfabricators.co.ke',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'National Park East Gate Rd',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.3031934,
      longitude: 36.7731693,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '13:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/containerfabricatorkenya',
      'https://www.instagram.com/container_fabricators',
    ],
    priceRange: 'KES',
    areaServed: {
      '@type': 'Country',
      name: 'Kenya',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Container Fabrication Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Used Shipping Containers' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Container Homes' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Container Offices' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial Container Spaces' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Container Storage Solutions' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Reefer Containers Kenya' } },
      ],
    },
  }
}

export function generateServiceSchema(service: {
  title: string
  full_description: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.full_description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Classic Container Fabricators Kenya',
      url: 'https://containerfabricators.co.ke',
    },
    areaServed: 'Kenya',
    url: `https://containerfabricators.co.ke/services/${service.slug}`,
  }
}

export function generateBreadcrumbSchema(items: { label: string; href?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href
        ? `https://containerfabricators.co.ke${item.href}`
        : undefined,
    })),
  }
}
