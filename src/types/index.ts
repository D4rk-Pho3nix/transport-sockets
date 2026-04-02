export interface Driver {
  id: string;
  full_name: string;
  phone_number: string;
  licence_number: string;
  photo_url: string | null;
  created_at: string;
}

export interface Truck {
  id: string;
  truck_number: string;
  number_plate: string;
  color_hex: string;
  color_name: string;
  status: TruckStatus;
  cargo_type: string | null;
  assigned_route: string | null;
  driver_id: string | null;
  tracking_token: string;
  created_at: string;
  drivers?: Driver;
}

export type TruckStatus = 'moving' | 'idle' | 'parked' | 'offline';

export interface LocationPing {
  id: string;
  truck_id: string;
  latitude: number;
  longitude: number;
  speed_kmh: number | null;
  accuracy_m: number | null;
  recorded_at: string;
}

export interface TimelineSnapshot {
  id: string;
  truck_id: string;
  latitude: number;
  longitude: number;
  landmark_name: string | null;
  snapshot_time: string;
  date_ist: string;
}

export interface DailyDistance {
  id: string;
  truck_id: string;
  date_ist: string;
  total_km: number;
  last_updated_at: string;
}

export interface Alert {
  id: string;
  name: string;
  type: 'idle_timeout' | 'offline_timeout' | 'speeding';
  threshold_value: number;
  is_active: boolean;
  created_at: string;
}

export interface AlertEvent {
  id: string;
  alert_id: string;
  truck_id: string;
  triggered_at: string;
  resolved_at: string | null;
  message: string;
  is_read: boolean;
}

export interface TruckPosition {
  truckId: string;
  lat: number;
  lng: number;
  speed: number;
  accuracy: number;
  timestamp: string;
}

export interface TrailPoint {
  lat: number;
  lng: number;
  timestamp: string;
}
