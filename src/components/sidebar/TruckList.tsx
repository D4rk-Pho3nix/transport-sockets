import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Navigation, Clock, Ban } from 'lucide-react';
import { useFleetStore } from '../../stores/useFleetStore';
import type { TruckStatus } from '../../types';

const STATUS_ICONS: Record<TruckStatus, React.ReactNode> = {
  moving: <Navigation className="w-3.5 h-3.5 text-green-500" />,
  idle: <Clock className="w-3.5 h-3.5 text-yellow-500" />,
  stopped: <Ban className="w-3.5 h-3.5 text-red-500" />,
  offline: <div className="w-3.5 h-3.5 rounded-full bg-gray-400" />
};

export default function TruckList() {
  const trucks = useFleetStore((s) => s.trucks);
  const statusFilter = useFleetStore((s) => s.statusFilter);
  const setStatusFilter = useFleetStore((s) => s.setStatusFilter);
  const searchQuery = useFleetStore((s) => s.searchQuery);
  const setSearchQuery = useFleetStore((s) => s.setSearchQuery);
  const selectedTruckId = useFleetStore((s) => s.selectedTruckId);
  const selectTruck = useFleetStore((s) => s.selectTruck);

  const filteredTrucks = trucks.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter.toLowerCase();
    const matchesSearch = 
      t.truck_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statuses = ['All', 'Moving', 'Idle', 'Stopped', 'Offline'];

  return (
    <aside className="w-[320px] bg-white dark:bg-[#111111] border-r border-[#E0E0E0] dark:border-[#2E2E2E] flex flex-col h-full transition-colors duration-200">
      <div className="p-4 space-y-4 border-b border-[#E0E0E0] dark:border-[#2E2E2E]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA] dark:text-[#555555]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trucks, drivers..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-transparent focus:border-[#E0E0E0] dark:focus:border-[#2E2E2E] rounded-xl text-sm transition-all outline-none"
          />
        </div>
        
        <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`
                px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all
                ${statusFilter === s 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#6B6B6B] dark:text-[#888888] hover:bg-[#EBEBEB] dark:hover:bg-[#222222]'
                }
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredTrucks.map((truck) => (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={truck.id}
              onClick={() => selectTruck(truck.id)}
              className={`
                p-4 border-b border-[#E0E0E0] dark:border-[#2E2E2E] cursor-pointer transition-all hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]
                ${selectedTruckId === truck.id ? 'bg-[#F5F5F5] dark:bg-[#1A1A1A] border-l-4 border-l-black dark:border-l-white' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: truck.color }}
                  />
                  <h3 className="font-display font-bold text-sm text-[#0A0A0A] dark:text-[#F0F0F0]">{truck.truck_number}</h3>
                  <span className="text-[10px] text-[#AAAAAA] dark:text-[#555555] font-mono">{truck.plate_number}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`status-badge ${
                    truck.status === 'moving' ? 'text-green-500' :
                    truck.status === 'idle' ? 'text-yellow-500' :
                    truck.status === 'stopped' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {truck.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#EBEBEB] dark:bg-[#222222] flex items-center justify-center">
                    <span className="text-[10px] font-bold">{truck.driver?.full_name.charAt(0)}</span>
                  </div>
                  <span className="text-xs text-[#6B6B6B] dark:text-[#888888]">{truck.driver?.full_name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#AAAAAA] dark:text-[#555555]">Distance</p>
                  <p className="text-xs font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">{truck.daily_distance.toFixed(1)} km</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTrucks.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <Filter className="w-8 h-8 text-[#E0E0E0] dark:text-[#2E2E2E] mx-auto" />
            <p className="text-sm font-medium text-[#6B6B6B] dark:text-[#888888]">No trucks found</p>
          </div>
        )}
      </div>
    </aside>
  );
}
