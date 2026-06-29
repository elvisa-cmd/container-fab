'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface Msg {
  id: string
  from: 'bot' | 'user'
  text: string
  time: Date
}

type HistoryMsg = { role: 'user' | 'assistant'; content: string }

const QUICK_CHIPS = [
  'What services do you offer?',
  'How much does a container office cost?',
  'How long does fabrication take?',
] as const

export default function ChatBubble() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: 'w1',
      from: 'bot',
      text: "👋 Hi! I'm the Container Fabricators AI assistant. I can answer questions about our services, pricing, and help you get started. What would you like to know?",
      time: new Date(),
    },
  ])
  const [history, setHistory] = useState<HistoryMsg[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [userMsgCount, setUserMsgCount] = useState(0)

  // Follow-up prompt state
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [followUpPhone, setFollowUpPhone] = useState('')
  const [followUpSent, setFollowUpSent] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing, showFollowUp])

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: 'instant' })
        inputRef.current?.focus()
      }, 320)
    }
  }, [open])

  function fmt(d: Date) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  async function send(text: string) {
    const t = text.trim()
    if (!t || sending) return

    const newCount = userMsgCount + 1
    setUserMsgCount(newCount)
    setMsgs(p => [...p, { id: `u${Date.now()}`, from: 'user', text: t, time: new Date() }])
    setInput('')
    setSending(true)
    setTyping(true)

    // Save to inbox silently
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Chat Visitor', email: 'chat@visitor.com', phone: '', service: 'Chat', message: t }),
    }).catch(() => {})

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t, history }),
      })
      const data = await res.json() as { reply?: string }
      const reply = data.reply ?? 'Sorry, something went wrong. Please call +254 715 296324.'

      setHistory(prev => [
        ...prev,
        { role: 'user', content: t },
        { role: 'assistant', content: reply },
      ])

      setTyping(false)
      setMsgs(p => [...p, { id: `b${Date.now()}`, from: 'bot', text: reply, time: new Date() }])

      // Show follow-up prompt after 3 messages
      if (newCount === 3 && !followUpSent) {
        setShowFollowUp(true)
      }
    } catch {
      setTyping(false)
      setMsgs(p => [...p, {
        id: `b${Date.now()}`,
        from: 'bot',
        text: "Sorry, I'm having connection issues. Please call us on +254 715 296324!",
        time: new Date(),
      }])
    } finally {
      setSending(false)
    }
  }

  async function sendFollowUp() {
    if (!followUpPhone.trim()) return
    setFollowUpSent(true)
    setShowFollowUp(false)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Chat Visitor',
          email: 'chat@visitor.com',
          phone: followUpPhone.trim(),
          service: 'Chat Follow-up',
          message: `[Chat follow-up request] Phone: ${followUpPhone.trim()}\n\nConversation:\n${history.map(m => `${m.role === 'user' ? 'Visitor' : 'AI'}: ${m.content}`).join('\n')}`,
        }),
      })
    } catch { /* silent */ }
    setMsgs(p => [...p, {
      id: `b${Date.now()}`,
      from: 'bot',
      text: `Perfect! We'll call you on ${followUpPhone.trim()} soon. Is there anything else I can help with?`,
      time: new Date(),
    }])
  }

  return (
    <>
      {/* ── Chat window ── */}
      <div
        className={[
          'fixed z-50 bg-white shadow-2xl overflow-hidden flex flex-col',
          'left-0 right-0 bottom-0 rounded-t-2xl',
          'sm:left-auto sm:right-5 sm:bottom-[88px] sm:w-[360px] sm:rounded-2xl',
          'transition-all duration-300 ease-out origin-bottom',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
        ].join(' ')}
        style={{ height: 480 }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="shrink-0 bg-steel px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-rust rounded-full flex items-center justify-center shrink-0">
            <span className="font-barlow font-800 text-white text-xs tracking-wider">CF</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-barlow font-700 text-white text-sm uppercase tracking-wider">
                AI Assistant
              </span>
              <span className="w-2 h-2 bg-green-400 rounded-full shrink-0" />
            </div>
            <p className="text-gray-400 text-xs">Container Fabricators Kenya</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white transition-colors ml-1 p-1"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col gap-1 max-w-[82%] ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={[
                    'px-3 py-2 text-sm leading-relaxed rounded-2xl',
                    m.from === 'user'
                      ? 'bg-rust text-white rounded-br-none'
                      : 'bg-white text-steel shadow-sm border border-gray-100 rounded-bl-none',
                  ].join(' ')}
                >
                  {m.text}
                </div>
                <span suppressHydrationWarning className="text-xs text-gray-400">{fmt(m.time)}</span>
              </div>
            </div>
          ))}

          {/* Quick reply chips — visible until first user message */}
          {userMsgCount === 0 && (
            <div className="flex flex-col gap-2 pt-1">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="text-xs font-barlow uppercase tracking-wider px-3 py-1.5 border border-rust text-rust hover:bg-rust hover:text-white transition-colors rounded-full text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Follow-up prompt */}
          {showFollowUp && !followUpSent && (
            <div className="bg-rust/5 border border-rust/20 rounded-xl p-3">
              <p className="text-xs text-steel mb-2 font-barlow">
                Want us to follow up with you? Leave your number:
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={followUpPhone}
                  onChange={(e) => setFollowUpPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendFollowUp()}
                  placeholder="+254 700 000 000"
                  className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-rust text-steel placeholder-gray-400"
                />
                <button
                  onClick={sendFollowUp}
                  disabled={!followUpPhone.trim()}
                  className="text-xs bg-rust text-white px-3 py-1.5 rounded-lg hover:bg-rust-lt transition-colors disabled:opacity-40 font-barlow uppercase tracking-wider"
                >
                  Send
                </button>
              </div>
              <button onClick={() => setShowFollowUp(false)} className="text-xs text-gray-400 mt-1 hover:text-gray-600">
                No thanks
              </button>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            disabled={sending}
            placeholder={sending ? 'Thinking...' : 'Type a message...'}
            className="flex-1 text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-rust text-steel placeholder-gray-400 disabled:opacity-60 transition-colors"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || sending}
            className="w-9 h-9 bg-rust rounded-full flex items-center justify-center text-white hover:bg-rust-lt transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Floating trigger button ── */}
      <div className="fixed bottom-5 right-5 z-50 group">
        {!open && (
          <span className="absolute bottom-full right-0 mb-3 bg-steel text-white text-xs font-barlow uppercase tracking-wider px-3 py-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none">
            Chat with us
            <span className="absolute top-full right-4 border-4 border-transparent border-t-steel" />
          </span>
        )}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-rust opacity-40 animate-ping" />
        )}
        <button
          onClick={() => setOpen((p) => !p)}
          className="relative z-10 w-[60px] h-[60px] bg-rust rounded-full flex items-center justify-center text-white shadow-xl hover:bg-rust-lt transition-colors"
          aria-label={open ? 'Close chat' : 'Open live chat'}
        >
          <span className="transition-transform duration-200">
            {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </span>
        </button>
      </div>
    </>
  )
}
