# FleetPulse — Product Requirements Document
### Real-Time Fleet Tracking Dashboard · Prototype v1.0 (Design-Enhanced)
**Prepared:** April 2026 | **Updated:** April 2026 (Design Inspiration Applied)
**Stack:** React TS · Supabase Realtime · Leaflet + CartoDB Positron · Zustand · Tailwind CSS v4
**Deployment:** Vercel + Supabase

---

## Changelog — v1.0 → v1.1 (Design Update)

| Section | Change |
|---|---|
| Map Markers | Added toggle: Color-coded SVG truck marker ↔ Driver photo marker |
| Trail | Added 30-minute timestamp labels on all truck trails |
| Timeline Feature | New: 30-minute location timeline with reverse geocoded landmark names in detail panel |
| Truck Cards | New: Left sidebar as card grid with color-coded SVG truck illustrations |
| Map View Mode | New: Fleet Overview ↔ Individual Tracking toggle, on-map |
| Individual Tracking | New: Follow-cam mode — map locks onto one truck, hides all others |
| Filters | New: Filter chips — by status, cargo type, route, driver name |
| Driver Contact | Revised: "Call Driver" opens contact pop-up (no in-app chat) |
| Trip History | New: Collapsible "Last Trips" block inside truck detail panel |
| Map Tile | Revised: CartoDB Positron (minimal light tile) for light-mode dashboard |
| Removed | Truck capacity %, cargo photo reports, ETA, change route, document/billing tabs |

---

## 1. Executive Summary

FleetPulse is a real-time fleet tracking dashboard built for a single industrial client to monitor 20 trucks simultaneously. The system has two surfaces: a **driver-facing mobile web app** (GPS broadcast interface) and an **admin dashboard** (fleet monitoring interface).

Location data is captured via browser Geolocation API on the driver's phone, pushed to Supabase every 5 seconds via Supabase Realtime WebSockets, and rendered live on a Leaflet map with a CartoDB Positron (clean white) tile layer. Each truck has a unique system-assigned color. The admin can toggle between **Fleet Overview** (all 20 trucks simultaneously) and **Individual Tracking** (focus on one truck with follow-cam). Truck cards in the left sidebar show color-coded SVG heavy truck illustrations with live timers. Each truck's trail shows 30-minute timestamp markers. Hovering on a driver photo marker reveals a driver detail card. The detail panel includes a vertical 30-minute location timeline with reverse geocoded landmark names, a collapsible last-trips history block, and a click-to-call driver contact pop-up.

---

## 2. Project Context

| Attribute | Value |
|---|---|
| Client Type | Single industrial company |
| Number of Trucks | 20 |
| Tracking Method (Prototype) | Driver's phone browser GPS |
| Tracking Method (Production) | Dedicated GPS hardware (future) |
| Map Provider | Leaflet.js + CartoDB Positron tiles (OpenStreetMap data) |
| Reverse Geocoding | Nominatim (OpenStreetMap) — free, no API key required |
| Realtime Layer | Supabase Realtime (WebSockets) |
| Location Update Interval | Every 5 seconds |
| Timeline Interval | Every 30 minutes |
| Language | English |
| Timezone | Indian Standard Time (IST / UTC+5:30) |
| Distance Unit | Kilometres |
| Design Mode | Light mode (primary) |
| Map Tile Style | CartoDB Positron — minimal, almost-white, clean |

---

## 3. Goals & Success Criteria

### Primary Goals
- Enable the client to see all 20 trucks on a live map with ≤5-second location lag.
- Provide a per-truck detail panel with driver info, 30-minute location timeline, and collapsible trip history.
- Allow seamless toggle between Fleet Overview and Individual Tracking (follow-cam) mode.
- Store and replay historical routes for up to 7 days, color-coded per truck.
- Allow admin users to configure alerts and filter trucks without developer intervention.

### Success Criteria (Prototype)
- All 20 truck cards and map markers are visible simultaneously in Fleet Overview.
- Individual Tracking mode locks the map onto one truck and follows it in real time.
- 30-minute timeline landmarks are correctly reverse geocoded and legible in the detail panel.
- Trails render with 30-minute timestamp markers on the polyline.
- Driver contact pop-up opens with correct details when "Call Driver" is tapped.
- Filter chips correctly reduce visible trucks in the sidebar and on the map.
- Daily distance resets at IST midnight with zero manual intervention.
- Historical route paths for the past 7 days are retrievable and rendered correctly.
- Authentication works end-to-end with the pre-built OTP flow.
- Dashboard loads in under 3 seconds on a standard broadband connection.

---

## 4. User Roles & Personas

