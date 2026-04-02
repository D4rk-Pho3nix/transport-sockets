import { Truck, User } from 'lucide-react';
import { useFleetStore } from '../../stores/useFleetStore';
import { ACCENT } from '../../lib/constants';

export default function MarkerToggle() {
  const markerStyle = useFleetStore((s) => s.markerStyle);
  const toggleMarkerStyle = useFleetStore((s) => s.toggleMarkerStyle);

  return (
    <div className="absolute top-4 right-4 z-[1000] map-control flex p-1 gap-0.5">
      <button
        onClick={toggleMarkerStyle}
        className="p-1.5 rounded-lg transition-all duration-200 cursor-pointer"
        style={
          markerStyle === 'truck'
            ? { backgroundColor: ACCENT, color: '#fff' }
            : { backgroundColor: 'transparent', color: '#6b7280' }
        }
        title="Truck markers"
      >
        <Truck size={14} />
      </button>
      <button
        onClick={toggleMarkerStyle}
        className="p-1.5 rounded-lg transition-all duration-200 cursor-pointer"
        style={
          markerStyle === 'driver'
            ? { backgroundColor: ACCENT, color: '#fff' }
            : { backgroundColor: 'transparent', color: '#6b7280' }
        }
        title="Driver markers"
      >
        <User size={14} />
      </button>
    </div>
  );
}
