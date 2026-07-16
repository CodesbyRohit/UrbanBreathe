import { useState, useCallback } from 'react';
import type { Intervention, SimulationResult } from '../types';
import { getInterventions, runSimulation } from '../services/api';

export function useInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInterventions();
      setInterventions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { interventions, loading, fetch };
}

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async (cityId: string, selected: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await runSimulation(cityId, selected);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, simulate };
}