### 4.1 Admin (Fleet Manager)
**Who:** Operations manager or supervisor at the industrial company.
**Access:** Full dashboard, driver management, alert configuration, historical data, filter controls.
**Key needs:** At-a-glance fleet status, individual truck deep-dive, driver contact access, alert management.

### 4.2 Driver
**Who:** Truck driver with a smartphone.
**Access:** Mobile tracking page only (`/track/:truckToken`). No dashboard access.
**Key needs:** Minimal friction — one tap to start broadcasting location. Clear GPS status indicator.

### 4.3 Super Admin (Developer / System Owner)
**Who:** Developer/product owner.
**Access:** All admin capabilities plus truck/driver record management and system configuration.
**Key needs:** Add/edit/remove trucks and drivers, manage the 20-color assignment, regenerate tracking tokens.

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       DRIVER'S PHONE                            │
│  Mobile Web App — /track/:truckToken                            │
│  → Requests browser Geolocation API permission                  │
│  → watchPosition (high accuracy) every 5 seconds               │
│  → Upserts row into location_pings via Supabase client          │
│  → Updates truck status (moving/idle/offline)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS + Supabase SDK
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
│  PostgreSQL DB              Realtime (WebSocket pub/sub)        │
│  ├── trucks                 ├── channel: location_pings         │
│  ├── drivers                └── broadcasts INSERT events        │
│  ├── location_pings                                             │
│  ├── timeline_snapshots     Edge Functions (pg_cron)            │
│  ├── daily_distance         ├── IST midnight distance reset     │
│  └── alerts / alert_events  └── 30-min timeline snapshot writer │
└────────────────────────┬────────────────────────────────────────┘
                         │ Supabase Realtime subscription
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                              │
│  React TS + Leaflet.js + Zustand                                │
│  ├── Supabase Realtime → updates Zustand truck location store   │
│  ├── Nominatim reverse geocoder → resolves 30-min snapshots     │
│  ├── Fleet Overview mode: 20 truck cards + full map             │
│  ├── Individual Tracking mode: single truck follow-cam          │
│  ├── Colored polyline trails with 30-min timestamp markers      │
│  └── Computes daily distance, evaluates alert conditions        │
└─────────────────────────────────────────────────────────────────┘
```

> **WebSocket Strategy:** Supabase Realtime handles the WebSocket layer natively. No separate Socket.IO server is required. The driver app writes directly to `location_pings`. Supabase broadcasts `INSERT` events to all subscribed dashboard clients in real time. The stack remains fully serverless and Vercel-deployable.

> **Reverse Geocoding Strategy:** Nominatim (OpenStreetMap's free geocoding API) is used to reverse geocode the 30-minute snapshot coordinates into human-readable landmark/area names. Nominatim is rate-limited to 1 request/second — the Supabase Edge Function that writes 30-minute snapshots handles the geocoding server-side to avoid client-side rate limit issues and cache results in `timeline_snapshots`.

---

## 6. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend (Dashboard) | React 18 + TypeScript | Requested |
| Frontend (Driver App) | React 18 + TypeScript (same repo, `/track` route) | Unified codebase |
| Map Library | Leaflet.js + React-Leaflet | OpenStreetMap, free, no API key |
| Map Tile | CartoDB Positron | Minimal white/gray aesthetic, matches light mode dashboard |
| Reverse Geocoding | Nominatim (OpenStreetMap) | Free, no API key, server-side via Edge Function |
| Realtime / WebSocket | Supabase Realtime | Native WebSocket, no extra server |
| Database | Supabase (PostgreSQL) | Requested — handles auth, storage, realtime |
| Authentication | Supabase Auth + OTP (pre-built) | Pre-existing implementation |
| State Management | Zustand | Lightweight, ideal for live position state + view mode toggle |
| Styling | Tailwind CSS v4 | Rapid professional UI |
| Charts / Sparklines | Recharts | Clean, TypeScript-friendly |
| Icons | Lucide React | Consistent, minimal icon set |
| Deployment | Vercel (frontend) + Supabase (backend/DB) | Requested |
| CI/CD | Vercel GitHub integration | Zero-config deploys on push |

---

## 7. Data Models

### 7.1 `trucks`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
truck_number    TEXT NOT NULL UNIQUE        -- e.g. "TRK-001"
number_plate    TEXT NOT NULL UNIQUE        -- e.g. "KA-01-AB-1234"
color_hex       TEXT NOT NULL               -- System-assigned, e.g. "#E63946"
color_name      TEXT NOT NULL               -- e.g. "Crimson"
status          TEXT DEFAULT 'offline'      -- moving | idle | parked | offline
cargo_type      TEXT
assigned_route  TEXT
driver_id       UUID REFERENCES drivers(id)
tracking_token  UUID DEFAULT gen_random_uuid() UNIQUE  -- URL token for driver app
created_at      TIMESTAMPTZ DEFAULT now()
```

