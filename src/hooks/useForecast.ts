import { useState, useEffect, useCallback } from 'react';
import type { Forecast } from '../types';
import { getForecast } from '../services/api';

export function useForecast(cityId: string | null) {
  const [data, setData] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!cityId) return;
    setLoading(true);
    setError(null);
    getForecast(cityId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [cityId]);

  useEffect(() => {
    if (cityId) fetch();
  }, [cityId, fetch]);

  return { data, loading, error, refresh: fetch };
}
