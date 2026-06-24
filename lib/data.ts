/**
 * lib/data.ts
 *
 * Primary storage: Supabase (when NEXT_PUBLIC_SUPABASE_URL is configured)
 * Fallback:        Local JSON files in /data/ (development without Supabase)
 */

import { unstable_noStore as noStore } from 'next/cache'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import type {
  HeroContent, AboutContent, ReeferContent,
  Service, Project, Message, PageView, Customer, LocationData,
} from '@/types'
import {
  mockHero, mockAbout, mockReefer, mockServices, mockProjects,
} from './mock-data'

// ── UUID helpers (Supabase id columns require valid UUID format) ──────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(s: string | undefined): boolean {
  return Boolean(s && UUID_RE.test(s))
}

/** Return id if it's already a valid UUID, otherwise generate a fresh one */
function ensureUUID(id: string | undefined): string {
  return isValidUUID(id) ? id! : randomUUID()
}

// ── Supabase availability ─────────────────────────────────────────────────────

function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(url && url !== 'your-project-url' && url.startsWith('https://'))
}

function getServiceClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createServiceClient } = require('./supabase-server') as {
    createServiceClient: () => ReturnType<typeof import('./supabase-server').createServiceClient>
  }
  return createServiceClient()
}

// ── Local JSON fallback ───────────────────────────────────────────────────────

const DIR = path.join(process.cwd(), 'data')

async function readJson<T>(file: string, def: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DIR, file), 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return def
  }
}

export async function writeJsonFile<T>(file: string, data: T): Promise<void> {
  await fs.mkdir(DIR, { recursive: true })
  await fs.writeFile(path.join(DIR, file), JSON.stringify(data, null, 2), 'utf-8')
}

// ── Content type ──────────────────────────────────────────────────────────────

export type ContentStore = {
  hero:     HeroContent
  about:    AboutContent
  reefer:   ReeferContent
  services: Service[]
  projects: Project[]
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_LOCATION: LocationData = {
  lat: -1.3031934, lng: 36.7731693,
  address:        'National Park East Gate Rd, Nairobi',
  city:           'Nairobi', country: 'Kenya',
  phone1:         '+254 715 296324', phone2: '+254 713 971 394',
  email:          'info@containerfabricators.co.ke',
  hours_weekday:  'Mon – Fri: 8:00 AM – 5:00 PM',
  hours_saturday: 'Saturday: 8:00 AM – 1:00 PM',
  hours_sunday:   'Sunday: Closed',
  updated_at:     '',
}

const DEFAULT_REEFER: Omit<ReeferContent, 'id' | 'updated_at'> = {
  heading:     'Daikin & Carrier Reefer Units',
  subheading:  'Cold Chain Specialists',
  description: 'The most sought-after reefer brands in East Africa — chosen for parts availability, affordability, and quieter operation.',
  feature1:    'Daikin and Carrier branded units in stock',
  feature2:    '1-year warranty on all new reefer units',
  feature3:    'Post-warranty servicing available at low cost',
  feature4:    'Suitable for food, pharmaceuticals, and logistics',
  image_url:   '',
}

// ── Helper: upsert single-row table (hero, about, reefer, location) ───────────

async function upsertSingleRow(
  table: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const sb = getServiceClient()
  const { data: existing } = await sb.from(table).select('id').single()
  const id = (existing as { id?: string } | null)?.id
  if (id) {
    const { error } = await sb.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) console.error(`${table} update failed:`, error.message)
  } else {
    const { error } = await sb.from(table).insert({ ...payload, updated_at: new Date().toISOString() })
    if (error) console.error(`${table} insert failed:`, error.message)
  }
}

// ── Helper: seed single-row table if empty ────────────────────────────────────

async function seedIfEmpty(
  table: string,
  defaults: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const sb = getServiceClient()
  const { error } = await sb.from(table).insert({ ...defaults, updated_at: new Date().toISOString() })
  if (error) {
    console.error(`${table} seed failed:`, error.message)
    return null
  }
  const { data } = await sb.from(table).select('*').single()
  return data as Record<string, unknown> | null
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════

export async function getHero(): Promise<HeroContent> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('hero_content').select('*').single()
      if (!error && data) {
        return {
          id:              (data as Record<string, unknown>).id             as string,
          headline_line1:  (data as Record<string, unknown>).headline_line1 as string,
          headline_line2:  (data as Record<string, unknown>).headline_line2 as string,
          headline_accent: (data as Record<string, unknown>).headline_accent as string,
          subtext:         (data as Record<string, unknown>).subtext        as string,
          stat_years:      (data as Record<string, unknown>).stat_years     as string,
          stat_projects:   (data as Record<string, unknown>).stat_projects  as string,
          stat_warranty:   (data as Record<string, unknown>).stat_warranty  as string,
          image_url:       (data as Record<string, unknown>).image_url      as string,
          slides:          ((data as Record<string, unknown>).slides as HeroContent['slides']) ?? [],
          updated_at:      (data as Record<string, unknown>).updated_at     as string,
        }
      }
      // Table is empty — seed with mock defaults
      console.log('hero_content is empty — seeding defaults')
      const seeded = await seedIfEmpty('hero_content', { ...mockHero })
      if (seeded) return seeded as unknown as HeroContent
    } catch (err) {
      console.error('getHero failed:', err)
    }
  }
  return readJson('hero.json', mockHero)
}

