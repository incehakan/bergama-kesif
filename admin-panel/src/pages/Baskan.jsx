import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'

export default function Baskan() {
  const [baskanAdi, setBaskanAdi] = useState('')
  const [unvan, setUnvan] = useState('Belediye Başkanı')
  const [mesaj, setMesaj] = useState('')
  const [fotografUrl, setFotografUrl] = useState('')
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
        const { data } = await api.get('/api/admin/baskan')
        if (cancelled) return
        if (data) {
          setBaskanAdi(data.baskanAdi ?? '')
          setUnvan(data.unvan ?? 'Belediye Başkanı')
          setMesaj(data.mesaj ?? '')
          setFotografUrl(data.fotografUrl ?? '')
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, 'Veri yüklenemedi.'))
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
      await api.put('/api/admin/baskan', {
        baskanAdi,
        unvan,
        mesaj,
        fotografUrl: fotografUrl || null,
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
      <h1 className="text-2xl font-bold text-slate-900">Başkan Mesajı</h1>
      <p className="mt-1 text-slate-600">Başkan mesajı içeriğini düzenleyin</p>

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
          <label className="mb-1 block text-sm font-medium text-slate-700">Başkan adı</label>
          <input
            required
            value={baskanAdi}
            onChange={(e) => setBaskanAdi(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Unvan</label>
          <input
            value={unvan}
            onChange={(e) => setUnvan(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mesaj</label>
          <textarea
            required
            rows={8}
            value={mesaj}
            onChange={(e) => setMesaj(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fotoğraf URL</label>
          <input
            type="url"
            value={fotografUrl}
            onChange={(e) => setFotografUrl(e.target.value)}
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
