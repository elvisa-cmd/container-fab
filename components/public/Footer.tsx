import Link from 'next/link'
import { Facebook, Instagram } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: '#111620' }} className="py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Logo variant="full" className="h-16 w-auto opacity-90" />
          </Link>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['About', 'Services', 'Projects', 'Contact'].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  className="font-barlow font-600 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              { Icon: Facebook, label: 'Facebook', href: '#' },
              {
                Icon: () => (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M11.992 0C5.374 0 0 5.373 0 11.992c0 2.117.556 4.1 1.527 5.823L.055 23.454l5.783-1.517A11.943 11.943 0 0011.992 24c6.619 0 11.992-5.374 11.992-11.992C23.984 5.374 18.611 0 11.992 0z" />
                  </svg>
                ),
                label: 'WhatsApp',
                href: 'https://wa.me/254700000000',
              },
              { Icon: Instagram, label: 'Instagram', href: '#' },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 border border-gray-700 flex items-center justify-center text-gray-400 hover:border-rust hover:text-rust transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © {year} Classic Container Fabricators Kenya. All rights reserved.
            {' '}·{' '}
            <Link
              href="/admin"
              className="text-white/20 hover:text-white/50 transition-colors"
            >
              Admin
            </Link>
          </p>
          <p className="text-gray-600 text-xs">
            National Park East Gate Rd, Nairobi, Kenya · +254 715 296324 ·{' '}
            <a
              href="mailto:info@containerfabricators.co.ke"
              className="hover:text-gray-400 transition-colors"
            >
              info@containerfabricators.co.ke
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
