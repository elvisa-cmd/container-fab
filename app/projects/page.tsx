export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import Link from 'next/link'
import { getProjects } from '@/lib/data'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import ProjectsGrid from '@/components/public/ProjectsGrid'

export const metadata: Metadata = {
  title: 'All Projects | Container Fabricators Kenya',
  description:
    'Browse all container fabrication projects by Classic Container Fabricators Kenya — offices, homes, commercial spaces and more.',
  alternates: { canonical: 'https://containerfabricators.co.ke/projects' },
}

export default async function ProjectsPage() {
  const all = await getProjects()
  const projects = all.sort((a, b) => a.order - b.order)

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-steel pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <nav className="flex items-center gap-2 text-white/40 text-sm font-barlow mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white/70">Projects</span>
            </nav>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-rust" />
              <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">Portfolio</span>
            </div>
            <h1 className="font-barlow font-800 text-5xl lg:text-7xl text-white uppercase leading-none mb-4">
              Our Projects
            </h1>
            <p className="text-white/60 text-lg max-w-xl">
              Every project tells a story. Browse our portfolio of container offices, homes, shops and more across Kenya.
            </p>
          </div>
        </section>

        {/* Grid with client-side filter */}
        <ProjectsGrid projects={projects} />

      </main>
      <Footer />
    </>
  )
}
