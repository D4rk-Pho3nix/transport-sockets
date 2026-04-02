import type { ReactNode } from 'react';
import AnimatedNumber from '../ui/AnimatedNumber';

interface KPICardProps {
  label: string;
  value: number;
  icon: ReactNode;
  color?: string;
  decimals?: number;
}

export default function KPICard({ label, value, icon, color, decimals = 0 }: KPICardProps) {
  return (
    <div className="flex items-center gap-2 px-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color ? `${color}15` : '#f3f4f6' }}
      >
        <span style={{ color: color || '#6b7280' }}>{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-text-primary leading-tight">
          <AnimatedNumber value={value} decimals={decimals} />
        </span>
        <span className="text-xs text-text-muted leading-tight">{label}</span>
      </div>
    </div>
  );
}
