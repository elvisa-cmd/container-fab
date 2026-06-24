import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'admin-session'
export const ADMIN_SESSION_VALUE  = 'authenticated'

/**
 * Server-side auth check for Route Handlers and Server Components.
 * Uses cookies() from next/headers — the reliable path on Vercel.
 */
export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies()
  return store.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE
}
