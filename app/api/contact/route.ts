import { NextRequest, NextResponse } from 'next/server'
import { appendMessage } from '@/lib/data'
import type { Message } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone = '', service = '', message } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const msg: Message = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      service,
      message: message.trim(),
      read: false,
      replied: false,
      reply_text: null,
      replied_at: null,
      created_at: new Date().toISOString(),
    }

    await appendMessage(msg)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
