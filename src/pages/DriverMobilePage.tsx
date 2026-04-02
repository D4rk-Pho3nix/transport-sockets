import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Power, LogOut, ShieldCheck, Map as MapIcon } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useFleetStore } from '../stores/useFleetStore';

export default function DriverMobilePage() {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const trucks = useFleetStore((s) => s.trucks);

  const assignedTruck = trucks.find(t => t.driver_id === `DRV-${user?.mobile === '8888888888' ? '1' : '2'}`) || trucks[0];

  const handleLogout = () => {
    stopBroadcasting();
    logout();
    navigate('/login');
  };

  const startBroadcasting = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsBroadcasting(true);
    setError(null);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        
        // In a real app, we'd emit this via Socket.io
        console.log(`Broadcasting: ${latitude}, ${longitude}`);
      },
      (err) => {
        setError(err.message);
        setIsBroadcasting(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const stopBroadcasting = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsBroadcasting(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#111111] flex flex-col transition-colors duration-500 overflow-hidden font-body">
      {/* Mobile Topbar */}
      <header className="p-6 flex items-center justify-between border-b border-[#E0E0E0] dark:border-[#2E2E2E]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white dark:border-black rounded-sm" />
          </div>
          <span className="text-lg font-display font-black tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0]">FleetTrack</span>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 rounded-xl bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#6B6B6B] dark:text-[#888888] hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col p-8 space-y-12">
        {/* Driver Profile Section */}
        <section className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-display font-black text-[#0A0A0A] dark:text-[#F0F0F0]">Welcome,</h2>
                   <p className="text-xl font-display font-bold text-[#6B6B6B] dark:text-[#888888]">Driver {user?.mobile === '8888888888' ? '1' : 'Admin'}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E] flex items-center justify-center text-2xl font-bold">
                    D
                </div>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E]">
               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: assignedTruck.color }} />
               <span className="text-sm font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">{assignedTruck.truck_number}</span>
               <span className="text-[10px] uppercase tracking-widest font-bold text-[#AAAAAA] dark:text-[#555555] font-mono">{assignedTruck.plate_number}</span>
            </div>
        </section>

        {/* Broadcasting Status Card */}
        <section className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="relative">
                <AnimatePresence>
                    {isBroadcasting && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full bg-green-500/20"
                        />
                    )}
                </AnimatePresence>
                <div className={`w-32 h-32 rounded-full border-4 border-[#E0E0E0] dark:border-[#2E2E2E] flex items-center justify-center transition-all duration-500 ${isBroadcasting ? 'bg-green-500 border-green-200 dark:border-green-900 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'bg-[#F5F5F5] dark:bg-[#1A1A1A]'}`}>
                    <Navigation className={`w-12 h-12 transition-all duration-500 ${isBroadcasting ? 'text-white translate-y-[-2px]' : 'text-[#AAAAAA] dark:text-[#555555]'}`} />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h3 className={`text-xl font-display font-bold uppercase tracking-widest transition-colors ${isBroadcasting ? 'text-green-500' : 'text-[#6B6B6B] dark:text-[#888888]'}`}>
                    {isBroadcasting ? 'Broadcasting Live' : 'Broadcasting Off'}
                </h3>
                <p className="text-sm text-[#AAAAAA] dark:text-[#555555] font-medium">GPS Accuracy: {coords ? 'High' : 'Waiting...'}</p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-500 text-xs text-center font-medium">
                {error}
              </div>
            )}
        </section>

        {/* Action Button */}
        <section className="pb-8">
             <button 
                onClick={isBroadcasting ? stopBroadcasting : startBroadcasting}
                className={`w-full py-6 rounded-3xl font-display font-black text-xl tracking-tight shadow-xl transition-all active:scale-95 duration-200 flex items-center justify-center gap-4 ${isBroadcasting ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-black dark:bg-white text-white dark:text-black shadow-black/20 dark:shadow-white/10'}`}
             >
                <Power className="w-6 h-6" />
                {isBroadcasting ? 'STOP SHARING' : 'START SHARING'}
             </button>
             
             <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-2xl text-center space-y-1">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Today's KM</p>
                   <p className="font-display font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">{assignedTruck.daily_distance.toFixed(1)}</p>
                </div>
                <div className="p-4 bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-2xl text-center space-y-1">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555]">Active For</p>
                   <p className="font-display font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">{isBroadcasting ? '2h 14m' : '—'}</p>
                </div>
             </div>
        </section>

        <section className="pb-4 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AAAAAA] dark:text-[#555555] uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Secure Protocol v1.0
            </div>
        </section>
      </main>
    </div>
  );
}
