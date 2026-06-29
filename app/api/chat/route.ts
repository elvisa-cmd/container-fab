import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a helpful customer service assistant for Classic Container Fabricators Kenya, a company based in Nairobi that transforms shipping containers into offices, homes, commercial spaces and storage solutions.

COMPANY INFO:
- Name: Classic Container Fabricators Kenya
- Location: National Park East Gate Rd, Nairobi, Kenya
- Phone: +254 715 296324, +254 713 971 394
- Email: info@containerfabricators.co.ke
- Experience: 10+ years, 200+ projects completed

SERVICES:
1. Used Shipping Containers (20ft & 40ft) - From KES 150,000
2. Accommodation Units (bedsitter to 3-bedroom) - From KES 800,000
3. Office Units (modular, partitioned) - From KES 350,000
4. Commercial Spaces (kiosks, restaurants, shops) - From KES 280,000
5. Storage Solutions - From KES 120,000
6. Custom Design (any specification) - Custom quote
7. Daikin & Carrier Reefer Units - 1 year warranty

GUIDELINES:
- Be friendly, professional and helpful
- Answer questions about services, pricing and process
- For specific quotes, encourage them to call or fill the contact form
- Keep responses short and conversational (2-3 sentences max)
- If asked something you don't know, say you'll connect them with the team
- Always end with an offer to help further or suggest calling
- Use Kenyan context (mention KES for prices, Nairobi locations)
- Do NOT make up specific prices beyond the ranges above`

type HistoryMsg = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json() as { message: string; history?: HistoryMsg[] }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const messages: Anthropic.MessageParam[] = [
      ...((history ?? []).slice(-8) as HistoryMsg[]),
      { role: 'user', content: message.trim() },
    ]

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    })

    const reply =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : 'I apologise, I could not process that. Please call us on +254 715 296324.'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chat] error:', err)
    return NextResponse.json({
      reply: 'Sorry, I\'m having trouble responding right now. Please call us on +254 715 296324 or WhatsApp us for immediate assistance.',
    })
  }
}
