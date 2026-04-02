export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export const PING_INTERVAL_MS = 3000;

export const MAP_DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]; // Bangalore
export const MAP_DEFAULT_ZOOM = 7;

export const STATUS_COLORS: Record<string, string> = {
  moving: '#22c55e',
  idle: '#f59e0b',
  parked: '#3b82f6',
  offline: '#9ca3af',
};

export const STATUS_LABELS: Record<string, string> = {
  moving: 'Moving',
  idle: 'Idle',
  parked: 'Parked',
  offline: 'Offline',
};

export const ACCENT = '#01696f';

export const STATUS_PRIORITY: Record<string, number> = {
  moving: 0,
  idle: 1,
  parked: 2,
  offline: 3,
};

export const PARKED_TIMEOUT_MS = 2 * 60 * 1000;   // 2 minutes
export const OFFLINE_TIMEOUT_MS = 30 * 60 * 1000;  // 30 minutes
