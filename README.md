# StreamFlow SA — Real-time River & Dam Dashboard

Full-stack dashboard scraping live data from DWS South Africa with:
- 🗺  Interactive map of gauging stations across SA
- ⚡  Auto-refresh every 15 min with live SSE push
- 🔔  Spill alerts with browser notifications
- 📊  National summary stats + WMA breakdown charts
- 🔍  Search, filter, sort across all 300+ stations

## Quick Start

```bash
unzip streamflow-dashboard.zip && cd streamflow

# 1. Install server deps
npm install

# 2. Build the frontend
cd client && npm install && npm run build && cd ..

# 3. Start
npm start
# → http://localhost:3737
```

## Features

| Feature | Detail |
|---------|--------|
| **Map view** | Leaflet dark map, markers sized/coloured by flow status. Click any pin for detail. |
| **Table view** | Sortable, searchable, filterable. Spilling rows highlighted. |
| **Auto-refresh** | Server fetches DWS every 15 min. Countdown timer in header. |
| **SSE live push** | Browser connected via `/api/events`. No polling needed. |
| **Spill alerts** | Toast notification + browser push when a dam starts/stops spilling. |
| **WMA filter** | Tab-switch between 6 Water Management Areas or view all. |
| **Station detail** | Click any row/marker: full detail panel + link to DWS flow graph. |

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/wmas` | 6 WMAs with bounds + center coords |
| `GET /api/stations` | All stations across all WMAs |
| `GET /api/stations?wma=WMA4` | Single WMA |
| `GET /api/summary` | Stats, top flows, spilling list |
| `GET /api/map` | Map-optimised payload (coord-bearing stations only) |
| `GET /api/events` | SSE stream: `connected`, `data-updated`, `spill-alert`, `spill-cleared` |
| `POST /api/refresh` | Force immediate re-scrape |

## Station Coordinates

~120 major stations have embedded lat/lng in `server/stationCoords.js`.
Stations without coordinates appear in the table only (not the map).
To add more, look up the station code in the DWS catalogue and add to that file.

## Data Notes

- Source: `dws.gov.za/hydrology/Unverified` (real-time, unaudited)
- Coverage: ~300 stations across 6 WMAs
- Update cadence: Hourly at source, 15-min cache server-side
- Verified/historical data portal is currently down (May 2026)