### 7.2 `drivers`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
full_name       TEXT NOT NULL
phone_number    TEXT NOT NULL UNIQUE
licence_number  TEXT NOT NULL UNIQUE
photo_url       TEXT                        -- Supabase Storage URL
created_at      TIMESTAMPTZ DEFAULT now()
```

### 7.3 `location_pings`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
truck_id        UUID REFERENCES trucks(id) NOT NULL
latitude        DOUBLE PRECISION NOT NULL
longitude       DOUBLE PRECISION NOT NULL
speed_kmh       DOUBLE PRECISION            -- From GPS if available
accuracy_m      DOUBLE PRECISION            -- GPS accuracy in metres
recorded_at     TIMESTAMPTZ DEFAULT now()
```
> **Retention:** Pings older than 7 days purged via pg_cron to control DB size.

### 7.4 `timeline_snapshots`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
truck_id        UUID REFERENCES trucks(id) NOT NULL
latitude        DOUBLE PRECISION NOT NULL
longitude       DOUBLE PRECISION NOT NULL
landmark_name   TEXT                        -- Reverse geocoded via Nominatim
snapshot_time   TIMESTAMPTZ NOT NULL        -- IST 30-min boundary (e.g. 10:00, 10:30, 11:00)
date_ist        DATE NOT NULL
```
> **How it works:** A Supabase pg_cron job fires every 30 minutes (IST), picks the most recent `location_ping` for each active truck, calls Nominatim to resolve the coordinates to a landmark name, and writes a row to `timeline_snapshots`. This is what populates the 30-minute timeline in the detail panel.

### 7.5 `daily_distance`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
truck_id        UUID REFERENCES trucks(id) NOT NULL
date_ist        DATE NOT NULL
total_km        DOUBLE PRECISION DEFAULT 0
last_updated_at TIMESTAMPTZ DEFAULT now()
UNIQUE (truck_id, date_ist)
```

### 7.6 `alerts`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            TEXT NOT NULL
type            TEXT NOT NULL               -- idle_timeout | offline_timeout | speeding
threshold_value DOUBLE PRECISION            -- minutes or km/h depending on type
is_active       BOOLEAN DEFAULT true
created_by      UUID REFERENCES auth.users(id)
created_at      TIMESTAMPTZ DEFAULT now()
```

### 7.7 `alert_events`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
alert_id        UUID REFERENCES alerts(id)
truck_id        UUID REFERENCES trucks(id)
triggered_at    TIMESTAMPTZ DEFAULT now()
resolved_at     TIMESTAMPTZ
message         TEXT
is_read         BOOLEAN DEFAULT false
```

---

## 8. Feature Requirements

---

### 8.1 Authentication

| ID | Requirement |
|---|---|
| AUTH-01 | Login page with phone number + OTP flow (pre-built integration). |
| AUTH-02 | On successful login, redirect to Fleet Overview dashboard. |
| AUTH-03 | Protected routes — unauthenticated users redirected to `/login`. |
| AUTH-04 | Session persists across browser refreshes via Supabase session tokens. |
| AUTH-05 | Driver tracking page at `/track/:truckToken` is publicly accessible — authenticated by unique per-truck UUID token only. No login required. |

---

### 8.2 Driver Mobile App (Tracking Page)

| ID | Requirement |
|---|---|
| DRV-01 | Accessible at `/track/:truckToken`. Unique per-truck URL generated from the Fleet Management screen. |
| DRV-02 | On load, request `navigator.geolocation` permission. Show a friendly, clear prompt explaining why location is needed. |
| DRV-03 | If permission denied, display an error screen with step-by-step instructions for enabling location on Android/iOS. |
| DRV-04 | On permission granted, display a minimal UI: truck number, driver name, a green pulsing "Live" badge, current GPS accuracy, and a "Stop Tracking" button. |
| DRV-05 | Poll `navigator.geolocation.watchPosition` (high accuracy) and insert into `location_pings` every 5 seconds via Supabase client. |
| DRV-06 | If GPS signal is lost, stop inserting, display a "GPS signal lost" warning, and retry when signal recovers. |
| DRV-07 | When the driver stops tracking or closes the tab, update truck `status` to `offline`. |
| DRV-08 | Fully responsive — optimized for 375px+ mobile. Dark-mode friendly for nighttime drivers. |

---

### 8.3 Live Map — Core Feature

