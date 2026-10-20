import { useState, useCallback, useEffect, useRef } from 'react';
import type { Intervention, SimulationResult, ScenarioAssumptions } from '../types';
import { getInterventions, runSimulation } from '../services/api';
import { useResource } from './useResource';

export function useInterventions() {
  return useResource<Intervention[]>('interventions', getInterventions);
}

/**
 * Runs scenarios for one city. The result is cleared when the city changes, so
 * a scenario computed for one city is never shown under another; an in-flight
 * run for the previous city is aborted.
 */
export function useSimulation(cityId: string) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
    setLoading(false);
    return () => controllerRef.current?.abort();
  }, [cityId]);

  const simulate = useCallback(async (selected: string[], assumptions?: ScenarioAssumptions) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await runSimulation(cityId, selected, assumptions, controller.signal);
      if (!controller.signal.aborted) setResult(data);
    } catch (err) {
      if (controller.signal.aborted || (err as { name?: string })?.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'The scenario could not be calculated.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [cityId]);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { result, loading, error, simulate, clear };
}
