import { useState, useEffect, useCallback } from 'react'

export function useAlerts() {
  const [alerts, setAlerts]         = useState([])
  const [sseStatus, setSseStatus]   = useState('connecting')
  const [lastUpdate, setLastUpdate] = useState(null)

  const dismiss = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const dismissAll = useCallback(() => setAlerts([]), [])

  useEffect(() => {
    let es
    let reconnectTimer

    function connect() {
      es = new EventSource('/api/events')

      es.addEventListener('connected', () => {
        setSseStatus('connected')
      })

      es.addEventListener('data-updated', (e) => {
        const data = JSON.parse(e.data)
        setLastUpdate(new Date(data.fetchedAt))
      })

      es.addEventListener('spill-alert', (e) => {
        const data = JSON.parse(e.data)
        const alert = {
          id:        Date.now() + Math.random(),
          type:      'spill',
          title:     `⚠ ${data.stations.length} dam${data.stations.length > 1 ? 's' : ''} now spilling`,
          stations:  data.stations,
          timestamp: new Date(data.timestamp),
          dismissed: false,
        }
        setAlerts(prev => [alert, ...prev].slice(0, 20))

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('StreamFlow SA — Spill Alert', {
            body: data.stations.map(s => `${s.code} ${s.place}: ${s.spill.toFixed(2)} m³/s`).join('\n'),
            icon: '/favicon.ico',
          })
        }
      })

      es.addEventListener('spill-cleared', (e) => {
        const data = JSON.parse(e.data)
        setAlerts(prev => [...prev, {
          id:        Date.now() + Math.random(),
          type:      'cleared',
          title:     `✓ Spill cleared: ${data.codes.join(', ')}`,
          stations:  [],
          timestamp: new Date(data.timestamp),
        }].slice(0, 20))
      })

      es.onerror = () => {
        setSseStatus('reconnecting')
        es.close()
        reconnectTimer = setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimer)
      es?.close()
    }
  }, [])

  return { alerts, dismiss, dismissAll, sseStatus, lastUpdate }
}

const TYPE_STYLES = {
  spill:   { border: '#e84d6f', bg: 'rgba(232,77,111,0.08)', icon: '⚠' },
  cleared: { border: '#3ecf8e', bg: 'rgba(62,207,142,0.08)',  icon: '✓' },
  info:    { border: '#0099e6', bg: 'rgba(0,153,230,0.08)',   icon: 'ℹ' },
}

export function AlertToasts({ alerts, onDismiss, onDismissAll }) {
  if (!alerts.length) return null

  return (
    <div className="alert-stack">
      {alerts.length > 1 && (
        <button className="alert-clear-all" onClick={onDismissAll}>
          Clear all ({alerts.length})
        </button>
      )}
      {alerts.slice(0, 5).map(a => {
        const style = TYPE_STYLES[a.type] || TYPE_STYLES.info
        return (
          <div
            key={a.id}
            className="alert-toast"
            style={{ borderLeft: `3px solid ${style.border}`, background: style.bg }}
          >
            <div className="alert-head">
              <span className="alert-title">{a.title}</span>
              <button className="alert-close" onClick={() => onDismiss(a.id)}>✕</button>
            </div>
            {a.stations?.length > 0 && (
              <div className="alert-body">
                {a.stations.map(s => (
                  <div key={s.code} className="alert-station">
                    <span className="alert-code">{s.code}</span>
                    <span className="alert-place">{s.place}</span>
                    <span className="alert-spill">{s.spill?.toFixed(2)} m³/s</span>
                  </div>
                ))}
              </div>
            )}
            <div className="alert-time">{a.timestamp.toLocaleTimeString()}</div>
          </div>
        )
      })}
    </div>
  )
}

export function AlertsBell({ alerts, sseStatus }) {
  const count = alerts.filter(a => a.type === 'spill').length
  const statusColor = sseStatus === 'connected' ? '#3ecf8e' : sseStatus === 'reconnecting' ? '#f7a325' : '#666'

  return (
    <div className="alerts-bell" title={`SSE: ${sseStatus}`}>
      <span className="bell-icon">🔔</span>
      {count > 0 && <span className="bell-badge">{count}</span>}
      <span className="sse-dot" style={{ background: statusColor }} title={`Stream: ${sseStatus}`} />
    </div>
  )
}

export function AlertsPanel({ alerts, onDismiss, onDismissAll, sseStatus }) {
  const [open, setOpen] = useState(false)
  const spillAlerts = alerts.filter(a => a.type === 'spill')

  return (
    <>
      <button
        className={`alerts-btn ${spillAlerts.length > 0 ? 'has-alerts' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="Spill Alerts"
      >
        🔔
        {spillAlerts.length > 0 && <span className="alerts-count">{spillAlerts.length}</span>}
        <span
          className="sse-indicator"
          title={`Live stream: ${sseStatus}`}
          style={{ background: sseStatus === 'connected' ? '#3ecf8e' : sseStatus === 'reconnecting' ? '#f7a325' : '#555' }}
        />
      </button>

      {open && (
        <div className="alerts-dropdown">
          <div className="alerts-header">
            <span>Spill Alerts</span>
            {alerts.length > 0 && (
              <button className="alerts-clear" onClick={onDismissAll}>Clear all</button>
            )}
          </div>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="alerts-empty">No active alerts</div>
            ) : (
              alerts.slice(0, 10).map(a => {
                const style = TYPE_STYLES[a.type] || TYPE_STYLES.info
                return (
                  <div key={a.id} className="alert-item" style={{ borderLeft: `2px solid ${style.border}` }}>
                    <div className="alert-item-head">
                      <span style={{ color: style.border }}>{a.title}</span>
                      <button onClick={() => onDismiss(a.id)}>✕</button>
                    </div>
                    {a.stations?.map(s => (
                      <div key={s.code} className="alert-item-station">
                        <code>{s.code}</code> {s.place} — {s.spill?.toFixed(2)} m³/s
                      </div>
                    ))}
                    <div className="alert-item-time">{a.timestamp.toLocaleTimeString()}</div>
                  </div>
                )
              })
            )}
          </div>
          <div className="alerts-footer">
            <span className="sse-status" style={{ color: sseStatus === 'connected' ? '#3ecf8e' : '#f7a325' }}>
              ● {sseStatus === 'connected' ? 'Live stream active' : 'Reconnecting…'}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
