import type { Forecast } from '../types';
import { getForecast } from '../services/api';
import { useResource } from './useResource';

export function useForecast(cityId: string | null) {
  return useResource<Forecast>(cityId, signal => getForecast(cityId as string, signal));
}
