import { useState, useEffect } from 'react';
import { Gauge, Navigation, Clock, Package } from 'lucide-react';
import type { TruckPosition } from '../../types';
import { formatSpeed, formatDistance, timeAgo } from '../../lib/formatters';

interface LiveMetricsProps {
  position?: TruckPosition;
  distance: number;
  cargoType: string | null;
}

function MetricChip({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 bg-surface-active rounded-xl">
      <span className="text-text-faint">{icon}</span>
      <span className="font-mono text-sm font-semibold text-text-primary">
        {value}
      </span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

export default function LiveMetrics({ position, distance, cargoType }: LiveMetricsProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-4 gap-2">
        <MetricChip
          icon={<Gauge size={14} />}
          value={position ? formatSpeed(position.speed) : '--'}
          label="Speed"
        />
        <MetricChip
          icon={<Navigation size={14} />}
          value={formatDistance(distance)}
          label="Distance"
        />
        <MetricChip
          icon={<Clock size={14} />}
          value={position ? timeAgo(position.timestamp) : '--'}
          label="Last Ping"
        />
        <MetricChip
          icon={<Package size={14} />}
          value={cargoType || '--'}
          label="Cargo"
        />
      </div>
    </div>
  );
}
