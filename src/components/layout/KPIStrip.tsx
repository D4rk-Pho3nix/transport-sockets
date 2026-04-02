import React from 'react';
import { Truck, Navigation, Activity, WifiOff, MapPin } from 'lucide-react';
import { useFleetStore } from '../../stores/useFleetStore';

export default function KPIStrip() {
  const trucks = useFleetStore((s) => s.trucks);
  
  const moving = trucks.filter(t => t.status === 'moving').length;
  const idle = trucks.filter(t => t.status === 'idle').length;
  const offline = trucks.filter(t => t.status === 'offline').length;
  const active = trucks.length - offline;
  const totalDistance = trucks.reduce((sum, t) => sum + t.daily_distance, 0);

  const kpis = [
    { label: 'Active Trucks', value: active, icon: <Activity className="w-4 h-4 text-green-500" />, trend: '🟢' },
    { label: 'Total Distance', value: `${totalDistance.toFixed(0)} km`, icon: <MapPin className="w-4 h-4 text-blue-500" /> },
    { label: 'Offline', value: offline, icon: <WifiOff className="w-4 h-4 text-red-500" />, trend: '🔴' },
    { label: 'Moving Now', value: moving, icon: <Navigation className="w-4 h-4 text-black dark:text-white" /> },
  ];

  return (
    <div className="h-16 border-t border-[#E0E0E0] dark:border-[#2E2E2E] bg-white dark:bg-[#111111] px-6 flex items-center justify-between transition-colors duration-200">
      <div className="flex-1 flex gap-12 overflow-x-auto no-scrollbar">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="flex items-center gap-3 min-w-fit">
            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2E2E]">
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] whitespace-nowrap">
                {kpi.label}
              </p>
              <p className="text-sm font-display font-black text-[#0A0A0A] dark:text-[#F0F0F0]">
                {kpi.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">
        <div className="w-2 h-2 rounded-full bg-green-500 pulse" />
        Live System Status: Healthy
      </div>
    </div>
  );
}
