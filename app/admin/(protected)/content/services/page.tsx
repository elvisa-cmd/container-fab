'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'
import {
  Plus, Trash2, Save, Settings2, Upload, X,
  GripVertical, RefreshCw, Check,
} from 'lucide-react'
import type { Service } from '@/types'

export const dynamic = 'force-dynamic'

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim() || 'new-service'
}

async function persistServices(services: Service[]): Promise<boolean> {
  const res = await fetch('/api/admin/save/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(services),
  })
  return res.ok
}

function newServiceTemplate(count: number): Service {
  return {
    id:               Date.now().toString(),
    number:           String(count + 1).padStart(2, '0'),
    icon:             '📦',
    title:            'New Service',
    slug:             'new-service',
    description:      '',
    full_description: '',
    features:         [''],
    process:          '',
    starting_price:   '',
    delivery_time:    '',
    cover_image:      '',
    gallery:          [],
    active:           false,
    order:            count + 1,
    updated_at:       new Date().toISOString(),
  }
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-rust transition-colors bg-white'
const textareaCls = `${inputCls} resize-y`

function CardSection({ title, helper, children }: {
  title: string; helper?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
      <h3 className="font-barlow font-700 text-steel uppercase tracking-widest text-sm border-b-2 border-rust pb-2 mb-4">
        {title}
      </h3>
      {helper && <p className="text-xs text-gray-400 mb-4">{helper}</p>}
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">
      {children}
    </label>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ServicesEditorPage() {
  const { addToast } = useToast()

  const [services,        setServices]        = useState<Service[]>([])
  const [selectedId,      setSelectedId]      = useState<string | null>(null)
  const [form,            setForm]            = useState<Service | null>(null)
  const [loading,         setLoading]         = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [savingOrder,     setSavingOrder]     = useState(false)
  const [hasOrderChange,  setHasOrderChange]  = useState(false)
  const [uploadingCover,  setUploadingCover]  = useState(false)
  const [uploadingGal,    setUploadingGal]    = useState(false)
  const [uploadProgress,  setUploadProgress]  = useState('')
  const [deleteConfirm,   setDeleteConfirm]   = useState(false)

  // Drag — service list
  const [dragSvcIdx, setDragSvcIdx] = useState<number | null>(null)
  const [dropSvcIdx, setDropSvcIdx] = useState<number | null>(null)

  // Drag — features
  const [dragFeatIdx, setDragFeatIdx] = useState<number | null>(null)
  const [dropFeatIdx, setDropFeatIdx] = useState<number | null>(null)

  const coverInputRef   = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const deleteTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/content?section=services')
      .then((r) => r.json())
      .then(({ data }) => { if (Array.isArray(data)) setServices(data) })
      .catch(() => addToast('Failed to load services', 'error'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Select & form sync ────────────────────────────────────────────────────
  function selectService(id: string) {
    const svc = services.find((s) => s.id === id)
    if (svc) { setSelectedId(id); setForm({ ...svc }); setDeleteConfirm(false) }
  }

  const updateForm = useCallback((patch: Partial<Service>) => {
    setForm((prev) => prev ? { ...prev, ...patch } : prev)
  }, [])

  function handleTitleChange(title: string) {
    if (!form) return
    const prevAuto = generateSlug(form.title)
    const auto = generateSlug(title)
    if (!form.slug || form.slug === prevAuto) {
      updateForm({ title, slug: auto })
    } else {
      updateForm({ title })
    }
  }

  // ── Add new service ───────────────────────────────────────────────────────
  function addNewService() {
    const svc = newServiceTemplate(services.length)
    const updated = [...services, svc]
    setServices(updated)
    setSelectedId(svc.id)
    setForm({ ...svc })
    setDeleteConfirm(false)
    setHasOrderChange(false)
  }

  // ── Save service ──────────────────────────────────────────────────────────
  async function saveService() {
    if (!form) return
    if (!form.title.trim()) { addToast('Title is required', 'error'); return }
    if (!form.slug.trim())  { addToast('Slug is required',  'error'); return }

    setSaving(true)
    const stamped = { ...form, updated_at: new Date().toISOString() }
    const updated = services.map((s) => s.id === form.id ? stamped : s)
    const ok = await persistServices(updated)
    setSaving(false)

    if (ok) {
      setServices(updated)
      setForm(stamped)
      addToast(`${form.title} saved successfully`, 'success')
    } else {
      addToast('Failed to save', 'error')
    }
  }

  // ── Delete service ────────────────────────────────────────────────────────
  function startDelete() {
    setDeleteConfirm(true)
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    deleteTimerRef.current = setTimeout(() => setDeleteConfirm(false), 5000)
  }

  async function confirmDelete() {
    if (!form) return
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    const updated = services.filter((s) => s.id !== form.id)
    const ok = await persistServices(updated)
    if (ok) {
      setServices(updated)
      setSelectedId(null)
      setForm(null)
      setDeleteConfirm(false)
      addToast('Service deleted', 'info')
    } else {
      addToast('Failed to delete', 'error')
    }
  }

  // ── Features ──────────────────────────────────────────────────────────────
  function addFeature() {
    if (!form) return
    updateForm({ features: [...(form.features ?? []), ''] })
  }
  function setFeature(idx: number, val: string) {
    if (!form) return
    const f = [...(form.features ?? [])]
    f[idx] = val
    updateForm({ features: f })
  }
  function removeFeature(idx: number) {
    if (!form) return
    updateForm({ features: (form.features ?? []).filter((_, i) => i !== idx) })
  }

  // ── Feature drag ──────────────────────────────────────────────────────────
  function onFeatDragStart(i: number) { setDragFeatIdx(i) }
  function onFeatDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (i !== dropFeatIdx) setDropFeatIdx(i)
  }
  function onFeatDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (!form || dragFeatIdx === null || dragFeatIdx === i) { setDragFeatIdx(null); setDropFeatIdx(null); return }
    const f = [...(form.features ?? [])]
    const [moved] = f.splice(dragFeatIdx, 1)
    f.splice(i, 0, moved)
    updateForm({ features: f })
    setDragFeatIdx(null); setDropFeatIdx(null)
  }

  // ── Service drag (reorder list) ───────────────────────────────────────────
  function onSvcDragStart(i: number) { setDragSvcIdx(i) }
  function onSvcDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (i !== dropSvcIdx) setDropSvcIdx(i)
  }
  function onSvcDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragSvcIdx === null || dragSvcIdx === i) { setDragSvcIdx(null); setDropSvcIdx(null); return }
    const next = [...services]
    const [moved] = next.splice(dragSvcIdx, 1)
    next.splice(i, 0, moved)
    setServices(next.map((s, idx) => ({ ...s, order: idx + 1 })))
    setHasOrderChange(true)
    setDragSvcIdx(null); setDropSvcIdx(null)
  }

  async function saveOrder() {
    setSavingOrder(true)
    const ok = await persistServices(services)
    setSavingOrder(false)
    if (ok) { setHasOrderChange(false); addToast('Order saved', 'success') }
    else      addToast('Failed to save order', 'error')
  }

  // ── Cover upload ──────────────────────────────────────────────────────────
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !form) return
    e.target.value = ''
    setUploadingCover(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json() as { url: string }
        updateForm({ cover_image: url })
        addToast('Cover image uploaded', 'success')
      } else addToast('Upload failed', 'error')
    } catch { addToast('Upload failed', 'error') }
    finally   { setUploadingCover(false) }
  }

  // ── Gallery multi-upload ──────────────────────────────────────────────────
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!form) return
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    setUploadingGal(true)

    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${files.length}…`)
      const fd = new FormData()
      fd.append('file', files[i])
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const { url } = await res.json() as { url: string }
          setForm((prev) => prev ? { ...prev, gallery: [...(prev.gallery ?? []), url] } : prev)
        }
      } catch { /* silent — continue batch */ }
    }
    setUploadingGal(false)
    setUploadProgress('')
  }

  function removeGalleryImg(idx: number) {
    if (!form) return
    updateForm({ gallery: (form.gallery ?? []).filter((_, i) => i !== idx) })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full">
        <div style={{ width: 380 }} className="border-r border-gray-200 bg-white p-4 space-y-2 shrink-0">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
        <div className="flex-1 p-8 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 w-full rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT PANEL ────────────────────────────────────────────────────── */}
      <div
        style={{ width: 380 }}
        className="flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden"
      >
        {/* Left header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h1 className="font-barlow font-800 text-xl text-steel uppercase tracking-widest">Services</h1>
          <button
            onClick={addNewService}
            className="flex items-center gap-1.5 bg-rust text-white font-barlow font-700 text-xs uppercase tracking-widest px-3 py-2 hover:bg-rust-lt transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {/* Service list */}
        <div className="flex-1 overflow-y-auto">
          {services.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-12 px-4">
              No services yet. Click Add to create one.
            </p>
          )}
          {services.map((s, idx) => {
            const isSelected = s.id === selectedId
            return (
              <div
                key={s.id}
                draggable
                onDragStart={() => onSvcDragStart(idx)}
                onDragOver={(e) => onSvcDragOver(e, idx)}
                onDrop={(e) => onSvcDrop(e, idx)}
                onDragEnd={() => { setDragSvcIdx(null); setDropSvcIdx(null) }}
                onClick={() => selectService(s.id)}
                className={[
                  'flex items-center gap-3 px-4 cursor-pointer select-none transition-colors border-b border-gray-100',
                  isSelected
                    ? 'border-l-[3px] border-l-rust'
                    : 'border-l-[3px] border-l-transparent hover:bg-gray-50',
                  dragSvcIdx === idx              ? 'opacity-50'  : '',
                  dropSvcIdx === idx && dragSvcIdx !== idx ? 'border-t-2 border-t-rust' : '',
                ].join(' ')}
                style={{
                  height: 64,
                  background: isSelected ? '#fff5f3' : undefined,
                }}
              >
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab" />
                <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded flex items-center justify-center text-xl shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-barlow font-700 text-sm uppercase tracking-widest truncate ${isSelected ? 'text-rust' : 'text-steel'}`}>
                    {s.title}
                  </p>
                  <span
                    className={`inline-block text-xs font-barlow uppercase tracking-wider px-1.5 py-0.5 rounded-sm mt-0.5 ${
                      s.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Save order button */}
        {hasOrderChange && (
          <div className="shrink-0 border-t border-gray-100 p-3">
            <button
              onClick={saveOrder}
              disabled={savingOrder}
              className="w-full flex items-center justify-center gap-2 border border-rust text-rust font-barlow font-700 text-xs uppercase tracking-widest py-2.5 hover:bg-rust hover:text-white transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingOrder ? 'Saving…' : 'Save Order'}
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {!form ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-gray-300 p-8">
            <Settings2 className="w-16 h-16" />
            <h2 className="font-barlow font-700 text-xl text-gray-400 uppercase tracking-widest">
              Select a service to edit
            </h2>
            <p className="text-gray-400 text-sm max-w-xs">
              Choose a service from the list, or create a new one.
            </p>
            <button
              onClick={addNewService}
              className="flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-6 py-3 hover:bg-rust-lt transition-colors mt-2"
            >
              <Plus className="w-4 h-4" /> Add New Service
            </button>
          </div>
        ) : (
          <div className="p-6 max-w-3xl mx-auto">

            {/* Form top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{form.icon}</span>
                <div>
                  <h2 className="font-barlow font-800 text-xl text-steel uppercase tracking-widest">
                    {form.title}
                  </h2>
                  <span className="text-xs text-gray-400 font-barlow uppercase tracking-wider">Editing</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Delete */}
                {!deleteConfirm ? (
                  <button
                    onClick={startDelete}
                    className="flex items-center gap-1.5 border border-red-300 text-red-500 font-barlow font-700 text-xs uppercase tracking-widest px-3 py-2 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={confirmDelete}
                      className="flex items-center gap-1 bg-red-600 text-white font-barlow font-700 text-xs uppercase tracking-widest px-3 py-2 hover:bg-red-700 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm Delete?
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Save */}
                <button
                  onClick={saveService}
                  disabled={saving}
                  className="flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-5 py-2 hover:bg-rust-lt transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* ── CARD 1 — Basic Info ──────────────────────────────────────── */}
            <CardSection title="Basic Information">
              {/* Icon */}
              <div className="mb-5 text-center">
                <div className="text-6xl mb-2">{form.icon || '📦'}</div>
                <input
                  value={form.icon}
                  onChange={(e) => updateForm({ icon: e.target.value })}
                  className={`${inputCls} text-center text-2xl`}
                  placeholder="Emoji icon"
                />
                <p className="text-xs text-gray-400 mt-1">Paste or type an emoji</p>
              </div>

              {/* Title */}
              <div className="mb-4">
                <FieldLabel>Title *</FieldLabel>
                <input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Office Units"
                />
              </div>

              {/* Slug */}
              <div className="mb-4">
                <FieldLabel>URL Slug *</FieldLabel>
                <div className="flex gap-2">
                  <input
                    value={form.slug}
                    onChange={(e) => updateForm({ slug: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => updateForm({ slug: generateSlug(form.title) })}
                    title="Regenerate from title"
                    className="px-3 border border-gray-200 rounded-md text-gray-400 hover:text-rust hover:border-rust transition-colors shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Public URL:{' '}
                  <span className="text-rust font-mono">/services/{form.slug || '…'}</span>
                </p>
              </div>

              {/* Short description */}
              <div className="mb-4">
                <FieldLabel>Short Description</FieldLabel>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  rows={2}
                  maxLength={160}
                  className={textareaCls}
                  placeholder="Shown on homepage service card"
                />
                <p className={`text-xs text-right mt-1 ${form.description.length > 140 ? 'text-rust' : 'text-gray-400'}`}>
                  {form.description.length} / 160
                </p>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateForm({ active: !form.active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? 'bg-rust' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-700">Show on homepage</span>
              </div>
            </CardSection>

            {/* ── CARD 2 — Full Content ────────────────────────────────────── */}
            <CardSection title="Service Detail Page Content">
              <div className="mb-4">
                <FieldLabel>Full Description</FieldLabel>
                <textarea
                  value={form.full_description}
                  onChange={(e) => updateForm({ full_description: e.target.value })}
                  rows={5}
                  className={textareaCls}
                  placeholder="Detailed description shown on the service page"
                />
              </div>
              <div>
                <FieldLabel>Process / How It Works</FieldLabel>
                <textarea
                  value={form.process}
                  onChange={(e) => updateForm({ process: e.target.value })}
                  rows={3}
                  className={textareaCls}
                  placeholder="Explain your step-by-step process for this service"
                />
              </div>
            </CardSection>

            {/* ── CARD 3 — Key Features ────────────────────────────────────── */}
            <CardSection
              title="Key Features"
              helper="Displayed as bullet points on the service page"
            >
              <div className="space-y-2 mb-3">
                {(form.features ?? []).map((f, fi) => (
                  <div
                    key={fi}
                    draggable
                    onDragStart={() => onFeatDragStart(fi)}
                    onDragOver={(e) => onFeatDragOver(e, fi)}
                    onDrop={(e) => onFeatDrop(e, fi)}
                    onDragEnd={() => { setDragFeatIdx(null); setDropFeatIdx(null) }}
                    className={[
                      'flex items-center gap-2 transition-all',
                      dragFeatIdx === fi                          ? 'opacity-50' : '',
                      dropFeatIdx === fi && dragFeatIdx !== fi    ? 'border-t-2 border-rust pt-2' : '',
                    ].join(' ')}
                  >
                    <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab" />
                    <input
                      value={f}
                      onChange={(e) => setFeature(fi, e.target.value)}
                      className={`${inputCls} flex-1`}
                      placeholder={`Feature ${fi + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(fi)}
                      className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-1.5 text-xs text-rust font-barlow font-700 uppercase tracking-wider hover:text-rust-lt transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </button>
            </CardSection>

            {/* ── CARD 4 — Pricing ─────────────────────────────────────────── */}
            <CardSection title="Pricing & Timeline">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Starting Price</FieldLabel>
                  <input
                    value={form.starting_price}
                    onChange={(e) => updateForm({ starting_price: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. From KES 350,000"
                  />
                </div>
                <div>
                  <FieldLabel>Delivery Time</FieldLabel>
                  <input
                    value={form.delivery_time}
                    onChange={(e) => updateForm({ delivery_time: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. 2–4 weeks"
                  />
                </div>
              </div>
            </CardSection>

            {/* ── CARD 5 — Cover Image ─────────────────────────────────────── */}
            <CardSection
              title="Cover Image"
              helper="Hero background on the service detail page. Recommended: 1920×1080px"
            >
              {form.cover_image && (
                <div className="relative rounded-md overflow-hidden mb-4" style={{ height: 180 }}>
                  <Image
                    src={form.cover_image}
                    alt="Cover"
                    fill
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                    unoptimized
                    sizes="600px"
                  />
                  <div className="absolute inset-0 bg-steel/60 flex items-center justify-center">
                    <span className="text-white text-xs font-barlow uppercase tracking-widest bg-black/40 px-3 py-1 rounded">
                      Cover Image
                    </span>
                  </div>
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex items-center gap-2 bg-rust text-white font-barlow font-700 text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-rust-lt transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingCover ? 'Uploading…' : form.cover_image ? 'Change Cover' : 'Upload Cover Image'}
                </button>
                {form.cover_image && (
                  <button
                    type="button"
                    onClick={() => updateForm({ cover_image: '' })}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </CardSection>

            {/* ── CARD 6 — Gallery ─────────────────────────────────────────── */}
            <CardSection
              title="Gallery Images"
              helper="Showcase your work. All images appear in a grid on the service page."
            >
              {/* Existing images */}
              {(form.gallery ?? []).length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(form.gallery ?? []).map((url, gi) => (
                    <div key={gi} className="relative group rounded-md overflow-hidden" style={{ height: 110 }}>
                      <Image
                        src={url}
                        alt={`Gallery ${gi + 1}`}
                        fill
                        className="object-cover"
                        style={{ objectFit: 'cover' }}
                        unoptimized
                        sizes="200px"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImg(gi)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleGalleryUpload}
              />

              <button
                type="button"
                disabled={uploadingGal}
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-rust/40 rounded-lg py-8 hover:border-rust hover:bg-rust/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploadingGal ? (
                  <>
                    <svg className="animate-spin w-6 h-6 text-rust" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-rust text-sm font-barlow uppercase tracking-wider">{uploadProgress}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-rust/60" />
                    <span className="text-sm text-gray-500">
                      Click to add images or drag and drop
                    </span>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP · up to 10 MB each · multiple files OK</span>
                  </>
                )}
              </button>
            </CardSection>

          </div>
        )}
      </div>

    </div>
  )
}
