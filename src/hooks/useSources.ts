import { useState, useEffect, useCallback } from 'react';
import type { SourceAttribution } from '../types';
import { getSources } from '../services/api';

export function useSourceAttribution(cityId: string | null) {
  const [data, setData] = useState<SourceAttribution | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(() => {
    if (!cityId) return;
    setLoading(true);
    getSources(cityId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cityId]);

  useEffect(() => {
    if (cityId) fetch();
  }, [cityId, fetch]);

  return { data, loading, refresh: fetch };
}
