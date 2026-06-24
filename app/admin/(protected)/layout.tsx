import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getMessages, adminEmail, sessionSecret, SESSION_COOKIE } from '@/lib/data'
import Sidebar from '@/components/admin/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (session?.value !== sessionSecret()) {
    redirect('/admin/login')
  }

  const messages = await getMessages()
  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar userEmail={adminEmail()} unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
