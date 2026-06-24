import { NextRequest, NextResponse } from 'next/server'
import { adminEmail, adminPassword, sessionSecret, SESSION_COOKIE } from '@/lib/data'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const expectedEmail    = adminEmail()
    const expectedPassword = adminPassword()

    console.log('[login] ADMIN_EMAIL env   :', process.env.ADMIN_EMAIL    ?? '(not set — using default)')
    console.log('[login] ADMIN_PASSWORD env:', process.env.ADMIN_PASSWORD ? '(set)' : '(not set — using default)')
    console.log('[login] Expected email    :', expectedEmail)
    console.log('[login] Received email    :', email?.trim())
    console.log('[login] Password match    :', password === expectedPassword)

    const emailMatch    = email?.trim().toLowerCase() === expectedEmail.toLowerCase()
    const passwordMatch = password === expectedPassword

    if (!emailMatch || !passwordMatch) {
      console.log('[login] Auth failed — emailMatch:', emailMatch, ' passwordMatch:', passwordMatch)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const secret = sessionSecret()
    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, secret, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
    console.log('[login] Auth succeeded — session cookie set')
    return res
  } catch (err) {
    console.error('[login] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
