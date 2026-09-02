const API_URL = 'https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler'

/** Bu proje başka bir belediye için kullanılacaksa bu değeri değiştirin */
export const ILCE_ADI = 'BERGAMA'

function matchesIlce(bolge) {
  const haystack = String(bolge || '').toLocaleUpperCase('tr-TR')
  const needle = String(ILCE_ADI || '').toLocaleUpperCase('tr-TR')
  if (!needle) return false
  return haystack.includes(needle)
}

export async function getNobetciEczaneler() {
  let res
  try {
    res = await fetch(API_URL, { headers: { Accept: 'application/json' } })
  } catch (e) {
    const detail = e?.message || 'Network request failed'
    throw new Error(`${detail}\n${API_URL}`)
  }

  if (!res.ok) {
    const err = new Error('Nöbetçi eczane bilgisi alınamadı')
    err.status = res.status
    throw err
  }

  const text = await res.text()
  if (!text) return []

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Nöbetçi eczane yanıtı okunamadı')
  }

  const rows = Array.isArray(parsed)
    ? parsed
    : parsed?.data || parsed?.sonuc || parsed?.Sonuc || []

  if (!Array.isArray(rows)) return []

  return rows.filter((row) => matchesIlce(row?.Bolge))
}

export function eczaneMapsUrl(item) {
  const lat = Number(item?.LokasyonX)
  const lng = Number(item?.LokasyonY)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }
  const q = encodeURIComponent(`${item?.Adi || ''} ${item?.Adres || ''} ${ILCE_ADI}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function eczaneTelUrl(item) {
  const tel = String(item?.Telefon || '').replace(/\s/g, '')
  return tel ? `tel:${tel}` : null
}
