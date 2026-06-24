import type { HeroContent, AboutContent, ReeferContent, Service, Project } from '@/types'

export const mockHero: HeroContent = {
  id: 'mock-hero',
  headline_line1: 'Built from',
  headline_line2: 'Designed for you.',
  headline_accent: 'steel.',
  subtext:
    'We transform shipping containers into bespoke offices, homes, storage units, and commercial spaces.',
  stat_years: '10+',
  stat_projects: '200+',
  stat_warranty: '1yr',
  image_url:
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80',
  updated_at: new Date().toISOString(),
}

export const mockAbout: AboutContent = {
  id: 'mock-about',
  heading: 'BUILT ON STEEL. DRIVEN BY PURPOSE.',
  paragraph1:
    'Classic Container Fabricators Kenya was founded with a single mission: to deliver world-class container conversions that combine structural integrity with thoughtful design. From our Nairobi workshop, we serve clients across Kenya and East Africa.',
  paragraph2:
    'Every unit we build undergoes rigorous quality checks — from the structural welds to the finishing paint. We source only verified shipping containers and use premium materials to ensure each conversion stands the test of time and climate.',
  badge_number: '10+',
  badge_label: 'Years of Excellence',
  image_url:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  pillar1_title: 'Quality First',
  pillar1_text:
    'ISO-grade welding standards and certified materials on every build.',
  pillar2_title: 'On-Time Delivery',
  pillar2_text:
    'We respect your timeline. Most builds complete in 4–8 weeks.',
  pillar3_title: 'Custom Solutions',
  pillar3_text:
    'No two projects are the same. We design to your exact specifications.',
  updated_at: new Date().toISOString(),
}

export const mockReefer: ReeferContent = {
  id: 'mock-reefer',
  heading: 'REEFER CONTAINERS',
  subheading: 'Cold Chain Solutions',
  description:
    'Our reefer container solutions provide reliable temperature-controlled environments for food storage, pharmaceutical logistics, and cold chain operations. We convert and maintain refrigerated containers to the highest standards.',
  feature1: 'Temperature range: -25°C to +25°C',
  feature2: 'Eutectic and mechanical refrigeration systems',
  feature3: 'HACCP-compliant interior finishes',
  feature4: 'Remote monitoring and alerting systems',
  image_url:
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
  updated_at: new Date().toISOString(),
}

const BLANK_SVC = { full_description: '', features: [] as string[], process: '', starting_price: '', delivery_time: '', cover_image: '', gallery: [] as string[] }

export const mockServices: Service[] = [
  { id: 'mock-svc-1', number: '01', icon: '📦', title: 'Used Shipping Containers', slug: 'used-shipping-containers', description: 'Premium-grade cargo and freight containers sourced and inspected.', ...BLANK_SVC, order: 1, active: true },
  { id: 'mock-svc-2', number: '02', icon: '🏠', title: 'Accommodation Units',       slug: 'accommodation-units',       description: 'Fully habitable container structures from studio to 3-bedroom.',     ...BLANK_SVC, order: 2, active: true },
  { id: 'mock-svc-3', number: '03', icon: '🏢', title: 'Office Units',              slug: 'office-units',              description: 'Modular, partitioned office spaces built with class.',              ...BLANK_SVC, order: 3, active: true },
  { id: 'mock-svc-4', number: '04', icon: '🏪', title: 'Commercial Spaces',         slug: 'commercial-spaces',         description: 'Retail kiosks, restaurants, pop-up shops, and market stalls.',    ...BLANK_SVC, order: 4, active: true },
  { id: 'mock-svc-5', number: '05', icon: '🔩', title: 'Storage Solutions',         slug: 'storage-solutions',         description: 'Secure, weatherproof storage containers for all industries.',     ...BLANK_SVC, order: 5, active: true },
  { id: 'mock-svc-6', number: '06', icon: '🎨', title: 'Custom Design',             slug: 'custom-design',             description: 'Have a unique vision? We get it done.',                          ...BLANK_SVC, order: 6, active: true },
]

const PROJ_DEFAULTS = {
  cover_image: '', gallery: [] as string[],
  location: 'Nairobi, Kenya', year: '2024',
  client: 'Private Client', status: 'Completed',
}

export const mockProjects: Project[] = [
  { id: 'mock-proj-1', title: 'Container Office Complex', slug: 'container-office-complex', category: 'Office', description: 'Modern open-plan office built from 4 containers.', featured: true, order: 1, ...PROJ_DEFAULTS },
  { id: 'mock-proj-2', title: 'Safari Camp Cabins',       slug: 'safari-camp-cabins',       category: 'Accommodation', description: '6 luxury cabins with solar and panoramic views.', featured: true, order: 2, ...PROJ_DEFAULTS },
  { id: 'mock-proj-3', title: 'Commercial Kiosk',          slug: 'commercial-kiosk',          category: 'Commercial', description: 'Branded retail kiosk for a Nairobi street corner.', featured: true, order: 3, ...PROJ_DEFAULTS },
  { id: 'mock-proj-4', title: 'Site Storage Units',        slug: 'site-storage-units',        category: 'Storage', description: 'Secure weatherproof storage for a construction site.', featured: false, order: 4, ...PROJ_DEFAULTS },
]
