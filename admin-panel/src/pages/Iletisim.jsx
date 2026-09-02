import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'
import KonumSecici from '../components/KonumSecici.jsx'

function toCoord(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default function Iletisim() {
  const [telefon, setTelefon] = useState('')
  const [eposta, setEposta] = useState('')
  const [adres, setAdres] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [koordinatLat, setKoordinatLat] = useState(null)
  const [koordinatLng, setKoordinatLng] = useState(null)
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
        const { data } = await api.get('/api/admin/iletisim')
        if (cancelled) return
        if (data) {
          setTelefon(data.telefon ?? '')
          setEposta(data.eposta ?? '')
          setAdres(data.adres ?? '')
          setWhatsapp(data.whatsapp ?? '')
          setKoordinatLat(toCoord(data.koordinatLat))
          setKoordinatLng(toCoord(data.koordinatLng))
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
      await api.put('/api/admin/iletisim', {
        telefon: telefon || null,
        eposta: eposta || null,
        adres: adres || null,
        whatsapp: whatsapp || null,
        koordinatLat,
        koordinatLng,
      })
      setSuccess('Kayıt başarıyla güncellendi.')
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt başarısız.'))
    } finally {
      setSaving(false)
    }
  }

  const hasPoint = koordinatLat != null && koordinatLng != null

  if (loading) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">İletişim Bilgileri</h1>
      <p className="mt-1 text-slate-600">Belediyenin iletişim bilgilerini düzenleyin</p>

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
          <label className="mb-1 block text-sm font-medium text-slate-700">Telefon</label>
          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">E-posta</label>
          <input
            type="email"
            value={eposta}
            onChange={(e) => setEposta(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Adres</label>
          <textarea
            rows={3}
            value={adres}
            onChange={(e) => setAdres(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">WhatsApp</label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-800/25"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Konum (haritadan işaretleyin)</label>
          <KonumSecici
            lat={koordinatLat}
            lng={koordinatLng}
            onChange={(lat, lng) => {
              setKoordinatLat(lat)
              setKoordinatLng(lng)
            }}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              {hasPoint
                ? `Seçili konum: ${Number(koordinatLat).toFixed(4)}, ${Number(koordinatLng).toFixed(4)}`
                : 'Henüz konum seçilmedi'}
            </p>
            <button
              type="button"
              onClick={() => {
                setKoordinatLat(null)
                setKoordinatLng(null)
              }}
              className="text-sm font-medium text-red-800 hover:underline"
            >
              Konumu Temizle
            </button>
          </div>
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
