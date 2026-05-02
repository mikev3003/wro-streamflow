import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAlerts, AlertsPanel } from './Alerts.jsx'
import './App.css'

const MapView = lazy(() => import('./MapView.jsx'))

const API = '/api'

const WMA_COLORS = {
  WMA1: '#0d8a7a', WMA2: '#1a6fdb', WMA3: '#5b4fcf',
  WMA4: '#c47d00', WMA5: '#c8293a', WMA6: '#0f9b6e',
}

const FLOW_STATUS = {
  spilling: { label: 'Spilling', color: '#c8293a', bg: 'rgba(200,41,58,0.1)' },
  high:     { label: 'High',     color: '#c47d00', bg: 'rgba(196,125,0,0.1)' },
  normal:   { label: 'Normal',   color: '#0f9b6e', bg: 'rgba(15,155,110,0.1)' },
  low:      { label: 'Low',      color: '#8a6500', bg: 'rgba(138,101,0,0.1)' },
  critical: { label: 'Critical', color: '#c8293a', bg: 'rgba(200,41,58,0.08)' },
  flowing:  { label: 'Flowing',  color: '#1a6fdb', bg: 'rgba(26,111,219,0.1)' },
  dry:      { label: 'Dry',      color: '#8896aa', bg: 'rgba(136,150,170,0.1)' },
  unknown:  { label: '—',        color: '#aab4c0', bg: 'rgba(170,180,192,0.08)' },
}

function useData(sseLastUpdate) {
  const [wmas, setWmas]           = useState([])
  const [stations, setStations]   = useState([])
  const [summary, setSummary]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [fetchedAt, setFetchedAt] = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [wmaRes, stRes, sumRes] = await Promise.all([
        fetch(`${API}/wmas`),
        fetch(`${API}/stations`),
        fetch(`${API}/summary`),
      ])
      const [wmaData, stData, sumData] = await Promise.all([
        wmaRes.json(), stRes.json(), sumRes.json()
      ])
      setWmas(wmaData)
      setStations(stData.allStations || [])
      setSummary(sumData)
      setFetchedAt(new Date(stData.fetchedAt))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (sseLastUpdate) load() }, [sseLastUpdate, load])

  const manualRefresh = useCallback(async () => {
    setLoading(true)
    try {
      await fetch(`${API}/refresh`, { method: 'POST' })
      await load()
    } catch (e) { setError(e.message); setLoading(false) }
  }, [load])

  return { wmas, stations, summary, loading, error, fetchedAt, reload: manualRefresh }
}

function FlowBadge({ status }) {
  const m = FLOW_STATUS[status] || FLOW_STATUS.unknown
  return <span className="badge" style={{ color: m.color, background: m.bg }}>{m.label}</span>
}

