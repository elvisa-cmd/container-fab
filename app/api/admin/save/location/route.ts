import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthed } from '@/lib/admin-auth'
import { writeLocation } from '@/lib/data'
import type { LocationData } from '@/types'

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json() as LocationData
    await writeLocation({ ...data, updated_at: new Date().toISOString() })
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[save/location]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
