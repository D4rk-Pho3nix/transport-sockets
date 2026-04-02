import { useState, useEffect, useRef, useCallback } from 'react';

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  accuracy: number | null;
  error: string | null;
  permissionDenied: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    speed: null,
    accuracy: null,
    error: null,
    permissionDenied: false,
  });

  const watchRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by this browser.' }));
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          accuracy: position.coords.accuracy,
          error: null,
          permissionDenied: false,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState(s => ({ ...s, error: 'Location permission denied.', permissionDenied: true }));
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setState(s => ({ ...s, error: 'GPS signal lost. Retrying...' }));
        } else {
          setState(s => ({ ...s, error: err.message }));
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, [start]);

  return state;
}
