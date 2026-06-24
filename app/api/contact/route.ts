import { NextRequest, NextResponse } from 'next/server'
import { addMessage } from '@/lib/data'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, service, message } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    await addMessage({
      name:       (name    || 'Chat Visitor').trim(),
      email:      (email   || 'chat@visitor.com').trim().toLowerCase(),
      phone:      (phone   || '').trim(),
      service:    (service || 'Contact Form').trim(),
      message:    message.trim(),
      read:       false,
      replied:    false,
      reply_text: '',
      replied_at: null,
    })

    console.log('[contact] message saved from:', name || 'Chat Visitor', '|', service)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
