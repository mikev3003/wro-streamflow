import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const WMA_COLORS = {
  WMA1: '#00c6a2', WMA2: '#0099e6', WMA3: '#7c6af7',
  WMA4: '#f7a325', WMA5: '#e84d6f', WMA6: '#3ecf8e',
}

const STATUS_COLORS = {
  spilling: '#e84d6f',
  high:     '#f7a325',
  normal:   '#3ecf8e',
  low:      '#ffd166',
  critical: '#ff6b6b',
  flowing:  '#0099e6',
  dry:      '#555',
  unknown:  '#333',
}

function makeIcon(station) {
  const color = STATUS_COLORS[station.flowStatus] || '#333'
  const isDam  = station.isDam
  const isSpill = station.spill > 0
  const size = isSpill ? 18 : isDam ? 14 : 11

  const svg = isDam
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 20 20">
        <rect x="2" y="2" width="16" height="16" rx="3" fill="${color}" fill-opacity="0.9" stroke="rgba(0,0,0,0.5)" stroke-width="1.5"/>
        ${isSpill ? '<circle cx="10" cy="10" r="4" fill="white" fill-opacity="0.7"/>' : ''}
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill="${color}" fill-opacity="0.9" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>
        ${isSpill ? '<circle cx="10" cy="10" r="3.5" fill="white" fill-opacity="0.7"/>' : ''}
       </svg>`

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -size / 2],
  })
}

function popupContent(s) {
  const flow = s.flow != null
    ? (s.isDam ? `${s.flow.toFixed(1)}% capacity` : `${s.flow.toFixed(2)} m³/s`)
    : '—'
  const spill = s.spill > 0 ? `<div class="pop-spill">⚠ Spilling: ${s.spill.toFixed(2)} m³/s</div>` : ''
  const stale = s.isStale ? `<div class="pop-stale">⚠ Stale data</div>` : ''
  const wmaColor = WMA_COLORS[s.wmaId] || '#888'
  return `
    <div class="map-popup">
      <div class="pop-head">
        <span class="pop-code" style="color:${wmaColor}">${s.code}</span>
        <span class="pop-type">${s.isDam ? '🏞' : '🌊'}</span>
      </div>
      <div class="pop-place">${s.place}</div>
      <div class="pop-row"><span>Flow</span><strong>${flow}</strong></div>
      <div class="pop-row"><span>Stage</span><strong>${s.stage != null ? s.stage.toFixed(3) + ' m' : '—'}</strong></div>
      <div class="pop-row"><span>Reading</span><strong>${s.datetime || '—'}</strong></div>
      ${spill}${stale}
      ${s.graphUrl ? `<a href="${s.graphUrl}" target="_blank" class="pop-link">View DWS Graph ↗</a>` : ''}
    </div>
  `
}

export default function MapView({ stations, activeWma, onStationClick }) {
  const mapRef      = useRef(null)
  const instanceRef = useRef(null)
  const layerRef    = useRef(null)
  const markerMap   = useRef({})

  // Init map
  useEffect(() => {
    if (instanceRef.current) return
    const map = L.map(mapRef.current, {
      center: [-28.5, 25.0],
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map)

    // Inject popup styles
    const style = document.createElement('style')
    style.textContent = `
      .map-popup { font-family: 'IBM Plex Mono', monospace; font-size: 12px; min-width: 200px; color: #1a2233; }
      .pop-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
      .pop-code { font-size:15px; font-weight:700; }
      .pop-place { color:#4a5568; font-size:11px; margin-bottom:8px; font-family:'Inter',sans-serif; }
      .pop-row { display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid #dde2ea; }
      .pop-row span { color:#8896aa; }
      .pop-row strong { color:#1a2233; font-weight:600; }
      .pop-spill { color:#c8293a; font-size:11px; margin-top:6px; font-weight:600; }
      .pop-stale { color:#8896aa; font-size:10px; margin-top:4px; }
      .pop-link { display:block; margin-top:8px; color:#1a6fdb; text-decoration:none; font-size:11px; font-weight:500; }
      .pop-link:hover { text-decoration:underline; }
      .leaflet-popup-content-wrapper { background:#ffffff; border:1px solid #dde2ea; border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,0.12); }
      .leaflet-popup-tip { background:#ffffff; }
      .leaflet-popup-content { margin:14px 16px; }
      .leaflet-popup-close-button { color:#8896aa !important; }
    `
    document.head.appendChild(style)

    instanceRef.current = map
    layerRef.current = L.layerGroup().addTo(map)
  }, [])

  // Update markers when stations change
  useEffect(() => {
    if (!instanceRef.current || !layerRef.current) return

    layerRef.current.clearLayers()
    markerMap.current = {}

    const visible = stations.filter(s =>
      s.lat !== null &&
      (activeWma === 'ALL' || s.wmaId === activeWma)
    )

    for (const s of visible) {
      const marker = L.marker([s.lat, s.lng], { icon: makeIcon(s) })
        .bindPopup(popupContent(s), { maxWidth: 260 })
        .on('click', () => onStationClick?.(s))

      layerRef.current.addLayer(marker)
      markerMap.current[s.code] = marker
    }

    // Fit bounds to visible markers
    if (visible.length > 0) {
      const bounds = L.latLngBounds(visible.map(s => [s.lat, s.lng]))
      instanceRef.current.fitBounds(bounds.pad(0.1), { maxZoom: 9 })
    }
  }, [stations, activeWma])

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
