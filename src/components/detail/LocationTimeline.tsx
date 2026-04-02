import type { TimelineSnapshot } from '../../types';
import { formatTimeIST } from '../../lib/formatters';

interface LocationTimelineProps {
  snapshots: TimelineSnapshot[];
  colorHex: string;
}

export default function LocationTimeline({ snapshots, colorHex }: LocationTimelineProps) {
  if (snapshots.length < 2) {
    return (
      <div className="px-4 py-4">
        <h3 className="text-xs font-semibold text-text-primary mb-2">Timeline</h3>
        <p className="text-xs text-text-faint italic">
          Timeline builds as the truck moves.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <h3 className="text-xs font-semibold text-text-primary mb-3">Timeline</h3>
      <div className="space-y-0">
        {snapshots.map((snap, i) => {
          const isFirst = i === 0;
          const isLast = i === snapshots.length - 1;

          return (
            <div key={snap.id} className="flex items-start gap-3 min-h-[36px]">
              {/* Time */}
              <span className="text-[10px] font-mono text-text-muted w-14 text-right shrink-0 pt-0.5">
                {formatTimeIST(snap.snapshot_time)}
              </span>

              {/* Dot + line */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 ${isFirst ? 'live-pulse' : ''}`}
                  style={{
                    borderColor: colorHex,
                    backgroundColor: isFirst ? colorHex : 'white',
                  }}
                />
                {!isLast && (
                  <div
                    className="w-px flex-1 min-h-[20px]"
                    style={{ backgroundColor: `${colorHex}40` }}
                  />
                )}
              </div>

              {/* Landmark */}
              <span className="text-xs text-text-primary pt-0.5 leading-tight">
                {snap.landmark_name || `${snap.latitude.toFixed(4)}, ${snap.longitude.toFixed(4)}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
