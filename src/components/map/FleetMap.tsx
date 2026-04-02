import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFleetStore } from '../../stores/useFleetStore';
import TruckMarker from './TruckMarker';
import { useAuthStore } from '../../stores/useAuthStore';

// Custom Map Controller to handle pans/zooms
function MapController() {
  const map = useMap();
  const selectedTruckId = useFleetStore((s) => s.selectedTruckId);
  const positions = useFleetStore((s) => s.positions);

  useEffect(() => {
    if (selectedTruckId && positions[selectedTruckId]) {
      const pos = positions[selectedTruckId];
      map.setView([pos.lat, pos.lng], 15, { animate: true });
    }
  }, [selectedTruckId, positions, map]);

  return null;
}

export default function FleetMap() {
  const trucks = useFleetStore((s) => s.trucks);
  const positions = useFleetStore((s) => s.positions);
  const trails = useFleetStore((s) => s.trails);
  const center: L.LatLngExpression = [10.77, 78.67];

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={12}
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />

        <ZoomControl position="bottomright" />
        <MapController />

        {trucks.map((truck) => {
          const pos = positions[truck.id];
          const trail = trails[truck.id] || [];
          
          return (
            <React.Fragment key={truck.id}>
              {/* Trail */}
              {trail.length > 1 && (
                <Polyline
                  positions={trail.map(p => [p.lat, p.lng])}
                  pathOptions={{
                    color: truck.color,
                    weight: 3,
                    opacity: 0.6,
                    lineJoin: 'round',
                    lineCap: 'round'
                  }}
                />
              )}

              {/* Pin */}
              {pos && (
                <TruckMarker 
                  truck={truck} 
                  position={[pos.lat, pos.lng]} 
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
      
      {/* Map Overlay Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
         <div className="bg-white dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-xl p-2 shadow-sm flex flex-col gap-1">
            <button className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#222222] rounded-lg text-[#6B6B6B] dark:text-[#888888] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
         </div>
      </div>
    </div>
  );
}
