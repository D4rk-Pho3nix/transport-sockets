-- ============================================================
-- FleetPulse — Complete Supabase Schema + Seed Data
-- Paste this entire file into your Supabase SQL Editor and run
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES (in dependency order)

-- 2a. Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  phone_number    TEXT NOT NULL UNIQUE,
  licence_number  TEXT NOT NULL UNIQUE,
  photo_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2b. Trucks
CREATE TABLE IF NOT EXISTS trucks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_number    TEXT NOT NULL UNIQUE,
  number_plate    TEXT NOT NULL UNIQUE,
  color_hex       TEXT NOT NULL,
  color_name      TEXT NOT NULL,
  status          TEXT DEFAULT 'offline' CHECK (status IN ('moving', 'idle', 'parked', 'offline')),
  cargo_type      TEXT,
  assigned_route  TEXT,
  driver_id       UUID REFERENCES drivers(id),
  tracking_token  UUID DEFAULT gen_random_uuid() UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2c. Location Pings (the real-time GPS data)
CREATE TABLE IF NOT EXISTS location_pings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id        UUID REFERENCES trucks(id) NOT NULL,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  speed_kmh       DOUBLE PRECISION DEFAULT 0,
  accuracy_m      DOUBLE PRECISION,
  recorded_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pings_truck_time ON location_pings(truck_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_pings_recorded_at ON location_pings(recorded_at DESC);

-- 2d. Timeline Snapshots (30-min reverse geocoded snapshots)
CREATE TABLE IF NOT EXISTS timeline_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id        UUID REFERENCES trucks(id) NOT NULL,
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  landmark_name   TEXT,
  snapshot_time   TIMESTAMPTZ NOT NULL,
  date_ist        DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_truck_date ON timeline_snapshots(truck_id, date_ist DESC);

-- 2e. Daily Distance
CREATE TABLE IF NOT EXISTS daily_distance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id        UUID REFERENCES trucks(id) NOT NULL,
  date_ist        DATE NOT NULL,
  total_km        DOUBLE PRECISION DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (truck_id, date_ist)
);

-- 2f. Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('idle_timeout', 'offline_timeout', 'speeding')),
  threshold_value DOUBLE PRECISION,
  is_active       BOOLEAN DEFAULT true,
  created_by      UUID,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2g. Alert Events
CREATE TABLE IF NOT EXISTS alert_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id        UUID REFERENCES alerts(id),
  truck_id        UUID REFERENCES trucks(id),
  triggered_at    TIMESTAMPTZ DEFAULT now(),
  resolved_at     TIMESTAMPTZ,
  message         TEXT,
  is_read         BOOLEAN DEFAULT false
);

-- ============================================================
-- 3. ENABLE REALTIME (CRITICAL for live tracking)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE location_pings;
ALTER PUBLICATION supabase_realtime ADD TABLE trucks;

-- ============================================================
-- 4. ROW LEVEL SECURITY (permissive for demo)
-- ============================================================
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on drivers" ON drivers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on trucks" ON trucks FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE location_pings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on location_pings" ON location_pings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE timeline_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on timeline_snapshots" ON timeline_snapshots FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE daily_distance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on daily_distance" ON daily_distance FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on alerts" ON alerts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on alert_events" ON alert_events FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. SEED DATA — 20 Drivers
-- ============================================================
INSERT INTO drivers (id, full_name, phone_number, licence_number, photo_url) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'Rajesh Kumar',       '+91-9876543201', 'KA-0120190012345', NULL),
  ('d0000001-0000-0000-0000-000000000002', 'Suresh Patel',       '+91-9876543202', 'TN-0220180067890', NULL),
  ('d0000001-0000-0000-0000-000000000003', 'Amit Sharma',        '+91-9876543203', 'MH-0320170034567', NULL),
  ('d0000001-0000-0000-0000-000000000004', 'Vikram Singh',       '+91-9876543204', 'KA-0420160078901', NULL),
  ('d0000001-0000-0000-0000-000000000005', 'Deepak Reddy',       '+91-9876543205', 'AP-0520150023456', NULL),
  ('d0000001-0000-0000-0000-000000000006', 'Manoj Yadav',        '+91-9876543206', 'TN-0620140056789', NULL),
  ('d0000001-0000-0000-0000-000000000007', 'Ravi Verma',         '+91-9876543207', 'KA-0720130089012', NULL),
  ('d0000001-0000-0000-0000-000000000008', 'Sanjay Mishra',      '+91-9876543208', 'MH-0820120045678', NULL),
  ('d0000001-0000-0000-0000-000000000009', 'Arun Nair',          '+91-9876543209', 'KL-0920110078901', NULL),
  ('d0000001-0000-0000-0000-000000000010', 'Karthik Iyer',       '+91-9876543210', 'TN-1020200012345', NULL),
  ('d0000001-0000-0000-0000-000000000011', 'Prasad Joshi',       '+91-9876543211', 'MH-1120190056789', NULL),
  ('d0000001-0000-0000-0000-000000000012', 'Ganesh Pillai',      '+91-9876543212', 'KL-1220180023456', NULL),
  ('d0000001-0000-0000-0000-000000000013', 'Naveen Gupta',       '+91-9876543213', 'UP-1320170067890', NULL),
  ('d0000001-0000-0000-0000-000000000014', 'Harish Menon',       '+91-9876543214', 'KA-1420160034567', NULL),
  ('d0000001-0000-0000-0000-000000000015', 'Dinesh Chauhan',     '+91-9876543215', 'RJ-1520150078901', NULL),
  ('d0000001-0000-0000-0000-000000000016', 'Mohan Das',          '+91-9876543216', 'TN-1620140012345', NULL),
  ('d0000001-0000-0000-0000-000000000017', 'Balasubramanian R',  '+91-9876543217', 'TN-1720130056789', NULL),
  ('d0000001-0000-0000-0000-000000000018', 'Prakash Hegde',      '+91-9876543218', 'KA-1820120023456', NULL),
  ('d0000001-0000-0000-0000-000000000019', 'Santosh Kulkarni',   '+91-9876543219', 'MH-1920110067890', NULL),
  ('d0000001-0000-0000-0000-000000000020', 'Venkatesh Rao',      '+91-9876543220', 'KA-2020200034567', NULL);