| ID | Requirement |
|---|---|
| MAP-01 | Full-screen or dominant-area Leaflet map using **CartoDB Positron** tiles (clean minimal white-gray). |
| MAP-02 | **Default Marker Style — Color-Coded SVG Truck:** Each truck rendered as a custom SVG marker shaped like the heavy articulated truck model from the inspiration image. The SVG is filled with the truck's assigned color. Truck number is displayed below the marker. |
| MAP-03 | **Alternate Marker Style — Driver Photo:** Admin can toggle to show the driver's circular profile photo as the map marker. A colored ring (truck's assigned color) borders the photo to maintain identity. |
| MAP-04 | **Marker Style Toggle:** A pill toggle control floated on the top-left or top-right of the map reads "🚛 Truck / 👤 Driver." Switching it updates all markers simultaneously without reload. Selection persists in Zustand state for the session. |
| MAP-05 | **Hover Interaction — Driver Photo Marker:** When hovering on a driver photo marker, a floating card appears showing: driver photo (large), driver name, truck number, status badge, current speed, and today's distance. |
| MAP-06 | **Hover Interaction — SVG Truck Marker:** Hovering shows a tooltip with truck number, number plate, and status badge. |
| MAP-07 | **Click Interaction:** Clicking any marker (either style) opens the Truck Detail Panel (right-side slide-over) and centers the map on that truck. |
| MAP-08 | Markers update in real time (≤5-second lag) via Supabase Realtime subscription on `location_pings`. No page refresh needed. |
| MAP-09 | **Breadcrumb Trail:** Each truck's path is drawn as a colored polyline in its assigned color. The trail for the current day grows as new pings arrive. Trail opacity from the distant past to the present increases so the most recent path is brightest. |
| MAP-10 | **30-Minute Timestamp Markers on Trail:** At every 30-minute interval, a small pill-shaped label (e.g., "10:30 AM") is placed on the trail polyline. These align with `timeline_snapshots`. |
| MAP-11 | Offline trucks (no ping in last 2 minutes) have their marker desaturated to gray. Their trail remains visible at reduced opacity. |
| MAP-12 | A **"Fit All" button** (bottom-right of map) resets the viewport to show all active trucks. |
| MAP-13 | A **map legend** (collapsible, bottom-left) shows all 20 trucks with their color swatch, truck number, and live status dot. |

---

### 8.4 View Mode — Fleet Overview vs. Individual Tracking

| ID | Requirement |
|---|---|
| VIEW-01 | Two view modes: **Fleet Overview** (default) and **Individual Tracking**. |
| VIEW-02 | **Toggle control** is positioned on the map, top-center or top-right, as a tab/pill: `Fleet Overview | Individual Tracking`. |
| VIEW-03 | **Fleet Overview mode:** All 20 trucks are visible on the map simultaneously. The left sidebar shows all 20 truck cards. The Truck Detail Panel opens as a right-side slide-over when a truck is clicked — the map remains visible behind it. |
| VIEW-04 | **Individual Tracking mode:** Entering this mode requires selecting a truck (from sidebar, marker click, or search). Once selected: (a) all other truck markers and trails are hidden; (b) the map zooms into the selected truck; (c) the map follows ("camera-locks") the truck's live position as it moves; (d) the full Truck Detail Panel occupies the right panel in a wider, persistent layout; (e) the left sidebar collapses to show only the selected truck card plus a "Back to Fleet" button. |
| VIEW-05 | **Switching trucks in Individual mode:** A minimal dropdown or search box in the collapsed sidebar allows switching to a different truck without exiting Individual mode. |
| VIEW-06 | **"Back to Fleet" button** in Individual mode returns to Fleet Overview, resets the map viewport to show all trucks. |
| VIEW-07 | The current view mode and selected truck ID are stored in Zustand. On browser refresh, the default view is always Fleet Overview. |

---

### 8.5 Truck Card Sidebar (Fleet Overview)

| ID | Requirement |
|---|---|
| CARD-01 | Left sidebar is a scrollable grid/list of 20 truck cards, one per truck. |
| CARD-02 | Each card contains: (a) **Color-coded SVG heavy truck illustration** — same model as inspiration image, filled/tinted with the truck's assigned color; (b) **Truck number** (large, bold); (c) **Status badge** (Moving / Idle / Parked / Offline) in color; (d) **Elapsed live timer** — e.g., "01:38:47" showing hours:minutes:seconds since last status change; (e) **Number plate** in small muted text; (f) **Today's distance** in km. |
| CARD-03 | The currently selected/active truck card has a colored border (its assigned color) and a slightly elevated surface to indicate selection. |
| CARD-04 | Cards are sorted by status priority: Moving first, then Idle, then Parked, then Offline. Within each group, sorted by truck number. |
| CARD-05 | Clicking a card enters Individual Tracking mode for that truck and flies the map to it. |
| CARD-06 | **Filter chips** appear above the card list (see Section 8.6). |

