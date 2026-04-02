import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { formatTimeIST } from '../../lib/formatters';

interface TimestampLabelProps {
  position: [number, number];
  time: string;
  colorHex: string;
}

export default function TimestampLabel({ position, time, colorHex }: TimestampLabelProps) {
  const icon = L.divIcon({
    className: '',
    html: `<div class="timestamp-pill" style="border-color: ${colorHex}">${formatTimeIST(time)}</div>`,
    iconSize: [60, 20],
    iconAnchor: [30, 10],
  });

  return <Marker position={position} icon={icon} interactive={false} />;
}
