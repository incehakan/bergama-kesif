function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export function buildExplorerMapHtml({ points = [], user = null, color = '#C0392B' }) {
  const data = safeJson({ points, user, color })
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
  .dot { width: 16px; height: 16px; border-radius: 8px; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.4); }
  .user { width: 16px; height: 16px; border-radius: 8px; background: #3b82f6; border: 3px solid #fff; box-shadow: 0 0 0 6px rgba(59,130,246,.25); }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const DATA = ${data};
  const map = L.map('map', { zoomControl: true }).setView([39.1206, 27.1789], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  const bounds = [];
  (DATA.points || []).forEach(function (p) {
    const lat = Number(p.koordinatLat);
    const lng = Number(p.koordinatLng);
    if (!isFinite(lat) || !isFinite(lng)) return;
    bounds.push([lat, lng]);
    const color = p.tip === 'eser' ? DATA.color : '#2563eb';
    const icon = L.divIcon({
      className: '',
      html: '<div class="dot" style="background:' + color + '"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([lat, lng], { icon: icon }).addTo(map).on('click', function () {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', tip: p.tip, id: p.id }));
      }
    });
  });
  let userMarker = null;
  function setUser(u) {
    if (!u || !isFinite(u.lat) || !isFinite(u.lng)) return;
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker([u.lat, u.lng], {
      icon: L.divIcon({ className: '', html: '<div class="user"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })
    }).addTo(map);
  }
  setUser(DATA.user);
  window.focusUser = function () {
    if (DATA.user && isFinite(DATA.user.lat)) map.setView([DATA.user.lat, DATA.user.lng], 15);
  };
  window.panToUser = function (lat, lng) {
    DATA.user = { lat: lat, lng: lng };
    setUser(DATA.user);
    map.setView([lat, lng], 15);
  };
  if (bounds.length) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
</script>
</body>
</html>`
}

export function buildRouteMapHtml({ stops = [], color = '#C0392B' }) {
  const data = safeJson({ stops, color })
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
  .num { background:${color}; color:#fff; width:24px; height:24px; border-radius:12px; display:flex; align-items:center; justify-content:center; font:800 12px sans-serif; border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,.35); }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const DATA = ${data};
  const map = L.map('map', { zoomControl: false, dragging: true, scrollWheelZoom: false }).setView([39.1206, 27.1789], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  const line = [];
  (DATA.stops || []).forEach(function (s, i) {
    const lat = Number(s.lat);
    const lng = Number(s.lng);
    if (!isFinite(lat) || !isFinite(lng)) return;
    line.push([lat, lng]);
    const icon = L.divIcon({
      className: '',
      html: '<div class="num">' + (i + 1) + '</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([lat, lng], { icon: icon }).addTo(map);
  });
  if (line.length >= 2) L.polyline(line, { color: DATA.color, weight: 4, opacity: 0.8 }).addTo(map);
  if (line.length) map.fitBounds(line, { padding: [24, 24], maxZoom: 15 });
</script>
</body>
</html>`
}
