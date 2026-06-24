'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/types'

const CATEGORIES = ['All', 'Office', 'Accommodation', 'Commercial', 'Storage', 'Custom']

function ProjectCard({ project }: { project: Project }) {
  const [hov, setHov] = useState(false)
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block relative overflow-hidden rounded-[4px]"
      style={{ aspectRatio: '4/3', cursor: 'pointer' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {project.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover_image}
          alt={project.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hov ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s ease', display: 'block',
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#1A1F2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2.5rem', opacity: 0.2 }}>📦</span>
        </div>
      )}

      {/* Featured badge */}
      {project.featured && (
        <div style={{ position: 'absolute', top: 12, left: 12, background: '#C94C1A', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          ⭐ Featured
        </div>
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(15,18,30,0.92) 0%, rgba(15,18,30,0.3) 50%, transparent 70%)',
      }} />

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem' }}>
        <p style={{
          color: '#C94C1A', fontSize: '0.65rem', letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
          fontWeight: 600, marginBottom: 3,
        }}>
          {project.category}
        </p>
        <h3 style={{
          color: '#fff',
          fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
          fontWeight: 700, fontSize: '1.1rem',
          textTransform: 'uppercase', lineHeight: 1.2,
        }}>
          {project.title}
        </h3>
        <div style={{
          overflow: 'hidden', maxHeight: hov ? 60 : 0,
          opacity: hov ? 1 : 0, transition: 'max-height 0.3s ease, opacity 0.25s ease',
          marginTop: hov ? 6 : 0,
        }}>
          {project.location && (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>
              {project.location}{project.year ? ` · ${project.year}` : ''}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState('All')

  const filtered = active === 'All'
    ? projects
    : projects.filter((p) => p.category === active)

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="font-barlow font-700 text-xs uppercase tracking-widest px-4 py-2 transition-colors"
                style={{
                  background: active === cat ? '#C94C1A' : 'transparent',
                  color:      active === cat ? '#fff'    : '#6B7280',
                  border:     `1.5px solid ${active === cat ? '#C94C1A' : '#e5e7eb'}`,
                  borderRadius: 2,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Showing {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            No projects in this category yet.
          </div>
        )}

      </div>
    </section>
  )
}
