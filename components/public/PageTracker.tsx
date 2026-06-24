'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const referrer = document.referrer || ''
    const userAgent = navigator.userAgent || ''

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: pathname, referrer, userAgent }),
    }).catch(() => {})
  }, [pathname])

  return null
}
