import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase-server'

const SLIDE_MAX   = 10 * 1024 * 1024
const LOGO_MAX    =  2 * 1024 * 1024
const SLIDE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const LOGO_TYPES  = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'])

function sanitize(name: string): string {
  return name.toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30) || 'file'
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
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
        error: isLogo
          ? 'Logos must be JPG, PNG, WebP or SVG'
          : 'Only JPG, PNG and WebP are allowed',
      }, { status: 400 })
    }
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File must be under ${isLogo ? '2' : '10'} MB` },
        { status: 400 },
      )
    }

    const ext      = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const ts       = Date.now()
    const rand     = Math.random().toString(36).slice(2, 7)
    const subDir   = isLogo ? 'logos' : 'slides'
    const filename = isLogo
      ? `logo-${sanitize(rawName)}-${ts}.${ext}`
      : `${subDir}-${ts}-${rand}.${ext}`
    const storagePath = `${subDir}/${filename}`

    const sb = createServiceClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await sb.storage
      .from('site-images')
      .upload(storagePath, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError.message)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = sb.storage.from('site-images').getPublicUrl(storagePath)
    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error('Upload route error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
