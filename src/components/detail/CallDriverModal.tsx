import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Phone, X } from 'lucide-react';
import type { Driver } from '../../types';

interface CallDriverModalProps {
  driver: Driver;
  colorHex: string;
  onClose: () => void;
}

export default function CallDriverModal({ driver, colorHex, onClose }: CallDriverModalProps) {
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(driver.full_name)}`;

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const formatted = driver.phone_number.replace(
    /(\d{2})(\d{5})(\d{5})/,
    '+$1 $2 $3'
  );

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-surface rounded-2xl shadow-2xl p-8 w-80 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <X size={16} className="text-text-faint" />
        </button>

        <img
          src={avatarUrl}
          alt={driver.full_name}
          className="w-20 h-20 rounded-full mx-auto mb-4 border-4"
          style={{ borderColor: colorHex }}
        />
        <h3 className="text-lg font-semibold text-text-primary">{driver.full_name}</h3>
        <p className="text-sm text-text-muted font-mono mt-1">{formatted}</p>

        <a
          href={`tel:${driver.phone_number}`}
          className="flex items-center justify-center gap-2 mt-6 px-6 py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: colorHex }}
        >
          <Phone size={16} />
          Call Driver
        </a>
      </motion.div>
    </motion.div>,
    document.body
  );
}
