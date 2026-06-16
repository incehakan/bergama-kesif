import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'

export default function Tarihce() {
  const [baslik, setBaslik] = useState('')
  const [icerik, setIcerik] = useState('')
  const [kapakFotoUrl, setKapakFotoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      setLoading(true)
      try {
        const { data } = await api.get('/api/admin/tarihce')
        if (cancelled) return
        if (data) {
          setBaslik(data.baslik ?? '')
          setIcerik(data.icerik ?? '')
          setKapakFotoUrl(data.kapakFotoUrl ?? '')
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, 'Tarihçe yüklenemedi.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await api.put('/api/admin/tarihce', {
        baslik,
        icerik,
        kapakFotoUrl: kapakFotoUrl || null,
        galeriUrls: [],
        yayinda: true,
      })
      setSuccess('Kayıt başarıyla güncellendi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt başarısız.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tarihçe</h1>
      <p className="mt-1 text-slate-600">Belediye tarihçesi metnini düzenleyin</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Başlık</label>
          <input
            required
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">İçerik</label>
          <textarea
            required
            rows={14}
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Kapak fotoğrafı URL</label>
          <input
            type="url"
            value={kapakFotoUrl}
            onChange={(e) => setKapakFotoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-red-900 px-5 py-2 text-sm font-semibold text-white hover:bg-red-950 disabled:opacity-60"
        >
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </form>
    </div>
  )
}
