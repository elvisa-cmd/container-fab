import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { generateBreadcrumbSchema } from '@/lib/structured-data'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** Light variant for use on white backgrounds */
  light?: boolean
}

export default function Breadcrumb({ items, light = false }: BreadcrumbProps) {
  const textBase   = light ? 'text-gray-400'   : 'text-white/50'
  const textHover  = light ? 'hover:text-steel' : 'hover:text-white'
  const textActive = light ? 'text-steel'       : 'text-white/80'
  const iconColor  = light ? 'text-gray-300'    : 'text-white/30'

  return (
    <>
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema(items)) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-barlow">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${iconColor}`} aria-hidden="true" />
              )}
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className={`${textBase} ${textHover} transition-colors`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? textActive : textBase}>{item.label}</span>
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}
