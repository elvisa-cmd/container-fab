/**
 * Migrate local JSON data → Supabase
 *
 * Run: node scripts/migrate-to-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import { randomUUID } from 'crypto'

// ── UUID helpers ─────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(str) {
  return Boolean(str) && UUID_RE.test(str)
}

/** Return id if it's already a valid UUID, otherwise generate a fresh one. */
function toUUID(id) {
  return isValidUUID(id) ? id : randomUUID()
}

/** Ensure a value is a plain integer (Supabase INT column). */
function toInt(v, fallback = 0) {
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const ROOT       = join(__dirname, '..')

// Load .env.local
config({ path: join(ROOT, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || supabaseUrl === 'your-project-url') {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL not set in .env.local')
  process.exit(1)
}
if (!serviceKey || serviceKey === 'your-service-role-key') {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY not set in .env.local')
  process.exit(1)
}

const sb = createClient(supabaseUrl, serviceKey)

// ── Helper ───────────────────────────────────────────────────────────────────

function readJson(filename, fallback = null) {
  const file = join(ROOT, 'data', filename)
  if (!existsSync(file)) {
    console.log(`  ⚠  data/${filename} not found — skipping`)
    return fallback
  }
  try {
    return JSON.parse(readFileSync(file, 'utf-8'))
  } catch (e) {
    console.warn(`  ⚠  Could not parse data/${filename}:`, e.message)
    return fallback
  }
}

async function upsertSingle(table, data) {
  const { data: existing } = await sb.from(table).select('id').single()
  if (existing?.id) {
    const { error } = await sb.from(table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw error
    console.log(`  ✅  ${table} — updated`)
  } else {
    const { error } = await sb.from(table)
      .insert({ ...data, updated_at: new Date().toISOString() })
    if (error) throw error
    console.log(`  ✅  ${table} — inserted`)
  }
}

// ── Tables ───────────────────────────────────────────────────────────────────

async function migrateHero() {
  const hero = readJson('hero.json')
  if (!hero) return
  // Remove local-only fields that don't exist in Supabase table
  const { id: _id, ...rest } = hero
  await upsertSingle('hero_content', rest)
}

async function migrateAbout() {
  const about = readJson('about.json')
  if (!about) return
  const { id: _id, ...rest } = about
  await upsertSingle('about_content', rest)
}

async function migrateReefer() {
  const reefer = readJson('reefers.json')
  if (!reefer) return
  const { id: _id, ...rest } = reefer
  await upsertSingle('reefer_content', rest)
}

async function migrateServices() {
  const services = readJson('services.json', [])
  if (!services.length) { console.log('  ⏭  services.json empty — skipping'); return }

  // Clear existing
  await sb.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const rows = services.map((s, i) => ({
    id:               toUUID(s.id),
    number:           s.number ?? '01',
    icon:             s.icon   ?? '📦',
    title:            s.title,
    slug:             s.slug,
    description:      s.description      ?? '',
    full_description: s.full_description ?? '',
    features:         Array.isArray(s.features) ? s.features : [],
    process:          s.process          ?? '',
    starting_price:   s.starting_price   ?? '',
    delivery_time:    s.delivery_time    ?? '',
    cover_image:      s.cover_image      ?? '',
    gallery:          Array.isArray(s.gallery) ? s.gallery : [],
    active:           s.active ?? true,
    order_index:      toInt(s.order ?? s.order_index ?? i),
    updated_at:       new Date().toISOString(),
  }))

  const { error } = await sb.from('services').insert(rows)
  if (error) throw error
  console.log(`  ✅  services — ${rows.length} rows`)
}

async function migrateProjects() {
  const projects = readJson('projects.json', [])
  if (!projects.length) { console.log('  ⏭  projects.json empty — skipping'); return }

  await sb.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const rows = projects.map((p, i) => ({
    id:          toUUID(p.id),
    title:       p.title,
    slug:        p.slug,
    category:    p.category    ?? 'General',
    cover_image: p.cover_image ?? p.image_url ?? '',
    gallery:     Array.isArray(p.gallery) ? p.gallery : [],
    description: p.description ?? '',
    location:    p.location    ?? 'Nairobi, Kenya',
    year:        p.year        ?? '',
    client:      p.client      ?? '',
    status:      p.status      ?? 'Completed',
    featured:    p.featured    ?? false,
    order_index: toInt(p.order ?? p.order_index ?? i),
    created_at:  p.created_at ?? new Date().toISOString(),
  }))

  const { error } = await sb.from('projects').insert(rows)
  if (error) throw error
  console.log(`  ✅  projects — ${rows.length} rows`)
}

async function migrateCustomers() {
  const customers = readJson('customers.json', [])
  if (!customers.length) { console.log('  ⏭  customers.json empty — skipping'); return }

  await sb.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const rows = customers.map((c, i) => ({
    id:          toUUID(c.id),
    name:        c.name,
    logo:        c.logo     ?? '',
    featured:    c.featured ?? true,
    order_index: toInt(c.order ?? c.order_index ?? i),
  }))

  const { error } = await sb.from('customers').insert(rows)
  if (error) throw error
  console.log(`  ✅  customers — ${rows.length} rows`)
}

async function migrateMessages() {
  const messages = readJson('messages.json', [])
  if (!messages.length) { console.log('  ⏭  messages.json empty — skipping'); return }

  // Insert in batches to avoid hitting request size limits
  const BATCH = 50
  let inserted = 0
  for (let i = 0; i < messages.length; i += BATCH) {
    const batch = messages.slice(i, i + BATCH)
    const { error } = await sb.from('messages').upsert(
      batch.map(m => ({ ...m, reply_text: m.reply_text ?? '' })),
      { onConflict: 'id', ignoreDuplicates: true }
    )
    if (error) throw error
    inserted += batch.length
  }
  console.log(`  ✅  messages — ${inserted} rows`)
}

async function migrateLocation() {
  const loc = readJson('location.json')
  if (!loc) return
  const { updated_at: _ua, ...rest } = loc
  await upsertSingle('location_data', rest)
}

// ── Main ─────────────────────────────────────────────────────────────────────

const STEPS = [
  ['Hero content',   migrateHero],
  ['About content',  migrateAbout],
  ['Reefer content', migrateReefer],
  ['Services',       migrateServices],
  ['Projects',       migrateProjects],
  ['Customers',      migrateCustomers],
  ['Messages',       migrateMessages],
  ['Location',       migrateLocation],
]

console.log('\n🚀  Container Fabricators — JSON → Supabase migration\n')
console.log(`    Project: ${supabaseUrl}\n`)

let ok = 0, fail = 0

for (const [label, fn] of STEPS) {
  process.stdout.write(`${label}:\n`)
  try {
    await fn()
    ok++
  } catch (err) {
    console.error(`  ❌  ${label} failed:`, err?.message ?? err)
    fail++
  }
}

console.log(`\n${'─'.repeat(40)}`)
console.log(`✅  ${ok} succeeded   ${fail ? `❌  ${fail} failed` : ''}`)
console.log('─'.repeat(40))
console.log('\nAll done! Open Supabase dashboard to verify your data.\n')
