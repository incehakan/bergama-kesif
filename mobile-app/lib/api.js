import Constants from 'expo-constants'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL
  || Constants.expoConfig?.extra?.apiUrl
  || 'http://45.43.152.58:3001'
export const SLUG = process.env.EXPO_PUBLIC_BELEDIYE_SLUG
  || Constants.expoConfig?.extra?.belediyeSlug
  || 'bergama'
const MEDIA_URL_FIELDS = new Set(['kapakFotoUrl', 'videoUrl', 'galeriUrls', 'ekVideolar'])

function buildUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL.replace(/\/$/, '')}${p}`
}

function toAbsoluteMediaUrl(value) {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed
  if (trimmed.startsWith('/')) return buildUrl(trimmed)
  return trimmed
}

function normalizeMediaUrls(value, parentKey = '') {
  if (Array.isArray(value)) {
    if (MEDIA_URL_FIELDS.has(parentKey)) return value.map((item) => toAbsoluteMediaUrl(item))
    return value.map((item) => normalizeMediaUrls(item))
  }

  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeMediaUrls(v, k)
    }
    return out
  }

  if (MEDIA_URL_FIELDS.has(parentKey)) return toAbsoluteMediaUrl(value)
  return value
}

async function request(path, options = {}) {
  const url = buildUrl(path)
  let res
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    })
  } catch (e) {
    const detail = e?.message || 'Network request failed'
    throw new Error(`${detail}\n${url}`)
  }

  if (!res.ok) {
    let message = 'İstek başarısız'
    try {
      const body = await res.json()
      if (body?.error && typeof body.error === 'string') message = body.error
    } catch {
      /* ignore */
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  try {
    return normalizeMediaUrls(JSON.parse(text))
  } catch {
    return null
  }
}

export function getAllYemeIcme(kategori) {
  const q =
    kategori && String(kategori).trim()
      ? `?kategori=${encodeURIComponent(kategori)}`
      : ''
  return request(`/api/public/${SLUG}/yemeicme${q}`)
}

export function getRotalar() {
  return request(`/api/public/${SLUG}/rotalar`)
}

export function getEtkinlikler() {
  return request(`/api/public/${SLUG}/etkinlikler`)
}

export function getHaberler() {
  return request(`/api/public/${SLUG}/haberler`)
}

export function getHaberDetay(id) {
  return request(`/api/public/${SLUG}/haberler/${id}`)
}

export function getTarihce() {
  return request(`/api/public/${SLUG}/tarihce`)
}

export function getBaskan() {
  return request(`/api/public/${SLUG}/baskan`)
}

export function getIletisim() {
  return request(`/api/public/${SLUG}/iletisim`)
}

export function getHaritaNoktalari() {
  return request(`/api/public/${SLUG}/harita`)
}

export function getEserler() {
  return request(`/api/public/${SLUG}/eserler`)
}

export function getEserByQR(qrKodu) {
  const code = encodeURIComponent(String(qrKodu).trim())
  return request(`/api/public/${SLUG}/eserler/qr/${code}`)
}

export function getVRIcerik(id) {
  return request(`/api/public/${SLUG}/vr/${id}`)
}
