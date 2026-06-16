import { useCallback, useRef, useState } from 'react'
import { api } from '../lib/api.js'

const MAX_VIDEO = 500 * 1024 * 1024
const MAX_FOTO = 10 * 1024 * 1024

const DESTEK = {
  fotograf: 'JPG, JPEG, PNG, WebP (en fazla 10 MB)',
  video: 'MP4, MOV, AVI (en fazla 500 MB)',
  vr360: 'JPG, JPEG, PNG (en fazla 10 MB)',
}

function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return ''
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
  const base = (api.defaults.baseURL || '').replace(/\/$/, '')
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${base}${p}`
}

function isVideoUrl(url) {
  if (!url) return false
  const u = url.split('?')[0].toLowerCase()
  return /\.(mp4|mov|avi|webm)(\s|$)/.test(u)
}

/**
 * @param {{ tip: 'fotograf' | 'video' | 'vr360'; mevcutUrl?: string | null; onYuklendi: (url: string) => void }} props
 */
export default function DosyaYukleyici({ tip, mevcutUrl, onYuklendi }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [localError, setLocalError] = useState('')

  const maxBytes = tip === 'video' ? MAX_VIDEO : MAX_FOTO

  const uploadFile = useCallback(
    async (file) => {
      setLocalError('')
      if (!file) return
      if (file.size > maxBytes) {
        setLocalError(
          tip === 'video'
            ? 'Dosya 500 MB sınırını aşıyor.'
            : 'Dosya 10 MB sınırını aşıyor.'
        )
        return
      }

      const fd = new FormData()
      fd.append('tip', tip)
      fd.append('dosya', file)

      setUploading(true)
      setProgress(0)
      try {
        const { data } = await api.post('/api/admin/medya/yukle', fd, {
          onUploadProgress: (ev) => {
            if (ev.total) {
              setProgress(Math.min(100, Math.round((ev.loaded * 100) / ev.total)))
            }
          },
        })
        if (data?.url) {
          onYuklendi(data.url)
          setProgress(100)
        } else {
          setLocalError('Sunucu yanıtı geçersiz.')
        }
      } catch (e) {
        const msg = e?.response?.data?.error
        setLocalError(typeof msg === 'string' ? msg : 'Yükleme başarısız.')
      } finally {
        setUploading(false)
      }
    },
    [tip, maxBytes, onYuklendi]
  )

  const onInputChange = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (f) uploadFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) uploadFile(f)
  }

  const previewSrc = mevcutUrl ? absoluteUrl(mevcutUrl) : ''
  const showVideoPreview = previewSrc && (tip === 'video' || isVideoUrl(mevcutUrl))

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">Desteklenen: {DESTEK[tip]}</p>

      {previewSrc && !showVideoPreview && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img src={previewSrc} alt="Önizleme" className="max-h-40 w-full object-contain" />
        </div>
      )}
      {previewSrc && showVideoPreview && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-black">
          <video src={previewSrc} controls className="max-h-48 w-full" />
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
          dragOver ? 'border-red-900 bg-red-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={onInputChange}
          disabled={uploading}
        />
        {uploading ? 'Yükleniyor…' : 'Dosya seçin veya sürükleyip bırakın'}
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-red-900 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-slate-600">{progress}%</p>
        </div>
      )}

      {localError && (
        <p className="text-xs text-red-700">{localError}</p>
      )}
    </div>
  )
}
