import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'
import DosyaYukleyici from '../components/DosyaYukleyici.jsx'
import KonumSecici from '../components/KonumSecici.jsx'

const KATEGORILER = ['RESTORAN', 'KAFE', 'PASTANE', 'SOKAK_LEZZETI', 'BAR', 'YEREL_URUN']

const KATEGORI_ETIKET = {
  RESTORAN: 'Restoran',
  KAFE: 'Kafe',
  PASTANE: 'Pastane',
  SOKAK_LEZZETI: 'Sokak Lezzeti',
  BAR: 'Bar',
  YEREL_URUN: 'Yerel Ürün',
}

const emptyForm = {
  isim: '',
  kategori: 'RESTORAN',
  aciklama: '',
  adres: '',
  telefon: '',
  kapakFotoUrl: '',
  koordinatLat: null,
  koordinatLng: null,
  yayinda: true,
}

export default function YemeIcme() {
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
      const { data } = await api.get('/api/admin/yemeicme')
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
      isim: row.isim ?? '',
      kategori: row.kategori ?? 'RESTORAN',
      aciklama: row.aciklama ?? '',
      adres: row.adres ?? '',
      telefon: row.telefon ?? '',
      kapakFotoUrl: row.kapakFotoUrl ?? '',
      koordinatLat: row.koordinatLat != null ? Number(row.koordinatLat) : null,
      koordinatLng: row.koordinatLng != null ? Number(row.koordinatLng) : null,
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
        ...form,
        kapakFotoUrl: form.kapakFotoUrl || null,
        aciklama: form.aciklama || null,
        adres: form.adres || null,
        telefon: form.telefon || null,
        koordinatLat: form.koordinatLat ?? null,
        koordinatLng: form.koordinatLng ?? null,
      }
      if (editingId) {
        await api.put(`/api/admin/yemeicme/${editingId}`, payload)
      } else {
        await api.post('/api/admin/yemeicme', payload)
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
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return
    setError('')
    try {
      await api.delete(`/api/admin/yemeicme/${id}`)
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
          <h1 className="text-2xl font-bold text-slate-900">Yeme & İçme</h1>
          <p className="mt-1 text-slate-600">Mekanları yönetin</p>
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
                <th className="px-4 py-3 font-semibold text-slate-700">İsim</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Kategori</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Adres</th>
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
                    <td className="px-4 py-3 font-medium text-slate-900">{r.isim}</td>
                    <td className="px-4 py-3 text-slate-600">{KATEGORI_ETIKET[r.kategori] || r.kategori}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600">{r.adres || '—'}</td>
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
              {editingId ? 'Düzenle' : 'Yeni Mekan'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">İsim</label>
                <input
                  required
                  value={form.isim}
                  onChange={(e) => setForm((f) => ({ ...f, isim: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {KATEGORILER.map((k) => (
                    <option key={k} value={k}>
                      {KATEGORI_ETIKET[k] || k}
                    </option>
                  ))}
                </select>
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
                <label className="mb-1 block text-xs font-medium text-slate-600">Adres</label>
                <input
                  value={form.adres}
                  onChange={(e) => setForm((f) => ({ ...f, adres: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Telefon</label>
                <input
                  value={form.telefon}
                  onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))}
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
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Konum (haritadan işaretleyin)</label>
                <KonumSecici
                  lat={form.koordinatLat}
                  lng={form.koordinatLng}
                  onChange={(lat, lng) => setForm((f) => ({ ...f, koordinatLat: lat, koordinatLng: lng }))}
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-600">
                    {form.koordinatLat != null && form.koordinatLng != null
                      ? `Seçili konum: ${Number(form.koordinatLat).toFixed(4)}, ${Number(form.koordinatLng).toFixed(4)}`
                      : 'Henüz konum seçilmedi'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, koordinatLat: null, koordinatLng: null }))}
                    className="text-sm font-medium text-red-800 hover:underline"
                  >
                    Konumu Temizle
                  </button>
                </div>
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
