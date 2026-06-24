'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import type { ChartData } from '@/types'

interface ViewsChartProps {
  data: ChartData[]
  title?: string
  days?: number
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-steel border border-white/10 px-4 py-3 text-sm shadow-xl">
      <p className="text-gray-300 mb-2 font-barlow text-xs uppercase tracking-wider">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-white">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-700">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ViewsChart({ data, title = 'Traffic & Enquiries — Last 30 Days' }: ViewsChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: (() => {
      try { return format(new Date(d.date), 'MMM d') } catch { return d.date }
    })(),
  }))

  return (
    <div className="bg-white border border-gray-100 p-6">
      <h3 className="font-barlow font-700 text-sm uppercase tracking-widest text-steel mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="views-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C94C1A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C94C1A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="messages-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A1F2E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1A1F2E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Views"
            stroke="#C94C1A"
            strokeWidth={2}
            fill="url(#views-gradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#C94C1A' }}
          />
          <Area
            type="monotone"
            dataKey="messages"
            name="Messages"
            stroke="#1A1F2E"
            strokeWidth={2}
            fill="url(#messages-gradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#1A1F2E' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
