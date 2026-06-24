import { NextRequest, NextResponse } from 'next/server'
import { appendPageView } from '@/lib/data'
import type { PageView } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { page = '/', referrer = '', userAgent = '' } = body

    const view: PageView = {
      id: crypto.randomUUID(),
      page,
      referrer,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    }

    await appendPageView(view)
  } catch {
    // Silently ignore tracking errors — never fail the user request
  }

  return NextResponse.json({ ok: true })
}
