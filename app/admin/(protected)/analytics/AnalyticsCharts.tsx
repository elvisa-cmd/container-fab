'use client'

import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { format } from 'date-fns'
import type { ChartData } from '@/types'

interface Props {
  chartData: ChartData[]
  weeklyData: { date: string; messages: number }[]
}

export default function AnalyticsCharts({ chartData, weeklyData }: Props) {
  const formattedDaily = chartData.map((d) => ({
    ...d,
    label: (() => { try { return format(new Date(d.date), 'MMM d') } catch { return d.date } })(),
  }))

  const formattedWeekly = weeklyData.map((d) => ({
    ...d,
    label: (() => { try { return format(new Date(d.date), 'MMM d') } catch { return d.date } })(),
  }))

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* 90-day line chart */}
      <div className="bg-white border border-gray-100 p-6">
        <h3 className="font-barlow font-700 text-sm uppercase tracking-widest text-steel mb-6">
          Page Views — Last 90 Days
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={formattedDaily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} interval={14} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb' }} />
            <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }} />
            <Line type="monotone" dataKey="views" name="Views" stroke="#C94C1A" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 12-week bar chart */}
      <div className="bg-white border border-gray-100 p-6">
        <h3 className="font-barlow font-700 text-sm uppercase tracking-widest text-steel mb-6">
          Messages by Week — Last 12 Weeks
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={formattedWeekly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb' }} />
            <Bar dataKey="messages" name="Messages" fill="#1A1F2E" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
