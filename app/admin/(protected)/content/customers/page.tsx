'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'
import {
  Plus, Trash2, Save, Star, Upload, X,
  GripVertical, Users, Pencil, AlertTriangle,
} from 'lucide-react'
import type { Customer } from '@/types'

export const dynamic = 'force-dynamic'

// ── helpers ───────────────────────────────────────────────────────────────────

const BLANK: Omit<Customer, 'id' | 'order'> = { name: '', logo: '', featured: true }

async function persist(customers: Customer[]): Promise<boolean> {
  const res = await fetch('/api/admin/save/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customers),
  })
  return res.ok
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

export default function CustomersEditorPage() {
  const { addToast } = useToast()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [saved,     setSaved]     = useState<string>('[]')  // JSON snapshot for dirty check
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [savingAll, setSavingAll] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Panel: null = closed  |  'add' = new customer  |  Customer = editing
  const [panel,   setPanel]   = useState<'add' | Customer | null>(null)
  const [form,    setForm]    = useState<Partial<Customer>>({})
  const [deleting, setDeleting] = useState<string | null>(null)  // id awaiting confirm

  // Drag-to-reorder
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)

  const logoRef = useRef<HTMLInputElement>(null)

  const hasUnsaved = JSON.stringify(customers) !== saved

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/content?section=customers')
      .then((r) => r.json())
      .then(({ data }) => {
        const list: Customer[] = Array.isArray(data) ? data : []
        setCustomers(list)
        setSaved(JSON.stringify(list))
      })
      .catch(() => addToast('Failed to load customers', 'error'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Panel helpers ───────────────────────────────────────────────────────────
  function openAdd() { setForm({ ...BLANK }); setPanel('add') }
  function openEdit(c: Customer) { setForm({ ...c }); setPanel(c) }
  function closePanel() { setPanel(null); setForm({}) }
  function setF<K extends keyof Customer>(k: K, v: Customer[K]) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  // ── Logo upload ─────────────────────────────────────────────────────────────
  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploadingLogo(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'logo')
    fd.append('name', form.name ?? 'customer')

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        addToast((d as { error?: string }).error ?? 'Upload failed', 'error')
        return
      }
      const { url } = await res.json() as { url: string }
      setF('logo', url)
      addToast('Logo uploaded', 'success')
    } catch {
      addToast('Upload failed', 'error')
    } finally {
      setUploadingLogo(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name])

  // ── Save customer ───────────────────────────────────────────────────────────
  async function saveCustomer(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name?.trim()) { addToast('Company name is required', 'error'); return }

    setSaving(true)
    let updated: Customer[]

    if (panel === 'add') {
      const maxOrd = customers.reduce((m, c) => Math.max(m, c.order), 0)
      updated = [...customers, {
        id:       Date.now().toString(),
        order:    maxOrd + 1,
        name:     form.name.trim(),
        logo:     form.logo ?? '',
        featured: form.featured ?? true,
      }]
    } else {
      const tid = (panel as Customer).id
      updated = customers.map((c) =>
        c.id === tid
          ? { ...c, name: form.name!.trim(), logo: form.logo ?? '', featured: form.featured ?? true }
          : c,
      )
    }

    const ok = await persist(updated)
    setSaving(false)

    if (ok) {
      setCustomers(updated)
      setSaved(JSON.stringify(updated))
      addToast('Customer saved', 'success')
      closePanel()
    } else {
      addToast('Failed to save', 'error')
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function confirmDelete(id: string) {
    const name    = customers.find((c) => c.id === id)?.name ?? 'Customer'
    const updated = customers.filter((c) => c.id !== id)
    const ok      = await persist(updated)
    if (ok) {
      setCustomers(updated)
      setSaved(JSON.stringify(updated))
      setDeleting(null)
      if (panel !== 'add' && (panel as Customer)?.id === id) closePanel()
      addToast(`${name} deleted`, 'info')
    } else {
      addToast('Failed to delete', 'error')
    }
  }

  // ── Toggle featured (UI only — requires Save All) ───────────────────────────
  function toggleFeatured(id: string) {
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, featured: !c.featured } : c))
  }

  // ── Save all (reorder / featured toggles) ───────────────────────────────────
  async function saveAll() {
    setSavingAll(true)
    const ok = await persist(customers)
    setSavingAll(false)
    if (ok) {
      setSaved(JSON.stringify(customers))
      addToast('All changes saved!', 'success')
    } else {
      addToast('Failed to save', 'error')
    }
  }

  // ── Drag reorder ────────────────────────────────────────────────────────────
  function onDragStart(i: number)  { setDragIdx(i) }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (i !== dropIdx) setDropIdx(i)
  }
  function onDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    const from = dragIdx
    setDragIdx(null); setDropIdx(null)
    if (from === null || from === i) return
    const next = [...customers]
    const [moved] = next.splice(from, 1)
    next.splice(i, 0, moved)
    setCustomers(next.map((c, idx) => ({ ...c, order: idx + 1 })))
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8">
        <div className="skeleton h-8 w-72 mb-3" />
        <div className="skeleton h-4 w-96 mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-44 rounded" />)}
        </div>
      </div>
    )
  }

  return (
    // Outer wrapper must be relative so absolute panel/overlay can anchor to it
    <div className="relative flex flex-col h-full overflow-hidden">

      {/* ── Scrollable main content ─────────────────────────────────────────── */}
      <div className={`flex-1 overflow-y-auto pb-24 ${panel ? 'pointer-events-none select-none' : ''}`}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest">
              Manage Customers
            </h1>
            <p className="text-gray-400 text-sm mt-1.5">
              Add your client company logos. They appear in the Our Customers section on the homepage.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="shrink-0 flex items-center gap-2 bg-rust text-white font-barlow font-700 text-xs uppercase tracking-widest px-5 py-3 hover:bg-rust-lt transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Customer
          </button>
        </div>

        <div className="px-8">

          {/* ── Empty state ──────────────────────────────────────────────────── */}
          {customers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="font-barlow font-700 text-xl text-steel uppercase tracking-widest mb-2">
                No customers yet
              </h2>
              <p className="text-gray-400 text-sm max-w-xs mb-8">
                Add your first customer to display their logo on the homepage.
              </p>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest px-6 py-3 hover:bg-rust-lt transition-colors"
              >
                <Plus className="w-4 h-4" /> Add First Customer
              </button>
            </div>
          )}

          {/* ── Customer grid ─────────────────────────────────────────────────── */}
          {customers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {customers.map((c, idx) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={(e) => onDrop(e, idx)}
                  onDragEnd={() => { setDragIdx(null); setDropIdx(null) }}
                  className={[
                    'relative rounded overflow-hidden bg-steel group transition-all',
                    dragIdx === idx                              ? 'opacity-50 ring-2 ring-rust' : '',
                    dropIdx === idx && dragIdx !== idx           ? 'ring-2 ring-dashed ring-rust' : '',
                    dragIdx !== idx && dropIdx !== idx           ? 'ring-1 ring-white/5'          : '',
                  ].join(' ')}
                  style={{ minHeight: 180 }}
                >
                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 z-10 text-white/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Featured badge */}
                  {c.featured && (
                    <div className="absolute top-2 right-2 z-10 bg-rust text-white font-barlow text-xs uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Featured
                    </div>
                  )}

                  {/* Logo / initials */}
                  <div className="flex items-center justify-center px-6" style={{ height: 120 }}>
                    {c.logo ? (
                      <div style={{ position: 'relative', width: 148, height: 64 }}>
                        <Image
                          src={c.logo}
                          alt={c.name}
                          fill
                          sizes="148px"
                          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center"
                           style={{ background: 'rgba(201,76,26,0.2)', border: '1px solid rgba(201,76,26,0.4)' }}>
                        <span className="font-barlow font-700 text-rust" style={{ fontSize: 24 }}>
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="px-4 pb-10 text-center">
                    <p className="text-white text-sm font-barlow font-600 truncate">{c.name}</p>
                  </div>

                  {/* Delete confirmation overlay */}
                  {deleting === c.id && (
                    <div className="absolute inset-0 bg-steel/95 z-20 flex flex-col items-center justify-center gap-3 p-4">
                      <AlertTriangle className="w-5 h-5 text-rust" />
                      <p className="text-white text-xs text-center font-barlow">
                        Delete <span className="font-700 text-rust">{c.name}</span>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleting(null)}
                          className="px-3 py-1.5 border border-white/20 text-white/70 text-xs font-barlow uppercase tracking-wider hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => confirmDelete(c.id)}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-barlow uppercase tracking-wider hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hover actions bar */}
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 z-10 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFeatured(c.id)}
                      title={c.featured ? 'Remove from homepage' : 'Show on homepage'}
                      className={`transition-colors ${c.featured ? 'text-rust' : 'text-white/40 hover:text-white'}`}
                    >
                      <Star className={`w-4 h-4 ${c.featured ? 'fill-rust' : ''}`} />
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit"
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(c.id)}
                        title="Delete"
                        className="text-white/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Unsaved changes bar ─────────────────────────────────────────────── */}
      {hasUnsaved && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-4 px-8 py-4 bg-rust shadow-2xl">
          <p className="text-white text-sm font-barlow">
            You have unsaved changes — save to update the homepage
          </p>
          <button
            onClick={saveAll}
            disabled={savingAll}
            className="shrink-0 flex items-center gap-2 bg-white text-rust font-barlow font-700 text-xs uppercase tracking-widest px-5 py-2 hover:bg-gray-50 transition-colors disabled:opacity-70"
          >
            {savingAll ? <><Spinner /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save All</>}
          </button>
        </div>
      )}

      {/* ── Overlay (dims content when panel is open) ───────────────────────── */}
      {panel && (
        <div
          className="absolute inset-0 z-20 bg-black/40"
          onClick={closePanel}
        />
      )}

      {/* ── Slide-in panel ──────────────────────────────────────────────────── */}
      {panel && (
        <div className="absolute right-0 top-0 bottom-0 z-30 bg-white shadow-2xl overflow-y-auto flex flex-col"
             style={{ width: 400 }}>

          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
            <h2 className="font-barlow font-700 text-lg text-steel uppercase tracking-widest">
              {panel === 'add' ? 'Add Customer' : 'Edit Customer'}
            </h2>
            <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel form */}
          <form onSubmit={saveCustomer} className="flex flex-col flex-1 px-6 py-6 gap-6">

            {/* Company name */}
            <div>
              <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">
                Company Name *
              </label>
              <input
                value={form.name ?? ''}
                onChange={(e) => setF('name', e.target.value)}
                required
                autoFocus
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-rust transition-colors"
                placeholder="e.g. Safaricom PLC"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-2">
                Company Logo
              </label>

              {/* Preview — dark bg shows exactly how it'll look on site */}
              <div
                className="w-full border-2 border-dashed border-rust/30 rounded flex items-center justify-center mb-3 cursor-pointer hover:border-rust/60 transition-colors"
                style={{ background: '#1A1F2E', height: 110 }}
                onClick={() => !uploadingLogo && logoRef.current?.click()}
              >
                {uploadingLogo ? (
                  <div className="flex flex-col items-center gap-2">
                    <Spinner />
                    <p className="text-white/40 text-xs font-barlow uppercase tracking-wider">Uploading…</p>
                  </div>
                ) : form.logo ? (
                  <div style={{ position: 'relative', width: 160, height: 72 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.logo}
                      alt="Logo preview"
                      style={{ objectFit: 'contain', width: '100%', height: '100%', filter: 'brightness(0) invert(1)' }}
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-white/25 mx-auto mb-1.5" />
                    <p className="text-white/40 text-xs font-barlow uppercase tracking-wider">Click to upload logo</p>
                  </div>
                )}
              </div>

              {form.logo && (
                <p className="text-xs text-gray-400 text-center mb-3">
                  This is how the logo appears on your website
                </p>
              )}

              <input
                ref={logoRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoUpload}
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-1.5 border border-rust text-rust text-xs font-barlow uppercase tracking-wider px-4 py-2 hover:bg-rust hover:text-white transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {form.logo ? 'Change Logo' : 'Upload Logo'}
                </button>
                {form.logo && (
                  <button
                    type="button"
                    onClick={() => setF('logo', '')}
                    className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                PNG with transparent background recommended · SVG accepted · max 3 MB
              </p>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setF('featured', !(form.featured ?? true))}
                className={`relative w-10 rounded-full transition-colors shrink-0 ${form.featured ? 'bg-rust' : 'bg-gray-200'}`}
                style={{ height: 22 }}
                aria-checked={form.featured}
                role="switch"
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-gray-700">Show in homepage customer carousel</span>
            </label>

            <div className="flex-1" />

            {/* Buttons */}
            <div className="space-y-2 pb-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest py-3 hover:bg-rust-lt transition-colors disabled:opacity-50"
              >
                {saving ? <><Spinner /> Saving…</> : <><Save className="w-4 h-4" /> Save Customer</>}
              </button>
              <button
                type="button"
                onClick={closePanel}
                className="w-full py-3 border border-gray-200 text-gray-500 font-barlow text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
