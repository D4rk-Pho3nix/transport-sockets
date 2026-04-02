import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const DUMMY_TRIPS = [
  { date: 'Mar 31', from: 'Bangalore Warehouse', to: 'Mysore Hub', distance: '148.2 km', color: '#22c55e' },
  { date: 'Mar 30', from: 'Mysore Hub', to: 'Ooty Depot', distance: '126.5 km', color: '#3b82f6' },
  { date: 'Mar 29', from: 'Bangalore Warehouse', to: 'Hassan Center', distance: '187.3 km', color: '#f59e0b' },
  { date: 'Mar 28', from: 'Hassan Center', to: 'Mangalore Port', distance: '173.8 km', color: '#8b5cf6' },
  { date: 'Mar 27', from: 'Mangalore Port', to: 'Bangalore Warehouse', distance: '352.1 km', color: '#ec4899' },
];

export default function LastTrips() {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 py-3 border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full cursor-pointer"
      >
        <span className="text-xs font-semibold text-text-primary">Last Trips</span>
        <ChevronDown
          size={14}
          className="text-text-faint transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 space-y-2">
              {DUMMY_TRIPS.map((trip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: trip.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{trip.date}</span>
                      <span className="text-xs font-mono text-text-faint">
                        {trip.distance}
                      </span>
                    </div>
                    <div className="text-xs text-text-primary truncate">
                      {trip.from} &rarr; {trip.to}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