---

### 8.6 Filter System

Filters appear as pill/chip toggles at the top of the left sidebar, above the truck cards.

| ID | Requirement |
|---|---|
| FLT-01 | **Status filter:** Chips for Moving, Idle, Parked, Offline. Selecting one or more shows only matching trucks in the sidebar and highlights only those trucks' markers on the map. Non-matching markers are dimmed (not hidden). |
| FLT-02 | **Cargo Type filter:** Chip for each unique cargo type present in the fleet (e.g., "Heavy Goods", "Fragile", "Bulk"). |
| FLT-03 | **Assigned Route filter:** Chip for each unique route present (e.g., "Route A", "Bangalore–Mysore"). |
| FLT-04 | **Driver Name search:** A small search input above the chips for free-text search across driver names. |
| FLT-05 | Multiple filters are additive (AND logic): a truck must match all selected filters to be shown. |
| FLT-06 | A **"Clear All Filters"** button appears when any filter is active. |
| FLT-07 | An active filter count badge appears on the filter section header when filters are applied. |
| FLT-08 | Filters apply to both the sidebar card list and the map marker highlighting. They do not remove markers — they dim non-matching ones so context is preserved. |

---

### 8.7 Truck Detail Panel

Triggered by clicking a truck card or map marker. In Fleet Overview, slides in as a right-side panel. In Individual Tracking, it is always open and wider.

#### 8.7.1 Header
| ID | Requirement |
|---|---|
| PNL-01 | Truck number (large), colored status badge, number plate, assigned route in header. |
| PNL-02 | **"Call Driver" button** in the header — clicking opens a centered modal pop-up containing: driver photo, driver name, phone number (large, formatted), and a "Call" button that triggers `tel:` protocol. A "Close" button dismisses the modal. No in-app chat or messaging. |

#### 8.7.2 Driver Card
| ID | Requirement |
|---|---|
| PNL-03 | Circular driver photo, full name, licence number, assigned truck number. |

#### 8.7.3 Live Metrics Strip
| ID | Requirement |
|---|---|
| PNL-04 | Horizontal row of live metric chips: Current Speed (km/h), Today's Distance (km), Last Ping (e.g., "12 sec ago"), Cargo Type. |

#### 8.7.4 30-Minute Location Timeline
This is a primary UI feature inspired by Image 1.

| ID | Requirement |
|---|---|
| TML-01 | A vertical timeline is rendered in the detail panel below the driver card and metrics strip. |
| TML-02 | Timeline shows one entry per 30-minute snapshot from `timeline_snapshots` for the current IST day, in reverse chronological order (most recent at the top). |
| TML-03 | Each timeline entry shows: (a) **Time** — e.g., "10:30 AM"; (b) **Landmark name** — reverse geocoded street/area name, e.g., "NH-48, Nelamangala, Bangalore"; (c) A colored dot in the truck's assigned color as the timeline node. |
| TML-04 | A subtle vertical line connects all timeline nodes. |
| TML-05 | The topmost entry is the most recent snapshot and is highlighted with a pulsing dot to indicate "last known location." |
| TML-06 | Timeline updates automatically when a new 30-minute snapshot is written to Supabase (via Realtime subscription). |
| TML-07 | If fewer than 2 snapshots exist (truck just started), show a placeholder state: "Timeline builds as the truck moves." |
| TML-08 | Maximum 48 entries visible (full 24-hour day in 30-min slots). A "View older" link loads earlier entries within the same day. |

#### 8.7.5 Collapsible Last Trips Block
Inspired by Image 3.

| ID | Requirement |
|---|---|
| TRIP-01 | Below the timeline, a collapsible section labeled **"Last Trips"** is collapsed by default. A chevron icon and entry count (e.g., "Last Trips  5 ›") signals it is expandable. |
| TRIP-02 | On expand, shows up to 7 past trip entries. Each entry shows: (a) Date (e.g., "Yesterday", "Mar 31"); (b) Start landmark → End landmark (reverse geocoded); (c) Total distance (km) for that day; (d) A small colored indicator dot in the truck's assigned color. |
| TRIP-03 | Clicking a trip entry switches the detail panel to "Historical Route View" for that date (Section 8.8). |
| TRIP-04 | A "See All" link at the bottom of the expanded list opens the full trip history in a wider modal. |

---

### 8.8 Historical Route View (7-Day Replay)

