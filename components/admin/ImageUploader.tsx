'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react'

interface ImageUploaderProps {
  currentUrl?: string
  onUpload: (url: string) => void
  label?: string
}

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export default function ImageUploader({ currentUrl, onUpload, label = 'Image' }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(currentUrl ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    setError('')
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); return }
    if (file.size > MAX_SIZE) { setError('File must be smaller than 5 MB.'); return }

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setUploading(true)
    setProgress(0)

    const interval = setInterval(() => setProgress((p) => Math.min(p + 20, 80)), 200)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Upload failed')
      }

      const { url } = await res.json()
      setProgress(100)
      onUpload(url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.')
      setPreview(currentUrl ?? '')
    } finally {
      clearInterval(interval)
      setUploading(false)
    }
  }, [currentUrl, onUpload])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const clearImage = () => {
    setPreview('')
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500">{label}</label>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed transition-colors cursor-pointer overflow-hidden
          ${dragging ? 'border-rust bg-rust/5' : 'border-gray-200 hover:border-rust/50'}
          ${uploading ? 'cursor-not-allowed' : ''}`}
        style={{ minHeight: 160 }}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

        {preview ? (
          <div className="relative" style={{ minHeight: 160 }}>
            <Image src={preview} alt="Preview" fill className="object-cover" sizes="400px"
              unoptimized={preview.startsWith('blob:')} />
            {!uploading && (
              <button type="button" onClick={(e) => { e.stopPropagation(); clearImage() }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white flex items-center justify-center hover:bg-red-700">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs py-1 px-3 flex items-center gap-2">
              <Upload className="w-3 h-3 shrink-0" /> Click to replace
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
            <Upload className="w-8 h-8" />
            <div className="text-sm text-center">
              <span className="text-rust font-600">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs">PNG, JPG, WebP — max 5 MB</div>
          </div>
        )}

        {uploading && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gray-200">
            <div className="h-full bg-rust transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}
      {progress === 100 && !uploading && !error && (
        <div className="flex items-center gap-2 text-green-600 text-xs">
          <CheckCircle className="w-3.5 h-3.5" /> Upload complete
        </div>
      )}
    </div>
  )
}
