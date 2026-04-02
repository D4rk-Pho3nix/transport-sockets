import { motion } from 'framer-motion';
import type { Truck, TruckPosition } from '../../types';
import TruckSVG from '../ui/TruckSVG';
import StatusBadge from '../ui/StatusBadge';
import LiveTimer from '../ui/LiveTimer';
import { formatDistance } from '../../lib/formatters';

interface TruckCardProps {
  truck: Truck;
  position?: TruckPosition;
  distance: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function TruckCard({
  truck,
  position,
  distance,
  isSelected,
  onClick,
}: TruckCardProps) {
  const timerSince = position?.timestamp || truck.created_at;

  return (
    <motion.div
      layout
      layoutId={truck.id}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 hover:bg-surface-hover"
      style={{
        borderLeft: isSelected ? `3px solid ${truck.color_hex}` : '3px solid transparent',
        backgroundColor: isSelected ? 'var(--color-surface-active)' : undefined,
        boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : undefined,
      }}
    >
      {/* Truck icon */}
      <div className="shrink-0 w-[60px] flex items-center justify-center">
        <TruckSVG colorHex={truck.color_hex} size={52} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary truncate">
            {truck.truck_number}
          </span>
          <StatusBadge status={truck.status} />
        </div>
        <div className="text-xs text-text-muted truncate mt-0.5">
          {truck.number_plate}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <LiveTimer since={timerSince} />
          <span className="font-mono text-xs text-text-faint">
            {formatDistance(distance)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
