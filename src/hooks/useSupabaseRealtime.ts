import { useEffect, useRef } from 'react';
import supabase from '../lib/supabase';
import { useFleetStore } from '../stores/useFleetStore';
import { haversineDistance } from '../lib/haversine';
import { getISTDate } from '../lib/formatters';
import type { LocationPing, TrailPoint, TimelineSnapshot } from '../types';

export function useSupabaseRealtime() {
  const store = useFleetStore();
  const initialized = useRef(false);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      const today = getISTDate();

      // Fetch trucks with drivers
      const { data: trucks } = await supabase
        .from('trucks')
        .select('*, drivers(*)')
        .order('truck_number');

      if (trucks) {
        store.setTrucks(trucks);
      }

      // Fetch today's pings to build trails + positions + distances
      const { data: pings } = await supabase
        .from('location_pings')
        .select('*')
        .gte('recorded_at', `${today}T00:00:00+05:30`)
        .order('recorded_at', { ascending: true });

      if (pings && pings.length > 0) {
        const positions: Record<string, { lat: number; lng: number; speed: number; accuracy: number; timestamp: string; truckId: string }> = {};
        const trails: Record<string, TrailPoint[]> = {};
        const distances: Record<string, number> = {};

        for (const ping of pings) {
          const tid = ping.truck_id;

          if (!trails[tid]) trails[tid] = [];

          const prevPoint = trails[tid].length > 0 ? trails[tid][trails[tid].length - 1] : null;
          if (prevPoint) {
            const d = haversineDistance(prevPoint.lat, prevPoint.lng, ping.latitude, ping.longitude);
            if (d < 1 && d > 0.001) {
              distances[tid] = (distances[tid] || 0) + d;
            }
          }

          trails[tid].push({ lat: ping.latitude, lng: ping.longitude, timestamp: ping.recorded_at });
          positions[tid] = {
            truckId: tid,
            lat: ping.latitude,
            lng: ping.longitude,
            speed: ping.speed_kmh || 0,
            accuracy: ping.accuracy_m || 0,
            timestamp: ping.recorded_at,
          };
        }

        store.setPositions(positions);
        store.setTrails(trails);

        // Merge with seeded distances
        const { data: seededDistances } = await supabase
          .from('daily_distance')
          .select('*')
          .eq('date_ist', today);

        const mergedDistances: Record<string, number> = {};
        if (seededDistances) {
          for (const sd of seededDistances) {
            mergedDistances[sd.truck_id] = sd.total_km;
          }
        }
        // Live-computed distances override seeded ones for trucks with real pings
        for (const [tid, d] of Object.entries(distances)) {
          mergedDistances[tid] = d;
        }
        store.setDailyDistances(mergedDistances);

        // Update truck statuses based on latest positions
        if (trucks) {
          const updatedTrucks = trucks.map(truck => {
            const pos = positions[truck.id];
            if (!pos) return truck;
            const speed = pos.speed;
            return { ...truck, status: speed > 2 ? 'moving' as const : 'idle' as const };
          });
          store.setTrucks(updatedTrucks);
        }
      } else {
        // No pings today, load seeded distances
        const { data: seededDistances } = await supabase
          .from('daily_distance')
          .select('*')
          .eq('date_ist', today);

        if (seededDistances) {
          const distances: Record<string, number> = {};
          for (const sd of seededDistances) {
            distances[sd.truck_id] = sd.total_km;
          }
          store.setDailyDistances(distances);
        }
      }

      // Fetch timeline snapshots
      const { data: snapshots } = await supabase
        .from('timeline_snapshots')
        .select('*')
        .eq('date_ist', today)
        .order('snapshot_time', { ascending: false });

      if (snapshots) {
        const grouped: Record<string, TimelineSnapshot[]> = {};
        for (const s of snapshots) {
          if (!grouped[s.truck_id]) grouped[s.truck_id] = [];
          grouped[s.truck_id].push(s);
        }
        store.setTimelineSnapshots(grouped);
      }

      // Fetch alert events
      const { data: alertEvents } = await supabase
        .from('alert_events')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(20);

      if (alertEvents) {
        store.setAlertEvents(alertEvents);
      }

      // Subscribe to real-time location pings
      const channel = supabase
        .channel('realtime-pings')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'location_pings' },
          (payload) => {
            const ping = payload.new as LocationPing;
            store.updatePosition(
              ping.truck_id,
              ping.latitude,
              ping.longitude,
              ping.speed_kmh || 0,
              ping.accuracy_m || 0,
              ping.recorded_at
            );
          }
        )
        .subscribe();

      // Status timeout checker (every 10s)
      statusIntervalRef.current = setInterval(() => {
        useFleetStore.getState().updateTruckStatuses();
      }, 10000);

      return () => {
        channel.unsubscribe();
        if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      };
    }

    init();
  }, []);
}
