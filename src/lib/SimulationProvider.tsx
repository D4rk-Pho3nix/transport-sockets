import React, { useEffect, useRef } from 'react';
import { useFleetStore } from '../stores/useFleetStore';

const ROUTES_CONFIG: Record<string, { from: [number, number], to: [number, number] }> = {
  'TRK-01': { 
     from: [78.651444, 10.753167], // lng, lat
     to: [78.675075, 10.780125]
  },
  'TRK-02': { 
     from: [78.688216, 10.784054], 
     to: [78.669832, 10.764409] 
  }
};

export default function SimulationProvider({ children }: { children: React.ReactNode }) {
  const updatePosition = useFleetStore((s) => s.updatePosition);
  const trucks = useFleetStore((s) => s.trucks);
  const routesRef = useRef<Record<string, { lat: number, lng: number }[]>>({});
  const progressRef = useRef<Record<string, number>>({ 'TRK-01': 0, 'TRK-02': 0 });

  useEffect(() => {
    // Fetch real road routes from OSRM
    const fetchRoutes = async () => {
      for (const [truckId, coords] of Object.entries(ROUTES_CONFIG)) {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${coords.from[0]},${coords.from[1]};${coords.to[0]},${coords.to[1]}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            // OSRM returns [lng, lat]
            const coordsArray = data.routes[0].geometry.coordinates.map((c: number[]) => ({
              lng: c[0],
              lat: c[1]
            }));
            routesRef.current[truckId] = coordsArray;
          }
        } catch (err) {
          console.error("Failed to fetch route for", truckId, err);
        }
      }
    };
    
    fetchRoutes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      trucks.forEach((truck) => {
        const route = routesRef.current[truck.id];
        if (!route || route.length === 0) return;

        let currentIdx = progressRef.current[truck.id] || 0;
        
        if (currentIdx < route.length - 1) {
          // Advance multiple coordinates per tick so it doesn't take hours to finish the route
          const stepSize = Math.max(1, Math.floor(route.length / 50)); 
          currentIdx = Math.min(currentIdx + stepSize, route.length - 1);
          progressRef.current[truck.id] = currentIdx;
          
          const nextPos = route[currentIdx];
          
          updatePosition(truck.id, {
            lat: nextPos.lat,
            lng: nextPos.lng,
            timestamp: new Date().toISOString()
          });
        }
      });
    }, 5000); // 5s interval as per PRD

    return () => clearInterval(interval);
  }, [trucks, updatePosition]);

  return <>{children}</>;
}
