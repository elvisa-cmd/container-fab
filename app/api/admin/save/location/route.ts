import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { writeLocation, sessionSecret, SESSION_COOKIE } from '@/lib/data'
import type { LocationData } from '@/types'

export async function POST(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value !== sessionSecret()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json() as LocationData
    await writeLocation({ ...data, updated_at: new Date().toISOString() })

    // Bust cache so public site shows fresh location immediately
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[save/location]', err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
