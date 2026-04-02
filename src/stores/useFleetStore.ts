import { create } from 'zustand';
import type { Truck, Driver, Position, TrailPoint, TruckStatus } from '../types';

interface FleetState {
  trucks: Truck[];
  drivers: Driver[];
  positions: Record<string, Position>;
  trails: Record<string, TrailPoint[]>;
  selectedTruckId: string | null;
  statusFilter: string;
  searchQuery: string;

  setTrucks: (trucks: Truck[]) => void;
  setDrivers: (drivers: Driver[]) => void;
  updatePosition: (truckId: string, pos: Position) => void;
  selectTruck: (id: string | null) => void;
  setStatusFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
}

// 20 Perceptually distinct colors from PRD
const TRUCK_COLORS = [
  '#E63946', '#2A9D8F', '#E9C46A', '#264653', '#F4A261',
  '#6A0572', '#0077B6', '#57CC99', '#FF6B6B', '#118AB2',
  '#06D6A0', '#FFD166', '#EF476F', '#073B4C', '#8338EC',
  '#3A86FF', '#FB5607', '#FF006E', '#FFBE0B', '#8AC926'
];

const MOCK_DRIVERS: Driver[] = Array.from({ length: 20 }, (_, i) => ({
  id: `DRV-${i + 1}`,
  full_name: `Driver ${i + 1}`,
  phone: `+91 98${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 90) + 10}999`,
  license_number: `DL-${Math.floor(Math.random() * 1000000)}`,
  status: 'active',
  assigned_truck_id: `TRK-${i + 1 < 10 ? '0' : ''}${i + 1}`
}));

const MOCK_TRUCKS: Truck[] = Array.from({ length: 20 }, (_, i) => {
  const truckId = `TRK-${i + 1 < 10 ? '0' : ''}${i + 1}`;
  return {
    id: truckId,
    truck_number: truckId,
    plate_number: `KA 01 AB ${Math.floor(Math.random() * 9000) + 1000}`,
    color: TRUCK_COLORS[i],
    cargo_type: ['Heavy Machinery', 'Chemical', 'FMCG', 'Electronics'][i % 4],
    assigned_route: ['Bengaluru → Mysuru', 'Mumbai → Pune', 'Delhi → Jaipur', 'Chennai → Kochi'][i % 4],
    driver_id: MOCK_DRIVERS[i].id,
    driver: MOCK_DRIVERS[i],
    status: 'idle' as TruckStatus,
    daily_distance: 0
  };
});

const INITIAL_POSITIONS: Record<string, {lat: number, lng: number}> = {
  'TRK-01': { lat: 10.753167, lng: 78.651444 },
  'TRK-02': { lat: 10.784054, lng: 78.688216 }
};

export const useFleetStore = create<FleetState>((set, get) => ({
  trucks: MOCK_TRUCKS,
  drivers: MOCK_DRIVERS,
  positions: {},
  trails: {},
  selectedTruckId: null,
  statusFilter: 'All',
  searchQuery: '',

  setTrucks: (trucks) => set({ trucks }),
  setDrivers: (drivers) => set({ drivers }),
  
  updatePosition: (truckId, pos) => {
    const state = get();
    const currentTrails = state.trails[truckId] || [];
    
    // Simple status logic: if pos changed, it's moving
    const prevPos = state.positions[truckId];
    let newStatus: TruckStatus = 'moving';
    if (prevPos && prevPos.lat === pos.lat && prevPos.lng === pos.lng) {
      newStatus = 'idle';
    }

    set({
      positions: { ...state.positions, [truckId]: pos },
      trails: { ...state.trails, [truckId]: [...currentTrails.slice(-50), { ...pos }] },
      trucks: state.trucks.map(t => t.id === truckId ? { ...t, status: newStatus, last_ping: pos.timestamp } : t)
    });
  },

  selectTruck: (id) => set({ selectedTruckId: id }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

Object.entries(INITIAL_POSITIONS).forEach(([id, coords]) => {
  useFleetStore.getState().updatePosition(id, {
    lat: coords.lat,
    lng: coords.lng,
    timestamp: new Date().toISOString()
  });
});
