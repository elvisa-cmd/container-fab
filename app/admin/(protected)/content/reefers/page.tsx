'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import ImageUploader from '@/components/admin/ImageUploader'
import type { ReeferContent } from '@/types'

export const dynamic = 'force-dynamic'

const FIELDS: { key: keyof ReeferContent; label: string; textarea?: boolean }[] = [
  { key: 'heading',     label: 'Heading' },
  { key: 'subheading',  label: 'Subheading' },
  { key: 'description', label: 'Description', textarea: true },
  { key: 'feature1',    label: 'Feature 1' },
  { key: 'feature2',    label: 'Feature 2' },
  { key: 'feature3',    label: 'Feature 3' },
  { key: 'feature4',    label: 'Feature 4' },
]

export default function ReefersEditorPage() {
  const { addToast } = useToast()
  const [form, setForm] = useState<Partial<ReeferContent>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/content?section=reefers')
      .then((r) => r.json())
      .then(({ data }) => { if (data) setForm(data) })
      .catch(() => addToast('Failed to load reefers data', 'error'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (key: keyof ReeferContent) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/save/reefers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, updated_at: new Date().toISOString() }),
      })
      if (res.ok) addToast('Reefers section updated successfully', 'success')
      else addToast('Failed to save reefers section', 'error')
    } catch {
      addToast('Network error — could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(7)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest mb-8">Edit Reefers Section</h1>
      <form onSubmit={save} className="space-y-5 bg-white border border-gray-100 p-6">
        {FIELDS.map(({ key, label, textarea }) => (
          <div key={key}>
            <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
            {textarea ? (
              <textarea
                value={(form[key] as string) ?? ''}
                onChange={set(key)}
                rows={4}
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-rust transition-colors resize-none"
              />
            ) : (
              <input
                value={(form[key] as string) ?? ''}
                onChange={set(key)}
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-rust transition-colors"
              />
            )}
          </div>
        ))}

        <ImageUploader
          label="Reefers Section Image"
          currentUrl={form.image_url}
          onUpload={(url) => setForm((p) => ({ ...p, image_url: url }))}
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-rust text-white font-barlow font-700 text-sm uppercase tracking-widest py-3 hover:bg-rust-lt transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : 'Save Reefers Section'}
        </button>
      </form>
    </div>
  )
}