| ID | Requirement |
|---|---|
| HIS-01 | Accessible from the "Last Trips" collapsible block in the detail panel, or from a "History" tab within the panel. |
| HIS-02 | A date picker allows selecting any date within the past 7 days (IST). |
| HIS-03 | On date selection, the full route for that truck on that day is drawn on the map as a colored polyline with 30-minute timestamp labels. |
| HIS-04 | Route **start** (▶) and **end** (■) markers are shown at journey endpoints. |
| HIS-05 | A daily distance figure for the selected date is shown next to the date picker. |
| HIS-06 | In Historical View, a banner appears at the top of the map: `"Viewing history — [Truck Number] on [Date]"` with a `"Back to Live"` button. |
| HIS-07 | Multi-truck historical comparison: In Fleet Overview mode, toggling "Compare Routes" allows selecting a date and viewing multiple trucks' historical routes color-coded simultaneously. |

---

### 8.9 Truck Status System

| Status | Trigger Condition |
|---|---|
| **Moving** | Latest ping speed > 2 km/h |
| **Idle** | Speed ≤ 2 km/h AND last ping within 2 minutes |
| **Parked** | No pings for 2–30 minutes |
| **Offline** | No pings for 30+ minutes OR driver stopped tracking |

| ID | Requirement |
|---|---|
| STS-01 | Status computed client-side from latest ping data + elapsed time. |
| STS-02 | Status badges color-coded: Moving = green, Idle = amber, Parked = blue, Offline = gray. |
| STS-03 | Status visible on: map marker tooltip, truck card, detail panel header, timeline top entry. |
| STS-04 | Elapsed timer on the truck card counts up (hh:mm:ss) from the moment the current status began. |

---

### 8.10 KPI Strip

| ID | Requirement |
|---|---|
| KPI-01 | Sticky top bar displays: Total Trucks (20), Active Now, Moving, Idle, Parked, Offline, Total Fleet Distance Today (km). |
| KPI-02 | KPI values update in real time. |
| KPI-03 | Notification bell icon in header shows unread alert count. Clicking opens a dropdown with the last 10 alert events. |

---

### 8.11 Daily Distance Tracking

| ID | Requirement |
|---|---|
| DST-01 | Distance computed by summing Haversine distances between consecutive pings within the same IST calendar day. |
| DST-02 | Distance resets to 0 at IST midnight (00:00 UTC+5:30) via a Supabase pg_cron job. |
| DST-03 | Today's cumulative distance is displayed on the truck card, map popup, and detail panel live metrics strip. |
| DST-04 | A **Fleet Distance Summary** screen shows all 20 trucks in a sortable table: truck number, driver name, today's distance, 7-day total. |

---

### 8.12 Alert System (Admin-Configurable)

| ID | Requirement |
|---|---|
| ALT-01 | Admin can create, edit, enable/disable, and delete alert rules from an Alerts Management screen (`/alerts`). |
| ALT-02 | Alert types: **Truck Idle** (X minutes threshold), **Truck Offline** (X minutes threshold), **Speeding** (X km/h threshold). |
| ALT-03 | Alert conditions evaluated client-side on the dashboard. Server-side evaluation is a Phase 3 enhancement. |
| ALT-04 | On trigger: an `alert_event` row is inserted into Supabase; a toast notification appears on the dashboard; the bell badge increments. |
| ALT-05 | Alert events log accessible in the Alerts screen — shows truck name, alert type, trigger time, and resolved/active status. |
| ALT-06 | Admin can mark alert events as resolved. |

---

### 8.13 Truck & Driver Management

| ID | Requirement |
|---|---|
| MGT-01 | Fleet Management screen (`/fleet`) lists all 20 trucks with assigned drivers. |
| MGT-02 | Admin can edit: number plate, cargo type, assigned route. |
| MGT-03 | Admin can edit driver: name, phone number, licence number, photo upload (Supabase Storage). |
| MGT-04 | Admin can reassign a driver to a different truck. |
| MGT-05 | Truck colors are system-assigned and not editable (visual consistency). |
| MGT-06 | Generating/regenerating the unique driver tracking URL is done from this screen. URL is copyable with one click. |

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Map marker updates render within 500ms of Supabase Realtime event receipt. |
| **Scalability** | Architecture supports 20 simultaneous location streams without UI lag. |
| **Reliability** | Supabase Realtime auto-reconnects on drop. Driver app retries inserts on network failure. |
| **Geocoding Rate** | Nominatim rate limit (1 req/sec) managed server-side in Edge Function. Results cached in `timeline_snapshots`. |
| **Security** | Driver pages token-gated (UUID). Dashboard protected by OTP auth. Supabase RLS on all tables. |
| **Responsiveness** | Dashboard: 1280px+ desktop. Driver app: 375px–768px mobile. |
| **Browser Support** | Chrome 110+, Safari 16+, Edge 110+. Driver app: Chrome for Android, Safari for iOS (GPS required). |
| **Data Privacy** | Location data stored in Supabase only. Pings older than 7 days purged. Mumbai region (`ap-south-1`) recommended. |

