export type TruckStatus = 'moving' | 'idle' | 'stopped' | 'offline';

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  license_number: string;
  photo_url?: string;
  status: 'active' | 'inactive';
  assigned_truck_id?: string;
}

export interface Truck {
  id: string;
  truck_number: string;
  plate_number: string;
  color: string;
  cargo_type: string;
  assigned_route: string;
  driver_id?: string;
  driver?: Driver;
  status: TruckStatus;
  last_ping?: string;
  daily_distance: number;
}

export interface Position {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface TrailPoint extends Position {
  speed?: number;
}
