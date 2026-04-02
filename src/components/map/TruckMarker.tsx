import { useRef, useEffect } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Truck, TruckPosition } from '../../types';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatSpeed } from '../../lib/formatters';

interface TruckMarkerProps {
  truck: Truck;
  position: TruckPosition;
  markerStyle: 'truck' | 'driver';
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
}

function buildTruckIcon(truck: Truck, isSelected: boolean, isDimmed: boolean): L.DivIcon {
  const pulse = '';
  const dimClass = isDimmed ? 'opacity-40 grayscale' : '';
  const offlineClass = truck.status === 'offline' ? 'grayscale' : '';
  const selectedScale = isSelected ? 'transform: scale(1.15);' : '';

  const svgHtml = `
    <svg width="40" height="20" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="6" width="48" height="24" rx="2" fill="${truck.color_hex}" />
      <path d="M48 12 H66 Q72 12 74 18 L76 24 V30 H48 V12Z" fill="#2D3436" />
      <path d="M56 14 H64 Q68 14 70 18 L72 22 H56 V14Z" fill="#636e72" opacity="0.6" />
      <rect x="0" y="30" width="76" height="2" rx="1" fill="#2D3436" />
      <circle cx="14" cy="34" r="5" fill="#1a1a1a" /><circle cx="14" cy="34" r="2.5" fill="#333" />
      <circle cx="28" cy="34" r="5" fill="#1a1a1a" /><circle cx="28" cy="34" r="2.5" fill="#333" />
      <circle cx="66" cy="34" r="5" fill="#1a1a1a" /><circle cx="66" cy="34" r="2.5" fill="#333" />
    </svg>`;

  const html = `
    <div class="truck-marker ${pulse} ${dimClass} ${offlineClass}" style="${selectedScale}">
      ${svgHtml}
      <span class="truck-marker-label">${truck.truck_number}</span>
    </div>`;

  return L.divIcon({
    className: '',
    html,
    iconSize: [48, 36],
    iconAnchor: [24, 36],
  });
}

function buildDriverIcon(truck: Truck, isSelected: boolean, isDimmed: boolean): L.DivIcon {
  const driverName = truck.drivers?.full_name || truck.truck_number;
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(driverName)}`;
  const dimClass = isDimmed ? 'opacity-40 grayscale' : '';
  const offlineClass = truck.status === 'offline' ? 'grayscale' : '';
  const selectedScale = isSelected ? 'transform: scale(1.15);' : '';
  const borderWidth = isSelected ? '4px' : '3px';

  const html = `
    <div class="driver-marker ${dimClass} ${offlineClass}" style="${selectedScale}">
      <img src="${avatarUrl}" class="driver-photo" style="border-color: ${truck.color_hex}; border-width: ${borderWidth};" />
    </div>`;

  return L.divIcon({
    className: '',
    html,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

export default function TruckMarker({
  truck,
  position,
  markerStyle,
  isSelected,
  isDimmed,
  onClick,
}: TruckMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const prevTimestampRef = useRef<string>(position.timestamp);

  useEffect(() => {
    if (position.timestamp !== prevTimestampRef.current) {
      prevTimestampRef.current = position.timestamp;
      const el = markerRef.current?.getElement();
      if (el) {
        const inner = el.querySelector('.truck-marker, .driver-marker');
        if (inner) {
          inner.classList.add('marker-pulse');
          setTimeout(() => inner.classList.remove('marker-pulse'), 600);
        }
      }
    }
  }, [position.timestamp]);

  const icon =
    markerStyle === 'truck'
      ? buildTruckIcon(truck, isSelected, isDimmed)
      : buildDriverIcon(truck, isSelected, isDimmed);

  return (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
        <div className="text-xs leading-relaxed">
          <div className="font-semibold">{truck.truck_number}</div>
          <div className="text-text-muted">{truck.number_plate}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: STATUS_COLORS[truck.status] }}
            />
            <span>{STATUS_LABELS[truck.status]}</span>
            <span className="text-text-faint">|</span>
            <span className="font-mono">{formatSpeed(position.speed)}</span>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}
