'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Search, Mail, MailOpen, Reply, CheckCheck, X } from 'lucide-react'
import type { Message } from '@/types'

type FilterTab = 'all' | 'unread' | 'replied'

export default function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [selected, setSelected] = useState<Message | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState('')

  const filtered = useMemo(() => {
    let list = messages
    if (filter === 'unread')  list = list.filter((m) => !m.read)
    if (filter === 'replied') list = list.filter((m) => m.replied)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q),
      )
    }
    return list
  }, [messages, filter, search])

  async function patchMessage(id: string, patch: Partial<Message>) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error((await res.json()).error ?? 'Update failed')
    const { message: updated } = await res.json()
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
    return updated as Message
  }

  async function markRead(msg: Message) {
    if (msg.read) return
    try {
      const updated = await patchMessage(msg.id, { read: true })
      setSelected((prev) => (prev?.id === msg.id ? updated : prev))
    } catch { /* silent */ }
  }

  function selectMessage(msg: Message) {
    setSelected(msg)
    setReplyText(msg.reply_text ?? '')
    setReplyError('')
    markRead(msg)
  }

  async function sendReply() {
    if (!selected || !replyText.trim()) return
    setReplying(true)
    setReplyError('')
    try {
      const updated = await patchMessage(selected.id, {
        replied: true,
        reply_text: replyText.trim(),
        replied_at: new Date().toISOString(),
        read: true,
      })
      setSelected(updated)
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : 'Error saving reply')
    } finally {
      setReplying(false)
    }
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: messages.length },
    { key: 'unread',  label: 'Unread',  count: messages.filter((m) => !m.read).length },
    { key: 'replied', label: 'Replied', count: messages.filter((m) => m.replied).length },
  ]

  return (
    <div className="flex" style={{ height: 'calc(100vh - 0px)' }}>
      {/* ── Left panel ── */}
      <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-5 border-b border-gray-100">
          <h1 className="font-barlow font-800 text-xl text-steel uppercase tracking-widest mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 focus:outline-none focus:border-rust transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2.5 text-xs font-barlow uppercase tracking-wider transition-colors
                ${filter === tab.key ? 'text-rust border-b-2 border-rust bg-rust/5' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 ${filter === tab.key ? 'text-rust' : 'text-gray-300'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              {messages.length === 0 ? 'No messages yet.' : 'No messages found.'}
            </div>
          ) : (
            filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => selectMessage(msg)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors
                  ${selected?.id === msg.id ? 'bg-rust/5 border-l-2 border-rust' : 'border-l-2 border-transparent'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${msg.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                    <span className={`text-sm truncate ${msg.read ? 'text-gray-600' : 'font-600 text-steel'}`}>
                      {msg.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{format(new Date(msg.created_at), 'MMM d')}</span>
                </div>
                {msg.service && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 font-barlow uppercase tracking-wider">
                    {msg.service}
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-1 truncate">{msg.message}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-gray-300">
            <Mail className="w-12 h-12" />
            <p className="text-sm">Select a message to view</p>
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-barlow font-800 text-2xl text-steel uppercase">{selected.name}</h2>
                <p className="text-mid-gray text-sm">{selected.email}</p>
                {selected.phone && <p className="text-mid-gray text-sm">{selected.phone}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{format(new Date(selected.created_at), 'PPpp')}</p>
                {selected.service && (
                  <span className="text-xs bg-rust/10 text-rust px-2 py-0.5 font-barlow uppercase tracking-wider mt-1 inline-block">
                    {selected.service}
                  </span>
                )}
              </div>
            </div>

            {/* Status badges */}
            <div className="flex gap-2 mb-6">
              <span className={`flex items-center gap-1 text-xs px-2 py-1 font-barlow uppercase tracking-wider
                ${selected.read ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {selected.read ? <MailOpen className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                {selected.read ? 'Read' : 'Unread'}
              </span>
              {selected.replied && (
                <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-600 font-barlow uppercase tracking-wider">
                  <CheckCheck className="w-3 h-3" /> Replied
                </span>
              )}
              {!selected.read && (
                <button
                  onClick={() => markRead(selected)}
                  className="text-xs px-2 py-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-barlow uppercase tracking-wider transition-colors"
                >
                  Mark as Read
                </button>
              )}
            </div>

            {/* Message body */}
            <div className="bg-gray-50 border border-gray-100 p-5 mb-6">
              <p className="text-steel text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>

            {/* Previous reply */}
            {selected.replied && selected.reply_text && (
              <div className="bg-blue-50 border border-blue-100 p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Reply className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-barlow uppercase tracking-wider text-blue-600">
                    Your Reply — {selected.replied_at ? format(new Date(selected.replied_at), 'PPp') : ''}
                  </span>
                </div>
                <p className="text-blue-800 text-sm whitespace-pre-wrap">{selected.reply_text}</p>
              </div>
            )}

            {/* Reply form */}
            <div className="bg-white border border-gray-100 p-5">
              <label className="block text-xs font-barlow uppercase tracking-widest text-gray-400 mb-3">
                {selected.replied ? 'Update Reply' : 'Write a Reply'}
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Type your reply here…"
                className="w-full border border-gray-200 px-4 py-3 text-sm text-steel focus:outline-none focus:border-rust transition-colors resize-none"
              />
              {replyError && <p className="text-red-500 text-xs mt-2">{replyError}</p>}
              <button
                onClick={sendReply}
                disabled={replying || !replyText.trim()}
                className="mt-3 flex items-center gap-2 bg-rust text-white font-barlow font-700 text-xs uppercase tracking-widest px-4 py-2 hover:bg-rust-lt transition-colors disabled:opacity-50"
              >
                {replying ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <><Reply className="w-3.5 h-3.5" /> Send Reply</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
