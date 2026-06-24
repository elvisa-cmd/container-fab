import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getMessages, updateMessage } from '@/lib/data'

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const messages = await getMessages()
  return NextResponse.json({ messages: messages.slice().reverse() })
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, ...patch } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    const updated = await updateMessage(id, patch)
    if (!updated) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    return NextResponse.json({ message: updated })
  } catch (err) {
    console.error('messages PUT error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
