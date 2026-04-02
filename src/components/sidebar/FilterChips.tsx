import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useFleetStore } from '../../stores/useFleetStore';
import { STATUS_LABELS, ACCENT } from '../../lib/constants';
import type { TruckStatus } from '../../types';

const STATUSES: TruckStatus[] = ['moving', 'idle', 'parked', 'offline'];

export default function FilterChips() {
  const trucks = useFleetStore((s) => s.trucks);
  const statusFilter = useFleetStore((s) => s.statusFilter);
  const cargoFilter = useFleetStore((s) => s.cargoFilter);
  const routeFilter = useFleetStore((s) => s.routeFilter);
  const driverSearch = useFleetStore((s) => s.driverSearch);
  const setStatusFilter = useFleetStore((s) => s.setStatusFilter);
  const setCargoFilter = useFleetStore((s) => s.setCargoFilter);
  const setRouteFilter = useFleetStore((s) => s.setRouteFilter);
  const setDriverSearch = useFleetStore((s) => s.setDriverSearch);
  const clearFilters = useFleetStore((s) => s.clearFilters);

  const cargoTypes = useMemo(
    () => [...new Set(trucks.map((t) => t.cargo_type).filter(Boolean))] as string[],
    [trucks]
  );
  const routes = useMemo(
    () => [...new Set(trucks.map((t) => t.assigned_route).filter(Boolean))] as string[],
    [trucks]
  );

  const activeCount =
    statusFilter.length + cargoFilter.length + routeFilter.length + (driverSearch ? 1 : 0);

  function toggleChip<T extends string>(current: T[], value: T, setter: (v: T[]) => void) {
    if (current.includes(value)) {
      setter(current.filter((c) => c !== value));
    } else {
      setter([...current, value]);
    }
  }

  return (
    <div className="px-3 py-3 border-b border-border space-y-2.5">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          type="text"
          placeholder="Search driver or truck..."
          value={driverSearch}
          onChange={(e) => setDriverSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Status */}
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => {
          const active = statusFilter.includes(s);
          return (
            <button
              key={s}
              onClick={() => toggleChip(statusFilter, s, setStatusFilter)}
              className="rounded-full px-3 py-1 text-xs cursor-pointer transition-all duration-200"
              style={
                active
                  ? { backgroundColor: ACCENT, color: '#fff' }
                  : { backgroundColor: '#f3f4f6', color: '#6b7280' }
              }
            >
              {STATUS_LABELS[s]}
            </button>
          );
        })}
      </div>

      {/* Cargo */}
      {cargoTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {cargoTypes.map((c) => {
            const active = cargoFilter.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleChip(cargoFilter, c, setCargoFilter)}
                className="rounded-full px-3 py-1 text-xs cursor-pointer transition-all duration-200"
                style={
                  active
                    ? { backgroundColor: ACCENT, color: '#fff' }
                    : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Routes */}
      {routes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {routes.map((r) => {
            const active = routeFilter.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleChip(routeFilter, r, setRouteFilter)}
                className="rounded-full px-3 py-1 text-xs cursor-pointer transition-all duration-200 max-w-[140px] truncate"
                style={
                  active
                    ? { backgroundColor: ACCENT, color: '#fff' }
                    : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                }
              >
                {r}
              </button>
            );
          })}
        </div>
      )}

      {/* Clear */}
      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs text-accent hover:underline cursor-pointer"
        >
          <X size={12} />
          Clear all ({activeCount})
        </button>
      )}
    </div>
  );
}
