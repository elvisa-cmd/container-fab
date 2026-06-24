'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'
import ImageUploader from '@/components/admin/ImageUploader'
import { ArrowRight, GripVertical, X, Plus } from 'lucide-react'
import type { HeroContent } from '@/types'

export const dynamic = 'force-dynamic'

interface Slide { id: string; image_url: string }

const Spin = () => (
  <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

export default function HeroEditorPage() {
  const { addToast } = useToast()
  const [form, setForm]           = useState<Partial<HeroContent>>({})
  const [slides, setSlides]       = useState<Slide[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [savingSlides, setSavingSlides] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragIdx, setDragIdx]     = useState<number | null>(null)
  const [dropIdx, setDropIdx]     = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/content?section=hero')
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return
        setForm(data)
        // Normalise: support legacy string[] format
        const raw: unknown[] = data.slides ?? []
        setSlides(
          raw.map((s, i) =>
            typeof s === 'string'
              ? { id: String(i), image_url: s }
              : (s as Slide),
          ),
        )
      })
      .catch(() => addToast('Failed to load hero data', 'error'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setField = (key: keyof HeroContent) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }))

  // ── Shared save ───────────────────────────────────────────────────────────

  async function persist(toastMsg?: string): Promise<boolean> {
    const res = await fetch('/api/admin/save/hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slides, updated_at: new Date().toISOString() }),
    })
    const ok = res.ok
    if (toastMsg) {
      if (ok) addToast(toastMsg, 'success')
      else     addToast('Failed to save — check console', 'error')
    }
    return ok
  }

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await persist('Hero updated successfully')
    setSaving(false)
  }

  async function handleSaveSlides() {
    setSavingSlides(true)
    await persist('Slides saved!')
    setSavingSlides(false)
  }

  // ── Slide upload ──────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // allow re-selecting same file

    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        addToast((d as { error?: string }).error ?? 'Upload failed', 'error')
        return
      }
      const { url } = await res.json() as { url: string }
      setSlides((prev) => [...prev, { id: Date.now().toString(), image_url: url }])
      addToast('Slide added', 'success')
    } catch {
      addToast('Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  // ── Drag-and-drop reorder ─────────────────────────────────────────────────

  function onDragStart(e: React.DragEvent, i: number) {
    setDragIdx(i)
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (i !== dropIdx) setDropIdx(i)
  }
  function onDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) { clearDrag(); return }
    const next = [...slides]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(i, 0, moved)
    setSlides(next)
    clearDrag()
  }
  function clearDrag() { setDragIdx(null); setDropIdx(null) }

  function removeSlide(id: string) {
    if (slides.length <= 1) { addToast('Cannot delete the last slide', 'info'); return }
    setSlides((prev) => prev.filter((s) => s.id !== id))
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <h1 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest">Edit Hero</h1>

      {/* ── Text fields + preview ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Form — saves everything including slides */}
        <form onSubmit={handleSaveAll} className="space-y-5 bg-white border border-gray-100 p-6">
          {[
            { key: 'headline_line1' as const, label: 'Headline Line 1 (white)' },
            { key: 'headline_accent' as const, label: 'Accent Line (rust — middle)' },
            { key: 'headline_line2' as const, label: 'Headline Line 3 (white — bottom)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
              <input
                value={(form[key] as string) ?? ''}
                onChange={setField(key)}
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-rust transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">Subtext</label>
            <textarea
              value={form.subtext ?? ''}
              onChange={setField('subtext')}
              rows={3}
              className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-rust transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'stat_years' as const,    label: 'Years' },
              { key: 'stat_projects' as const, label: 'Projects' },
              { key: 'stat_warranty' as const, label: 'Warranty' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
                <input
                  value={(form[key] as string) ?? ''}
                  onChange={setField(key)}
                  className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-rust transition-colors"
                />
              </div>
            ))}
          </div>

          <ImageUploader
            label="Fallback image (shown if slides is empty)"
            currentUrl={form.image_url}
            onUpload={(url) => setForm((p) => ({ ...p, image_url: url }))}
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest py-3 hover:bg-rust-lt transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><Spin /> Saving…</> : 'Save Hero Section (includes slides)'}
          </button>
        </form>

        {/* Live preview */}
        <div className="bg-steel p-6 flex flex-col gap-4 sticky top-8 self-start">
          <div className="text-xs font-barlow uppercase tracking-widest text-gray-400 mb-2">Live Preview</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-rust" />
            <span className="text-rust text-xs font-barlow uppercase tracking-widest">Nairobi, Kenya</span>
          </div>
          <div>
            <div className="font-barlow font-800 text-3xl text-white uppercase">{form.headline_line1 || '…'}</div>
            <div className="font-barlow font-800 text-3xl text-rust  uppercase">{form.headline_accent || '…'}</div>
            <div className="font-barlow font-800 text-3xl text-white uppercase">{form.headline_line2 || '…'}</div>
          </div>
          <p className="text-gray-300 text-sm">{form.subtext}</p>
          <div className="flex gap-2">
            <div className="bg-rust text-white text-xs font-barlow uppercase px-4 py-2 flex items-center gap-1">
              View Services <ArrowRight className="w-3 h-3" />
            </div>
            <div className="border border-white/30 text-white text-xs font-barlow uppercase px-4 py-2">
              View Projects
            </div>
          </div>
          <div className="flex gap-6 border-t border-white/10 pt-4">
            {[
              { v: form.stat_years,    l: 'Years' },
              { v: form.stat_projects, l: 'Projects' },
              { v: form.stat_warranty, l: 'Warranty' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-barlow font-800 text-2xl text-rust">{s.v || '—'}</div>
                <div className="font-barlow text-xs uppercase tracking-widest text-gray-400">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero Slides ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-barlow font-700 text-xl text-steel uppercase tracking-widest">Hero Slides</h2>
            <p className="text-gray-400 text-xs mt-1">
              Drag to reorder · auto-advances every 5 s on the public site
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveSlides}
            disabled={savingSlides}
            className="flex items-center gap-2 border border-rust text-rust font-barlow font-700 text-xs uppercase tracking-widest px-4 py-2 hover:bg-rust hover:text-white transition-colors disabled:opacity-50"
          >
            {savingSlides ? <><Spin /> Saving…</> : 'Save Slides'}
          </button>
        </div>

        {/* Hidden file picker */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

          {/* Existing slides */}
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={(e) => onDrop(e, idx)}
              onDragEnd={clearDrag}
              className={[
                'relative aspect-video rounded overflow-hidden border-2 transition-all select-none',
                dragIdx === idx
                  ? 'opacity-50 scale-95 border-gray-300'
                  : dropIdx === idx
                    ? 'border-rust border-dashed'
                    : 'border-gray-200',
              ].join(' ')}
              style={{ cursor: 'grab' }}
            >
              <Image
                src={slide.image_url}
                alt={`Slide ${idx + 1}`}
                fill
                className="object-cover pointer-events-none"
                sizes="280px"
              />

              {/* Slide number */}
              <div className="absolute top-2 left-2 bg-steel/75 text-white text-xs font-barlow uppercase tracking-wider px-2 py-0.5 backdrop-blur-sm select-none">
                Slide {idx + 1}
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeSlide(slide.id)}
                disabled={slides.length <= 1}
                title={slides.length <= 1 ? 'Cannot delete the last slide' : 'Remove slide'}
                className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white flex items-center justify-center rounded-sm hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Drag handle hint */}
              <div className="absolute bottom-2 left-2 text-white/60 select-none pointer-events-none">
                <GripVertical className="w-4 h-4 drop-shadow" />
              </div>
            </div>
          ))}

          {/* Add Slide card */}
          <button
            type="button"
            onClick={() => !uploading && fileRef.current?.click()}
            disabled={uploading}
            className={[
              'aspect-video rounded border-2 border-dashed border-rust flex flex-col items-center justify-center gap-2',
              'hover:bg-rust/5 transition-colors',
              uploading ? 'opacity-60 cursor-not-allowed animate-pulse' : 'cursor-pointer',
            ].join(' ')}
          >
            {uploading ? (
              <>
                <Spin />
                <span className="text-xs font-barlow uppercase tracking-wider text-rust">Uploading…</span>
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-rust" />
                <span className="text-xs font-barlow uppercase tracking-wider text-rust">Add Image</span>
              </>
            )}
          </button>
        </div>

        {slides.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-6">
            No slides yet — click Add Image to upload the first one.
          </p>
        )}
      </div>
    </div>
  )
}
