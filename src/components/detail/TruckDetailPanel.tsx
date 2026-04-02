import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin } from 'lucide-react';
import type { Truck } from '../../types';
import { useFleetStore } from '../../stores/useFleetStore';
import StatusBadge from '../ui/StatusBadge';
import DriverCard from './DriverCard';
import LiveMetrics from './LiveMetrics';
import LocationTimeline from './LocationTimeline';
import LastTrips from './LastTrips';
import CallDriverModal from './CallDriverModal';

interface TruckDetailPanelProps {
  truck: Truck;
}

export default function TruckDetailPanel({ truck }: TruckDetailPanelProps) {
  const [showCallModal, setShowCallModal] = useState(false);
  const viewMode = useFleetStore((s) => s.viewMode);
  const positions = useFleetStore((s) => s.positions);
  const dailyDistances = useFleetStore((s) => s.dailyDistances);
  const timelineSnapshots = useFleetStore((s) => s.timelineSnapshots);
  const closeDetailPanel = useFleetStore((s) => s.closeDetailPanel);

  const position = positions[truck.id];
  const distance = dailyDistances[truck.id] || 0;
  const snapshots = timelineSnapshots[truck.id] || [];
  const panelWidth = viewMode === 'individual' ? 480 : 400;

  return (
    <>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full bg-surface border-l border-border flex flex-col overflow-hidden shrink-0 z-10"
        style={{ width: panelWidth }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-8 rounded-full"
                style={{ backgroundColor: truck.color_hex }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">
                    {truck.truck_number}
                  </span>
                  <StatusBadge status={truck.status} />
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {truck.number_plate}
                </div>
              </div>
            </div>
            <button
              onClick={closeDetailPanel}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X size={16} className="text-text-faint" />
            </button>
          </div>

          {/* Route + Call */}
          <div className="flex items-center justify-between mt-2.5">
            {truck.assigned_route && (
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <MapPin size={12} />
                <span className="truncate max-w-[200px]">{truck.assigned_route}</span>
              </div>
            )}
            {truck.drivers && (
              <button
                onClick={() => setShowCallModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: truck.color_hex }}
              >
                <Phone size={12} />
                Call Driver
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {truck.drivers && <DriverCard driver={truck.drivers} />}
          <LiveMetrics position={position} distance={distance} cargoType={truck.cargo_type} />
          <div className="border-t border-border">
            <LocationTimeline snapshots={snapshots} colorHex={truck.color_hex} />
          </div>
          <LastTrips />
        </div>
      </motion.div>

      {/* Call modal */}
      <AnimatePresence>
        {showCallModal && truck.drivers && (
          <CallDriverModal
            driver={truck.drivers}
            colorHex={truck.color_hex}
            onClose={() => setShowCallModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
