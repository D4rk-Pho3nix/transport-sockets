import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../lib/supabase';
import { useGeolocation } from '../hooks/useGeolocation';
import { PING_INTERVAL_MS } from '../lib/constants';

export default function DriverTrack() {
  const { truckToken } = useParams<{ truckToken: string }>();
  const [truckId, setTruckId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invalidToken, setInvalidToken] = useState(false);
  const geo = useGeolocation();
  const lastPingRef = useRef(0);
  const truckIdRef = useRef<string | null>(null);

  // Resolve tracking token to truck ID
  useEffect(() => {
    if (!truckToken) {
      setInvalidToken(true);
      return;
    }

    async function resolve() {
      const { data, error: err } = await supabase
        .from('trucks')
        .select('id')
        .eq('tracking_token', truckToken)
        .single();

      if (err || !data) {
        setInvalidToken(true);
        return;
      }

      setTruckId(data.id);
      truckIdRef.current = data.id;
    }

    resolve();
  }, [truckToken]);

  // Send pings every 3 seconds
  useEffect(() => {
    if (!truckId || geo.latitude === null || geo.longitude === null) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      if (now - lastPingRef.current < PING_INTERVAL_MS - 200) return;
      lastPingRef.current = now;

      const speedKmh = geo.speed !== null ? geo.speed * 3.6 : 0;

      await supabase.from('location_pings').insert({
        truck_id: truckId,
        latitude: geo.latitude,
        longitude: geo.longitude,
        speed_kmh: Math.max(0, speedKmh),
        accuracy_m: geo.accuracy,
      });

      await supabase
        .from('trucks')
        .update({ status: speedKmh > 2 ? 'moving' : 'idle' })
        .eq('id', truckId);
    }, PING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [truckId, geo.latitude, geo.longitude, geo.speed, geo.accuracy]);

  // Set offline on tab close
  useEffect(() => {
    const handleUnload = () => {
      if (truckIdRef.current) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/trucks?id=eq.${truckIdRef.current}`,
          JSON.stringify({ status: 'offline' })
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Invalid token
  if (invalidToken) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'Inter, sans-serif', padding: '20px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#x26A0;</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
            Invalid Tracking Link
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            This tracking URL is not valid. Please contact your fleet manager for the correct link.
          </p>
        </div>
      </div>
    );
  }

  // GPS permission denied
  if (geo.permissionDenied) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'Inter, sans-serif', padding: '20px',
        background: '#fafafa',
      }}>
        <div style={{
          textAlign: 'center', maxWidth: '420px',
          background: 'white', borderRadius: '16px', padding: '32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#x1F4CD;</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>
            Location Permission Required
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
            FleetPulse needs your location to track this truck in real time.
          </p>
          <div style={{
            textAlign: 'left', background: '#f9fafb', borderRadius: '12px',
            padding: '16px', fontSize: '13px', color: '#374151', lineHeight: 1.7,
          }}>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Android Chrome:</p>
            <p>Settings &rarr; Site Settings &rarr; Location &rarr; Allow</p>
            <p style={{ fontWeight: 600, marginBottom: '8px', marginTop: '12px' }}>iOS Safari:</p>
            <p>Settings &rarr; Safari &rarr; Location &rarr; Allow</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px', padding: '10px 24px',
              background: '#01696f', color: 'white', border: 'none',
              borderRadius: '8px', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // GPS error (not permission)
  if (geo.error && !geo.permissionDenied) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'Inter, sans-serif',
      }}>
        <p style={{ color: '#f59e0b', fontSize: '14px' }}>{geo.error}</p>
      </div>
    );
  }

  // Completely blank — tracking is active
  return null;
}
