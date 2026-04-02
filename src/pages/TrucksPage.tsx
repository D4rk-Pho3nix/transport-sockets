import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Truck as TruckIcon, Navigation, Activity } from 'lucide-react';
import { useFleetStore } from '../stores/useFleetStore';

export default function TrucksPage() {
  const trucks = useFleetStore((s) => s.trucks);
  const [search, setSearch] = useState('');

  const filtered = trucks.filter(t => 
    t.truck_number.toLowerCase().includes(search.toLowerCase()) ||
    t.plate_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#111111] transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0]">Trucks</h1>
          <p className="text-[#6B6B6B] dark:text-[#888888]">Manage fleet vehicles, maintenance, and assignments</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Truck
        </button>
      </div>

      <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2E2E] mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA] dark:text-[#555555]" />
          <input 
            type="text" 
            placeholder="Search by truck number or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#111111] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filtered.map((truck) => (
          <div key={truck.id} className="bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div 
              className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 group-hover:opacity-20 transition-all pointer-events-none"
              style={{ backgroundColor: truck.color }}
            />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2E2E]"
                  style={{ backgroundColor: truck.color + '20' }}
                >
                  <TruckIcon className="w-6 h-6" style={{ color: truck.color }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[#0A0A0A] dark:text-[#F0F0F0] text-lg">{truck.truck_number}</h3>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#AAAAAA] dark:text-[#555555] font-mono">{truck.plate_number}</span>
                </div>
              </div>
              <div className={`status-badge ${
                truck.status === 'moving' ? 'text-green-500' :
                truck.status === 'idle' ? 'text-yellow-500' :
                truck.status === 'stopped' ? 'text-red-500' : 'text-gray-400'
              }`}>
                {truck.status}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F5F5F5] dark:bg-[#222222] rounded-xl border border-transparent group-hover:border-[#E0E0E0] dark:group-hover:border-[#2E2E2E] transition-all">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-1">Driver</p>
                  <p className="text-sm font-bold text-[#0A0A0A] dark:text-[#F0F0F0] truncate">{truck.driver?.full_name}</p>
                </div>
                <div className="p-3 bg-[#F5F5F5] dark:bg-[#222222] rounded-xl border border-transparent group-hover:border-[#E0E0E0] dark:group-hover:border-[#2E2E2E] transition-all">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-1">Cargo</p>
                  <p className="text-sm font-bold text-[#0A0A0A] dark:text-[#F0F0F0] truncate">{truck.cargo_type}</p>
                </div>
              </div>
              
              <div className="p-3 bg-[#F5F5F5] dark:bg-[#222222] rounded-xl border border-transparent group-hover:border-[#E0E0E0] dark:group-hover:border-[#2E2E2E] transition-all">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-1">Assigned Route</p>
                <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3 text-[#6B6B6B] dark:text-[#888888]" />
                  <p className="text-sm font-bold text-[#0A0A0A] dark:text-[#F0F0F0] truncate">{truck.assigned_route}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2E2E] opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 py-2 text-xs font-bold uppercase tracking-widest bg-[#F5F5F5] dark:bg-[#222222] rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Assign</button>
              <button className="flex-1 py-2 text-xs font-bold uppercase tracking-widest bg-[#F5F5F5] dark:bg-[#222222] rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
