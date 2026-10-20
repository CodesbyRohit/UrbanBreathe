import { useEffect, useState } from 'react';
import type { City, AirQualityData } from '../types';
import { getCities, getAirQuality } from '../services/api';
import { useResource } from './useResource';

export function useCities() {
  return useResource<City[]>('cities', getCities);
}

export function useAirQuality(cityId: string | null) {
  return useResource<AirQualityData>(cityId, signal => getAirQuality(cityId as string, signal));
}

/**
 * Current estimates for every city, for the map and the comparison view.
 * A city whose request fails is recorded as null ("no estimate") — never a
 * substitute value. Requests are aborted on unmount or when the list changes.
 */
export function useAllCitiesAirQuality(cities: City[], reloadKey = 0) {
  const [map, setMap] = useState<Record<string, AirQualityData | null>>({});
  const ids = cities.map(c => c.id).join(',');

  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    ids.split(',').forEach(id => {
      getAirQuality(id, controller.signal)
        .then(data => { if (!controller.signal.aborted) setMap(prev => ({ ...prev, [id]: data })); })
        .catch(err => {
          if (controller.signal.aborted || err?.name === 'AbortError') return;
          setMap(prev => ({ ...prev, [id]: prev[id] ?? null }));
        });
    });
    return () => controller.abort();
  }, [ids, reloadKey]);

  return map;
}
