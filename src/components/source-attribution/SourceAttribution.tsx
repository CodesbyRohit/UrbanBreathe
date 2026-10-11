import React from 'react';
import { Search, Info, RefreshCw, AlertTriangle } from 'lucide-react';
import { useSourceAttribution } from '../../hooks/useSources';
import { SOURCE_LABELS, SOURCE_COLORS, POLLUTANT_LABELS } from '../../utils/constants';
import DataBasisBadge from '../common/DataBasisBadge';
import type { SourceIndicator } from '../../types';

interface SourceAttributionProps {
  cityId: string;
}

function indicatorValue(ind: SourceIndicator): string {
  if (ind.value === null) return 'Unavailable';
  if (Array.isArray(ind.value)) return ind.value.map(p => POLLUTANT_LABELS[p] || p).join(', ');
  return String(ind.value);
}

export default function SourceAttribution({ cityId }: SourceAttributionProps) {
  const { data, loading, error, refresh } = useSourceAttribution(cityId);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="skeleton w-40 h-4 mb-4" />
            <div className="skeleton w-full h-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-slate-500">{error || 'Unable to load source context.'}</p>
          <button
            onClick={refresh}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors mx-auto"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Search size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Source Context</h2>
          <p className="text-sm text-slate-500">Descriptive indicators — not source apportionment</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DataBasisBadge provenance={data.provenance} />
          <button onClick={refresh} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Refresh data">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900" role="note">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <p className="leading-relaxed">{data.disclaimer}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.indicators.map(ind => (
          <div key={ind.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700">{ind.label}</h3>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{indicatorValue(ind)}</p>
            {ind.inputs && ind.value !== null && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                PM2.5 {ind.inputs.pm25} / PM10 {ind.inputs.pm10} {ind.inputs.unit} (24-h means)
              </p>
            )}
            {ind.unavailableReason && <p className="text-xs text-amber-700 mt-1">{ind.unavailableReason}</p>}
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">{ind.explanation}</p>
            <p className="text-[11px] text-slate-500 mt-2 flex items-start gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" /> {ind.caveat}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700">Common urban source categories</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">Listed for context only. Their contributions in {cityId} are not estimated here.</p>
        <div className="space-y-3">
          {data.sourceCategories.map(s => (
            <div key={s.source} className="border border-slate-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: SOURCE_COLORS[s.source] || '#94a3b8' }} />
                <span className="text-sm font-semibold text-slate-800">{SOURCE_LABELS[s.source] || s.source}</span>
              </div>
              <p className="text-xs text-slate-600">{s.description}</p>
              <p className="text-xs text-slate-500 mt-1">Typical measures: {s.mitigation}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">Season: {data.season.label} ({data.season.basis})</p>
    </div>
  );
}