export async function setHero(d: HeroContent): Promise<void> {
  if (supabaseConfigured()) {
    try {
      await upsertSingleRow('hero_content', d as unknown as Record<string, unknown>)
      return
    } catch (err) {
      console.error('setHero failed:', err)
    }
  }
  await writeJsonFile('hero.json', d)
}

// ═══════════════════════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════════════════════

export async function getAbout(): Promise<AboutContent> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('about_content').select('*').single()
      if (!error && data) return data as unknown as AboutContent
      console.log('about_content is empty — seeding defaults')
      const seeded = await seedIfEmpty('about_content', { ...mockAbout })
      if (seeded) return seeded as unknown as AboutContent
    } catch (err) {
      console.error('getAbout failed:', err)
    }
  }
  return readJson('about.json', mockAbout)
}

export async function setAbout(d: AboutContent): Promise<void> {
  if (supabaseConfigured()) {
    try {
      await upsertSingleRow('about_content', d as unknown as Record<string, unknown>)
      return
    } catch (err) {
      console.error('setAbout failed:', err)
    }
  }
  await writeJsonFile('about.json', d)
}

// ═══════════════════════════════════════════════════════════════════════════
// REEFER
// ═══════════════════════════════════════════════════════════════════════════

export async function getReefer(): Promise<ReeferContent> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('reefer_content').select('*').single()
      if (!error && data) return data as unknown as ReeferContent
      // Table row missing — seed with built-in defaults
      console.log('reefer_content is empty — seeding defaults')
      const seeded = await seedIfEmpty('reefer_content', { ...DEFAULT_REEFER })
      if (seeded) return { ...DEFAULT_REEFER, id: seeded.id as string, updated_at: seeded.updated_at as string }
    } catch (err) {
      console.error('getReefer failed:', err)
    }
  }
  return readJson('reefers.json', mockReefer)
}

export async function setReefer(d: ReeferContent): Promise<void> {
  if (supabaseConfigured()) {
    try {
      await upsertSingleRow('reefer_content', d as unknown as Record<string, unknown>)
      return
    } catch (err) {
      console.error('setReefer failed:', err)
    }
  }
  await writeJsonFile('reefers.json', d)
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════

function rowToService(row: Record<string, unknown>): Service {
  return {
    id:               row.id as string,
    number:           row.number as string,
    icon:             row.icon as string,
    title:            row.title as string,
    slug:             row.slug as string,
    description:      (row.description ?? '')      as string,
    full_description: (row.full_description ?? '')  as string,
    features:         (row.features as string[])   ?? [],
    process:          (row.process ?? '')           as string,
    starting_price:   (row.starting_price ?? '')   as string,
    delivery_time:    (row.delivery_time ?? '')     as string,
    cover_image:      (row.cover_image ?? '')       as string,
    gallery:          (row.gallery as string[])     ?? [],
    active:           row.active as boolean,
    order:            (row.order_index as number)   ?? 0,
  }
}

export async function getServices(): Promise<Service[]> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('services').select('*').order('order_index', { ascending: true })
      if (error) { console.error('getServices Supabase error:', error.message) }
      if (!error && data) return (data as Record<string, unknown>[]).map(rowToService)
    } catch (err) {
      console.error('getServices failed:', err)
    }
  }
  return readJson('services.json', mockServices)
}

