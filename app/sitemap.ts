import { MetadataRoute } from 'next'
import { getServices, getProjects } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects] = await Promise.all([getServices(), getProjects()])

  // Services
  const seenSvc = new Set<string>()
  const serviceUrls = services
    .filter((s) => s.active && s.slug && !seenSvc.has(s.slug) && (seenSvc.add(s.slug), true))
    .map((s) => ({
      url: `https://containerfabricators.co.ke/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // Projects
  const seenPrj = new Set<string>()
  const projectUrls = projects
    .filter((p) => p.slug && !seenPrj.has(p.slug) && (seenPrj.add(p.slug), true))
    .map((p) => ({
      url: `https://containerfabricators.co.ke/projects/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  return [
    { url: 'https://containerfabricators.co.ke',          lastModified: new Date(), changeFrequency: 'daily'   as const, priority: 1    },
    { url: 'https://containerfabricators.co.ke/services', lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 0.9  },
    { url: 'https://containerfabricators.co.ke/projects', lastModified: new Date(), changeFrequency: 'weekly'  as const, priority: 0.85 },
    ...serviceUrls,
    ...projectUrls,
  ]
}