---

## 10. System-Assigned Truck Color Palette (20 Colors)

Colors chosen for high contrast against CartoDB Positron's white/light-gray tile layer.

| # | Truck | Color Name | Hex |
|---|---|---|---|
| 1 | TRK-001 | Crimson | #E63946 |
| 2 | TRK-002 | Ocean Blue | #457B9D |
| 3 | TRK-003 | Forest Green | #2D6A4F |
| 4 | TRK-004 | Amber | #D4A017 |
| 5 | TRK-005 | Deep Purple | #7B2D8B |
| 6 | TRK-006 | Tangerine | #F4762A |
| 7 | TRK-007 | Cyan | #0096C7 |
| 8 | TRK-008 | Magenta | #C2185B |
| 9 | TRK-009 | Lime | #558B2F |
| 10 | TRK-010 | Royal Blue | #1565C0 |
| 11 | TRK-011 | Maroon | #9B2226 |
| 12 | TRK-012 | Teal | #00796B |
| 13 | TRK-013 | Indigo | #4527A0 |
| 14 | TRK-014 | Coral | #E64A19 |
| 15 | TRK-015 | Gold | #F9A825 |
| 16 | TRK-016 | Steel Blue | #0277BD |
| 17 | TRK-017 | Brick | #BF360C |
| 18 | TRK-018 | Mint | #00897B |
| 19 | TRK-019 | Slate | #455A64 |
| 20 | TRK-020 | Violet | #6A1B9A |

---

## 11. Screen Inventory

| Screen | Route | Access | Description |
|---|---|---|---|
| Login | `/login` | Public | OTP-based login |
| Fleet Overview | `/` | Admin | Map (all trucks) + card sidebar + KPI strip + filter chips |
| Individual Tracking | `/` (mode toggle) | Admin | Map (one truck, follow-cam) + detail panel |
| Truck Detail Panel | Slide-over on `/` | Admin | Driver card, metrics, 30-min timeline, call modal, last trips |
| Fleet Management | `/fleet` | Admin | Edit trucks and drivers, regenerate tracking URLs |
| Alerts Management | `/alerts` | Admin | CRUD alert rules, alert events log |
| Fleet Distance Summary | `/distance` | Admin | 20-truck sortable distance table |
| Driver Tracking Page | `/track/:token` | Public (token-gated) | Driver's GPS broadcast interface |

---

## 12. UI / UX Design Direction

### Visual Tone
Clean, minimal, professional. Inspired by enterprise fleet tools (Samsara, FleetComplete) and modern data-dense dashboards (Linear, Vercel Analytics). The 20 truck colors are the primary visual language — all other chrome is neutral warm-white/light-gray surfaces with a single teal accent for interactive elements.

### Map Aesthetic
CartoDB Positron tile layer — very clean, muted, almost white. Road labels legible but unobtrusive. Truck markers and colored trails pop against this background. The map is the primary visual hierarchy of the entire dashboard — everything else supports it.

### Truck SVG Illustration
The SVG illustration used on truck cards is a simplified side-profile of a heavy articulated truck (cab + trailer) — matching the style in the inspiration image. The trailer fill is the truck's assigned color. The cab is a neutral dark gray (#2D3436). SVG is the same for all 20 trucks; only the fill color changes.

### Typography
- Body: **Inter** or **DM Sans** (Google Fonts) — high legibility at small sizes for data-dense UI
- Monospace (for timers, distances, coordinates): **JetBrains Mono** or **Geist Mono**
- 3 text levels: primary `#1a1a1a`, muted `#6b7280`, faint `#9ca3af`

### Color Restraint
One accent color (teal `#01696f`) for buttons, focus states, and active selections. All other UI is neutral gray/white. The 20 truck colors appear only in context of truck identity (markers, trails, cards, timeline nodes, status badges).

### Spacing & Density
Dense dashboard — the sidebar and panel must pack a lot of information without feeling cluttered. Cards use compact spacing. The map gets maximum viewport real estate.

### Micro-interactions
- Every live update (new ping received) causes the relevant marker to briefly pulse.
- Status badge transitions (e.g., Moving → Idle) animate with a smooth fade.
- Elapsed timer ticks every second on the truck card.
- 30-minute timeline entries slide in from the top when a new snapshot is added.
- Collapsible "Last Trips" block expands/collapses with a smooth height animation.
- Call Driver modal enters with a fade + subtle scale-up animation.

