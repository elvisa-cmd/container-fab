import { NextRequest, NextResponse } from 'next/server'
import { updateMessage, sessionSecret, SESSION_COOKIE } from '@/lib/data'

export async function POST(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value !== sessionSecret()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { messageId, replyText } = await req.json()

    if (!messageId || !replyText?.trim()) {
      return NextResponse.json(
        { error: 'messageId and replyText are required' },
        { status: 400 },
      )
    }

    const updated = await updateMessage(messageId, {
      replied: true,
      reply_text: replyText.trim(),
      replied_at: new Date().toISOString(),
      read: true,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json({ message: updated })
  } catch (err) {
    console.error('Reply route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
