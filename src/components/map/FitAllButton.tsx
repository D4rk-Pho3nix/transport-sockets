import { useMap } from 'react-leaflet';
import { Maximize2 } from 'lucide-react';
import L from 'leaflet';
import { useFleetStore } from '../../stores/useFleetStore';

export default function FitAllButton() {
  const map = useMap();
  const positions = useFleetStore((s) => s.positions);

  function handleFitAll() {
    const coords = Object.values(positions).map(
      (p) => [p.lat, p.lng] as [number, number]
    );
    if (coords.length === 0) return;
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }

  return (
    <button
      onClick={handleFitAll}
      className="absolute bottom-4 right-4 z-[1000] map-control p-2 cursor-pointer hover:bg-surface-hover transition-colors duration-200"
      title="Fit all trucks"
    >
      <Maximize2 size={16} className="text-text-primary" />
    </button>
  );
}
