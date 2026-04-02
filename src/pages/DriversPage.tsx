import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useFleetStore } from '../stores/useFleetStore';

export default function DriversPage() {
  const drivers = useFleetStore((s) => s.drivers);
  const [search, setSearch] = useState('');

  const filtered = drivers.filter(d => 
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search)
  );

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#111111] transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0]">Drivers</h1>
          <p className="text-[#6B6B6B] dark:text-[#888888]">Manage fleet operators and assignments</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2E2E] mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA] dark:text-[#555555]" />
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#111111] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((driver) => (
          <div key={driver.id} className="bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#EBEBEB] dark:bg-[#222222] flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2E2E]">
                <span className="text-lg font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">{driver.full_name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">{driver.full_name}</h3>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#AAAAAA] dark:text-[#555555]">{driver.id}</span>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B] dark:text-[#888888]">
                <Phone className="w-3.5 h-3.5" /> {driver.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B] dark:text-[#888888]">
                <ShieldCheck className="w-3.5 h-3.5" /> License: {driver.license_number}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#F5F5F5] dark:bg-[#222222] text-[10px] font-bold text-[#6B6B6B] dark:text-[#888888]">
                Truck: {driver.assigned_truck_id}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2E2E] opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 py-2 text-xs font-bold uppercase tracking-widest bg-[#F5F5F5] dark:bg-[#222222] rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Edit</button>
              <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
