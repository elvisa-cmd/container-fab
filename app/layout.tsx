import type { Metadata } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import './globals.css'
import PageTracker from '@/components/public/PageTracker'
import ChatBubble from '@/components/public/ChatBubble'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://containerfabricators.co.ke'),
  title: {
    default: 'Container Fabricators Kenya | Shipping Container Solutions Nairobi',
    template: '%s | Container Fabricators Kenya',
  },
  description:
    'Classic Container Fabricators Kenya — We transform shipping containers into offices, homes, commercial spaces and storage solutions. Based in Nairobi, serving all of Kenya. Call +254 715 296324.',
  keywords: [
    'container fabricators kenya',
    'shipping containers nairobi',
    'container homes kenya',
    'container offices nairobi',
    'modified containers kenya',
    'container fabrication nairobi',
    'buy shipping containers kenya',
    'container houses kenya',
    'container shops nairobi',
    'reefer containers kenya',
    'daikin reefer kenya',
    'carrier reefer kenya',
    'container modification kenya',
    'affordable container homes nairobi',
    'container office units kenya',
  ],
  authors: [{ name: 'Classic Container Fabricators Kenya' }],
  creator: 'Classic Container Fabricators Kenya',
  publisher: 'Classic Container Fabricators Kenya',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://containerfabricators.co.ke',
    siteName: 'Container Fabricators Kenya',
    title: 'Container Fabricators Kenya | Shipping Container Solutions',
    description:
      'We transform shipping containers into bespoke offices, homes, storage units, and commercial spaces. Based in Nairobi, Kenya.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Container Fabricators Kenya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Container Fabricators Kenya',
    description:
      'Shipping container offices, homes and commercial spaces in Nairobi Kenya.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'QEqFMy3_2FszUD',
  },
  alternates: {
    canonical: 'https://containerfabricators.co.ke',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body>
        <PageTracker />
        {children}
        <ChatBubble />
      </body>
    </html>
  )
}
