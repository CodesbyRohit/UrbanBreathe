import { useState, useEffect, useCallback, useRef } from 'react';
import type { SourceAttribution } from '../types';
import { getSources } from '../services/api';

export function useSourceAttribution(cityId: string | null) {
  const [data, setData] = useState<SourceAttribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const latestRef = useRef<string | null>(null);

  const fetch = useCallback(() => {
    if (!cityId) return;

    // Cancel any in-flight request from a previous city
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    latestRef.current = cityId;

    setLoading(true);
    setError(null);
    getSources(cityId, controller.signal)
      .then(result => {
        if (latestRef.current === cityId) setData(result);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        if (latestRef.current === cityId) setError(err.message);
      })
      .finally(() => {
        if (latestRef.current === cityId) setLoading(false);
      });
  }, [cityId]);

  useEffect(() => {
    if (cityId) fetch();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cityId, fetch]);

  return { data, loading, error, refresh: fetch };
}
