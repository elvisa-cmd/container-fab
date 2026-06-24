'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/Toast'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  Plus, Trash2, Star, ChevronUp, ChevronDown,
  X, Edit2, Upload, GripVertical,
} from 'lucide-react'
import type { Project } from '@/types'

export const dynamic = 'force-dynamic'

const CATEGORIES  = ['Office', 'Accommodation', 'Commercial', 'Storage', 'Custom']
const STATUSES    = ['Completed', 'Ongoing', 'Planning']

function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim() || 'project'
}

const EMPTY: Partial<Project> = {
  title: '', slug: '', category: CATEGORIES[0],
  cover_image: '', gallery: [], description: '',
  location: '', year: new Date().getFullYear().toString(),
  client: '', status: 'Completed',
  featured: false, order: 0,
}

async function persistProjects(projects: Project[]): Promise<boolean> {
  const res = await fetch('/api/admin/save/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projects),
  })
  return res.ok
}

const inputCls =
  'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-rust bg-white'
const labelCls =
  'block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1'

export default function ProjectsEditorPage() {
  const { addToast } = useToast()
  const [projects,   setProjects]   = useState<Project[]>([])
  const [loading,    setLoading]    = useState(true)
  const [panel,      setPanel]      = useState<'add' | string | null>(null)
  const [editForm,   setEditForm]   = useState<Partial<Project>>(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const [uploadingCurrent, setUploadingCurrent] = useState(0)
  const [uploadingTotal,   setUploadingTotal]   = useState(0)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/content?section=projects')
      .then((r) => r.json())
      .then(({ data }) => { if (data) setProjects(data) })
      .catch(() => addToast('Failed to load projects', 'error'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openAdd()      { setEditForm({ ...EMPTY }); setPanel('add') }
  function openEdit(p: Project) { setEditForm({ ...p }); setPanel(p.id) }
  function closePanel()   { setPanel(null); setEditForm(EMPTY) }

  function setF<K extends keyof Project>(k: K, v: Project[K]) {
    setEditForm((f) => ({ ...f, [k]: v }))
  }

  function handleTitleChange(title: string) {
    const prevAuto = generateSlug(editForm.title ?? '')
    const auto = generateSlug(title)
    if (!editForm.slug || editForm.slug === prevAuto) {
      setEditForm((f) => ({ ...f, title, slug: auto }))
    } else {
      setF('title', title)
    }
  }

  // ── Gallery multi-upload ─────────────────────────────────────────────────
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    setUploadingTotal(files.length)

    for (let i = 0; i < files.length; i++) {
      setUploadingCurrent(i + 1)
      const fd = new FormData()
      fd.append('file', files[i])
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const { url } = await res.json() as { url: string }
          setEditForm((prev) => ({
            ...prev,
            gallery: [...(prev.gallery ?? []), url],
          }))
        }
      } catch { /* silent */ }
    }

    setUploadingTotal(0)
    setUploadingCurrent(0)
    addToast('Photos uploaded!', 'success')
  }

  function removeGalleryImg(idx: number) {
    setEditForm((prev) => ({
      ...prev,
      gallery: (prev.gallery ?? []).filter((_, i) => i !== idx),
    }))
  }

  // ── Save project ─────────────────────────────────────────────────────────
  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!editForm.title?.trim()) { addToast('Title is required', 'error'); return }
    setSubmitting(true)

    let updated: Project[]
    if (panel === 'add') {
      const maxOrd = projects.reduce((m, p) => Math.max(m, p.order), 0)
      const added: Project = {
        id:          crypto.randomUUID(),
        title:       editForm.title!.trim(),
        slug:        editForm.slug ?? generateSlug(editForm.title!),
        category:    editForm.category ?? CATEGORIES[0],
        cover_image: editForm.cover_image ?? '',
        gallery:     editForm.gallery ?? [],
        description: editForm.description ?? '',
        location:    editForm.location ?? '',
        year:        editForm.year ?? '',
        client:      editForm.client ?? '',
        status:      editForm.status ?? 'Completed',
        featured:    editForm.featured ?? false,
        order:       maxOrd + 1,
        created_at:  new Date().toISOString(),
      }
      updated = [...projects, added]
    } else {
      updated = projects.map((p) =>
        p.id === panel ? { ...p, ...editForm } as Project : p,
      )
    }

    const ok = await persistProjects(updated)
    setSubmitting(false)
    if (ok) {
      setProjects(updated)
      addToast(panel === 'add' ? 'Project added!' : 'Project updated!', 'success')
      closePanel()
    } else {
      addToast('Failed to save project', 'error')
    }
  }

  async function toggleFeatured(p: Project) {
    const updated = projects.map((x) => (x.id === p.id ? { ...x, featured: !x.featured } : x))
    setProjects(updated)
    await persistProjects(updated)
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return
    const updated = projects.filter((p) => p.id !== id)
    setProjects(updated)
    if (panel === id) closePanel()
    const ok = await persistProjects(updated)
    if (ok) addToast('Project deleted', 'info')
    else     addToast('Failed to delete', 'error')
  }

  async function move(idx: number, dir: -1 | 1) {
    const other = idx + dir
    if (other < 0 || other >= projects.length) return
    const updated = [...projects]
    const tmp = updated[idx].order
    updated[idx] = { ...updated[idx], order: updated[other].order }
    updated[other] = { ...updated[other], order: tmp }
    ;[updated[idx], updated[other]] = [updated[other], updated[idx]]
    setProjects(updated)
    await persistProjects(updated)
  }

  if (loading) {
    return (
      <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 w-full" />)}
      </div>
    )
  }

  const isEditing = panel !== null

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest">Projects</h1>
        <button
          onClick={isEditing ? closePanel : openAdd}
          className="flex items-center gap-2 bg-rust text-white font-barlow font-700 text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-rust-lt transition-colors"
        >
          {isEditing ? <><X className="w-4 h-4" /> Close</> : <><Plus className="w-4 h-4" /> Add Project</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Project grid */}
        <div className={`${isEditing ? 'lg:col-span-2' : 'lg:col-span-3'} grid sm:grid-cols-2 ${isEditing ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-4`}>
          {projects.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => openEdit(p)}
              className={`bg-white border overflow-hidden cursor-pointer transition-all ${panel === p.id ? 'border-rust' : 'border-gray-100 hover:border-gray-300'}`}
            >
              <div className="relative h-40">
                {p.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-sm">No image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-steel/70 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-white text-xs font-barlow uppercase tracking-wider">{p.category}</p>
                  <p className="text-white text-sm font-700 truncate">{p.title}</p>
                </div>
                {p.featured && <div className="absolute top-2 right-2 bg-rust p-1"><Star className="w-3 h-3 text-white fill-white" /></div>}
                {p.gallery?.length > 0 && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded font-barlow">
                    {p.gallery.length + 1} photos
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => move(idx, 1)} disabled={idx === projects.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={() => toggleFeatured(p)} className={`p-1.5 transition-colors ${p.featured ? 'text-rust' : 'text-gray-300 hover:text-gray-500'}`}>
                  <Star className={`w-4 h-4 ${p.featured ? 'fill-rust' : ''}`} />
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <div className="flex-1" />
                <button onClick={() => deleteProject(p.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400 text-sm">
              No projects yet. Click Add Project to create one.
            </div>
          )}
        </div>

        {/* Edit / Add panel */}
        {isEditing && (
          <div className="lg:col-span-1 bg-white border border-gray-100 self-start sticky top-8 overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-barlow font-700 text-sm uppercase tracking-widest text-steel">
                {panel === 'add' ? 'New Project' : 'Edit Project'}
              </h2>
            </div>

            <form onSubmit={submitForm} className="p-5 space-y-5">

              {/* CARD: Basic Info */}
              <div className="space-y-3">
                <p className="font-barlow font-700 text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Basic Info</p>
                <div>
                  <label className={labelCls}>Title *</label>
                  <input value={editForm.title ?? ''} onChange={(e) => handleTitleChange(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Slug</label>
                  <input value={editForm.slug ?? ''} onChange={(e) => setF('slug', e.target.value)} className={`${inputCls} font-mono text-xs`} />
                  <p className="text-xs text-gray-400 mt-0.5">/projects/<span className="text-rust">{editForm.slug || '…'}</span></p>
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select value={editForm.category ?? CATEGORIES[0]} onChange={(e) => setF('category', e.target.value)} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={editForm.description ?? ''} onChange={(e) => setF('description', e.target.value)} rows={3} className={`${inputCls} resize-none`} />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editForm.featured ?? false} onChange={(e) => setF('featured', e.target.checked)} className="accent-rust" />
                  Featured on homepage
                </label>
              </div>

              {/* CARD: Project Details */}
              <div className="space-y-3">
                <p className="font-barlow font-700 text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Project Details</p>
                <div>
                  <label className={labelCls}>Location</label>
                  <input value={editForm.location ?? ''} onChange={(e) => setF('location', e.target.value)} placeholder="e.g. Nairobi, Kenya" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Year</label>
                    <input value={editForm.year ?? ''} onChange={(e) => setF('year', e.target.value)} placeholder="2024" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={editForm.status ?? 'Completed'} onChange={(e) => setF('status', e.target.value)} className={inputCls}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Client</label>
                  <input value={editForm.client ?? ''} onChange={(e) => setF('client', e.target.value)} placeholder="e.g. Private Client" className={inputCls} />
                </div>
              </div>

              {/* CARD: Cover Image */}
              <div className="space-y-2">
                <p className="font-barlow font-700 text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Cover Image</p>
                <p className="text-xs text-gray-400">Main image shown in project grid</p>
                <ImageUploader
                  label=""
                  currentUrl={editForm.cover_image}
                  onUpload={(url) => setF('cover_image', url)}
                />
              </div>

              {/* CARD: Gallery */}
              <div className="space-y-3">
                <p className="font-barlow font-700 text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Gallery Photos</p>
                <p className="text-xs text-gray-400">Additional photos shown on the project detail page</p>

                {/* Existing gallery thumbnails */}
                {(editForm.gallery ?? []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {(editForm.gallery ?? []).map((url, gi) => (
                      <div key={gi} className="relative group" style={{ height: 70 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                        <button
                          type="button"
                          onClick={() => removeGalleryImg(gi)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 text-white flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryUpload}
                />

                {uploadingTotal > 0 ? (
                  <div>
                    <p className="text-rust text-xs font-barlow uppercase tracking-wider mb-1.5">
                      Uploading photo {uploadingCurrent} of {uploadingTotal}…
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rust transition-all duration-300"
                        style={{ width: `${(uploadingCurrent / uploadingTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-rust/40 text-rust text-xs font-barlow uppercase tracking-wider py-3 hover:border-rust hover:bg-rust/5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Add Photos
                  </button>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-rust text-white font-barlow font-700 text-xs uppercase tracking-widest py-2.5 hover:bg-rust-lt transition-colors disabled:opacity-50">
                  {submitting ? 'Saving…' : panel === 'add' ? 'Add Project' : 'Save Changes'}
                </button>
                <button type="button" onClick={closePanel}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs font-barlow uppercase tracking-widest hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
