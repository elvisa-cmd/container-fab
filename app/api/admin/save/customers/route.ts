import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthed } from '@/lib/admin-auth'
import { setCustomers } from '@/lib/data'
import type { Customer } from '@/types'

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const customers: Customer[] = Array.isArray(body) ? body : []

    console.log('[save/customers] saving', customers.length, 'customers')
    await setCustomers(customers)

    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[save/customers] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
