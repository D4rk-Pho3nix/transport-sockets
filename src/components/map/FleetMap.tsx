import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useFleetStore, getFilteredTrucks } from '../../stores/useFleetStore';
import {
  TILE_URL,
  TILE_ATTRIBUTION,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
} from '../../lib/constants';
import TruckMarker from './TruckMarker';
import BreadcrumbTrail from './BreadcrumbTrail';
import FollowCam from './FollowCam';
import 'leaflet/dist/leaflet.css';

function MapEvents() {
  const map = useMap();
  const selectedTruckId = useFleetStore((s) => s.selectedTruckId);
  const positions = useFleetStore((s) => s.positions);
  const viewMode = useFleetStore((s) => s.viewMode);

  useEffect(() => {
    if (viewMode === 'individual' && selectedTruckId) {
      const pos = positions[selectedTruckId];
      if (pos) {
        map.flyTo([pos.lat, pos.lng], 14, { duration: 0.8 });
      }
    }
  }, [selectedTruckId, viewMode]);

  return null;
}

function MapContent() {
  const viewMode = useFleetStore((s) => s.viewMode);
  const selectedTruckId = useFleetStore((s) => s.selectedTruckId);
  const markerStyle = useFleetStore((s) => s.markerStyle);
  const positions = useFleetStore((s) => s.positions);
  const trails = useFleetStore((s) => s.trails);
  const filteredTrucks = useFleetStore(getFilteredTrucks);
  const selectTruck = useFleetStore((s) => s.selectTruck);

  const trucksToRender =
    viewMode === 'individual' && selectedTruckId
      ? filteredTrucks.filter((t) => t.id === selectedTruckId)
      : filteredTrucks;

  const allTrucksWithPositions = trucksToRender.filter(
    (t) => positions[t.id]
  );

  return (
    <>
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

      {allTrucksWithPositions.map((truck) => {
        const trailPoints = trails[truck.id] || [];
        const isSelected = truck.id === selectedTruckId;
        const isDimmed =
          viewMode === 'individual' &&
          selectedTruckId !== null &&
          truck.id !== selectedTruckId;

        return (
          <BreadcrumbTrail
            key={`trail-${truck.id}`}
            trailPoints={trailPoints}
            colorHex={truck.color_hex}
            isSelected={isSelected}
            isDimmed={isDimmed}
          />
        );
      })}

      {allTrucksWithPositions.map((truck) => {
        const isSelected = truck.id === selectedTruckId;
        const isDimmed =
          viewMode === 'individual' &&
          selectedTruckId !== null &&
          truck.id !== selectedTruckId;

        return (
          <TruckMarker
            key={`marker-${truck.id}`}
            truck={truck}
            position={positions[truck.id]}
            markerStyle={markerStyle}
            isSelected={isSelected}
            isDimmed={isDimmed}
            onClick={() => selectTruck(truck.id)}
          />
        );
      })}

      <MapEvents />
      <FollowCam />
    </>
  );
}

export default function FleetMap() {
  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      zoomControl={true}
      className="w-full h-full"
    >
      <MapContent />
    </MapContainer>
  );
}
