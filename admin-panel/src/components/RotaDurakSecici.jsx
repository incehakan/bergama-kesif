import { useEffect, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../lib/api.js'
import '../lib/leafletIcon.js'

const BERGAMA = [39.1206, 27.1789]
const PRIMARY = '#C0392B'
const MEKAN = '#2563eb'

function toCoord(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function stopIcon(n) {
  return L.divIcon({
    className: 'rota-stop-icon',
    html: `<div style="background:${PRIMARY};color:#fff;width:26px;height:26px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${n}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

function renumber(list) {
  return list.map((d, i) => ({ ...d, sira: i + 1 }))
}

function MapClick({ onEmptyClick, ignoreRef }) {
  useMapEvents({
    click(e) {
      if (ignoreRef.current && Date.now() - ignoreRef.current < 220) return
      onEmptyClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function RotaDurakSecici({ duraklar = [], onChange }) {
  const ignoreRef = useRef(0)
  const stops = Array.isArray(duraklar) ? duraklar : []
  const [pois, setPois] = useState([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [eserRes, mekanRes] = await Promise.all([
          api.get('/api/admin/eserler'),
          api.get('/api/admin/yemeicme'),
        ])
        const eserler = (Array.isArray(eserRes.data) ? eserRes.data : [])
          .filter((e) => e.yayinda && toCoord(e.koordinatLat) != null && toCoord(e.koordinatLng) != null)
          .map((e) => ({
            kaynakTipi: 'eser',
            kaynakId: e.id,
            ad: e.isim,
            lat: toCoord(e.koordinatLat),
            lng: toCoord(e.koordinatLng),
          }))
        const mekanlar = (Array.isArray(mekanRes.data) ? mekanRes.data : [])
          .filter((m) => m.yayinda && toCoord(m.koordinatLat) != null && toCoord(m.koordinatLng) != null)
          .map((m) => ({
            kaynakTipi: 'yemeicme',
            kaynakId: m.id,
            ad: m.isim,
            lat: toCoord(m.koordinatLat),
            lng: toCoord(m.koordinatLng),
          }))
        if (!cancelled) setPois([...eserler, ...mekanlar])
      } catch {
        if (!cancelled) setPois([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function emit(next) {
    onChange(renumber(next))
  }

  function addStop(stop) {
    const exists = stops.some(
      (s) =>
        s.kaynakTipi &&
        s.kaynakTipi !== 'ozel' &&
        s.kaynakTipi === stop.kaynakTipi &&
        String(s.kaynakId) === String(stop.kaynakId)
    )
    if (exists) return
    emit([...stops, { ...stop, sira: stops.length + 1 }])
  }

  function addFromPoi(poi) {
    ignoreRef.current = Date.now()
    addStop({
      ad: poi.ad,
      lat: poi.lat,
      lng: poi.lng,
      kaynakTipi: poi.kaynakTipi,
      kaynakId: poi.kaynakId,
    })
  }

  function addEmpty(lat, lng) {
    const ad = window.prompt('Durak adı')
    if (!ad || !ad.trim()) return
    addStop({
      ad: ad.trim(),
      lat,
      lng,
      kaynakTipi: 'ozel',
      kaynakId: null,
    })
  }

  function move(index, dir) {
    const next = [...stops]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    const tmp = next[index]
    next[index] = next[j]
    next[j] = tmp
    emit(next)
  }

  function remove(index) {
    emit(stops.filter((_, i) => i !== index))
  }

  const line = stops
    .map((s) => [toCoord(s.lat), toCoord(s.lng)])
    .filter((p) => p[0] != null && p[1] != null)

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-600">Rota durakları (haritadan seçin)</p>
      <p className="mb-2 text-xs text-slate-500">
        Kırmızı: tarihi eser · Mavi: mekan · Boş yere tıklayınca özel durak eklenir
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-300">
        <MapContainer center={BERGAMA} zoom={13} style={{ height: 340, width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClick onEmptyClick={addEmpty} ignoreRef={ignoreRef} />
          {pois.map((p) => (
            <CircleMarker
              key={`${p.kaynakTipi}-${p.kaynakId}`}
              center={[p.lat, p.lng]}
              radius={8}
              pathOptions={{
                color: p.kaynakTipi === 'eser' ? PRIMARY : MEKAN,
                fillColor: p.kaynakTipi === 'eser' ? PRIMARY : MEKAN,
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{ click: () => addFromPoi(p) }}
            />
          ))}
          {line.length >= 2 ? <Polyline positions={line} pathOptions={{ color: PRIMARY, weight: 4, opacity: 0.75 }} /> : null}
          {stops.map((s, i) => {
            const lat = toCoord(s.lat)
            const lng = toCoord(s.lng)
            if (lat == null || lng == null) return null
            return <Marker key={`stop-${i}`} position={[lat, lng]} icon={stopIcon(i + 1)} />
          })}
        </MapContainer>
      </div>
      <ul className="mt-3 space-y-2">
        {stops.length === 0 ? (
          <li className="text-xs text-slate-500">Henüz durak yok.</li>
        ) : (
          stops.map((s, i) => (
            <li
              key={`${s.sira}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm"
            >
              <span className="w-6 text-center text-xs font-extrabold text-red-800">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{s.ad}</span>
              <button type="button" className="text-xs text-slate-600 hover:underline" onClick={() => move(i, -1)}>
                Yukarı
              </button>
              <button type="button" className="text-xs text-slate-600 hover:underline" onClick={() => move(i, 1)}>
                Aşağı
              </button>
              <button type="button" className="text-xs text-red-800 hover:underline" onClick={() => remove(i)}>
                Sil
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
