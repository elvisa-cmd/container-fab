import { NextRequest, NextResponse } from 'next/server'
import {
  getHero, getAbout, getReefer, getServices, getProjects, getCustomers, readLocation,
  patchContent, sessionSecret, SESSION_COOKIE,
} from '@/lib/data'
import type { ContentStore } from '@/lib/data'

function authed(req: NextRequest) {
  return req.cookies.get(SESSION_COOKIE)?.value === sessionSecret()
}

// Maps URL ?section= param → ContentStore key (handles aliases like 'reefers' → 'reefer')
const SECTION_READERS: Record<string, () => Promise<unknown>> = {
  hero:      getHero,
  about:     getAbout,
  reefer:    getReefer,
  reefers:   getReefer,
  services:  getServices,
  projects:  getProjects,
  customers: getCustomers,
  location:  readLocation,
}

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section') ?? ''
  const reader = SECTION_READERS[section]
  if (reader) {
    return NextResponse.json({ data: await reader() })
  }
  // No section param → return all
  const [hero, about, reefer, services, projects] = await Promise.all([
    getHero(), getAbout(), getReefer(), getServices(), getProjects(),
  ])
  return NextResponse.json({ data: { hero, about, reefer, services, projects } })
}

export async function PUT(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { section, data } = await req.json()
    if (!section) {
      return NextResponse.json({ error: 'section is required' }, { status: 400 })
    }
    await patchContent(section as keyof ContentStore, data)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('content PUT error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
