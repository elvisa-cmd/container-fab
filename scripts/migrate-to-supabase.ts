/**
 * Migration script: local JSON files → Supabase
 *
 * Run once after setting up your Supabase project:
 *   npx ts-node --project tsconfig.json scripts/migrate-to-supabase.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const sb  = createClient(supabaseUrl, serviceKey)
const DIR = path.join(process.cwd(), 'data')

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DIR, file), 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    console.warn(`  ⚠ Could not read ${file} — using fallback`)
    return fallback
  }
}

async function migrateHero() {
  const hero = await readJson<Record<string, unknown>>('hero.json', {})
  if (!Object.keys(hero).length) { console.log('  ⏭ hero.json empty — skipping'); return }

  // Get existing row id
  const { data: existing } = await sb.from('hero_content').select('id').single()
  if (existing?.id) {
    const { error } = await sb.from('hero_content').update({ ...hero, updated_at: new Date().toISOString() }).eq('id', existing.id)
    if (error) throw error
    console.log('  ✅ hero_content updated')
  } else {
    const { error } = await sb.from('hero_content').insert({ ...hero, updated_at: new Date().toISOString() })
    if (error) throw error
    console.log('  ✅ hero_content inserted')
  }
}

async function migrateAbout() {
  const about = await readJson<Record<string, unknown>>('about.json', {})
  if (!Object.keys(about).length) { console.log('  ⏭ about.json empty — skipping'); return }
  const { data: existing } = await sb.from('about_content').select('id').single()
  if (existing?.id) {
    const { error } = await sb.from('about_content').update({ ...about, updated_at: new Date().toISOString() }).eq('id', existing.id)
    if (error) throw error
    console.log('  ✅ about_content updated')
  } else {
    const { error } = await sb.from('about_content').insert({ ...about, updated_at: new Date().toISOString() })
    if (error) throw error
    console.log('  ✅ about_content inserted')
  }
}

async function migrateReefer() {
  const reefer = await readJson<Record<string, unknown>>('reefers.json', {})
  if (!Object.keys(reefer).length) { console.log('  ⏭ reefers.json empty — skipping'); return }
  const { data: existing } = await sb.from('reefer_content').select('id').single()
  if (existing?.id) {
    const { error } = await sb.from('reefer_content').update({ ...reefer, updated_at: new Date().toISOString() }).eq('id', existing.id)
    if (error) throw error
    console.log('  ✅ reefer_content updated')
  } else {
    const { error } = await sb.from('reefer_content').insert({ ...reefer, updated_at: new Date().toISOString() })
    if (error) throw error
    console.log('  ✅ reefer_content inserted')
  }
}

async function migrateServices() {
  const services = await readJson<Record<string, unknown>[]>('services.json', [])
  if (!services.length) { console.log('  ⏭ services.json empty — skipping'); return }
  await sb.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const rows = services.map((s, i) => ({
    id:               s.id,
    number:           s.number ?? '01',
    icon:             s.icon ?? '📦',
    title:            s.title,
    slug:             s.slug,
    description:      s.description ?? '',
    full_description: s.full_description ?? '',
    features:         s.features ?? [],
    process:          s.process ?? '',
    starting_price:   s.starting_price ?? '',
    delivery_time:    s.delivery_time ?? '',
    cover_image:      s.cover_image ?? '',
    gallery:          s.gallery ?? [],
    active:           s.active ?? true,
    order_index:      i,
    updated_at:       new Date().toISOString(),
  }))
  const { error } = await sb.from('services').insert(rows)
  if (error) throw error
  console.log(`  ✅ services: ${rows.length} rows inserted`)
}

async function migrateProjects() {
  const projects = await readJson<Record<string, unknown>[]>('projects.json', [])
  if (!projects.length) { console.log('  ⏭ projects.json empty — skipping'); return }
  await sb.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const rows = projects.map((p, i) => ({
    id:          p.id,
    title:       p.title,
    slug:        p.slug,
    category:    p.category ?? 'General',
    cover_image: p.cover_image ?? (p.image_url ?? ''),
    gallery:     p.gallery ?? [],
    description: p.description ?? '',
    location:    p.location ?? 'Nairobi, Kenya',
    year:        p.year ?? '',
    client:      p.client ?? '',
    status:      p.status ?? 'Completed',
    featured:    p.featured ?? false,
    order_index: i,
    created_at:  p.created_at ?? new Date().toISOString(),
  }))
  const { error } = await sb.from('projects').insert(rows)
  if (error) throw error
  console.log(`  ✅ projects: ${rows.length} rows inserted`)
}

async function migrateCustomers() {
  const customers = await readJson<Record<string, unknown>[]>('customers.json', [])
  if (!customers.length) { console.log('  ⏭ customers.json empty — skipping'); return }
  await sb.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const rows = customers.map((c, i) => ({
    id:          c.id,
    name:        c.name,
    logo:        c.logo ?? '',
    featured:    c.featured ?? true,
    order_index: i,
  }))
  const { error } = await sb.from('customers').insert(rows)
  if (error) throw error
  console.log(`  ✅ customers: ${rows.length} rows inserted`)
}

async function migrateMessages() {
  const messages = await readJson<Record<string, unknown>[]>('messages.json', [])
  if (!messages.length) { console.log('  ⏭ messages.json empty — skipping'); return }
  const { error } = await sb.from('messages').insert(messages)
  if (error) throw error
  console.log(`  ✅ messages: ${messages.length} rows inserted`)
}

async function migrateLocation() {
  const loc = await readJson<Record<string, unknown>>('location.json', {})
  if (!Object.keys(loc).length) { console.log('  ⏭ location.json empty — skipping'); return }
  const { data: existing } = await sb.from('location_data').select('id').single()
  if (existing?.id) {
    const { error } = await sb.from('location_data').update({ ...loc, updated_at: new Date().toISOString() }).eq('id', existing.id)
    if (error) throw error
    console.log('  ✅ location_data updated')
  } else {
    const { error } = await sb.from('location_data').insert({ ...loc, updated_at: new Date().toISOString() })
    if (error) throw error
    console.log('  ✅ location_data inserted')
  }
}

async function main() {
  console.log('\n🚀 Container Fabricators — Migrating JSON → Supabase\n')

  const steps: [string, () => Promise<void>][] = [
    ['Hero content',  migrateHero],
    ['About content', migrateAbout],
    ['Reefer content', migrateReefer],
    ['Services',      migrateServices],
    ['Projects',      migrateProjects],
    ['Customers',     migrateCustomers],
    ['Messages',      migrateMessages],
    ['Location',      migrateLocation],
  ]

  for (const [label, fn] of steps) {
    console.log(`\n${label}:`)
    try {
      await fn()
    } catch (err) {
      console.error(`  ❌ ${label} failed:`, err)
    }
  }

  console.log('\n✅ Migration complete!\n')
}

main()
