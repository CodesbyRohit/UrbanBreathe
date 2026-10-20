import type { SourceContext } from '../types';
import { getSources } from '../services/api';
import { useResource } from './useResource';

export function useSourceContext(cityId: string | null) {
  return useResource<SourceContext>(cityId, signal => getSources(cityId as string, signal));
}
