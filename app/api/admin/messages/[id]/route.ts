import { NextRequest, NextResponse } from 'next/server'
import { updateMessage, sessionSecret, SESSION_COOKIE } from '@/lib/data'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (req.cookies.get(SESSION_COOKIE)?.value !== sessionSecret()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const patch = await req.json()
    const updated = await updateMessage(id, patch)
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    return NextResponse.json({ message: updated })
  } catch (err) {
    console.error('PATCH message error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