function StatCard({ label, value, unit, color, sub, pulse }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      {pulse && <div className="stat-pulse" style={{ background: color }} />}
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value ?? '—'}{unit && <span className="stat-unit"> {unit}</span>}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function WMASummaryChart({ stations }) {
  const data = Object.values(
    stations.reduce((acc, s) => {
      if (!s.wmaId) return acc
      if (!acc[s.wmaId]) acc[s.wmaId] = { wma: s.wmaId, rivers: 0, dams: 0 }
      s.isDam ? acc[s.wmaId].dams++ : acc[s.wmaId].rivers++
      return acc
    }, {})
  )
  return (
    <div className="chart-box">
      <div className="chart-title">Stations by Water Management Area</div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis dataKey="wma" tick={{ fill: '#8896aa', fontSize: 11 }} />
          <YAxis tick={{ fill: '#8896aa', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #dde2ea', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#1a2233', fontWeight: 600 }} />
          <Bar dataKey="rivers" name="Rivers" stackId="a">
            {data.map(e => <Cell key={e.wma} fill={WMA_COLORS[e.wma]} />)}
          </Bar>
          <Bar dataKey="dams" name="Dams" stackId="a" radius={[4, 4, 0, 0]}>
            {data.map(e => <Cell key={e.wma} fill={WMA_COLORS[e.wma] + '55'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TopFlowList({ items }) {
  if (!items?.length) return null
  const max = Math.max(...items.map(i => i.flow))
  return (
    <div className="chart-box">
      <div className="chart-title">Highest River Flows Right Now</div>
      {items.map((s, i) => (
        <div key={s.code} className="top-item">
          <span className="top-rank">#{i + 1}</span>
          <div className="top-info">
            <span className="top-code" style={{ color: WMA_COLORS[s.wmaId] }}>{s.code}</span>
            <span className="top-place">{s.place}</span>
          </div>
          <div className="top-track">
            <div className="top-fill" style={{ width: `${(s.flow / max) * 100}%`, background: WMA_COLORS[s.wmaId] }} />
          </div>
          <span className="top-val">{s.flow.toFixed(1)}<small> m³/s</small></span>
        </div>
      ))}
    </div>
  )
}

function SpillingPanel({ stations }) {
  const spilling = stations.filter(s => s.spill > 0)
  if (!spilling.length) return null
  return (
    <div className="spilling-panel">
      <div className="spilling-title">
        <span className="spill-pulse" />
        {spilling.length} dam{spilling.length > 1 ? 's' : ''} currently spilling
      </div>
      <div className="spilling-list">
        {spilling.map(s => (
          <div key={s.code} className="spilling-item">
            <span className="spill-code" style={{ color: WMA_COLORS[s.wmaId] }}>{s.code}</span>
            <span className="spill-place">{s.place}</span>
            <span className="spill-val">Cap: {s.flow?.toFixed(1)}%</span>
            <span className="spill-rate">▼ {s.spill.toFixed(2)} m³/s</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StationDetail({ s, onClose }) {
  if (!s) return null
  const meta = FLOW_STATUS[s.flowStatus] || FLOW_STATUS.unknown
  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <div className="detail-bar" style={{ background: meta.color }} />
        <button className="detail-close" onClick={onClose}>✕</button>
        <div className="detail-head">
          <div className="detail-code" style={{ color: meta.color }}>{s.code}</div>
          <div className="detail-place">{s.place}</div>
          <FlowBadge status={s.flowStatus} />
        </div>
        <div className="detail-rows">
          {[
            ['Type',     s.isDam ? '🏞 Dam / Reservoir' : '🌊 River Gauge'],
            ['WMA',      `${s.wmaId} – ${s.wmaLabel || ''}`],
            ['Stage',    s.stage != null ? `${s.stage.toFixed(3)} m` : '—'],
            [s.isDam ? 'Capacity' : 'Flow',
             s.flow != null ? (s.isDam ? `${s.flow.toFixed(1)} %` : `${s.flow.toFixed(3)} m³/s`) : '—'],
            s.spill > 0  ? ['Spill', `${s.spill.toFixed(2)} m³/s`] : null,
            ['Reading',  s.datetime || '—'],
            s.comment    ? ['Note', s.comment] : null,
            s.lat != null ? ['Location', `${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}`] : null,
          ].filter(Boolean).map(([lbl, val]) => (
            <div key={lbl} className="detail-row">
              <span className="detail-lbl">{lbl}</span>
              <span className="detail-val">{val}</span>
            </div>
          ))}
        </div>
        {s.graphUrl && (
          <a className="detail-link" href={s.graphUrl} target="_blank" rel="noopener noreferrer">
            View DWS Flow Graph ↗
          </a>
        )}
      </div>
    </div>
  )
}

function AutoRefreshCountdown({ nextRefreshAt }) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const tick = () => setSecs(Math.max(0, Math.round((nextRefreshAt - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [nextRefreshAt])
  const m = Math.floor(secs / 60), s = secs % 60
  return <span className="countdown" title="Next auto-refresh">⟳ {m}:{String(s).padStart(2, '0')}</span>
}

export default function App() {
  const { alerts, dismiss, dismissAll, sseStatus, lastUpdate } = useAlerts()
  const { wmas, stations, summary, loading, error, fetchedAt, reload } = useData(lastUpdate)

  const [view, setView]           = useState('table')
  const [activeWma, setActiveWma] = useState('ALL')
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState('flow')
  const [sortDir, setSortDir]     = useState(-1)
  const [selected, setSelected]   = useState(null)
  const [showDams, setShowDams]   = useState(true)
  const [showRivers, setShowRivers] = useState(true)

  const nextRefresh = fetchedAt ? new Date(fetchedAt.getTime() + 15 * 60 * 1000) : null

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const filtered = stations
    .filter(s => activeWma === 'ALL' || s.wmaId === activeWma)
    .filter(s => (showDams || !s.isDam) && (showRivers || s.isDam))
    .filter(s => !search || s.code.toLowerCase().includes(search.toLowerCase()) || s.place.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortBy] ?? (sortDir === -1 ? -Infinity : Infinity)
      const bv = b[sortBy] ?? (sortDir === -1 ? -Infinity : Infinity)
      return typeof av === 'string' ? sortDir * av.localeCompare(bv) : sortDir * (av - bv)
    })

  const toggleSort = col => {
    if (sortBy === col) setSortDir(d => -d)
    else { setSortBy(col); setSortDir(-1) }
  }

  const Th = ({ col, label }) => (
    <th onClick={() => toggleSort(col)} className="sortable">
      {label} <span className="sort-arrow">{sortBy === col ? (sortDir === -1 ? '↓' : '↑') : '⇅'}</span>
    </th>
  )

  const spillingStations = stations.filter(s => s.spill > 0)

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="brand-mark">〰</div>
          <div>
            <div className="brand-name">WRO StreamFlow <span>SA</span></div>
            <div className="brand-sub">Real-time river &amp; dam monitoring · DWS South Africa</div>
          </div>
        </div>

        <div className="header-center">
          <div className="view-toggle">
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>
              ☰ Table
            </button>
            <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
              ◉ Map
            </button>
          </div>
        </div>

        <div className="header-right">
          {nextRefresh && <AutoRefreshCountdown nextRefreshAt={nextRefresh} />}
          {fetchedAt && <div className="last-update">↺ {fetchedAt.toLocaleTimeString()}</div>}
          <AlertsPanel alerts={alerts} onDismiss={dismiss} onDismissAll={dismissAll} sseStatus={sseStatus} />
          <button className="btn-refresh" onClick={reload} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      {error && <div className="error-bar">⚠ {error} — DWS may be unreachable</div>}

      {loading && !stations.length ? (
        <div className="loading">
          <div className="loading-anim">〰〰〰</div>
          <p>Fetching live data from DWS…</p>
          <p className="loading-sub">Scraping all 6 Water Management Areas</p>
        </div>
      ) : (
        <main className="main">
          {summary && (
            <div className="stats-row">
              <StatCard label="Total Stations"    value={summary.totalStations}      color="#1a6fdb" />
              <StatCard label="River Gauges"      value={summary.riverStations}      color="#0f9b6e" />
              <StatCard label="Dam Stations"      value={summary.damStations}        color="#c47d00" />
              <StatCard label="Dams Spilling"     value={summary.spillingDams}       color="#c8293a"
                pulse={summary.spillingDams > 0}
                sub={summary.spillingDams > 0 ? 'Active overflow' : 'None currently'} />
              <StatCard label="Avg Dam Capacity"  value={summary.avgDamCapacity}     color="#5b4fcf" unit="%" />
              <StatCard label="Mapped Stations"   value={summary.stationsWithCoords} color="#0d8a7a" sub="With coordinates" />
            </div>
          )}

          {spillingStations.length > 0 && <SpillingPanel stations={spillingStations} />}

          <div className="charts-row">
            <WMASummaryChart stations={stations} />
            {summary?.topFlowStations && <TopFlowList items={summary.topFlowStations} />}
          </div>

          <div className="wma-tabs">
            {[{ id: 'ALL', label: 'All Areas' }, ...wmas].map(w => (
              <button key={w.id}
                className={`wma-tab ${activeWma === w.id ? 'active' : ''}`}
                style={activeWma === w.id && w.id !== 'ALL'
                  ? { borderColor: WMA_COLORS[w.id] + '66', color: WMA_COLORS[w.id], background: WMA_COLORS[w.id] + '12' }
                  : {}}
                onClick={() => setActiveWma(w.id)}
              >
                {w.id !== 'ALL' && <span className="dot" style={{ background: WMA_COLORS[w.id] }} />}
                {w.id === 'ALL' ? 'All Areas' : `${w.id} · ${w.label}`}
                {w.id !== 'ALL' && (
                  <span className="tab-count">{stations.filter(s => s.wmaId === w.id).length}</span>
                )}
              </button>
            ))}
          </div>

          {view === 'map' && (
            <div className="map-container">
              <Suspense fallback={<div className="map-loading">Loading map…</div>}>
                <MapView stations={stations} activeWma={activeWma} onStationClick={setSelected} />
              </Suspense>
              <div className="map-legend">
                <div className="legend-title">Status</div>
                {['spilling','high','normal','low','flowing','dry'].map(s => (
                  <div key={s} className="legend-item">
                    <span className="legend-dot" style={{ background: FLOW_STATUS[s].color }} />
                    {FLOW_STATUS[s].label}
                  </div>
                ))}
                <div className="legend-sep" />
                <div className="legend-item"><span className="legend-dot" style={{ background: '#888' }} />River ●</div>
                <div className="legend-item"><span className="legend-square" style={{ background: '#888' }} />Dam ■</div>
              </div>
            </div>
          )}

          {view === 'table' && (
            <>
              <div className="controls">
                <input className="search" type="text" placeholder="Search station code or location…"
                  value={search} onChange={e => setSearch(e.target.value)} />
                <div className="toggles">
                  <button className={`toggle ${showRivers ? 'on' : ''}`} onClick={() => setShowRivers(v => !v)}>
                    🌊 Rivers {showRivers ? '✓' : ''}
                  </button>
                  <button className={`toggle ${showDams ? 'on' : ''}`} onClick={() => setShowDams(v => !v)}>
                    🏞 Dams {showDams ? '✓' : ''}
                  </button>
                </div>
                <div className="count">{filtered.length} of {stations.filter(s => activeWma === 'ALL' || s.wmaId === activeWma).length} stations</div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <Th col="code"     label="Station" />
                      <Th col="place"    label="Location" />
                      <th>WMA</th>
                      <th>Type</th>
                      <Th col="stage"    label="Stage (m)" />
                      <Th col="flow"     label="Flow / Cap" />
                      <th>Spill</th>
                      <th>Status</th>
                      <Th col="datetime" label="Reading" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.code}
                        className={`row ${selected?.code === s.code ? 'sel' : ''} ${s.isStale ? 'stale' : ''} ${s.spill > 0 ? 'spilling-row' : ''}`}
                        onClick={() => setSelected(s)}
                      >
                        <td><code className="stn-code" style={{ color: WMA_COLORS[s.wmaId] }}>{s.code}</code></td>
                        <td className="place">{s.place}</td>
                        <td><span className="dot" style={{ background: WMA_COLORS[s.wmaId] }} /><span className="wma-id">{s.wmaId}</span></td>
                        <td><span style={{ fontSize: 14 }}>{s.isDam ? '🏞' : '🌊'}</span></td>
                        <td className="num">{s.stage != null ? s.stage.toFixed(3) : '—'}</td>
                        <td className="num bold">{s.flow != null ? (s.isDam ? `${s.flow.toFixed(1)}%` : s.flow.toFixed(2)) : '—'}</td>
                        <td>{s.spill > 0 && <span className="spill">▼ {s.spill.toFixed(1)}</span>}</td>
                        <td><FlowBadge status={s.flowStatus} /></td>
                        <td className="time">{s.datetime?.split(' ')[0] || '—'}</td>
                      </tr>
                    ))}
                    {!filtered.length && <tr><td colSpan={9} className="empty">No stations match your filter</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      )}

      {selected && <StationDetail s={selected} onClose={() => setSelected(null)} />}

      <footer className="footer">
        Data: Department of Water and Sanitation (DWS) · Unverified real-time · For reference only ·
        {' '}{sseStatus === 'connected' ? '● Live stream active' : '○ Reconnecting…'}
      </footer>
    </div>
  )
}