-- ============================================================
-- 6. SEED DATA — 20 Trucks (with explicit tracking tokens)
-- ============================================================
INSERT INTO trucks (id, truck_number, number_plate, color_hex, color_name, status, cargo_type, assigned_route, driver_id, tracking_token) VALUES
  ('t0000001-0000-0000-0000-000000000001', 'TRK-001', 'KA-01-AB-1234', '#E63946', 'Crimson',      'offline', 'Heavy Machinery',   'Bangalore-Mysore',       'd0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'),
  ('t0000001-0000-0000-0000-000000000002', 'TRK-002', 'TN-02-CD-5678', '#457B9D', 'Ocean Blue',   'offline', 'FMCG',              'Chennai-Coimbatore',     'd0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002'),
  ('t0000001-0000-0000-0000-000000000003', 'TRK-003', 'MH-03-EF-9012', '#2D6A4F', 'Forest Green', 'offline', 'Petroleum',         'Mumbai-Pune',            'd0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003'),
  ('t0000001-0000-0000-0000-000000000004', 'TRK-004', 'KA-04-GH-3456', '#D4A017', 'Amber',        'offline', 'Textiles',          'Bangalore-Chennai',      'd0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004'),
  ('t0000001-0000-0000-0000-000000000005', 'TRK-005', 'AP-05-IJ-7890', '#7B2D8B', 'Deep Purple',  'offline', 'Electronics',       'Hyderabad-Vijayawada',   'd0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005'),
  ('t0000001-0000-0000-0000-000000000006', 'TRK-006', 'TN-06-KL-2345', '#F4762A', 'Tangerine',    'offline', 'Building Materials', 'Chennai-Madurai',        'd0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006'),
  ('t0000001-0000-0000-0000-000000000007', 'TRK-007', 'KA-07-MN-6789', '#0096C7', 'Cyan',         'offline', 'Pharmaceuticals',   'Bangalore-Hubli',        'd0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007'),
  ('t0000001-0000-0000-0000-000000000008', 'TRK-008', 'MH-08-OP-0123', '#C2185B', 'Magenta',      'offline', 'Agricultural',      'Mumbai-Nashik',          'd0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008'),
  ('t0000001-0000-0000-0000-000000000009', 'TRK-009', 'KL-09-QR-4567', '#558B2F', 'Lime',         'offline', 'FMCG',              'Kochi-Trivandrum',       'd0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009'),
  ('t0000001-0000-0000-0000-000000000010', 'TRK-010', 'TN-10-ST-8901', '#1565C0', 'Royal Blue',   'offline', 'Heavy Machinery',   'Chennai-Bangalore',      'd0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010'),
  ('t0000001-0000-0000-0000-000000000011', 'TRK-011', 'MH-11-UV-2345', '#9B2226', 'Maroon',       'offline', 'Petroleum',         'Mumbai-Goa',             'd0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011'),
  ('t0000001-0000-0000-0000-000000000012', 'TRK-012', 'KA-12-WX-6789', '#00796B', 'Teal',         'offline', 'Textiles',          'Bangalore-Mangalore',    'd0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000012'),
  ('t0000001-0000-0000-0000-000000000013', 'TRK-013', 'UP-13-YZ-0123', '#4527A0', 'Indigo',       'offline', 'Electronics',       'Lucknow-Delhi',          'd0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013'),
  ('t0000001-0000-0000-0000-000000000014', 'TRK-014', 'KA-14-AB-4567', '#E64A19', 'Coral',        'offline', 'Building Materials', 'Bangalore-Belgaum',      'd0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014'),
  ('t0000001-0000-0000-0000-000000000015', 'TRK-015', 'RJ-15-CD-8901', '#F9A825', 'Gold',         'offline', 'Pharmaceuticals',   'Jaipur-Udaipur',         'd0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015'),
  ('t0000001-0000-0000-0000-000000000016', 'TRK-016', 'TN-16-EF-2345', '#0277BD', 'Steel Blue',   'offline', 'Agricultural',      'Chennai-Tirupati',       'd0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000016'),
  ('t0000001-0000-0000-0000-000000000017', 'TRK-017', 'TN-17-GH-6789', '#BF360C', 'Brick',        'offline', 'FMCG',              'Coimbatore-Madurai',     'd0000001-0000-0000-0000-000000000017', 'a0000001-0000-0000-0000-000000000017'),
  ('t0000001-0000-0000-0000-000000000018', 'TRK-018', 'KA-18-IJ-0123', '#00897B', 'Mint',         'offline', 'Heavy Machinery',   'Bangalore-Hyderabad',    'd0000001-0000-0000-0000-000000000018', 'a0000001-0000-0000-0000-000000000018'),
  ('t0000001-0000-0000-0000-000000000019', 'TRK-019', 'MH-19-KL-4567', '#455A64', 'Slate',        'offline', 'Petroleum',         'Pune-Kolhapur',          'd0000001-0000-0000-0000-000000000019', 'a0000001-0000-0000-0000-000000000019'),
  ('t0000001-0000-0000-0000-000000000020', 'TRK-020', 'KA-20-MN-8901', '#6A1B9A', 'Violet',       'offline', 'Textiles',          'Mysore-Ooty',            'd0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000020');

