import { notFound } from 'next/navigation'
import { readProjectBySlug, getProjects } from '@/lib/data'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import ProjectDetail from '@/components/public/ProjectDetail'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await readProjectBySlug(slug)
  if (!project) return { title: 'Project Not Found' }
  return {
    title: { absolute: `${project.title} | Container Fabricators Kenya` },
    description: project.description || `${project.category} project by Container Fabricators Kenya in ${project.location}.`,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.cover_image ? [{ url: project.cover_image }] : [],
    },
    alternates: {
      canonical: `https://containerfabricators.co.ke/projects/${project.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const projects = await getProjects()
  const seen = new Set<string>()
  return projects
    .filter((p) => p.slug && !seen.has(p.slug) && (seen.add(p.slug), true))
    .map((p) => ({ slug: p.slug }))
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const [project, all] = await Promise.all([
    readProjectBySlug(slug),
    getProjects(),
  ])

  if (!project) notFound()

  const related = all
    .filter((p) => p.slug !== slug)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)

  return (
    <>
      <Navbar />
      <main>
        <ProjectDetail project={project} related={related} />
      </main>
      <Footer />
    </>
  )
}
