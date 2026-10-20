import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, Loader, RotateCcw, ArrowRight } from 'lucide-react';
import { useInterventions, useSimulation } from '../../hooks/useSimulation';
import { useAqiColor } from '../../hooks/useTheme';
import type { City, ResolvedIntervention } from '../../types';
import { formatIndex, formatConcentration, formatCityTime } from '../../utils/provenance';
import { POLLUTANT_LABELS, pollutantList } from '../../utils/constants';
import { buildAssumptions, parseReductionPercent, toPercentText, MAX_REDUCTION_PERCENT } from '../../utils/scenarioInputs';
import PageHeader from '../common/PageHeader';
import DataBasisBadge from '../common/DataBasisBadge';
import CategoryBadge from '../common/CategoryBadge';
import Notice from '../common/Notice';
import { LoadingPanel, ErrorPanel } from '../common/StateViews';

interface PolicySimulatorProps {
  city: City;
}

const percent = (r: number) => `${Math.round(r * 1000) / 10}%`;
const reductionsText = (r: Record<string, number>) =>
  Object.entries(r).filter(([, v]) => v > 0).map(([p, v]) => `${POLLUTANT_LABELS[p] || p} −${percent(v)}`).join(', ') || 'none';

export default function PolicySimulator({ city }: PolicySimulatorProps) {
  const catalogue = useInterventions();
  const { result, loading, error, simulate, clear } = useSimulation(city.id);
  const aqiColor = useAqiColor();
  const [selected, setSelected] = useState<string[]>([]);
  // Edited percentage text per intervention and pollutant.
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const [lastRun, setLastRun] = useState<string | null>(null);

  const interventions = catalogue.data ?? [];
  const defaults = useMemo(
    () => Object.fromEntries(interventions.map(iv => [iv.id, iv.assumedReduction])),
    [interventions],
  );
  const assumptions = buildAssumptions(selected, defaults, edits);
  const signature = JSON.stringify([selected, assumptions]);
  const resultIsStale = result !== null && lastRun !== signature;

  const toggle = (id: string) => setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  const setEdit = (id: string, pollutant: string, text: string) =>
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [pollutant]: text } }));
  const resetEdits = (id: string) => setEdits(prev => { const next = { ...prev }; delete next[id]; return next; });
  const resetAll = () => { setSelected([]); setEdits({}); setLastRun(null); clear(); };

  const run = () => {
    if (!selected.length || assumptions === null) return;
    setLastRun(signature);
    simulate(selected, Object.keys(assumptions).length ? assumptions : undefined);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<SlidersHorizontal size={18} />}
        title={`Scenario explorer — ${city.name}`}
        description="Illustrative arithmetic on the current modelled concentrations. Not a prediction of what a policy would achieve."
      >
        {result && <DataBasisBadge provenance={result.provenance} />}
      </PageHeader>

      <Notice tone="caution" title="Hypothetical — read the assumptions">
        The default reduction fractions are uncited placeholders inherited from the original prototype and have not been validated for any city.
        You can replace them with your own (for example from a published study); edited values are equally unvalidated.
        No health, exposure, cost or causal effect is estimated.
      </Notice>

      {catalogue.loading && !catalogue.data && <LoadingPanel label="Loading interventions" />}
      {catalogue.error && !catalogue.data && <ErrorPanel title="Interventions could not be loaded" message={catalogue.error} onRetry={catalogue.reload} />}

      {catalogue.data && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
          <section className="panel p-4 lg:col-span-2" aria-labelledby="iv-heading">
            <div className="flex items-center justify-between mb-3">
              <h3 id="iv-heading" className="text-sm font-semibold text-slate-700">1. Choose interventions</h3>
              <button type="button" onClick={resetAll} className="btn text-slate-600 hover:bg-slate-100" disabled={!selected.length && !result}>
                <RotateCcw size={12} aria-hidden="true" /> Reset
              </button>
            </div>
            <ul className="space-y-2">
              {interventions.map(iv => {
                const isSelected = selected.includes(iv.id);
                const edited = !!edits[iv.id];
                return (
                  <li key={iv.id} className={`rounded-lg border p-3 ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-600" checked={isSelected} onChange={() => toggle(iv.id)} />
                      <span className="min-w-0">
                        <span className="text-sm font-medium text-slate-800">{iv.name}</span>
                        <span className="ml-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{iv.category}</span>
                        <span className="block text-xs text-slate-500">{iv.description}</span>
                        <span className="block text-xs text-slate-600 mt-0.5">Placeholder: {reductionsText(iv.assumedReduction)}</span>
                      </span>
                    </label>
                    {isSelected && (
                      <fieldset className="mt-3 border-t border-slate-200 pt-2">
                        <legend className="sr-only">Assumed reductions for {iv.name}</legend>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(iv.assumedReduction).map(([p, def]) => {
                            const text = edits[iv.id]?.[p] ?? toPercentText(def);
                            const parsed = parseReductionPercent(text);
                            const inputId = `red-${iv.id}-${p}`;
                            return (
                              <div key={p} className="w-28">
                                <label htmlFor={inputId} className="block text-xs text-slate-600">{POLLUTANT_LABELS[p] || p} reduction %</label>
                                <input
                                  id={inputId}
                                  type="number" inputMode="decimal" min={0} max={MAX_REDUCTION_PERCENT} step={1}
                                  value={text}
                                  onChange={e => setEdit(iv.id, p, e.target.value)}
                                  aria-invalid={'error' in parsed}
                                  aria-describedby={'error' in parsed ? `${inputId}-err` : undefined}
                                  className="mt-0.5 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm tabular text-slate-900"
                                />
                                {'error' in parsed && <p id={`${inputId}-err`} className="text-xs text-red-700 mt-0.5">{parsed.error}</p>}
                              </div>
                            );
                          })}
                        </div>
                        {edited && (
                          <button type="button" onClick={() => resetEdits(iv.id)} className="mt-2 text-xs text-brand-700 underline underline-offset-2">
                            Restore placeholder values
                          </button>
                        )}
                      </fieldset>
                    )}
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={run} disabled={!selected.length || assumptions === null || loading} className="btn-primary w-full mt-4 py-2.5 text-sm">
              {loading ? <><Loader size={16} className="animate-spin" aria-hidden="true" /> Calculating…</> : <>2. Calculate scenario <ArrowRight size={16} aria-hidden="true" /></>}
            </button>
            {assumptions === null && <p className="text-xs text-red-700 mt-2" role="alert">Fix the highlighted values before calculating.</p>}
          </section>

          <div className="lg:col-span-3 space-y-4">
            <p className="sr-only" role="status">
              {loading ? 'Calculating scenario…' : result?.status === 'ok'
                ? `Scenario calculated: ${formatIndex(result.baselineAQI, result.baselineAQIIsLowerBound)} now, ${formatIndex(result.scenarioAQI, result.scenarioAQIIsLowerBound)} hypothetical.`
                : ''}
            </p>
            {!result && !loading && !error && (
              <div className="panel p-8 text-center text-sm text-slate-500">
                Select one or more interventions, review the assumed reductions, then calculate.
              </div>
            )}
            {error && <ErrorPanel title="The scenario could not be calculated" message={error} onRetry={run} />}
            {result && (
              <>
                {resultIsStale && (
                  <Notice tone="caution">Inputs changed since this result was calculated. Calculate again to update it.</Notice>
                )}
                <section className="panel p-5" aria-labelledby="result-heading">
                  <h3 id="result-heading" className="text-sm font-semibold text-slate-700">Current estimate vs. hypothetical scenario</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For {formatCityTime(result.referenceTime, city.timezone)} · {result.naqiLabel}
                  </p>
                  {result.status !== 'ok' ? (
                    <p className="text-sm text-amber-700 mt-3">Not enough valid data for an estimate, so no scenario is computed. {result.reasons.join(' ')}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 items-center text-center mt-4">
                      <div>
                        <div className="text-xs uppercase font-semibold text-slate-500">Current (modelled)</div>
                        <div className="text-3xl font-bold tabular" style={{ color: aqiColor(result.baselineAQI) }}>{formatIndex(result.baselineAQI, result.baselineAQIIsLowerBound)}</div>
                        <CategoryBadge index={result.baselineAQI} label={result.baselineCategory} />
                        <div className="text-xs text-slate-500 mt-1">{pollutantList(result.baselineDominantPollutants)}</div>
                      </div>
                      <div className="text-sm text-slate-600">
                        <div className="text-xs uppercase font-semibold text-slate-500">Change</div>
                        <div className="text-xl font-bold tabular text-slate-800">{result.aqiChange === null ? 'n/a' : result.aqiChange > 0 ? `+${result.aqiChange}` : result.aqiChange}</div>
                        {result.aqiChange === null && <div className="text-xs text-slate-500">not computable for 401+</div>}
                      </div>
                      <div>
                        <div className="text-xs uppercase font-semibold text-slate-500">Hypothetical</div>
                        <div className="text-3xl font-bold tabular" style={{ color: aqiColor(result.scenarioAQI) }}>{formatIndex(result.scenarioAQI, result.scenarioAQIIsLowerBound)}</div>
                        <CategoryBadge index={result.scenarioAQI} label={result.scenarioCategory} />
                        <div className="text-xs text-slate-500 mt-1">{pollutantList(result.scenarioDominantPollutants)}</div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="panel p-5" aria-labelledby="scenario-table-heading">
                  <h3 id="scenario-table-heading" className="text-sm font-semibold text-slate-700 mb-2">Inputs and results by pollutant</h3>
                  <div className="overflow-x-auto">
                    <table className="data-table w-full min-w-[520px] text-sm">
                      <caption className="sr-only">Current and hypothetical mean concentrations and sub-indices</caption>
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th scope="col">Pollutant</th>
                          <th scope="col" className="!text-right">Reduction</th>
                          <th scope="col" className="!text-right">Current mean</th>
                          <th scope="col" className="!text-right">Scenario mean</th>
                          <th scope="col" className="!text-right">Sub-index</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.pollutants.map(p => (
                          <tr key={p.pollutant}>
                            <th scope="row" className="!normal-case !text-sm !text-slate-800 !tracking-normal">
                              {POLLUTANT_LABELS[p.pollutant] || p.pollutant}
                              <span className="block text-xs font-normal text-slate-500">{p.averagingHours}-h mean</span>
                            </th>
                            <td className="text-right tabular">{p.reduction > 0 ? `−${percent(p.reduction)}` : '—'}</td>
                            <td className="text-right font-mono tabular whitespace-nowrap">{formatConcentration(p.baselineAverage, p.unit, p.unit === 'mg/m3' ? 2 : 1)}</td>
                            <td className="text-right font-mono tabular whitespace-nowrap">{formatConcentration(p.scenarioAverage, p.unit, p.unit === 'mg/m3' ? 2 : 1)}</td>
                            <td className="text-right font-mono tabular whitespace-nowrap">
                              {p.status === 'ok'
                                ? `${formatIndex(p.baselineSubIndex, p.baselineIsLowerBound)} → ${formatIndex(p.scenarioSubIndex, p.scenarioIsLowerBound)}`
                                : <span className="font-sans text-xs text-amber-700">insufficient data</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="panel p-5 text-xs text-slate-600 space-y-3" aria-labelledby="assumptions-heading">
                  <h3 id="assumptions-heading" className="text-sm font-semibold text-slate-700">How this was calculated</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    {result.calculationSteps.map(s => <li key={s}>{s}</li>)}
                  </ol>
                  <p>{result.combinationRule} Combined: {reductionsText(result.combinedReductions)}.</p>
                  <table className="data-table w-full text-xs">
                    <caption className="text-left font-semibold text-slate-700 pb-1">Assumptions used</caption>
                    <thead><tr><th scope="col">Intervention</th><th scope="col">Reductions</th><th scope="col">Source</th></tr></thead>
                    <tbody>
                      {result.interventions.map((iv: ResolvedIntervention) => (
                        <tr key={iv.id}>
                          <td className="text-slate-800">{iv.name}</td>
                          <td>{reductionsText(iv.assumedReduction)}</td>
                          <td>{iv.assumptionSource === 'user-edited' ? 'Edited by you' : 'Uncited placeholder'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p>{result.assumptionNote}</p>
                  <p className="text-slate-500">{result.disclaimer}</p>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