export async function setServices(services: Service[]): Promise<void> {
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const rows = services.map((s, i) => ({
        id:               ensureUUID(s.id),
        number:           s.number           ?? '01',
        icon:             s.icon             ?? '📦',
        title:            s.title,
        slug:             s.slug,
        description:      s.description      ?? '',
        full_description: s.full_description ?? '',
        features:         s.features         ?? [],
        process:          s.process          ?? '',
        starting_price:   s.starting_price   ?? '',
        delivery_time:    s.delivery_time    ?? '',
        cover_image:      s.cover_image      ?? '',
        gallery:          s.gallery          ?? [],
        active:           s.active           ?? true,
        order_index:      i,
        updated_at:       new Date().toISOString(),
      }))
      const { error } = await sb.from('services').upsert(rows, { onConflict: 'id' })
      if (error) { console.error('[setServices] upsert error:', error.message, error.details); throw error }
      if (rows.length > 0) {
        const ids = rows.map(r => `'${r.id}'`).join(',')
        await sb.from('services').delete().not('id', 'in', `(${ids})`)
      } else {
        await sb.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      }
      return
    } catch (err) {
      console.error('[setServices] failed:', err)
      throw err
    }
  }
  await writeJsonFile('services.json', services)
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('services').select('*').eq('slug', slug).eq('active', true).single()
      if (!error && data) return rowToService(data as Record<string, unknown>)
    } catch (err) {
      console.error('getServiceBySlug failed:', err)
    }
  }
  const services = await readJson('services.json', mockServices)
  return services.find((s) => s.slug === slug && s.active) ?? null
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════════════

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id:          row.id          as string,
    title:       row.title       as string,
    slug:        row.slug        as string,
    category:    row.category    as string,
    cover_image: (row.cover_image ?? '') as string,
    gallery:     (row.gallery as string[]) ?? [],
    description: (row.description ?? '') as string,
    location:    (row.location   ?? '') as string,
    year:        (row.year       ?? '') as string,
    client:      (row.client     ?? '') as string,
    status:      (row.status     ?? 'Completed') as string,
    featured:    row.featured    as boolean,
    order:       (row.order_index as number) ?? 0,
    created_at:  row.created_at  as string | undefined,
  }
}

export async function getProjects(): Promise<Project[]> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('projects').select('*').order('order_index', { ascending: true })
      if (error) { console.error('getProjects Supabase error:', error.message) }
      if (!error && data) return (data as Record<string, unknown>[]).map(rowToProject)
    } catch (err) {
      console.error('getProjects failed:', err)
    }
  }
  return readJson('projects.json', mockProjects)
}

export const readProjects = getProjects

export async function setProjects(projects: Project[]): Promise<void> {
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const rows = projects.map((p, i) => ({
        id:          ensureUUID(p.id),
        title:       p.title,
        slug:        p.slug,
        category:    p.category    ?? 'General',
        cover_image: p.cover_image ?? '',
        gallery:     p.gallery     ?? [],
        description: p.description ?? '',
        location:    p.location    ?? '',
        year:        p.year        ?? '',
        client:      p.client      ?? '',
        status:      p.status      ?? 'Completed',
        featured:    p.featured    ?? false,
        order_index: i,
        created_at:  p.created_at  ?? new Date().toISOString(),
      }))
      const { error } = await sb.from('projects').upsert(rows, { onConflict: 'id' })
      if (error) { console.error('[setProjects] upsert error:', error.message, error.details); throw error }
      if (rows.length > 0) {
        const ids = rows.map(r => `'${r.id}'`).join(',')
        await sb.from('projects').delete().not('id', 'in', `(${ids})`)
      } else {
        await sb.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      }
      return
    } catch (err) {
      console.error('[setProjects] failed:', err)
      throw err
    }
  }
  await writeJsonFile('projects.json', projects)
}

export async function readProjectBySlug(slug: string): Promise<Project | null> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('projects').select('*').eq('slug', slug).single()
      if (!error && data) return rowToProject(data as Record<string, unknown>)
    } catch (err) {
      console.error('readProjectBySlug failed:', err)
    }
  }
  const projects = await readJson('projects.json', mockProjects)
  return projects.find((p) => p.slug === slug) ?? null
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSITE CONTENT
// ═══════════════════════════════════════════════════════════════════════════

export async function getContent(): Promise<ContentStore> {
  const [hero, about, reefer, services, projects] = await Promise.all([
    getHero(), getAbout(), getReefer(), getServices(), getProjects(),
  ])
  return { hero, about, reefer, services, projects }
}

export async function patchContent<K extends keyof ContentStore>(
  section: K,
  data: ContentStore[K],
): Promise<void> {
  switch (section as string) {
    case 'hero':                   return setHero(data as HeroContent)
    case 'about':                  return setAbout(data as AboutContent)
    case 'reefer': case 'reefers': return setReefer(data as ReeferContent)
    case 'services':               return setServices(data as Service[])
    case 'projects':               return setProjects(data as Project[])
    default: throw new Error(`Unknown content section: ${String(section)}`)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════

export async function getCustomers(): Promise<Customer[]> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('customers').select('*').order('order_index', { ascending: true })
      if (error) { console.error('getCustomers Supabase error:', error.message) }
      if (!error && data) {
        return (data as Record<string, unknown>[]).map((row) => ({
          id:       row.id       as string,
          name:     row.name     as string,
          logo:     (row.logo ?? '') as string,
          featured: row.featured as boolean,
          order:    (row.order_index as number) ?? 0,
        }))
      }
    } catch (err) {
      console.error('getCustomers failed:', err)
    }
  }
  return readJson<Customer[]>('customers.json', [])
}

