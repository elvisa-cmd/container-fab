'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Project } from '@/types'

interface CardProps { project: Project; large?: boolean }

function ProjectCard({ project, large }: CardProps) {
  const [hovered, setHovered] = useState(false)
  const img = project.cover_image

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block relative overflow-hidden rounded-[4px] cursor-pointer"
      style={{ aspectRatio: large ? '3/4' : '4/3' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={project.title}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s ease',
            display: 'block',
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#1A1F2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '3rem' }}>📦</span>
        </div>
      )}

      {/* Gradient overlay — always visible */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(15,18,30,0.92) 0%, rgba(15,18,30,0.4) 40%, transparent 70%)',
      }} />

      {/* Text content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '1.5rem',
      }}>
        <p style={{
          color: '#C94C1A', fontSize: '0.7rem', letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
          fontWeight: 600, marginBottom: 4,
        }}>
          {project.category}
        </p>
        <h3 style={{
          color: '#fff',
          fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
          fontWeight: 700, fontSize: large ? '1.4rem' : '1.2rem',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          lineHeight: 1.2,
        }}>
          {project.title}
        </h3>
        {/* Hover extras */}
        <div style={{
          overflow: 'hidden',
          maxHeight: hovered ? 80 : 0,
          opacity: hovered ? 1 : 0,
          transition: 'max-height 0.35s ease, opacity 0.3s ease',
          marginTop: hovered ? 8 : 0,
        }}>
          {project.location && (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
              {project.location} · {project.year}
            </p>
          )}
          <p style={{
            color: '#C94C1A',
            fontFamily: "var(--font-barlow),'Barlow Condensed',sans-serif",
            fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginTop: 4,
          }}>
            View Project →
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function Projects({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order).slice(0, 6)

  return (
    <section id="projects" className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-0.5 bg-rust" />
              <span className="font-barlow font-600 text-xs tracking-[0.3em] text-rust uppercase">
                Our Work
              </span>
            </div>
            <h2
              className="font-barlow font-800 text-steel uppercase leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
            >
              Featured Projects
            </h2>
          </div>
          <a
            href="/#contact"
            className="font-barlow font-700 text-sm uppercase tracking-widest text-rust hover:underline shrink-0"
            style={{ letterSpacing: '0.1em' }}
          >
            Start Your Project →
          </a>
        </div>

        {/* Symmetric 3×2 grid */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* View all */}
        <div className="flex justify-center mt-12">
          <Link
            href="/projects"
            className="font-barlow font-700 text-sm uppercase tracking-widest transition-colors"
            style={{
              border: '2px solid #C94C1A',
              color: '#C94C1A',
              padding: '14px 40px',
              borderRadius: 2,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#C94C1A'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#C94C1A'
            }}
          >
            View All Projects →
          </Link>
        </div>
      </div>
    </section>
  )
}
