import type { Driver } from '../../types';

interface DriverCardProps {
  driver: Driver;
}

export default function DriverCard({ driver }: DriverCardProps) {
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(driver.full_name)}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <img
        src={avatarUrl}
        alt={driver.full_name}
        className="w-10 h-10 rounded-full bg-surface-active shrink-0"
      />
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {driver.full_name}
        </div>
        <div className="text-xs text-text-muted">
          {driver.licence_number}
        </div>
      </div>
    </div>
  );
}
