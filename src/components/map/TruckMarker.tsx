import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Truck } from '../../types';

interface TruckMarkerProps {
  truck: Truck;
  position: [number, number];
}

const createTruckIcon = (color: string, truckNumber: string) => {
  return L.divIcon({
    className: 'truck-marker-icon',
    html: `
      <div class="relative flex flex-col items-center">
        <div class="w-8 h-8 rounded-full bg-white dark:bg-[#111111] border-2 border-white dark:border-[#2E2E2E] shadow-lg flex items-center justify-center overflow-hidden transition-all duration-300">
           <svg 
            viewBox="0 0 24 24" 
            fill="${color}" 
            stroke="white" 
            stroke-width="1.5" 
            class="w-5 h-5 drop-shadow-md"
          >
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v5a1 1 0 0 0 1 1h2" />
            <path d="M15 8h5a2 2 0 0 1 2 2v2h-7V8Z" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
          </svg>
        </div>
        <div 
          class="mt-1 px-1.5 py-0.5 rounded-md bg-white border border-[#E0E0E0] dark:bg-[#1A1A1A] dark:border-[#2E2E2E] text-[10px] font-bold text-[#0A0A0A] dark:text-[#F0F0F0] whitespace-nowrap shadow-sm translate-y-[-2px]"
          style="border-bottom: 2px solid ${color}"
        >
          ${truckNumber}
        </div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 40],
  });
};

export default function TruckMarker({ truck, position }: TruckMarkerProps) {
  const icon = React.useMemo(() => createTruckIcon(truck.color, truck.truck_number), [truck.color, truck.truck_number]);

  return (
    <Marker position={position} icon={icon}>
      {/* Popups excluded for Prototype v1.0, but keeping the container if needed */}
    </Marker>
  );
}
