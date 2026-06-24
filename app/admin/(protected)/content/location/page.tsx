'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/Toast'
import {
  MapPin, Save, CheckCircle, Camera, X,
  ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react'
import type { LocationData } from '@/types'

export const dynamic = 'force-dynamic'

interface PendingCoords {
  lat:      number
  lng:      number
  accuracy: number
}

const DEFAULT: LocationData = {
  lat: -1.3031934, lng: 36.7731693,
  address: 'National Park East Gate Rd, Nairobi',
  city: 'Nairobi', country: 'Kenya',
  phone1: '+254 715 296324', phone2: '+254 713 971 394',
  email: 'info@containerfabricators.co.ke',
  hours_weekday:  'Mon – Fri: 8:00 AM – 5:00 PM',
  hours_saturday: 'Saturday: 8:00 AM – 1:00 PM',
  hours_sunday:   'Sunday: Closed',
  updated_at: '',
}

const inputCls =
  'w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm ' +
  'focus:outline-none focus:border-rust transition-colors bg-white'

function accuracyColor(m: number) {
  if (m < 50)  return '#10b981'
  if (m < 200) return '#f59e0b'
  return '#ef4444'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LocationEditorPage() {
  const { addToast } = useToast()

  // form / load
  const [formData,   setFormData]   = useState<LocationData>(DEFAULT)
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)

  // camera flow
  const [capturing,     setCapturing]     = useState(false)
  const [cameraOpen,    setCameraOpen]    = useState(false)
  const [cameraStream,  setCameraStream]  = useState<MediaStream | null>(null)
  const [pendingCoords, setPendingCoords] = useState<PendingCoords | null>(null)
  const [locationError, setLocationError] = useState(false)

  // result
  const [gpsFound,  setGpsFound]  = useState(false)
  const [accuracy,  setAccuracy]  = useState<number | null>(null)
  const [mapKey,    setMapKey]    = useState(0)

  // error state
  const [error, setError] = useState<'' | 'CAMERA_DENIED'>('')

  // manual entry
  const [showManual, setShowManual] = useState(false)
  const [manualLat,  setManualLat]  = useState('')
  const [manualLng,  setManualLng]  = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)

  // ── Load existing data ───────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/content?section=location')
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          const d = data as LocationData
          setFormData(d)
          setManualLat(String(d.lat))
          setManualLng(String(d.lng))
          if (d.lat !== 0 || d.lng !== 0) setGpsFound(true)
        }
      })
      .catch(() => addToast('Failed to load location data', 'error'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Attach camera stream to video element ────────────────────────────────
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  // ── Stop stream on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop())
    }
  }, [cameraStream])

  // ── Open camera + request GPS simultaneously ─────────────────────────────
  const handleTakePhoto = async () => {
    setCapturing(true)
    setError('')
    setPendingCoords(null)
    setLocationError(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setCameraStream(stream)
      setCameraOpen(true)

      // Simultaneously request GPS
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPendingCoords({
            lat:      parseFloat(pos.coords.latitude.toFixed(6)),
            lng:      parseFloat(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
          })
        },
        () => setLocationError(true),
        { enableHighAccuracy: true, timeout: 15000 },
      )
    } catch {
      setCapturing(false)
      setError('CAMERA_DENIED')
    }
  }

  // ── Capture — snapshot (discarded) + save coords ─────────────────────────
  const handleCapture = () => {
    if (!pendingCoords) {
      addToast('Waiting for GPS… try again in a moment', 'error')
      return
    }

    // Snapshot for shutter feel — immediately discarded
    const video = videoRef.current
    if (video) {
      const canvas = document.createElement('canvas')
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      // canvas goes out of scope → GC'd, never stored/uploaded
    }

    // Stop camera
    cameraStream?.getTracks().forEach((t) => t.stop())
    setCameraStream(null)
    setCameraOpen(false)

    // Persist coordinates
    setFormData((p) => ({ ...p, lat: pendingCoords.lat, lng: pendingCoords.lng }))
    setManualLat(String(pendingCoords.lat))
    setManualLng(String(pendingCoords.lng))
    setAccuracy(pendingCoords.accuracy)
    setGpsFound(true)
    setCapturing(false)
    setPendingCoords(null)
    setMapKey((k) => k + 1)

    addToast('📍 Location pinned!', 'success')
  }

  // ── Cancel camera ────────────────────────────────────────────────────────
  const handleCancelCamera = () => {
    cameraStream?.getTracks().forEach((t) => t.stop())
    setCameraStream(null)
    setCameraOpen(false)
    setCapturing(false)
    setPendingCoords(null)
    setLocationError(false)
  }

  // ── Apply manual coordinates ─────────────────────────────────────────────
  const applyManual = () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (isNaN(lat) || isNaN(lng)) { addToast('Enter valid numbers', 'error'); return }
    setFormData((p) => ({ ...p, lat, lng }))
    setAccuracy(null)
    setGpsFound(true)
    setMapKey((k) => k + 1)
    addToast('Coordinates applied', 'success')
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/save/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) addToast('✅ Location saved! Changes are live on your website.', 'success')
      else        addToast('Failed to save location', 'error')
    } catch {
      addToast('Network error', 'error')
    } finally {
      setSaving(false)
    }
  }

  const setF = <K extends keyof LocationData>(k: K, v: LocationData[K]) =>
    setFormData((p) => ({ ...p, [k]: v }))

  const mapSrc = gpsFound
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${formData.lng - 0.008},${formData.lat - 0.008},${formData.lng + 0.008},${formData.lat + 0.008}&layer=mapnik&marker=${formData.lat},${formData.lng}`
    : ''

  const canSave = formData.lat !== 0 || formData.lng !== 0

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 space-y-4 max-w-3xl mx-auto">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}
      </div>
    )
  }

  return (
    <form onSubmit={save} className="p-8 max-w-3xl mx-auto space-y-5">

      {/* Page header */}
      <div>
        <h1 className="font-barlow font-800 text-3xl text-steel uppercase tracking-widest">
          Location &amp; Contact Info
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Use your camera to pin your exact business location, then fill in contact details.
        </p>
      </div>

      {/* ── CAMERA ERROR ─────────────────────────────────────────────────── */}
      {error === 'CAMERA_DENIED' && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '1.25rem 1.5rem' }}>
          <p className="font-600 text-red-600 mb-1">Camera access was denied</p>
          <p className="text-gray-500 text-sm mb-3">Enable camera access in your browser settings, then try again.</p>
          <button type="button" onClick={() => { setError(''); handleTakePhoto() }}
            className="flex items-center gap-2 bg-rust text-white text-xs font-barlow font-700 uppercase tracking-wider px-4 py-2 hover:bg-rust-lt transition-colors">
            <RefreshCw size={13} /> Try Again
          </button>
        </div>
      )}

      {/* ── LOCATION CAPTURE SECTION ─────────────────────────────────────── */}
      {!cameraOpen ? (
        !gpsFound ? (
          /* IDLE — green capture card */
          <div>
            <div
              role="button"
              tabIndex={0}
              onClick={capturing ? undefined : handleTakePhoto}
              onKeyDown={(e) => e.key === 'Enter' && !capturing && handleTakePhoto()}
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 12,
                padding: '1.5rem',
                cursor: capturing ? 'wait' : 'pointer',
                transition: 'background 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
              onMouseEnter={(e) => { if (!capturing) (e.currentTarget as HTMLDivElement).style.background = 'rgba(16,185,129,0.14)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(16,185,129,0.08)' }}
            >
              <div style={{ width: 48, height: 48, background: '#10b981', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {capturing
                  ? <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  : <Camera size={22} style={{ color: '#fff' }} />
                }
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#065f46', marginBottom: 2 }}>
                  {capturing ? 'Opening camera…' : 'Take Photo to Pin Location'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Camera opens · GPS captured · Photo discarded
                </p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              🔒 The photo is never saved or uploaded. Only GPS coordinates are kept.
            </p>
          </div>
        ) : (
          /* SUCCESS — coordinates pinned */
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
            <div className="flex items-start gap-4 mb-4">
              <CheckCircle size={40} style={{ color: '#10b981', flexShrink: 0 }} />
              <div className="flex-1">
                <p className="font-700 text-green-700 text-lg mb-1">Location Pinned!</p>
                <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#059669', lineHeight: 1.7 }}>
                  Lat: {formData.lat.toFixed(6)}<br />
                  Lng: {formData.lng.toFixed(6)}
                </p>
                {accuracy !== null && (
                  <span style={{
                    display: 'inline-block',
                    background: accuracyColor(accuracy) + '20',
                    border: `1px solid ${accuracyColor(accuracy)}50`,
                    color: accuracyColor(accuracy),
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginTop: 6,
                  }}>
                    Accuracy: ±{accuracy}m
                  </span>
                )}
              </div>
              <button type="button" onClick={handleTakePhoto}
                style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, color: '#374151', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
                Retake
              </button>
            </div>

            {/* Live map preview */}
            <div style={{ borderRadius: 8, overflow: 'hidden', height: 280 }}>
              <iframe
                key={mapKey}
                src={mapSrc}
                title="Location preview"
                style={{ width: '100%', height: '100%', border: 'none', filter: 'saturate(0.85)' }}
                loading="lazy"
              />
            </div>
          </div>
        )
      ) : (
        /* CAMERA VIEWFINDER */
        <div style={{ minHeight: 500, background: '#000', borderRadius: 12, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1.5rem 2rem' }}>

          {/* Location status bar */}
          <div style={{ marginBottom: '1rem', width: '100%', textAlign: 'center' }}>
            {locationError ? (
              <span style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 20, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
                ⚠️ Location unavailable — you can still capture
              </span>
            ) : pendingCoords ? (
              <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7', borderRadius: 20, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
                📍 Location ready — tap to capture
              </span>
            ) : (
              <span style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#fcd34d', borderRadius: 20, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
                ⏳ Getting your location…
              </span>
            )}
          </div>

          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 8, display: 'block' }}
          />

          {/* Capture button */}
          <div className="flex flex-col items-center" style={{ marginTop: '1.5rem', gap: 8 }}>
            <button
              type="button"
              onClick={handleCapture}
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#C94C1A',
                border: '4px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 0 2px #C94C1A',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Camera size={28} style={{ color: '#fff' }} />
            </button>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Tap to capture
            </p>
          </div>

          {/* Cancel */}
          <button
            type="button"
            onClick={handleCancelCamera}
            style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 14px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <X size={14} /> Cancel
          </button>
        </div>
      )}

      {/* ── Manual entry (collapsed) ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button type="button" onClick={() => setShowManual((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
          <span className="font-barlow font-700 text-sm uppercase tracking-wider text-steel">
            Enter coordinates manually
          </span>
          {showManual ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {showManual && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-amber-700 text-xs">
              ⚠️ Manual entry is less accurate than camera capture
            </div>
            <p className="text-xs text-gray-500">
              To find coordinates: go to <strong>maps.google.com</strong>, long-press your location — the coordinates appear at the top.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">Latitude</label>
                <input type="number" step="0.000001" value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className={inputCls} placeholder="-1.303193" />
              </div>
              <div>
                <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">Longitude</label>
                <input type="number" step="0.000001" value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className={inputCls} placeholder="36.773169" />
              </div>
            </div>
            <button type="button" onClick={applyManual}
              className="flex items-center gap-2 border border-rust text-rust text-xs font-barlow font-700 uppercase tracking-wider px-4 py-2 hover:bg-rust hover:text-white transition-colors">
              <MapPin size={14} /> Use These Coordinates
            </button>
          </div>
        )}
      </div>

      {/* ── Contact Information ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-barlow font-700 text-xl text-steel uppercase tracking-widest">
          Contact Information
        </h2>
        {([
          { k: 'address'  as const, label: 'Address' },
          { k: 'city'     as const, label: 'City' },
          { k: 'country'  as const, label: 'Country' },
          { k: 'phone1'   as const, label: 'Phone 1' },
          { k: 'phone2'   as const, label: 'Phone 2' },
          { k: 'email'    as const, label: 'Email' },
        ]).map(({ k, label }) => (
          <div key={k}>
            <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
            <input type="text" value={formData[k] as string}
              onChange={(e) => setF(k, e.target.value)} className={inputCls} />
          </div>
        ))}
      </div>

      {/* ── Working Hours ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-barlow font-700 text-xl text-steel uppercase tracking-widest">
          Working Hours
        </h2>
        {([
          { k: 'hours_weekday'  as const, label: 'Weekday Hours',  ph: 'Mon – Fri: 8:00 AM – 5:00 PM' },
          { k: 'hours_saturday' as const, label: 'Saturday Hours', ph: 'Saturday: 8:00 AM – 1:00 PM' },
          { k: 'hours_sunday'   as const, label: 'Sunday Hours',   ph: 'Sunday: Closed' },
        ]).map(({ k, label, ph }) => (
          <div key={k}>
            <label className="block text-xs font-barlow uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
            <input type="text" value={formData[k] as string} placeholder={ph}
              onChange={(e) => setF(k, e.target.value)} className={inputCls} />
          </div>
        ))}
      </div>

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <div>
        <button type="submit" disabled={!canSave || saving}
          title={!canSave ? 'Pin a location first before saving' : undefined}
          className="w-full flex items-center justify-center gap-2 font-barlow font-700 text-sm uppercase tracking-widest py-4 rounded-md transition-colors"
          style={{
            background: canSave && !saving ? '#C94C1A' : '#d1d5db',
            color:      canSave && !saving ? '#fff'    : '#6b7280',
            cursor:     canSave && !saving ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg> Saving…</>
          ) : (
            <><Save size={16} /> Save Location to Website</>
          )}
        </button>
        {!canSave && (
          <p className="text-center text-xs text-gray-400 mt-2">
            📍 Capture your location or enter coordinates manually before saving
          </p>
        )}
      </div>

    </form>
  )
}
