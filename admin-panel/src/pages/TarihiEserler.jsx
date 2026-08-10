import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../lib/api.js'
import Spinner from '../components/Spinner.jsx'
import DosyaYukleyici from '../components/DosyaYukleyici.jsx'
import QRPrint from '../components/QRPrint.jsx'

const emptyForm = {
  isim: '',
  donem: '',
  kisaAciklama: '',
  detayliAciklama: '',
  kapakFotoUrl: '',
  videoUrl: '',
  ekVideolar: [],
  yayinda: true,
}

function shortQr(code) {
  if (!code || typeof code !== 'string') return '—'
  return code.length <= 12 ? code : `${code.slice(0, 8)}…`
}

export default function TarihiEserler() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [qrEser, setQrEser] = useState(null)

  async function fetchList() {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/eserler')
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
      donem: row.donem ?? '',
      kisaAciklama: row.kisaAciklama ?? '',
      detayliAciklama: row.detayliAciklama ?? '',
      kapakFotoUrl: row.kapakFotoUrl ?? '',
      videoUrl: row.videoUrl ?? '',
      ekVideolar: Array.isArray(row.ekVideolar) ? [...row.ekVideolar] : [],
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
      const ekVideolar = (form.ekVideolar || [])
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter(Boolean)
      const payload = {
        isim: form.isim,
        donem: form.donem || null,
        kisaAciklama: form.kisaAciklama || null,
        detayliAciklama: form.detayliAciklama || null,
        kapakFotoUrl: form.kapakFotoUrl || null,
        videoUrl: form.videoUrl || null,
        ekVideolar,
        yayinda: form.yayinda,
      }
      if (editingId) {
        await api.put(`/api/admin/eserler/${editingId}`, payload)
      } else {
        await api.post('/api/admin/eserler', payload)
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
    if (!confirm('Bu eseri silmek istediğinize emin misiniz?')) return
    setError('')
    try {
      await api.delete(`/api/admin/eserler/${id}`)
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
          <h1 className="text-2xl font-bold text-slate-900">Tarihi Eserler</h1>
          <p className="mt-1 text-slate-600">Eser ve QR kayıtlarını yönetin</p>
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
                <th className="px-4 py-3 font-semibold text-slate-700">Dönem</th>
                <th className="px-4 py-3 font-semibold text-slate-700">QR kodu</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tarama</th>
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
                    <td className="px-4 py-3 font-medium text-slate-900">{r.isim}</td>
                    <td className="px-4 py-3 text-slate-600">{r.donem || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {r.qrKodu ? (
                        <button
                          type="button"
                          onClick={() => setQrEser(r)}
                          title="QR kodunu görüntüle"
                          className="text-left text-red-900 hover:underline"
                        >
                          {shortQr(r.qrKodu)}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.taramaSayisi ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.yayinda ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {r.yayinda ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td className="space-x-2 whitespace-nowrap px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setQrEser(r)}
                        className="text-red-900 hover:underline"
                      >
                        QR Görüntüle
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="text-slate-700 hover:underline"
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
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? 'Eseri Düzenle' : 'Yeni Eser'}
            </h2>
            {!editingId && (
              <p className="mt-2 text-xs text-slate-500">QR kodu kayıt sonrası otomatik oluşturulur.</p>
            )}
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
                <label className="mb-1 block text-xs font-medium text-slate-600">Dönem</label>
                <input
                  value={form.donem}
                  onChange={(e) => setForm((f) => ({ ...f, donem: e.target.value }))}
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
                <label className="mb-1 block text-xs font-medium text-slate-600">Ana video</label>
                <DosyaYukleyici
                  tip="video"
                  mevcutUrl={form.videoUrl}
                  onYuklendi={(url) => setForm((f) => ({ ...f, videoUrl: url }))}
                />
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                    veya URL gir
                  </summary>
                  <input
                    value={form.videoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </details>
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-medium text-slate-600">Ek videolar</label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        ekVideolar: [...(f.ekVideolar || []), ''],
                      }))
                    }
                    className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Video Ekle
                  </button>
                </div>
                <div className="space-y-4">
                  {(form.ekVideolar || []).map((ekUrl, idx) => (
                    <div
                      key={`ek-${idx}`}
                      className="rounded-lg border border-slate-200 bg-slate-50/80 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-600">Video {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => {
                              const arr = [...(f.ekVideolar || [])]
                              arr.splice(idx, 1)
                              return { ...f, ekVideolar: arr }
                            })
                          }
                          className="text-xs text-red-800 hover:underline"
                        >
                          Sil
                        </button>
                      </div>
                      <DosyaYukleyici
                        tip="video"
                        mevcutUrl={ekUrl}
                        onYuklendi={(url) =>
                          setForm((f) => {
                            const arr = [...(f.ekVideolar || [])]
                            arr[idx] = url
                            return { ...f, ekVideolar: arr }
                          })
                        }
                      />
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                          veya URL gir
                        </summary>
                        <input
                          value={ekUrl}
                          onChange={(e) =>
                            setForm((f) => {
                              const arr = [...(f.ekVideolar || [])]
                              arr[idx] = e.target.value
                              return { ...f, ekVideolar: arr }
                            })
                          }
                          placeholder="https://..."
                          className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                        />
                      </details>
                    </div>
                  ))}
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
      {qrEser && <QRPrint eser={qrEser} onKapat={() => setQrEser(null)} />}
    </div>
  )
}
