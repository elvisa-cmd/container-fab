'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface Msg {
  id: string
  from: 'bot' | 'user'
  text: string
  time: Date
}

export default function ChatBubble() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: 'w1',
      from: 'bot',
      text: '👋 Hi there! Welcome to Container Fabricators Kenya. How can we help you today?',
      time: new Date(),
    },
    {
      id: 'w2',
      from: 'bot',
      text: 'You can ask us about pricing, container types, or request a quote!',
      time: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [userMsgd, setUserMsgd] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

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

    setMsgs(p => [...p, { id: `u${Date.now()}`, from: 'user', text: t, time: new Date() }])
    setInput('')
    setSending(true)
    setUserMsgd(true)

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Chat Visitor',
          email: 'chat@visitor.com',
          phone: '',
          service: 'Chat',
          message: t,
        }),
      })
    } catch {
      // Silently ignore — chat reply still works
    }

    setSending(false)
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      setMsgs(p => [
        ...p,
        {
          id: `b${Date.now()}`,
          from: 'bot',
          text: 'Thanks for your message! Our team will get back to you shortly. For urgent enquiries call +254 715 296324 or WhatsApp us.',
          time: new Date(),
        },
      ])
    }, 1500)
  }

  function quickReply(type: 'quote' | 'services' | 'call') {
    if (type === 'quote') {
      send("I'd like to get a quote")
    } else if (type === 'services') {
      setOpen(false)
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = 'tel:+254715296324'
    }
  }

  return (
    <>
      {/* ── Chat window ── */}
      <div
        className={[
          'fixed z-50 bg-white shadow-2xl overflow-hidden flex flex-col',
          // Mobile: full-width sheet anchored to bottom
          'left-0 right-0 bottom-0 rounded-t-2xl',
          // Desktop: floating panel above button
          'sm:left-auto sm:right-5 sm:bottom-[88px] sm:w-[360px] sm:rounded-2xl',
          // Animation
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
                Chat with us
              </span>
              <span className="w-2 h-2 bg-green-400 rounded-full shrink-0" />
            </div>
            <p className="text-gray-400 text-xs">We typically reply in minutes</p>
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
              <div
                className={`flex flex-col gap-1 max-w-[82%] ${
                  m.from === 'user' ? 'items-end' : 'items-start'
                }`}
              >
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
                <span suppressHydrationWarning className="text-xs text-gray-400">
                  {fmt(m.time)}
                </span>
              </div>
            </div>
          ))}

          {/* Quick reply chips — visible until first user message */}
          {!userMsgd && (
            <div className="flex flex-wrap gap-2 pt-1">
              {(
                [
                  { label: 'Get a Quote',   type: 'quote'    },
                  { label: 'View Services', type: 'services' },
                  { label: 'Call Us Now',   type: 'call'     },
                ] as { label: string; type: 'quote' | 'services' | 'call' }[]
              ).map(({ label, type }) => (
                <button
                  key={label}
                  onClick={() => quickReply(type)}
                  className="text-xs font-barlow uppercase tracking-wider px-3 py-1.5 border border-rust text-rust hover:bg-rust hover:text-white transition-colors rounded-full"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
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
            placeholder={sending ? 'Sending...' : 'Type a message...'}
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
        {/* Tooltip */}
        {!open && (
          <span className="absolute bottom-full right-0 mb-3 bg-steel text-white text-xs font-barlow uppercase tracking-wider px-3 py-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none">
            Chat with us
            {/* Tooltip arrow */}
            <span className="absolute top-full right-4 border-4 border-transparent border-t-steel" />
          </span>
        )}

        {/* Pulse ring — only when closed */}
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
