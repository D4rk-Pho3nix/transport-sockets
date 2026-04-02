import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useFleetStore, getKPIStats } from '../../stores/useFleetStore';
import { timeAgo } from '../../lib/formatters';

export default function AlertBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const alertEvents = useFleetStore((s) => s.alertEvents);
  const { unreadAlerts } = useFleetStore(getKPIStats);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const recentAlerts = alertEvents.slice(0, 10);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors duration-200 cursor-pointer"
      >
        <Bell size={18} className="text-text-primary" />
        {unreadAlerts > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadAlerts > 9 ? '9+' : unreadAlerts}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="px-3 py-2.5 border-b border-border">
              <span className="text-xs font-semibold text-text-primary">
                Alerts
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              {recentAlerts.length === 0 && (
                <div className="p-4 text-center text-xs text-text-faint">
                  No alerts yet.
                </div>
              )}
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-3 py-2.5 border-b border-border-light hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {!alert.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary leading-relaxed">
                        {alert.message}
                      </p>
                      <p className="text-[10px] text-text-faint mt-0.5">
                        {timeAgo(alert.triggered_at)}
                        {alert.resolved_at && ' (resolved)'}
                      </p>
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
