import React, { useState, useEffect, useRef } from 'react';
import { Settings, ArrowRight, TrendingDown, BarChart3, Loader, AlertTriangle } from 'lucide-react';
import { useInterventions, useSimulation } from '../../hooks/useSimulation';
import MetricCard from '../common/MetricCard';
import DataBasisBadge from '../common/DataBasisBadge';
import { getAQIColor } from '../../utils/formatters';
import { formatIndex, formatValue } from '../../utils/provenance';
import { POLLUTANT_LABELS } from '../../utils/constants';

interface PolicySimulatorProps {
  cityId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Regulatory: '#2675dc',
  Traffic: '#c2410c',
  Mitigation: '#15803d',
  'Long-term': '#7c3aed',
};

function reductionsText(r: Record<string, number>): string {
  return Object.entries(r).map(([p, v]) => `${POLLUTANT_LABELS[p] || p} −${Math.round(v * 100)}%`).join(', ');
}

export default function PolicySimulator({ cityId }: PolicySimulatorProps) {
  const { interventions, error: catalogueError, fetch: fetchInterventions } = useInterventions();
  const { result, loading: simLoading, error: simError, simulate } = useSimulation();
  const [selected, setSelected] = useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchInterventions(); }, [fetchInterventions]);

  const toggle = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleRun = () => {
    if (selected.length === 0) return;
    simulate(cityId, selected);
  };

  useEffect(() => {
    if (result && !simLoading) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [result, simLoading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Settings size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Scenario Explorer</h2>
          <p className="text-sm text-slate-500">Illustrative arithmetic on current modelled concentrations — not a prediction</p>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900" role="note">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        <p>
          Reduction fractions are uncited placeholder assumptions and have not been validated for any city.
          No health, exposure or cost estimates are made.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Select interventions</h3>
          {catalogueError && <p className="text-xs text-red-700 mb-2">{catalogueError}</p>}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {interventions.map(iv => {
              const isSelected = selected.includes(iv.id);
              return (
                <button
                  key={iv.id}
                  onClick={() => toggle(iv.id)}
                  aria-pressed={isSelected}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
                    isSelected ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${isSelected ? 'text-brand-700' : 'text-slate-800'}`}>{iv.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white shrink-0" style={{ backgroundColor: CATEGORY_COLORS[iv.category] || '#64748b' }}>
                      {iv.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{iv.description}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Assumed: {reductionsText(iv.assumedReduction)}</p>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRun}
            disabled={selected.length === 0 || simLoading}
            className="w-full mt-4 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {simLoading ? (<><Loader size={16} className="animate-spin" /><span>Calculating…</span></>) : (<>Run scenario <ArrowRight size={16} /></>)}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4" ref={resultRef}>
          {!result && !simLoading && !simError && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center h-64">
              <BarChart3 size={32} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Select interventions and run the scenario</p>
            </div>
          )}

          {simError && <p className="text-sm text-red-700">{simError}</p>}

          {simLoading && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-3">
              <Loader size={20} className="text-brand-500 animate-spin" />
              <p className="text-sm text-slate-700">Applying assumed reductions to current modelled means…</p>
            </div>
          )}

          {result && !simLoading && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-sm font-semibold text-slate-700">Current vs illustrative scenario</h3>
                  <DataBasisBadge provenance={result.provenance} />
                </div>
                {result.status !== 'ok' ? (
                  <p className="text-sm text-amber-700">Not enough valid data for a NAQI estimate. {result.reasons.join(' ')}</p>
                ) : (
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">Current</div>
                      <div className="text-3xl font-bold font-mono" style={{ color: getAQIColor(result.baselineAQI) }}>
                        {formatIndex(result.baselineAQI, result.baselineAQIIsLowerBound)}
                      </div>
                      <div className="text-xs text-slate-500">{result.baselineCategory}</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <TrendingDown size={20} className="text-teal-700" />
                      <span className="text-sm font-bold font-mono text-teal-700 mt-1">
                        {result.aqiChange === null ? 'n/a' : result.aqiChange}
                      </span>
                      <span className="text-[10px] text-slate-500">change</span>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">Scenario</div>
                      <div className="text-3xl font-bold font-mono" style={{ color: getAQIColor(result.scenarioAQI) }}>
                        {formatIndex(result.scenarioAQI, result.scenarioAQIIsLowerBound)}
                      </div>
                      <div className="text-xs text-slate-500">{result.scenarioCategory}</div>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 text-center">{result.naqiLabel}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="PM2.5 24-h mean (current)" value={formatValue(result.baselinePM25, 1)} unit="µg/m³" />
                <MetricCard label="PM2.5 24-h mean (scenario)" value={formatValue(result.scenarioPM25, 1)} unit="µg/m³" />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
                <h3 className="text-sm font-semibold text-slate-700">Assumptions used</h3>
                <p>Combined reductions: {reductionsText(result.combinedReductions)}</p>
                <p>{result.combinationRule}</p>
                <p>{result.assumptionNote}</p>
                <p className="text-slate-500">{result.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
