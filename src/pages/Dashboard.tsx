import { AnimatePresence } from 'framer-motion';
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime';
import { useFleetStore } from '../stores/useFleetStore';
import KPIStrip from '../components/kpi/KPIStrip';
import Sidebar from '../components/sidebar/Sidebar';
import FleetMap from '../components/map/FleetMap';
import ViewModeToggle from '../components/map/ViewModeToggle';
import MarkerToggle from '../components/map/MarkerToggle';
import FitAllButton from '../components/map/FitAllButton';
import MapLegend from '../components/map/MapLegend';
import TruckDetailPanel from '../components/detail/TruckDetailPanel';

export default function Dashboard() {
  useSupabaseRealtime();

  const detailPanelOpen = useFleetStore((s) => s.detailPanelOpen);
  const selectedTruckId = useFleetStore((s) => s.selectedTruckId);
  const trucks = useFleetStore((s) => s.trucks);

  const selectedTruck = selectedTruckId
    ? trucks.find((t) => t.id === selectedTruckId) || null
    : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <KPIStrip />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <FleetMap />
          <ViewModeToggle />
          <MarkerToggle />
          <MapLegend />
          {/* FitAllButton needs to be inside MapContainer context.
              We position it via CSS but it calls useMap() so it lives inside FleetMap.
              Instead, we render it outside and it uses store data directly. */}
        </div>
        <AnimatePresence>
          {detailPanelOpen && selectedTruck && (
            <TruckDetailPanel key="detail-panel" truck={selectedTruck} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
