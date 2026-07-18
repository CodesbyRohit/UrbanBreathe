import { useState, useEffect, useCallback } from 'react';
import type { SourceAttribution } from '../types';
import { getSources } from '../services/api';

export function useSourceAttribution(cityId: string | null) {
  const [data, setData] = useState<SourceAttribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!cityId) return;
    setLoading(true);
    setError(null);
    getSources(cityId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [cityId]);

  useEffect(() => {
    if (cityId) fetch();
  }, [cityId, fetch]);

  return { data, loading, error, refresh: fetch };
}
