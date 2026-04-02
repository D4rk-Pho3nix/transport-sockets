import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useFleetStore, getFilteredTrucks } from '../../stores/useFleetStore';
import FilterChips from './FilterChips';
import TruckCard from './TruckCard';

export default function Sidebar() {
  const viewMode = useFleetStore((s) => s.viewMode);
  const selectedTruckId = useFleetStore((s) => s.selectedTruckId);
  const positions = useFleetStore((s) => s.positions);
  const dailyDistances = useFleetStore((s) => s.dailyDistances);
  const trucks = useFleetStore((s) => s.trucks);
  const filteredTrucks = useFleetStore(getFilteredTrucks);
  const selectTruck = useFleetStore((s) => s.selectTruck);
  const setViewMode = useFleetStore((s) => s.setViewMode);

  const isIndividual = viewMode === 'individual';
  const width = isIndividual ? 280 : 320;

  function handleBackToFleet() {
    setViewMode('fleet');
    selectTruck(null);
  }

  return (
    <motion.aside
      animate={{ width }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-full bg-surface border-r border-border flex flex-col overflow-hidden shrink-0"
    >
      {/* Individual mode header */}
      {isIndividual && (
        <div className="px-3 py-2.5 border-b border-border space-y-2">
          <button
            onClick={handleBackToFleet}
            className="flex items-center gap-1.5 text-xs text-accent hover:underline cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Fleet
          </button>

          {/* Truck switcher */}
          <select
            value={selectedTruckId || ''}
            onChange={(e) => selectTruck(e.target.value || null)}
            className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-surface focus:outline-none focus:border-accent"
          >
            <option value="">Select truck...</option>
            {trucks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.truck_number} - {t.drivers?.full_name || 'Unassigned'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Fleet mode filters */}
      {!isIndividual && <FilterChips />}

      {/* Truck list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {(isIndividual && selectedTruckId
            ? filteredTrucks.filter((t) => t.id === selectedTruckId)
            : filteredTrucks
          ).map((truck) => (
            <TruckCard
              key={truck.id}
              truck={truck}
              position={positions[truck.id]}
              distance={dailyDistances[truck.id] || 0}
              isSelected={truck.id === selectedTruckId}
              onClick={() => selectTruck(truck.id)}
            />
          ))}
        </AnimatePresence>

        {filteredTrucks.length === 0 && (
          <div className="p-4 text-center text-xs text-text-faint">
            No trucks match filters.
          </div>
        )}
      </div>
    </motion.aside>
  );
}
