import { Polyline } from 'react-leaflet';
import type { TrailPoint } from '../../types';
import TimestampLabel from './TimestampLabel';

interface BreadcrumbTrailProps {
  trailPoints: TrailPoint[];
  colorHex: string;
  isSelected: boolean;
  isDimmed: boolean;
}

export default function BreadcrumbTrail({
  trailPoints,
  colorHex,
  isSelected,
  isDimmed,
}: BreadcrumbTrailProps) {
  if (trailPoints.length < 2) return null;

  const positions = trailPoints.map((p) => [p.lat, p.lng] as [number, number]);

  const thirtyMinMs = 30 * 60 * 1000;
  const labels: { position: [number, number]; time: string }[] = [];
  let lastLabelTime = 0;

  for (const point of trailPoints) {
    const t = new Date(point.timestamp).getTime();
    if (t - lastLabelTime >= thirtyMinMs) {
      labels.push({ position: [point.lat, point.lng], time: point.timestamp });
      lastLabelTime = t;
    }
  }

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: colorHex,
          weight: isSelected ? 4 : 3,
          opacity: isDimmed ? 0.15 : 0.7,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      {!isDimmed &&
        labels.map((l, i) => (
          <TimestampLabel
            key={i}
            position={l.position}
            time={l.time}
            colorHex={colorHex}
          />
        ))}
    </>
  );
}
