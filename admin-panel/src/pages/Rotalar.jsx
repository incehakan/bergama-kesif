import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'
import DosyaYukleyici from '../components/DosyaYukleyici.jsx'

const ZORLUK = ['KOLAY', 'ORTA', 'ZOR']

const emptyForm = {
  baslik: '',
  kisaAciklama: '',
  detayliAciklama: '',
  sureSaat: '',
  mesafeKm: '',
  zorluk: 'KOLAY',
  kapakFotoUrl: '',
  yayinda: true,
  rotaDuraklar: [],
}

export default function Rotalar() {
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
      const { data } = await api.get('/api/admin/rotalar')
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
    const duraklar =
      row.rotaDuraklar !== undefined && row.rotaDuraklar !== null
        ? row.rotaDuraklar
        : []
    setForm({
      baslik: row.baslik ?? '',
      kisaAciklama: row.kisaAciklama ?? '',
      detayliAciklama: row.detayliAciklama ?? '',
      sureSaat: row.sureSaat != null ? String(row.sureSaat) : '',
      mesafeKm: row.mesafeKm != null ? String(row.mesafeKm) : '',
      zorluk: row.zorluk ?? 'KOLAY',
      kapakFotoUrl: row.kapakFotoUrl ?? '',
      yayinda: !!row.yayinda,
      rotaDuraklar: duraklar,
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
      const sureSaat =
        form.sureSaat === '' ? null : Number.parseFloat(form.sureSaat)
      const mesafeKm =
        form.mesafeKm === '' ? null : Number.parseFloat(form.mesafeKm)
      const payload = {
        baslik: form.baslik,
        kisaAciklama: form.kisaAciklama || null,
        detayliAciklama: form.detayliAciklama || null,
        sureSaat: Number.isFinite(sureSaat) ? sureSaat : null,
        mesafeKm: Number.isFinite(mesafeKm) ? mesafeKm : null,
        zorluk: form.zorluk,
        kapakFotoUrl: form.kapakFotoUrl || null,
        galeriUrls: [],
        rotaDuraklar: form.rotaDuraklar ?? [],
        yayinda: form.yayinda,
      }
      if (editingId) {
        await api.put(`/api/admin/rotalar/${editingId}`, payload)
      } else {
        await api.post('/api/admin/rotalar', payload)
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
    if (!confirm('Bu rotayı silmek istediğinize emin misiniz?')) return
    setError('')
    try {
      await api.delete(`/api/admin/rotalar/${id}`)
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
          <h1 className="text-2xl font-bold text-slate-900">Rotalar</h1>
          <p className="mt-1 text-slate-600">Turizm rotalarını yönetin</p>
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
                <th className="px-4 py-3 font-semibold text-slate-700">Zorluk</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Süre (saat)</th>
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
                    <td className="px-4 py-3 text-slate-600">{r.zorluk}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.sureSaat != null ? r.sureSaat : '—'}
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
              {editingId ? 'Rotayı Düzenle' : 'Yeni Rota'}
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
                <label className="mb-1 block text-xs font-medium text-slate-600">Kısa açıklama</label>
                <input
                  value={form.kisaAciklama}
                  onChange={(e) => setForm((f) => ({ ...f, kisaAciklama: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Detaylı açıklama</label>
                <textarea
                  rows={4}
                  value={form.detayliAciklama}
                  onChange={(e) => setForm((f) => ({ ...f, detayliAciklama: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Süre (saat)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.sureSaat}
                    onChange={(e) => setForm((f) => ({ ...f, sureSaat: e.target.value }))}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Mesafe (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.mesafeKm}
                    onChange={(e) => setForm((f) => ({ ...f, mesafeKm: e.target.value }))}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Zorluk</label>
                <select
                  value={form.zorluk}
                  onChange={(e) => setForm((f) => ({ ...f, zorluk: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {ZORLUK.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
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
              <p className="text-xs text-slate-500">
                {editingId
                  ? 'Mevcut rota durakları korunur; harita düzenleyicisi sonra eklenebilir.'
                  : 'Yeni rota için durak listesi boş başlar; harita düzenleyicisi sonra eklenebilir.'}
              </p>
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
