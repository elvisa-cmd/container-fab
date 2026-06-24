import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthed } from '@/lib/admin-auth'
import {
  setHero, setAbout, setReefer, setServices, setProjects, setCustomers,
} from '@/lib/data'

const SAVERS: Record<string, (data: unknown) => Promise<void>> = {
  hero:      (d) => setHero(d as Parameters<typeof setHero>[0]),
  about:     (d) => setAbout(d as Parameters<typeof setAbout>[0]),
  reefers:   (d) => setReefer(d as Parameters<typeof setReefer>[0]),
  reefer:    (d) => setReefer(d as Parameters<typeof setReefer>[0]),
  services:  (d) => setServices(d as Parameters<typeof setServices>[0]),
  projects:  (d) => setProjects(d as Parameters<typeof setProjects>[0]),
  customers: (d) => setCustomers(d as Parameters<typeof setCustomers>[0]),
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> },
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { section } = await params
  const saver = SAVERS[section]
  if (!saver) {
    return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 })
  }

  try {
    const data = await req.json()
    await saver(data)
    revalidatePath('/', 'layout')
    revalidatePath('/services')
    revalidatePath('/projects')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`[save/${section}] error:`, err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