export async function setCustomers(customers: Customer[]): Promise<void> {
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      // Always provide explicit UUIDs so the NOT NULL constraint is never violated
      const rows = customers.map((c, i) => ({
        id:          ensureUUID(c.id),
        name:        (c.name || '').trim() || 'Unnamed',
        logo:        c.logo     ?? '',
        featured:    c.featured ?? true,
        order_index: typeof c.order === 'number' ? c.order : i,
      }))
      console.log('[setCustomers] upserting', rows.length, 'rows')
      // Upsert by id, then delete stale rows no longer in the list
      const { error } = await sb.from('customers').upsert(rows, { onConflict: 'id' })
      if (error) { console.error('[setCustomers] upsert error:', error.message, error.details); throw error }
      if (rows.length > 0) {
        const ids = rows.map(r => `'${r.id}'`).join(',')
        await sb.from('customers').delete().not('id', 'in', `(${ids})`)
      } else {
        await sb.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      }
      return
    } catch (err) {
      console.error('[setCustomers] failed:', err)
      throw err
    }
  }
  await writeJsonFile('customers.json', customers)
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCATION
// ═══════════════════════════════════════════════════════════════════════════

export async function readLocation(): Promise<LocationData> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('location_data').select('*').single()
      if (!error && data) return data as unknown as LocationData
      console.log('location_data is empty — seeding defaults')
      const seeded = await seedIfEmpty('location_data', { ...DEFAULT_LOCATION })
      if (seeded) return seeded as unknown as LocationData
    } catch (err) {
      console.error('readLocation failed:', err)
    }
  }
  return readJson<LocationData>('location.json', DEFAULT_LOCATION)
}

export async function writeLocation(d: LocationData): Promise<void> {
  if (supabaseConfigured()) {
    try {
      await upsertSingleRow('location_data', d as unknown as Record<string, unknown>)
      return
    } catch (err) {
      console.error('writeLocation failed:', err)
    }
  }
  await writeJsonFile('location.json', d)
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════════════════

export async function getMessages(): Promise<Message[]> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('messages').select('*').order('created_at', { ascending: false })
      if (error) { console.error('getMessages Supabase error:', error.message) }
      if (!error && data) return data as unknown as Message[]
    } catch (err) {
      console.error('getMessages failed:', err)
    }
  }
  return readJson<Message[]>('messages.json', [])
}

export async function setMessages(messages: Message[]): Promise<void> {
  await writeJsonFile('messages.json', messages)
}

export async function appendMessage(msg: Message): Promise<void> {
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { error } = await sb.from('messages').insert({ ...msg, created_at: new Date().toISOString() })
      if (error) console.error('appendMessage failed:', error.message)
      else return
    } catch (err) {
      console.error('appendMessage failed:', err)
    }
  }
  const list = await readJson<Message[]>('messages.json', [])
  list.push(msg)
  await writeJsonFile('messages.json', list)
}

export async function updateMessage(id: string, patch: Partial<Message>): Promise<Message | null> {
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('messages').update(patch).eq('id', id).select().single()
      if (error) { console.error('updateMessage failed:', error.message); return null }
      if (data) return data as unknown as Message
    } catch (err) {
      console.error('updateMessage failed:', err)
    }
  }
  const list = await readJson<Message[]>('messages.json', [])
  const idx = list.findIndex((m) => m.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...patch }
  await writeJsonFile('messages.json', list)
  return list[idx]
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE VIEWS
// ═══════════════════════════════════════════════════════════════════════════

export async function getPageViews(): Promise<PageView[]> {
  noStore()
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('page_views').select('*').order('created_at', { ascending: false })
      if (!error && data) return data as unknown as PageView[]
    } catch (err) {
      console.error('getPageViews failed:', err)
    }
  }
  return readJson<PageView[]>('page_views.json', [])
}

export async function appendPageView(view: PageView): Promise<void> {
  if (supabaseConfigured()) {
    try {
      const sb = getServiceClient()
      await sb.from('page_views').insert({
        page:       view.page,
        referrer:   view.referrer,
        user_agent: view.user_agent,
        created_at: view.created_at ?? new Date().toISOString(),
      })
      return
    } catch { /* silent — never crash on analytics */ }
  }
  const views = await readJson<PageView[]>('page_views.json', [])
  views.push(view)
  const trimmed = views.length > 10000 ? views.slice(-10000) : views
  await writeJsonFile('page_views.json', trimmed)
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH (cookie-based — independent of Supabase)
// ═══════════════════════════════════════════════════════════════════════════

export function adminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() || 'admin@containerfabricators.co.ke'
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || 'Admin2024!'
}

export function sessionSecret(): string {
  return process.env.ADMIN_SECRET?.trim() || 'cf-admin-session-v1'
}

export const SESSION_COOKIE = 'admin-session'
