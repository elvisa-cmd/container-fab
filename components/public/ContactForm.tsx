'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Phone, Mail, CheckCircle, MessageCircle } from 'lucide-react'

const SERVICE_OPTIONS = [
  'Used Shipping Containers',
  'Accommodation Units',
  'Office Units',
  'Commercial Spaces',
  'Storage Solutions',
  'Custom Design',
]

export default function ContactForm() {
  const ref = useRef<HTMLElement>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', message: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    els?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function validate() {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    setServerError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to send message')
      }
      setSuccess(true)
      setForm({ name: '', phone: '', email: '', service: '', message: '' })
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  })

  return (
    <section id="contact" ref={ref} className="bg-steel py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left — contact info */}
          <div>
            <div className="reveal flex items-center gap-3 mb-6">
              <div className="w-8 h-0.5 bg-rust" />
              <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">
                Get In Touch
              </span>
            </div>
            <h2 className="reveal font-barlow font-800 text-4xl lg:text-5xl text-white uppercase leading-tight mb-8">
              GET IN<br />
              <span className="text-rust">TOUCH</span>
            </h2>
            <p className="reveal text-gray-300 leading-relaxed mb-12 max-w-md">
              Ready to transform your space? Send us a message and we&apos;ll get back to you within 24 hours with a free consultation.
            </p>

            <div className="space-y-6">
              {[
                { Icon: MapPin, label: 'Address',         content: <span>National Park East Gate Rd, Nairobi, Kenya</span> },
                { Icon: Phone, label: 'Phone / WhatsApp', content: <span>+254 715 296324 / +254 713 971 394</span> },
                { Icon: Mail,  label: 'Email',            content: (
                  <a
                    href="mailto:info@containerfabricators.co.ke"
                    className="text-white hover:text-rust transition-colors"
                  >
                    info@containerfabricators.co.ke
                  </a>
                )},
              ].map(({ Icon, label, content }, i) => (
                <div key={label} className={`reveal reveal-delay-${i + 1} flex gap-4 items-start`}>
                  <div className="w-10 h-10 bg-rust/20 border border-rust/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-rust" />
                  </div>
                  <div>
                    <div className="font-barlow font-600 text-xs uppercase tracking-widest text-gray-400 mb-1">
                      {label}
                    </div>
                    <div className="text-white text-sm">{content}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp direct button */}
            <a
              href="https://api.whatsapp.com/send?phone=254715296324"
              target="_blank"
              rel="noopener noreferrer"
              className="reveal reveal-delay-3 mt-10 inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-barlow font-700 text-sm uppercase tracking-widest px-6 py-3.5 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Right — form */}
          <div className="reveal">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-16">
                <CheckCircle className="w-16 h-16 text-green-400" />
                <h3 className="font-barlow font-800 text-2xl text-white uppercase">Message Sent!</h3>
                <p className="text-gray-300 max-w-xs">
                  Thank you for reaching out. We&apos;ll be in touch within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="font-barlow font-700 text-sm uppercase tracking-widest text-rust border border-rust px-5 py-2 hover:bg-rust hover:text-white transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-barlow uppercase tracking-widest text-gray-400 mb-2">
                      Full Name *
                    </label>
                    <input
                      {...field('name')}
                      placeholder="John Kamau"
                      className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-rust transition-colors`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-barlow uppercase tracking-widest text-gray-400 mb-2">
                      Phone / WhatsApp
                    </label>
                    <input
                      {...field('phone')}
                      placeholder="+254 700 000 000"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-rust transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-barlow uppercase tracking-widest text-gray-400 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...field('email')}
                    type="email"
                    placeholder="john@example.com"
                    className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-rust transition-colors`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-barlow uppercase tracking-widest text-gray-400 mb-2">
                    Service Interested In
                  </label>
                  <select
                    {...field('service')}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-rust transition-colors appearance-none"
                    style={{ backgroundColor: '#1A1F2E' }}
                  >
                    <option value="" style={{ backgroundColor: '#1A1F2E' }}>Select a service...</option>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s} style={{ backgroundColor: '#1A1F2E' }}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-barlow uppercase tracking-widest text-gray-400 mb-2">
                    Message *
                  </label>
                  <textarea
                    {...field('message')}
                    rows={5}
                    placeholder="Tell us about your project — site location, size, timeline, budget..."
                    className={`w-full bg-white/5 border ${errors.message ? 'border-red-500' : 'border-white/10'} px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-rust transition-colors resize-none`}
                  />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>

                {serverError && (
                  <div className="bg-red-900/30 border border-red-700 px-4 py-3 text-red-300 text-sm">
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest py-4 hover:bg-rust-lt transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
