import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useFleetStore } from '../../stores/useFleetStore';

export default function FollowCam() {
  const map = useMap();
  const viewMode = useFleetStore((s) => s.viewMode);
  const selectedTruckId = useFleetStore((s) => s.selectedTruckId);
  const positions = useFleetStore((s) => s.positions);

  useEffect(() => {
    if (viewMode !== 'individual' || !selectedTruckId) return;
    const pos = positions[selectedTruckId];
    if (!pos) return;
    map.panTo([pos.lat, pos.lng], { animate: true, duration: 0.5 });
  }, [
    viewMode,
    selectedTruckId,
    positions[selectedTruckId]?.lat,
    positions[selectedTruckId]?.lng,
    map,
  ]);

  return null;
}
