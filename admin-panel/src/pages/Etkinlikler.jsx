import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(v) {
  if (!v) return null
  return new Date(v).toISOString()
}

const emptyForm = {
  baslik: '',
  aciklama: '',
  tarihBaslangic: '',
  tarihBitis: '',
  konum: '',
  kapakFotoUrl: '',
  ucretsiz: true,
  yayinda: true,
}

export default function Etkinlikler() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function fetchList() {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/etkinlikler')
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(getErrorMessage(e, 'Liste yüklenemedi.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditingId(row.id)
    setForm({
      baslik: row.baslik ?? '',
      aciklama: row.aciklama ?? '',
      tarihBaslangic: toDatetimeLocal(row.tarihBaslangic),
      tarihBitis: row.tarihBitis ? toDatetimeLocal(row.tarihBitis) : '',
      konum: row.konum ?? '',
      kapakFotoUrl: row.kapakFotoUrl ?? '',
      ucretsiz: !!row.ucretsiz,
      yayinda: !!row.yayinda,
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.tarihBaslangic) {
      setError('Başlangıç tarihi zorunludur.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        baslik: form.baslik,
        aciklama: form.aciklama || null,
        tarihBaslangic: fromDatetimeLocal(form.tarihBaslangic),
        tarihBitis: form.tarihBitis ? fromDatetimeLocal(form.tarihBitis) : null,
        konum: form.konum || null,
        kapakFotoUrl: form.kapakFotoUrl || null,
        ucretsiz: form.ucretsiz,
        yayinda: form.yayinda,
      }
      if (editingId) {
        await api.put(`/api/admin/etkinlikler/${editingId}`, payload)
      } else {
        await api.post('/api/admin/etkinlikler', payload)
      }
      closeModal()
      await fetchList()
    } catch (err) {
      setError(getErrorMessage(err, 'İşlem başarısız.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return
    setError('')
    try {
      await api.delete(`/api/admin/etkinlikler/${id}`)
      await fetchList()
    } catch (e) {
      setError(getErrorMessage(e, 'Silinemedi.'))
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Etkinlikler</h1>
          <p className="mt-1 text-slate-600">Etkinlik takvimini yönetin</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white hover:bg-red-950"
        >
          Yeni Ekle
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Başlık</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tarih</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Konum</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ücretsiz</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Durum</th>
                <th className="px-4 py-3 font-semibold text-slate-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Henüz kayıt yok.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.baslik}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {r.tarihBaslangic
                        ? new Date(r.tarihBaslangic).toLocaleString('tr-TR')
                        : '—'}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600">{r.konum || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.ucretsiz ? 'Evet' : 'Hayır'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.yayinda ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {r.yayinda ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="mr-2 text-red-900 hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="text-slate-600 hover:text-red-700 hover:underline"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Başlık</label>
                <input
                  required
                  value={form.baslik}
                  onChange={(e) => setForm((f) => ({ ...f, baslik: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Açıklama</label>
                <textarea
                  rows={3}
                  value={form.aciklama}
                  onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Başlangıç</label>
                <input
                  type="datetime-local"
                  required
                  value={form.tarihBaslangic}
                  onChange={(e) => setForm((f) => ({ ...f, tarihBaslangic: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Bitiş (isteğe bağlı)</label>
                <input
                  type="datetime-local"
                  value={form.tarihBitis}
                  onChange={(e) => setForm((f) => ({ ...f, tarihBitis: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Konum</label>
                <input
                  value={form.konum}
                  onChange={(e) => setForm((f) => ({ ...f, konum: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.ucretsiz}
                  onChange={(e) => setForm((f) => ({ ...f, ucretsiz: e.target.checked }))}
                />
                Ücretsiz
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.yayinda}
                  onChange={(e) => setForm((f) => ({ ...f, yayinda: e.target.checked }))}
                />
                Yayında
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
