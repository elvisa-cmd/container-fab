export interface HeroContent {
  id: string
  headline_line1: string
  headline_line2: string
  headline_accent: string
  subtext: string
  stat_years: string
  stat_projects: string
  stat_warranty: string
  image_url: string
  slides?: Array<{ id: string; image_url: string }>
  updated_at: string
}

export interface AboutContent {
  id: string
  heading: string
  paragraph1: string
  paragraph2: string
  badge_number: string
  badge_label: string
  image_url: string
  pillar1_title: string
  pillar1_text: string
  pillar2_title: string
  pillar2_text: string
  pillar3_title: string
  pillar3_text: string
  updated_at: string
}

export interface ReeferContent {
  id: string
  heading: string
  subheading: string
  description: string
  feature1: string
  feature2: string
  feature3: string
  feature4: string
  image_url: string
  updated_at: string
}

export interface Service {
  id: string
  number: string
  icon: string
  title: string
  slug: string
  description: string
  full_description: string
  features: string[]
  process: string
  starting_price: string
  delivery_time: string
  cover_image: string
  gallery: string[]
  order: number
  active: boolean
  updated_at?: string
}

export interface Project {
  id: string
  title: string
  slug: string
  category: string
  cover_image: string
  gallery: string[]
  description: string
  location: string
  year: string
  client: string
  status: string
  featured: boolean
  order: number
  created_at?: string
}

export interface Message {
  id: string
  name: string
  email: string
  phone: string
  service: string
  message: string
  read: boolean
  replied: boolean
  reply_text: string | null
  replied_at: string | null
  created_at: string
}

export interface PageView {
  id: string
  page: string
  referrer: string
  user_agent: string
  created_at: string
}

export interface SiteStats {
  totalViews: number
  viewsToday: number
  viewsThisWeek: number
  viewsThisMonth: number
  totalMessages: number
  unreadMessages: number
  messagesThisWeek: number
}

export interface ChartData {
  date: string
  views: number
  messages: number
}

export interface Customer {
  id: string
  name: string
  logo: string
  featured: boolean
  order: number
}

export interface LocationData {
  lat: number
  lng: number
  address: string
  city: string
  country: string
  phone1: string
  phone2: string
  email: string
  hours_weekday: string
  hours_saturday: string
  hours_sunday: string
  updated_at: string
}
