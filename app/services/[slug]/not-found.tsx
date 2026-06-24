import Link from 'next/link'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'

export default function ServiceNotFound() {
  return (
    <>
      <Navbar />
      <main
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
        style={{ background: '#F0EDE8' }}
      >
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="font-barlow font-800 text-4xl text-steel uppercase tracking-widest mb-4">
          Service Not Found
        </h1>
        <p className="text-gray-500 max-w-md mb-10 leading-relaxed">
          We couldn&apos;t find that service. It may have been moved or the URL
          might be incorrect.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-8 py-4 hover:bg-rust-lt transition-colors"
          >
            View All Services
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-steel text-steel font-barlow font-700 text-sm uppercase tracking-widest px-8 py-4 hover:bg-steel hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
