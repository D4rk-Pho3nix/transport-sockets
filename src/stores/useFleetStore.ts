import { create } from 'zustand';
import type { Truck, TruckPosition, TrailPoint, TimelineSnapshot, AlertEvent, TruckStatus } from '../types';
import { haversineDistance } from '../lib/haversine';
import { PARKED_TIMEOUT_MS, OFFLINE_TIMEOUT_MS, STATUS_PRIORITY } from '../lib/constants';

interface FleetState {
  trucks: Truck[];
  positions: Record<string, TruckPosition>;
  trails: Record<string, TrailPoint[]>;
  dailyDistances: Record<string, number>;
  timelineSnapshots: Record<string, TimelineSnapshot[]>;
  alertEvents: AlertEvent[];
  statusChangedAt: Record<string, string>;

  viewMode: 'fleet' | 'individual';
  selectedTruckId: string | null;
  markerStyle: 'truck' | 'driver';
  detailPanelOpen: boolean;

  statusFilter: string[];
  cargoFilter: string[];
  routeFilter: string[];
  driverSearch: string;

  setTrucks: (trucks: Truck[]) => void;
  setPositions: (positions: Record<string, TruckPosition>) => void;
  setTrails: (trails: Record<string, TrailPoint[]>) => void;
  setDailyDistances: (distances: Record<string, number>) => void;
  setTimelineSnapshots: (snapshots: Record<string, TimelineSnapshot[]>) => void;
  setAlertEvents: (events: AlertEvent[]) => void;

  updatePosition: (truckId: string, lat: number, lng: number, speed: number, accuracy: number, timestamp: string) => void;
  updateTruckStatuses: () => void;

  selectTruck: (truckId: string | null) => void;
  setViewMode: (mode: 'fleet' | 'individual') => void;
  toggleMarkerStyle: () => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;

  setStatusFilter: (statuses: string[]) => void;
  setCargoFilter: (types: string[]) => void;
  setRouteFilter: (routes: string[]) => void;
  setDriverSearch: (query: string) => void;
  clearFilters: () => void;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  trucks: [],
  positions: {},
  trails: {},
  dailyDistances: {},
  timelineSnapshots: {},
  alertEvents: [],
  statusChangedAt: {},

  viewMode: 'fleet',
  selectedTruckId: null,
  markerStyle: 'truck',
  detailPanelOpen: false,

  statusFilter: [],
  cargoFilter: [],
  routeFilter: [],
  driverSearch: '',

  setTrucks: (trucks) => set({ trucks }),
  setPositions: (positions) => set({ positions }),
  setTrails: (trails) => set({ trails }),
  setDailyDistances: (distances) => set({ dailyDistances: distances }),
  setTimelineSnapshots: (snapshots) => set({ timelineSnapshots: snapshots }),
  setAlertEvents: (events) => set({ alertEvents: events }),

  updatePosition: (truckId, lat, lng, speed, accuracy, timestamp) => {
    const state = get();
    const prevPosition = state.positions[truckId];

    let addedDistance = 0;
    if (prevPosition) {
      const dist = haversineDistance(prevPosition.lat, prevPosition.lng, lat, lng);
      if (dist < 1 && dist > 0.001) {
        addedDistance = dist;
      }
    }

    const newPosition: TruckPosition = { truckId, lat, lng, speed, accuracy, timestamp };

    const newTrailPoint: TrailPoint = { lat, lng, timestamp };
    const existingTrail = state.trails[truckId] || [];

    const newStatus: TruckStatus = speed > 2 ? 'moving' : 'idle';

    const currentTruck = state.trucks.find(t => t.id === truckId);
    const oldStatus = currentTruck?.status;

    set({
      positions: { ...state.positions, [truckId]: newPosition },
      trails: { ...state.trails, [truckId]: [...existingTrail, newTrailPoint] },
      dailyDistances: {
        ...state.dailyDistances,
        [truckId]: (state.dailyDistances[truckId] || 0) + addedDistance,
      },
      trucks: state.trucks.map(t =>
        t.id === truckId ? { ...t, status: newStatus } : t
      ),
      statusChangedAt: oldStatus !== newStatus
        ? { ...state.statusChangedAt, [truckId]: timestamp }
        : state.statusChangedAt,
    });
  },

  updateTruckStatuses: () => {
    const state = get();
    const now = Date.now();

    const updatedTrucks = state.trucks.map(truck => {
      const pos = state.positions[truck.id];
      if (!pos) return truck;

      const elapsed = now - new Date(pos.timestamp).getTime();

      if (truck.status === 'moving' || truck.status === 'idle') {
        if (elapsed > OFFLINE_TIMEOUT_MS) {
          return { ...truck, status: 'offline' as TruckStatus };
        }
        if (elapsed > PARKED_TIMEOUT_MS) {
          return { ...truck, status: 'parked' as TruckStatus };
        }
      }
      return truck;
    });

    set({ trucks: updatedTrucks });
  },

  selectTruck: (truckId) => set({
    selectedTruckId: truckId,
    detailPanelOpen: truckId !== null,
  }),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleMarkerStyle: () => set(s => ({
    markerStyle: s.markerStyle === 'truck' ? 'driver' : 'truck',
  })),

  openDetailPanel: () => set({ detailPanelOpen: true }),
  closeDetailPanel: () => set({ detailPanelOpen: false, selectedTruckId: null }),

  setStatusFilter: (statuses) => set({ statusFilter: statuses }),
  setCargoFilter: (types) => set({ cargoFilter: types }),
  setRouteFilter: (routes) => set({ routeFilter: routes }),
  setDriverSearch: (query) => set({ driverSearch: query }),
  clearFilters: () => set({
    statusFilter: [],
    cargoFilter: [],
    routeFilter: [],
    driverSearch: '',
  }),
}));

// Selectors
export function getFilteredTrucks(state: FleetState): Truck[] {
  let filtered = [...state.trucks];

  if (state.statusFilter.length > 0) {
    filtered = filtered.filter(t => state.statusFilter.includes(t.status));
  }
  if (state.cargoFilter.length > 0) {
    filtered = filtered.filter(t => t.cargo_type && state.cargoFilter.includes(t.cargo_type));
  }
  if (state.routeFilter.length > 0) {
    filtered = filtered.filter(t => t.assigned_route && state.routeFilter.includes(t.assigned_route));
  }
  if (state.driverSearch.trim()) {
    const q = state.driverSearch.toLowerCase();
    filtered = filtered.filter(t =>
      t.drivers?.full_name?.toLowerCase().includes(q) ||
      t.truck_number.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status] ?? 4;
    const pb = STATUS_PRIORITY[b.status] ?? 4;
    if (pa !== pb) return pa - pb;
    return a.truck_number.localeCompare(b.truck_number);
  });

  return filtered;
}

export function getKPIStats(state: FleetState) {
  const total = state.trucks.length;
  const moving = state.trucks.filter(t => t.status === 'moving').length;
  const idle = state.trucks.filter(t => t.status === 'idle').length;
  const parked = state.trucks.filter(t => t.status === 'parked').length;
  const offline = state.trucks.filter(t => t.status === 'offline').length;
  const active = total - offline;
  const totalDistance = Object.values(state.dailyDistances).reduce((sum, d) => sum + d, 0);
  const unreadAlerts = state.alertEvents.filter(e => !e.is_read).length;

  return { total, moving, idle, parked, offline, active, totalDistance, unreadAlerts };
}
