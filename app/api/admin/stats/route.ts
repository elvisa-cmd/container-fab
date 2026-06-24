import { NextRequest, NextResponse } from 'next/server'
import { getMessages, getPageViews, sessionSecret, SESSION_COOKIE } from '@/lib/data'
import { startOfWeek, subWeeks } from 'date-fns'

export async function GET(req: NextRequest) {
  if (req.cookies.get(SESSION_COOKIE)?.value !== sessionSecret()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [messages, pageViews] = await Promise.all([getMessages(), getPageViews()])

  const now = new Date()
  const todayStr   = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart  = new Date(now.getTime() - 7  * 86400000).toISOString()
  const monthStart = new Date(now.getTime() - 30 * 86400000).toISOString()
  const day90Start = new Date(now.getTime() - 90 * 86400000).toISOString()

  // ── Basic stats ──────────────────────────────────────────────────────────────
  const totalViews       = pageViews.length
  const viewsToday       = pageViews.filter((v) => v.created_at >= todayStr).length
  const viewsThisWeek    = pageViews.filter((v) => v.created_at >= weekStart).length
  const viewsThisMonth   = pageViews.filter((v) => v.created_at >= monthStart).length
  const totalMessages    = messages.length
  const unreadMessages   = messages.filter((m) => !m.read).length
  const repliedMessages  = messages.filter((m) => m.replied).length
  const messagesThisWeek = messages.filter((m) => m.created_at >= weekStart).length

  // ── 30-day chart (views + messages per day) ──────────────────────────────────
  const last30Days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    last30Days.push({
      date: key,
      views:    pageViews.filter((v) => v.created_at.slice(0, 10) === key).length,
      messages: messages.filter((m) => m.created_at.slice(0, 10) === key).length,
    })
  }

  // ── 90-day chart (views per day) ─────────────────────────────────────────────
  const last90Days = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    last90Days.push({
      date: key,
      views:    pageViews.filter((v) => v.created_at.slice(0, 10) === key && v.created_at >= day90Start).length,
      messages: messages.filter((m) => m.created_at.slice(0, 10) === key && m.created_at >= day90Start).length,
    })
  }

  // ── 12-week messages bar chart ───────────────────────────────────────────────
  const weeklyMessages = []
  for (let i = 11; i >= 0; i--) {
    const weekDate = startOfWeek(subWeeks(now, i))
    const weekKey  = weekDate.toISOString().slice(0, 10)
    weeklyMessages.push({
      date: weekKey,
      messages: messages.filter((m) => {
        const mWeek = startOfWeek(new Date(m.created_at)).toISOString().slice(0, 10)
        return mWeek === weekKey
      }).length,
    })
  }

  // ── Top pages (last 90 days) ─────────────────────────────────────────────────
  const pageCounts: Record<string, number> = {}
  pageViews
    .filter((v) => v.created_at >= day90Start)
    .forEach((v) => { pageCounts[v.page] = (pageCounts[v.page] ?? 0) + 1 })
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }))

  // ── Recent activity feed (last 20 page views) ────────────────────────────────
  const recentActivity = pageViews
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20)
    .map((v) => ({ page: v.page, timestamp: v.created_at, referrer: v.referrer }))

  // ── Recent messages (last 5 for dashboard) ───────────────────────────────────
  const recentMessages = messages
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  return NextResponse.json({
    totalViews,
    viewsToday,
    viewsThisWeek,
    viewsThisMonth,
    totalMessages,
    unreadMessages,
    repliedMessages,
    messagesThisWeek,
    last30Days,
    last90Days,
    weeklyMessages,
    topPages,
    recentActivity,
    recentMessages,
  })
}
