import { useState, useEffect, useCallback } from 'react';
import type { City, AirQualityData } from '../types';
import { getCities, getAirQuality } from '../services/api';

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCities()
      .then(setCities)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { cities, loading, error };
}

export function useAirQuality(city: City | null) {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!city) return;
    setLoading(true);
    setError(null);
    getAirQuality(city.id, city.lat, city.lon)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [city]);

  useEffect(() => {
    if (city) refresh();
  }, [city, refresh]);

  return { data, loading, error, refresh };
}
