import { redirect } from 'next/navigation'
import { getMessages, adminEmail } from '@/lib/data'
import { isAdminAuthed } from '@/lib/admin-auth'
import Sidebar from '@/components/admin/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthed()
  if (!authed) redirect('/admin/login')

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
