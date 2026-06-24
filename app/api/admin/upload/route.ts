import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { sessionSecret, SESSION_COOKIE } from '@/lib/data'

const PUBLIC_DIR  = path.join(process.cwd(), 'public')
const SLIDE_MAX   = 10 * 1024 * 1024
const LOGO_MAX    =  2 * 1024 * 1024
const SLIDE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const LOGO_TYPES  = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'])

function sanitizeName(name: string): string {
  return name.toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30) || 'file'
}

function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(url && url !== 'your-project-url' && url.startsWith('https://'))
}

export async function POST(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value !== sessionSecret()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const form    = await req.formData()
    const file    = form.get('file')   as File   | null
    const type    = (form.get('type')  as string | null) ?? 'slide'
    const rawName = (form.get('name')  as string | null) ?? ''

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const isLogo  = type === 'logo'
    const allowed = isLogo ? LOGO_TYPES : SLIDE_TYPES
    const maxSize = isLogo ? LOGO_MAX   : SLIDE_MAX

    if (!allowed.has(file.type)) {
      return NextResponse.json({
        error: isLogo ? 'Logos must be JPG, PNG, WebP or SVG' : 'Only JPG, PNG and WebP allowed',
      }, { status: 400 })
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File must be under ${isLogo ? '2' : '10'} MB` }, { status: 400 })
    }

    const ext      = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const ts       = Date.now()
    const rand     = Math.random().toString(36).slice(2, 7)
    const subDir   = isLogo ? 'logos' : 'slides'
    const filename = isLogo
      ? `logo-${sanitizeName(rawName)}-${ts}.${ext}`
      : `${subDir}-${ts}-${rand}.${ext}`

    // ── Supabase Storage (when configured) ───────────────────────────────
    if (supabaseConfigured()) {
      try {
        const { createServiceClient } = await import('@/lib/supabase-server')
        const sb = createServiceClient()
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const storagePath = `${subDir}/${filename}`
        const { error } = await sb.storage
          .from('site-images')
          .upload(storagePath, buffer, { contentType: file.type, upsert: false })

        if (!error) {
          const { data: urlData } = sb.storage.from('site-images').getPublicUrl(storagePath)
          return NextResponse.json({ url: urlData.publicUrl })
        }
        console.warn('Supabase upload error, falling back to local:', error.message)
      } catch (err) {
        console.warn('Supabase upload exception, falling back to local:', err)
      }
    }

    // ── Local file system fallback ───────────────────────────────────────
    const uploadDir = path.join(PUBLIC_DIR, 'uploads', subDir)
    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/${subDir}/${filename}` })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
