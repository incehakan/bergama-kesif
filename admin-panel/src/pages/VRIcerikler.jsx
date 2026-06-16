import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'

const TIPLER = ['FOTOGRAF_360', 'VIDEO_360']

const emptyForm = {
  baslik: '',
  aciklama: '',
  tip: 'FOTOGRAF_360',
  dosyaUrl: '',
  onizlemeUrl: '',
  sure: '',
  yayinda: true,
}

export default function VRIcerikler() {
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
      const { data } = await api.get('/api/admin/vr')
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
      tip: row.tip ?? 'FOTOGRAF_360',
      dosyaUrl: row.dosyaUrl ?? '',
      onizlemeUrl: row.onizlemeUrl ?? '',
      sure: row.sure != null ? String(row.sure) : '',
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
      const sureNum = form.sure === '' ? null : Number.parseInt(form.sure, 10)
      const payload = {
        baslik: form.baslik,
        aciklama: form.aciklama || null,
        tip: form.tip,
        dosyaUrl: form.dosyaUrl,
        onizlemeUrl: form.onizlemeUrl || null,
        sure: Number.isFinite(sureNum) ? sureNum : null,
        yayinda: form.yayinda,
      }
      if (editingId) {
        await api.put(`/api/admin/vr/${editingId}`, payload)
      } else {
        await api.post('/api/admin/vr', payload)
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
    if (!confirm('Bu VR içeriğini silmek istediğinize emin misiniz?')) return
    setError('')
    try {
      await api.delete(`/api/admin/vr/${id}`)
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
          <h1 className="text-2xl font-bold text-slate-900">VR İçerikler</h1>
          <p className="mt-1 text-slate-600">360° içerikleri yönetin</p>
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
                <th className="px-4 py-3 font-semibold text-slate-700">Tip</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Süre (sn)</th>
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
                    <td className="px-4 py-3 text-slate-600">{r.tip}</td>
                    <td className="px-4 py-3 text-slate-600">{r.sure != null ? r.sure : '—'}</td>
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
              {editingId ? 'VR İçeriğini Düzenle' : 'Yeni VR İçeriği'}
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
                  rows={2}
                  value={form.aciklama}
                  onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tip</label>
                <select
                  value={form.tip}
                  onChange={(e) => setForm((f) => ({ ...f, tip: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {TIPLER.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Dosya URL</label>
                <input
                  required
                  value={form.dosyaUrl}
                  onChange={(e) => setForm((f) => ({ ...f, dosyaUrl: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Önizleme URL</label>
                <input
                  value={form.onizlemeUrl}
                  onChange={(e) => setForm((f) => ({ ...f, onizlemeUrl: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Süre (saniye)</label>
                <input
                  type="number"
                  min="0"
                  value={form.sure}
                  onChange={(e) => setForm((f) => ({ ...f, sure: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
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
