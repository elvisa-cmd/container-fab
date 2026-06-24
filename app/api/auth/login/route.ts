import { NextRequest, NextResponse } from 'next/server'
import { adminEmail, adminPassword } from '@/lib/data'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const expectedEmail    = adminEmail()
    const expectedPassword = adminPassword()

    const emailMatch    = email?.trim().toLowerCase() === expectedEmail.toLowerCase()
    const passwordMatch = password === expectedPassword

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const isProd = process.env.NODE_ENV === 'production'
    const res = NextResponse.json({ ok: true })
    res.cookies.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, {
      httpOnly: true,
      secure:   isProd,
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7, // 7 days
      path:     '/',
    })
    return res
  } catch (err) {
    console.error('[login] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
