import {
  Truck,
  Navigation,
  Clock,
  MapPin,
  Package,
} from 'lucide-react';
import { useFleetStore, getKPIStats } from '../../stores/useFleetStore';
import { STATUS_COLORS, ACCENT } from '../../lib/constants';
import KPICard from './KPICard';
import AlertBell from './AlertBell';

export default function KPIStrip() {
  const stats = useFleetStore(getKPIStats);

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center px-4 shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-6">
        <Truck size={20} style={{ color: ACCENT }} />
        <span className="text-lg font-semibold" style={{ color: ACCENT }}>
          FleetPulse
        </span>
      </div>

      {/* KPI cards */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        <KPICard
          label="Total"
          value={stats.total}
          icon={<Package size={14} />}
          color={ACCENT}
        />
        <div className="w-px h-6 bg-border mx-1" />
        <KPICard
          label="Moving"
          value={stats.moving}
          icon={<Navigation size={14} />}
          color={STATUS_COLORS.moving}
        />
        <KPICard
          label="Idle"
          value={stats.idle}
          icon={<Clock size={14} />}
          color={STATUS_COLORS.idle}
        />
        <KPICard
          label="Parked"
          value={stats.parked}
          icon={<MapPin size={14} />}
          color={STATUS_COLORS.parked}
        />
        <KPICard
          label="Offline"
          value={stats.offline}
          icon={<Truck size={14} />}
          color={STATUS_COLORS.offline}
        />
        <div className="w-px h-6 bg-border mx-1" />
        <KPICard
          label="Distance (km)"
          value={stats.totalDistance}
          icon={<Navigation size={14} />}
          color={ACCENT}
          decimals={1}
        />
      </div>

      {/* Alert bell */}
      <div className="ml-2">
        <AlertBell />
      </div>
    </header>
  );
}
