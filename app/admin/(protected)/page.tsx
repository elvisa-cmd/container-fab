'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Eye, TrendingUp, Mail, Bell,
  ExternalLink, ChevronRight,
} from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import ViewsChart from '@/components/admin/ViewsChart'
import type { ChartData, Message } from '@/types'

interface Stats {
  totalViews: number
  viewsToday: number
  viewsThisWeek: number
  totalMessages: number
  unreadMessages: number
  messagesThisWeek: number
  last30Days: ChartData[]
  recentMessages: Message[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {/* silently fail */})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-4 max-w-7xl mx-auto">
        <div className="skeleton h-10 w-64" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 w-full" />)}
        </div>
        <div className="skeleton h-72 w-full" />
      </div>
    )
  }

  const s = stats ?? {
    totalViews: 0, viewsToday: 0, viewsThisWeek: 0,
    totalMessages: 0, unreadMessages: 0, messagesThisWeek: 0,
    last30Days: [], recentMessages: [],
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest">Dashboard</h1>
        <p className="text-mid-gray text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard
          Icon={Eye}
          label="Total Page Views"
          value={s.totalViews.toLocaleString()}
          subLabel={`+${s.viewsThisWeek} this week`}
          variant="rust"
        />
        <StatsCard
          Icon={TrendingUp}
          label="Views Today"
          value={s.viewsToday.toLocaleString()}
          variant="green"
        />
        <StatsCard
          Icon={Mail}
          label="Total Messages"
          value={s.totalMessages.toLocaleString()}
          subLabel={`+${s.messagesThisWeek} this week`}
          variant="blue"
        />
        <StatsCard
          Icon={Bell}
          label="Unread Messages"
          value={s.unreadMessages.toLocaleString()}
          subLabel={s.unreadMessages > 0 ? 'Needs attention' : 'All caught up'}
          variant={s.unreadMessages > 0 ? 'rust' : 'gray'}
        />
      </div>

      {/* Chart */}
      {s.last30Days.length > 0 && (
        <div className="mb-8">
          <ViewsChart data={s.last30Days} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent messages */}
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-barlow font-700 text-sm uppercase tracking-widest text-steel">Recent Enquiries</h3>
            <Link href="/admin/messages" className="text-xs text-rust font-barlow uppercase tracking-wider hover:text-rust-lt flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {s.recentMessages.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No messages yet.</p>
          ) : (
            <div className="space-y-0">
              {s.recentMessages.map((msg: Message) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  className="flex items-center gap-4 py-3 border-b border-gray-50 hover:bg-gray-50 -mx-2 px-2 transition-colors group"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${msg.read ? 'bg-gray-200' : 'bg-rust'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate ${msg.read ? 'text-gray-600' : 'font-600 text-steel'}`}>{msg.name}</span>
                      {msg.service && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 font-barlow uppercase tracking-wider hidden sm:block">
                          {msg.service}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                  </div>
                  <div className="text-xs text-gray-400 shrink-0">{format(new Date(msg.created_at), 'MMM d')}</div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-rust shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-gray-100 p-6">
          <h3 className="font-barlow font-700 text-sm uppercase tracking-widest text-steel mb-5">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Edit Hero Section',    href: '/admin/content/hero' },
              { label: 'Manage Services',      href: '/admin/content/services' },
              { label: 'Manage Projects',      href: '/admin/content/projects' },
              { label: 'Edit About Section',   href: '/admin/content/about' },
              { label: 'Edit Reefers Section', href: '/admin/content/reefers' },
              { label: 'View Messages',        href: '/admin/messages' },
              { label: 'View Analytics',       href: '/admin/analytics' },
              { label: 'Visit Live Site',      href: '/', external: true },
            ].map(({ label, href, external }) =>
              external ? (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-rust transition-colors border border-gray-100">
                  {label} <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                </a>
              ) : (
                <Link key={href} href={href}
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-rust transition-colors border border-gray-100">
                  {label} <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
