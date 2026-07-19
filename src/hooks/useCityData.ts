import { useState, useEffect, useCallback, useRef } from 'react';
import type { City, AirQualityData } from '../types';
import { getCities, getAirQuality } from '../services/api';

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getCities(controller.signal)
      .then(setCities)
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return { cities, loading, error };
}

export function useAirQuality(city: City | null) {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const latestCityRef = useRef<string | null>(null);

  const refresh = useCallback(() => {
    if (!city) return;

    // Cancel any in-flight request from a previous city selection
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    latestCityRef.current = city.id;

    setLoading(true);
    setError(null);
    getAirQuality(city.id, city.lat, city.lon, controller.signal)
      .then(result => {
        // Only update state if this is still the latest requested city
        if (latestCityRef.current === city.id) {
          setData(result);
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        if (latestCityRef.current === city.id) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (latestCityRef.current === city.id) {
          setLoading(false);
        }
      });
  }, [city]);

  useEffect(() => {
    if (city) refresh();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [city, refresh]);

  return { data, loading, error, refresh };
}