-- ============================================================
-- 7. SEED DATA — Dummy Timeline Snapshots (today)
-- ============================================================
DO $$
DECLARE
  today DATE := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  truck_ids UUID[] := ARRAY[
    't0000001-0000-0000-0000-000000000001'::uuid,
    't0000001-0000-0000-0000-000000000002'::uuid,
    't0000001-0000-0000-0000-000000000003'::uuid,
    't0000001-0000-0000-0000-000000000004'::uuid,
    't0000001-0000-0000-0000-000000000005'::uuid
  ];
  landmarks TEXT[][] := ARRAY[
    ARRAY['Peenya Industrial Area, Bangalore', 'Nelamangala Toll Plaza, NH-48', 'Kunigal Town, Tumkur District', 'Channarayapatna, Hassan Road', 'Srirangapatna, Mandya District', 'Mysore Ring Road Junction'],
    ARRAY['Ambattur Industrial Estate, Chennai', 'Sriperumbudur, Kancheepuram', 'Vellore Fort Area', 'Krishnagiri Junction', 'Salem Steel Plant Road', 'Erode Bus Stand Area'],
    ARRAY['Navi Mumbai Toll Naka', 'Panvel Junction, NH-4', 'Khalapur Tunnel Entry', 'Lonavala Market Area', 'Khandala Ghat Section', 'Pune Expressway Exit'],
    ARRAY['Electronic City Phase 1, Bangalore', 'Hosur Road Toll Gate', 'Hosur Town, Tamil Nadu', 'Krishnagiri Fort Road', 'Vellore Bypass Road', 'Kanchipuram Silk Town'],
    ARRAY['Gachibowli IT Park, Hyderabad', 'Shamshabad Airport Road', 'Jadcherla Bypass, NH-44', 'Kurnool Town Center', 'Ongole Bus Depot Road', 'Vijayawada Kanaka Durga Temple Area']
  ];
  t_id UUID;
  i INT;
  j INT;
  snap_time TIMESTAMPTZ;
  base_lats DOUBLE PRECISION[] := ARRAY[12.9716, 13.0827, 19.0760, 12.9716, 17.3850];
  base_lngs DOUBLE PRECISION[] := ARRAY[77.5946, 80.2707, 72.8777, 77.5946, 78.4867];
