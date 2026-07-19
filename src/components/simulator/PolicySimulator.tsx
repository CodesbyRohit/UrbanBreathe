import React, { useState, useEffect, useRef } from 'react';
import { Settings, ArrowRight, DollarSign, TrendingDown, Users, Heart, BarChart3, Loader } from 'lucide-react';
import { useInterventions, useSimulation } from '../../hooks/useSimulation';
import MetricCard from '../common/MetricCard';
import { formatCrores, formatNumber, getAQIColor, getAQILabel } from '../../utils/formatters';

interface PolicySimulatorProps {
  cityId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Regulatory: '#3b91e8',
  Traffic: '#f97316',
  Mitigation: '#15803d',
  'Long-term': '#7c3aed',
};

export default function PolicySimulator({ cityId }: PolicySimulatorProps) {
  const { interventions, fetch: fetchInterventions } = useInterventions();
  const { result, loading: simLoading, simulate } = useSimulation();
  const [selected, setSelected] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchInterventions(); }, [fetchInterventions]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRunSimulation = () => {
    if (selected.length === 0) return;
    setShowResult(false);
    simulate(cityId, selected);
  };

  // Animate result appearance when simulation finishes
  useEffect(() => {
    if (result && !simLoading) {
      setShowResult(true);
      // Scroll to results after a brief delay for animation
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result, simLoading]);

  const effectivenessData = result ? [
    { label: 'AQI Improvement', value: result.effectiveness.aqiImprovement, color: '#3b91e8' },
    { label: 'PM2.5 Reduction', value: result.effectiveness.pm25Reduction, color: '#15803d' },
    { label: 'Health Impact', value: result.effectiveness.healthImpact, color: '#f97316' },
    { label: 'Feasibility', value: result.effectiveness.feasibility, color: '#7c3aed' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Settings size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Policy Intervention Simulator</h2>
          <p className="text-sm text-slate-500">Test policy interventions and measure their impact</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intervention Selection */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Interventions</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {interventions.map(iv => {
              const isSelected = selected.includes(iv.id);
              return (
                <button
                  key={iv.id}
                  onClick={() => toggle(iv.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${isSelected ? 'text-brand-700' : 'text-slate-800'}`}>
                      {iv.name}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[iv.category] || '#94a3b8' }}
                    >
                      {iv.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{iv.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><DollarSign size={10} /> {iv.cost} {iv.costUnit}</span>
                    <span>{iv.timeToEffect}</span>
                    <span>Support: {iv.publicSupport}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={selected.length === 0 || simLoading}
            className="w-full mt-4 px-4 py-2.5 bg-brand-500 text-white text-sm font-semibold rounded-lg
              hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
              flex items-center justify-center gap-2"
          >
            {simLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>Computing Impact...</span>
              </>
            ) : (
              <>
                Run Simulation
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4" ref={resultRef}>
          {!result && !simLoading && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center h-64">
              <BarChart3 size={32} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-500">Select interventions and run simulation</p>
              <p className="text-xs text-slate-400 mt-1">Compare before and after impact across key metrics</p>
            </div>
          )}

          {/* Loading State */}
          {simLoading && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Loader size={20} className="text-brand-500 animate-spin" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Analyzing Policy Impact</p>
                    <p className="text-xs text-slate-400">Running dispersion model with selected interventions...</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="skeleton w-full h-16" />
                <div className="skeleton w-full h-12" />
                <div className="skeleton w-3/4 h-12" />
              </div>
            </div>
          )}

          {/* Results with animation */}
          {result && (
            <div className={`transition-all duration-500 ease-out ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Before/After Comparison */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Before / After Comparison</h3>
                <div className="flex items-center justify-center gap-8 py-4">
                  <div className="text-center animate-scale-in">
                    <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">Before</div>
                    <div className="text-3xl font-bold font-mono text-slate-800">{result.baselineAQI}</div>
                    <div className="text-xs text-slate-500">AQI</div>
                  </div>
                  <div className="flex flex-col items-center animate-fade-in" style={{ animationDelay: '150ms' }}>
                    <div className="w-10 h-10 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center">
                      <TrendingDown size={20} className="text-teal-500" />
                    </div>
                    <span className="text-sm font-bold font-mono text-teal-600 mt-1">-{result.aqiReduction}</span>
                    <span className="text-[10px] text-slate-400">AQI reduction</span>
                  </div>
                  <div className="text-center animate-scale-in" style={{ animationDelay: '300ms' }}>
                    <div className="text-xs text-slate-500 mb-1 uppercase font-semibold">After</div>
                    <div className="text-3xl font-bold font-mono" style={{ color: getAQIColor(result.predictedAQI) }}>
                      {result.predictedAQI}
                    </div>
                    <div className="text-xs text-slate-500">{getAQILabel(result.predictedAQI)}</div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 via-brand-500 to-orange-500 transition-all duration-1000 ease-out"
                    style={{ width: `${result.improvementPercentage}%` }}
                  />
                </div>
                <div className="text-center text-xs text-slate-500 mt-2">
                  <span className="font-semibold text-slate-700">{result.improvementPercentage}%</span> improvement
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <MetricCard label="PM2.5 Reduction" value={`${result.pm25Reduction}`} unit="µg/m³" trend="down" trendLabel={`From ${result.baselinePM25}`} />
                <MetricCard label="Hospital Admissions" value={formatNumber(result.avertedAdmissions)} subtitle="Averted" icon={<Heart size={16} />} />
                <MetricCard label="Population Exposed" value={formatNumber(result.exposedPopulation)} subtitle={`Of ${formatNumber(result.population)}`} icon={<Users size={16} />} />
                <MetricCard label="Implementation Cost" value={formatCrores(result.totalCostCrores)} icon={<DollarSign size={16} />} />
              </div>

              {/* Effectiveness Scores */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Effectiveness Scores</h3>
                <div className="space-y-3">
                  {effectivenessData.map(metric => (
                    <div key={metric.label} className="animate-fade-in" style={{ animationDelay: `${effectivenessData.indexOf(metric) * 100}ms` }}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium">{metric.label}</span>
                        <span className="text-slate-500 font-mono">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
