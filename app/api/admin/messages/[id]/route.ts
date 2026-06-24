import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { updateMessage } from '@/lib/data'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const patch = await req.json()
    const updated = await updateMessage(id, patch)
    if (!updated) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    return NextResponse.json({ message: updated })
  } catch (err) {
    console.error('PATCH message error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