BEGIN
  FOR i IN 1..5 LOOP
    t_id := truck_ids[i];
    FOR j IN 1..6 LOOP
      snap_time := (today || ' ' || (7 + (j-1) * 0.5)::text || ':00:00')::timestamptz AT TIME ZONE 'Asia/Kolkata';
      INSERT INTO timeline_snapshots (truck_id, latitude, longitude, landmark_name, snapshot_time, date_ist)
      VALUES (
        t_id,
        base_lats[i] + (j * 0.05),
        base_lngs[i] + (j * 0.08),
        landmarks[i][j],
        snap_time,
        today
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- 8. SEED DATA — Dummy Daily Distances (today)
-- ============================================================
DO $$
DECLARE
  today DATE := (now() AT TIME ZONE 'Asia/Kolkata')::date;
BEGIN
  INSERT INTO daily_distance (truck_id, date_ist, total_km) VALUES
    ('t0000001-0000-0000-0000-000000000001', today, 142.7),
    ('t0000001-0000-0000-0000-000000000002', today, 98.3),
    ('t0000001-0000-0000-0000-000000000003', today, 167.2),
    ('t0000001-0000-0000-0000-000000000004', today, 203.5),
    ('t0000001-0000-0000-0000-000000000005', today, 178.9),
    ('t0000001-0000-0000-0000-000000000006', today, 56.1),
    ('t0000001-0000-0000-0000-000000000007', today, 134.8),
    ('t0000001-0000-0000-0000-000000000008', today, 89.4),
    ('t0000001-0000-0000-0000-000000000009', today, 112.6),
    ('t0000001-0000-0000-0000-000000000010', today, 187.3),
    ('t0000001-0000-0000-0000-000000000011', today, 145.0),
    ('t0000001-0000-0000-0000-000000000012', today, 76.8),
    ('t0000001-0000-0000-0000-000000000013', today, 221.4),
    ('t0000001-0000-0000-0000-000000000014', today, 163.9),
    ('t0000001-0000-0000-0000-000000000015', today, 94.2),
    ('t0000001-0000-0000-0000-000000000016', today, 128.7),
    ('t0000001-0000-0000-0000-000000000017', today, 155.3),
    ('t0000001-0000-0000-0000-000000000018', today, 201.8),
    ('t0000001-0000-0000-0000-000000000019', today, 67.5),
    ('t0000001-0000-0000-0000-000000000020', today, 183.1);
END $$;

-- ============================================================
-- 9. SEED DATA — Dummy Alerts + Alert Events
-- ============================================================
INSERT INTO alerts (id, name, type, threshold_value, is_active) VALUES
  ('al000001-0000-0000-0000-000000000001', 'Truck Idle Alert',     'idle_timeout',    15,  true),
  ('al000001-0000-0000-0000-000000000002', 'Truck Offline Alert',  'offline_timeout',  30, true),
  ('al000001-0000-0000-0000-000000000003', 'Speeding Alert',       'speeding',         80, true);

INSERT INTO alert_events (alert_id, truck_id, triggered_at, resolved_at, message, is_read) VALUES
  ('al000001-0000-0000-0000-000000000001', 't0000001-0000-0000-0000-000000000003', now() - interval '2 hours',  now() - interval '1 hour 45 minutes', 'TRK-003 idle for 18 minutes at Mumbai-Pune highway',  true),
  ('al000001-0000-0000-0000-000000000003', 't0000001-0000-0000-0000-000000000007', now() - interval '1 hour',   NULL,                                  'TRK-007 exceeding 80 km/h on Bangalore-Hubli route',  false),
  ('al000001-0000-0000-0000-000000000002', 't0000001-0000-0000-0000-000000000012', now() - interval '45 minutes', now() - interval '30 minutes',       'TRK-012 offline for 35 minutes near Mangalore',       true),
  ('al000001-0000-0000-0000-000000000001', 't0000001-0000-0000-0000-000000000015', now() - interval '30 minutes', NULL,                                'TRK-015 idle for 22 minutes at Udaipur depot',        false),
  ('al000001-0000-0000-0000-000000000003', 't0000001-0000-0000-0000-000000000010', now() - interval '15 minutes', now() - interval '10 minutes',       'TRK-010 exceeding 80 km/h on Chennai-Bangalore NH',   true),
  ('al000001-0000-0000-0000-000000000002', 't0000001-0000-0000-0000-000000000019', now() - interval '10 minutes', NULL,                                'TRK-019 offline for 32 minutes near Kolhapur',        false);

-- ============================================================
-- DONE! Verify with: SELECT * FROM trucks;
-- You should see 20 trucks with their assigned drivers and tracking tokens.
--
-- IMPORTANT: After running this SQL, go to your Supabase Dashboard:
-- Database > Replication > and confirm that location_pings and trucks
-- tables appear in the supabase_realtime publication.
--
-- Driver tracking URLs will be:
-- /track/a0000001-0000-0000-0000-000000000001  (TRK-001)
-- /track/a0000001-0000-0000-0000-000000000002  (TRK-002)
-- ... and so on up to ...020
-- ============================================================
