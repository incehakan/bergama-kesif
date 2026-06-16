import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'
import DosyaYukleyici from '../components/DosyaYukleyici.jsx'

const emptyForm = {
  baslik: '',
  ozet: '',
  icerik: '',
  kapakFotoUrl: '',
  yayinda: true,
}

export default function Haberler() {
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
      const { data } = await api.get('/api/admin/haberler')
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
      ozet: row.ozet ?? '',
      icerik: row.icerik ?? '',
      kapakFotoUrl: row.kapakFotoUrl ?? '',
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
    setSaving(true)
    setError('')
    try {
      const payload = {
        baslik: form.baslik,
        ozet: form.ozet || null,
        icerik: form.icerik || null,
        kapakFotoUrl: form.kapakFotoUrl || null,
        yayinda: form.yayinda,
      }
      if (editingId) {
        await api.put(`/api/admin/haberler/${editingId}`, payload)
      } else {
        await api.post('/api/admin/haberler', payload)
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
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return
    setError('')
    try {
      await api.delete(`/api/admin/haberler/${id}`)
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
          <h1 className="text-2xl font-bold text-slate-900">Haberler</h1>
          <p className="mt-1 text-slate-600">Haber içeriklerini yönetin</p>
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
                <th className="px-4 py-3 font-semibold text-slate-700">Özet</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tarih</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Durum</th>
                <th className="px-4 py-3 font-semibold text-slate-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Henüz kayıt yok.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.baslik}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600">{r.ozet || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {r.olusturma
                        ? new Date(r.olusturma).toLocaleDateString('tr-TR')
                        : '—'}
                    </td>
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
              {editingId ? 'Haberi Düzenle' : 'Yeni Haber'}
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
                <label className="mb-1 block text-xs font-medium text-slate-600">Özet</label>
                <input
                  value={form.ozet}
                  onChange={(e) => setForm((f) => ({ ...f, ozet: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">İçerik</label>
                <textarea
                  rows={6}
                  value={form.icerik}
                  onChange={(e) => setForm((f) => ({ ...f, icerik: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Kapak fotoğraf</label>
                <DosyaYukleyici
                  tip="fotograf"
                  mevcutUrl={form.kapakFotoUrl}
                  onYuklendi={(url) => setForm((f) => ({ ...f, kapakFotoUrl: url }))}
                />
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                    veya URL gir
                  </summary>
                  <input
                    value={form.kapakFotoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, kapakFotoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </details>
              </div>
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
