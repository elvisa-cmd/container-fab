'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, MessageSquare, Edit, BarChart2, LogOut,
  ChevronDown, ChevronRight, Image, Users, Boxes, Star, Thermometer,
  ExternalLink, Camera,
} from 'lucide-react'

interface SidebarProps {
  userEmail: string
  unreadCount: number
}

const contentItems = [
  { label: 'Hero',      href: '/admin/content/hero',      Icon: Image },
  { label: 'About',     href: '/admin/content/about',     Icon: Users },
  { label: 'Customers', href: '/admin/content/customers', Icon: Users },
  { label: 'Services',  href: '/admin/content/services',  Icon: Boxes },
  { label: 'Projects',  href: '/admin/content/projects',  Icon: Star },
  { label: 'Reefers',   href: '/admin/content/reefers',   Icon: Thermometer },
  { label: 'Location',  href: '/admin/content/location',  Icon: Camera },
]

export default function Sidebar({ userEmail, unreadCount }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [contentOpen, setContentOpen] = useState(pathname.startsWith('/admin/content'))
  const [signingOut, setSigningOut] = useState(false)

  const isActive  = (href: string) => pathname === href
  const isSection = (prefix: string) => pathname.startsWith(prefix)

  async function signOut() {
    setSigningOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const linkClass = (href: string) =>
    `relative flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-none
     ${isActive(href)
       ? 'text-white bg-white/5 border-l-2 border-rust font-600'
       : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
     }`

  return (
    <aside className="w-60 bg-steel flex flex-col shrink-0 border-r border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-rust flex items-center justify-center shrink-0">
          <span className="font-barlow font-800 text-white text-xs tracking-widest">CF</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-barlow font-700 text-white text-xs tracking-widest uppercase">Container</span>
          <span className="font-barlow font-700 text-rust text-xs tracking-widest uppercase">Fabricators</span>
        </div>
      </div>

      {/* View Site shortcut */}
      <Link
        href="/"
        className="flex items-center justify-center gap-2 mx-3 my-2 px-3 py-2 bg-rust text-white text-xs font-barlow font-700 uppercase tracking-widest hover:bg-rust-lt transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View Site
      </Link>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        <Link href="/admin" className={linkClass('/admin')}>
          <LayoutDashboard className="w-4 h-4 shrink-0" /> Dashboard
        </Link>

        <Link href="/admin/messages" className={linkClass('/admin/messages')}>
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="flex-1">Messages</span>
          {unreadCount > 0 && (
            <span className="bg-rust text-white text-xs font-700 px-1.5 py-0.5 min-w-[20px] text-center leading-none">
              {unreadCount}
            </span>
          )}
        </Link>

        <div>
          <button onClick={() => setContentOpen(!contentOpen)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-2
              ${isSection('/admin/content')
                ? 'text-white bg-white/5 border-rust'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}>
            <Edit className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Content</span>
            {contentOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {contentOpen && (
            <div className="ml-7 border-l border-white/10 mt-0.5 space-y-0.5">
              {contentItems.map(({ label, href, Icon }) => (
                <Link key={href} href={href}
                  className={`flex items-center gap-3 pl-4 pr-4 py-2 text-sm transition-colors
                    ${isActive(href) ? 'text-rust' : 'text-gray-500 hover:text-gray-200'}`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" /> {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/admin/analytics" className={linkClass('/admin/analytics')}>
          <BarChart2 className="w-4 h-4 shrink-0" /> Analytics
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <p className="text-gray-500 text-xs truncate">{userEmail}</p>
        <button onClick={signOut} disabled={signingOut}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors disabled:opacity-50">
          <LogOut className="w-4 h-4" />
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}

