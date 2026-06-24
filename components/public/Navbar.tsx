'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Lock } from 'lucide-react'
import Logo from './Logo'

const navLinks = [
  { label: 'About',    href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact',  href: '#contact' },
]

export default function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [open,     setOpen]     = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-steel shadow-[0_2px_20px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <nav aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" aria-label="Container Fabricators Kenya â€” home" className="flex items-center shrink-0">
            <Logo variant="navbar" className="h-10 w-auto" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-barlow font-600 text-sm uppercase tracking-widest text-gray-300 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              className="font-barlow font-700 text-sm uppercase tracking-widest bg-rust text-white px-5 py-2 hover:bg-rust-lt transition-colors"
            >
              Get a Quote
            </a>

            {/* Discreet admin access â€” desktop only */}
            <button
              onClick={() => router.push('/admin')}
              title="Admin Panel"
              aria-label="Admin Panel"
              className="hidden md:flex w-9 h-9 items-center justify-center border border-white/20 text-white/30 hover:text-white/60 hover:border-white/40 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden bg-steel border-t border-white/10 px-6 pb-6 flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-barlow font-600 text-sm uppercase tracking-widest text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="font-barlow font-700 text-sm uppercase tracking-widest bg-rust text-white px-5 py-3 text-center hover:bg-rust-lt transition-colors mt-2"
            >
              Get a Quote
            </a>
          </div>
        )}
      </nav>
    </header>
  )
}

