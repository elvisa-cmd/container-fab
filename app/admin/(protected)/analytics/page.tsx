'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Eye, TrendingUp, Mail, Bell,
} from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import AnalyticsCharts from './AnalyticsCharts'
import type { ChartData } from '@/types'

interface StatsData {
  totalViews: number
  viewsToday: number
  viewsThisWeek: number
  totalMessages: number
  unreadMessages: number
  messagesThisWeek: number
  last90Days: ChartData[]
  weeklyMessages: { date: string; messages: number }[]
  topPages: { page: string; count: number }[]
  recentActivity: { page: string; timestamp: string; referrer: string }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-4 max-w-7xl mx-auto">
        <div className="skeleton h-10 w-64" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 w-full" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="skeleton h-64 w-full" />
          <div className="skeleton h-64 w-full" />
        </div>
      </div>
    )
  }

  const d = data ?? {
    totalViews: 0, viewsToday: 0, viewsThisWeek: 0,
    totalMessages: 0, unreadMessages: 0, messagesThisWeek: 0,
    last90Days: [], weeklyMessages: [], topPages: [], recentActivity: [],
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest">Analytics</h1>
        <p className="text-mid-gray text-sm mt-1">Last updated: {format(new Date(), 'PPpp')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatsCard Icon={Eye}       label="Total Views"    value={d.totalViews.toLocaleString()}    subLabel={`+${d.viewsThisWeek} this week`}     variant="rust" />
        <StatsCard Icon={TrendingUp} label="Views Today"   value={d.viewsToday.toLocaleString()}    variant="green" />
        <StatsCard Icon={Mail}       label="Total Messages" value={d.totalMessages.toLocaleString()} subLabel={`+${d.messagesThisWeek} this week`}  variant="blue" />
        <StatsCard Icon={Bell}       label="Unread"        value={d.unreadMessages.toLocaleString()} variant={d.unreadMessages > 0 ? 'rust' : 'gray'} />
      </div>

      {/* Charts */}
      <AnalyticsCharts chartData={d.last90Days} weeklyData={d.weeklyMessages} />

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Top pages */}
        <div className="bg-white border border-gray-100 p-6">
          <h3 className="font-barlow font-700 text-sm uppercase tracking-widest text-steel mb-5">Top Pages — Last 90 Days</h3>
          {d.topPages.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {d.topPages.map(({ page, count }) => {
                const max = d.topPages[0].count
                return (
                  <div key={page}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-steel truncate">{page || '/'}</span>
                      <span className="text-sm font-600 text-rust shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100">
                      <div className="h-full bg-rust/60 transition-all" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-gray-100 p-6">
          <h3 className="font-barlow font-700 text-sm uppercase tracking-widest text-steel mb-5">Recent Activity</h3>
          {d.recentActivity.length === 0 ? (
            <p className="text-gray-400 text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-0 max-h-80 overflow-y-auto">
              {d.recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-blue-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-steel truncate">{item.page || '/'}</p>
                    {item.referrer && (
                      <p className="text-xs text-gray-400 truncate">via {item.referrer}</p>
                    )}
                    <p className="text-xs text-gray-400">{format(new Date(item.timestamp), 'MMM d, yyyy · HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
