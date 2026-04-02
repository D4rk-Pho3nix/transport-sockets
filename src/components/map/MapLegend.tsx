import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFleetStore } from '../../stores/useFleetStore';
import { STATUS_COLORS } from '../../lib/constants';

export default function MapLegend() {
  const [open, setOpen] = useState(false);
  const trucks = useFleetStore((s) => s.trucks);

  return (
    <div className="absolute bottom-4 left-4 z-[1000] map-control max-h-[50vh] flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary cursor-pointer"
      >
        <span>Trucks ({trucks.length})</span>
        <ChevronDown
          size={14}
          className="transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>
      {open && (
        <div className="overflow-y-auto custom-scrollbar px-3 pb-2 space-y-1 max-h-[40vh]">
          {trucks.map((truck) => (
            <div key={truck.id} className="flex items-center gap-2 py-0.5">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: truck.color_hex }}
              />
              <span className="text-xs text-text-primary truncate">
                {truck.truck_number}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 ml-auto"
                style={{ backgroundColor: STATUS_COLORS[truck.status] }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