---

## 13. Component Library (Key Components)

| Component | Description |
|---|---|
| `TruckCard` | Color-coded SVG truck + status badge + timer + distance. Used in sidebar. |
| `MapMarkerTruck` | Custom Leaflet Divicon: SVG heavy truck shape, filled with truck color. |
| `MapMarkerDriver` | Custom Leaflet Divicon: circular driver photo with colored ring. |
| `MarkerToggle` | Pill toggle floating on map: "Truck / Driver" marker style switch. |
| `ViewModeToggle` | Pill toggle on map: "Fleet Overview / Individual Tracking" switch. |
| `TruckDetailPanel` | Right slide-over or persistent panel with all truck detail sections. |
| `LocationTimeline` | Vertical timeline component for 30-min snapshots with landmark names. |
| `LastTripsAccordion` | Collapsible block showing past 7-day trip summaries. |
| `CallDriverModal` | Modal pop-up with driver photo, name, phone, and tel: call button. |
| `FilterChips` | Row of pill chips above sidebar for status/cargo/route/name filtering. |
| `KPIStrip` | Sticky top bar with live fleet stats. |
| `AlertToast` | Toast notification for alert triggers. |

---

## 14. Development Phases

### Phase 1 — Core Prototype (Current Scope)
- [ ] Supabase schema + RLS policies setup
- [ ] Driver tracking mobile page (GPS → Supabase insert every 5s)
- [ ] Supabase Realtime subscription in dashboard
- [ ] CartoDB Positron map with 20 color-coded SVG truck markers
- [ ] Driver photo marker style + marker style toggle
- [ ] Hover card for driver photo markers
- [ ] Colored breadcrumb trails with 30-minute timestamp labels
- [ ] Fleet Overview sidebar with truck cards (SVG illustrations)
- [ ] Fleet Overview ↔ Individual Tracking view mode toggle
- [ ] Individual Tracking follow-cam mode
- [ ] Filter chips (status, cargo, route, driver name)
- [ ] Truck Detail Panel (driver card, metrics strip, call modal)
- [ ] 30-minute location timeline (Nominatim reverse geocoding via Edge Function)
- [ ] Collapsible Last Trips block
- [ ] Daily distance computation + IST midnight reset
- [ ] OTP authentication integration
- [ ] Fleet Management screen (edit trucks/drivers, generate URLs)
- [ ] KPI strip
- [ ] Deployment to Vercel

### Phase 2 — Enhanced Features
- [ ] 7-day historical route replay with date picker
- [ ] Admin-configurable alert system (dashboard-side evaluation)
- [ ] Alert events log screen
- [ ] Fleet Distance Summary screen (sortable table)
- [ ] Multi-truck historical route comparison
- [ ] Email notifications for alerts
- [ ] Dark mode toggle

### Phase 3 — Production Readiness
- [ ] Replace phone GPS with hardware GPS device integration
- [ ] Server-side alert evaluation via Supabase Edge Functions
- [ ] SMS notifications (MSG91 for India)
- [ ] PDF/Excel daily distance reports
- [ ] Role-based access control (super admin / fleet manager / read-only viewer)
- [ ] Supabase Mumbai region migration
- [ ] PWA with offline capability for driver app

---

## 15. Out of Scope (Prototype v1.0)

- Truck capacity / load percentage tracking
- Cargo photo upload by drivers
- In-app chat or messaging
- Geofencing and zone-based alerts
- Turn-by-turn navigation or route optimization
- Fuel tracking or maintenance scheduling
- ERP / logistics system integration
- Multi-company / multi-tenant support
- Native iOS / Android apps
- Change Route from dashboard

---

## 16. Open Questions & Dependencies

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Client's company name and logo for placeholder branding | Client | Pending |
| 2 | Are the 20 truck and driver records pre-seeded by developer, or does admin create them via the dashboard? | Client | Pending |
| 3 | What email address should Phase 2 alert notifications go to? | Client | Phase 2 |
| 4 | Confirm Supabase project region — recommend `ap-south-1` (Mumbai) for IST proximity | Developer | To confirm |
| 5 | Are drivers expected to keep the tracking tab open all day, or only during active trips? | Client | Pending |
| 6 | Should the driver tracking URL be a permanent link per truck, or regenerated per trip? | Client | Pending |
| 7 | Nominatim reverse geocoding returns English names by default — confirm English landmark names are acceptable for the client | Client | Likely yes (confirmed English-only in Q24) |

---

*This is PRD v1.1. Updated with full UI design direction derived from the client-supplied inspiration board (April 2026). Ready for engineering handoff for Phase 1.*

