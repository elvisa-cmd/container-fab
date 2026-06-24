import { NextRequest, NextResponse } from 'next/server'
import { getMessages, updateMessage, sessionSecret, SESSION_COOKIE } from '@/lib/data'

function authed(req: NextRequest) {
  return req.cookies.get(SESSION_COOKIE)?.value === sessionSecret()
}

export async function GET(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const messages = await getMessages()
  // Newest first
  return NextResponse.json({ messages: messages.slice().reverse() })
}

export async function PUT(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id, ...patch } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    const updated = await updateMessage(id, patch)
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    return NextResponse.json({ message: updated })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
