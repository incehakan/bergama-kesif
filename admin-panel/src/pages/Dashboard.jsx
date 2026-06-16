import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'

export default function Dashboard() {
  const [userName, setUserName] = useState('')
  const [counts, setCounts] = useState({
    mekan: 0,
    rota: 0,
    etkinlik: 0,
    eser: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      setLoading(true)
      try {
        const [meRes, yemeRes, rotaRes, etkRes, eserRes] = await Promise.all([
          api.get('/api/auth/me'),
          api.get('/api/admin/yemeicme'),
          api.get('/api/admin/rotalar'),
          api.get('/api/admin/etkinlikler'),
          api.get('/api/admin/eserler'),
        ])
        if (cancelled) return
        setUserName(meRes.data?.ad || 'Yönetici')
        const yeme = Array.isArray(yemeRes.data) ? yemeRes.data : []
        const rota = Array.isArray(rotaRes.data) ? rotaRes.data : []
        const etk = Array.isArray(etkRes.data) ? etkRes.data : []
        const eser = Array.isArray(eserRes.data) ? eserRes.data : []
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const yaklasan = etk.filter((e) => {
          const t = e?.tarihBaslangic ? new Date(e.tarihBaslangic) : null
          return t && !Number.isNaN(t.getTime()) && t >= startOfToday
        })
        setCounts({
          mekan: yeme.length,
          rota: rota.filter((r) => r.yayinda).length,
          etkinlik: yaklasan.length,
          eser: eser.length,
        })
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, 'Veriler yüklenemedi.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <Spinner />

  const cards = [
    { label: 'Toplam Mekan', value: counts.mekan, sub: 'Yeme & içme kayıtları' },
    { label: 'Aktif Rota', value: counts.rota, sub: 'Yayında olan rotalar' },
    { label: 'Yaklaşan Etkinlik', value: counts.etkinlik, sub: 'Bugünden itibaren' },
    { label: 'Toplam Eser', value: counts.eser, sub: 'Tarihi eser kayıtları' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Hoş geldiniz, {userName}
      </h1>
      <p className="mt-1 text-slate-600">Özet istatistikler</p>

      {error && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-red-900">{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
