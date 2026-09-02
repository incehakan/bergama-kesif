import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import '../lib/leafletIcon.js'

const BERGAMA = [39.1206, 27.1789]
const ZOOM = 13

function toCoord(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function KonumSecici({ lat, lng, onChange }) {
  const parsedLat = toCoord(lat)
  const parsedLng = toCoord(lng)
  const hasPoint = parsedLat != null && parsedLng != null
  const center = hasPoint ? [parsedLat, parsedLng] : BERGAMA

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300">
      <MapContainer
        center={center}
        zoom={ZOOM}
        style={{ height: 320, width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {hasPoint ? (
          <Marker
            position={[parsedLat, parsedLng]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const next = e.target.getLatLng()
                onChange(next.lat, next.lng)
              },
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  )
}
