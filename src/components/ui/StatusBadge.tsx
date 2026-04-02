import { motion } from 'framer-motion';
import type { TruckStatus } from '../../types';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';

interface StatusBadgeProps {
  status: TruckStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-active">
      <motion.span
        className="w-2 h-2 rounded-full inline-block"
        animate={{ backgroundColor: color }}
        transition={{ duration: 0.4 }}
      />
      <span className="text-text-primary">{label}</span>
    </span>
  );
}
