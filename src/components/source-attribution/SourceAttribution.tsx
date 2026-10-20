import React from 'react';
import { Search, Info } from 'lucide-react';
import { useSourceContext } from '../../hooks/useSources';
import { SOURCE_LABELS, pollutantList } from '../../utils/constants';
import type { City, SourceIndicator } from '../../types';
import PageHeader from '../common/PageHeader';
import DataBasisBadge from '../common/DataBasisBadge';
import DataFreshness from '../common/DataFreshness';
import Notice from '../common/Notice';
import { LoadingPanel, ErrorPanel, StaleBanner } from '../common/StateViews';

interface SourceAttributionProps {
  city: City;
}

function indicatorValue(ind: SourceIndicator): string {
  if (ind.value === null) return 'Unavailable';
  if (Array.isArray(ind.value)) return pollutantList(ind.value);
  return ind.value.toFixed(2);
}

export default function SourceAttribution({ city }: SourceAttributionProps) {
  const { data, loading, error, reload } = useSourceContext(city.id);

  const header = (
    <PageHeader icon={<Search size={18} />} title={`Source context — ${city.name}`} description="Descriptive indicators only. UrbanBreathe does not estimate how much each source contributes.">
      {data && <DataBasisBadge provenance={data.provenance} />}
    </PageHeader>
  );

  if (!data) {
    return (
      <div className="space-y-5">
        {header}
        {loading ? <LoadingPanel label="Loading source context" /> : <ErrorPanel message={error} onRetry={reload} />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {header}
      {error && <StaleBanner message={error} onRetry={reload} />}

      <Notice tone="caution" title="Not source apportionment">{data.disclaimer}</Notice>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.indicators.map(ind => (
          <section key={ind.id} className="panel p-5" aria-labelledby={`ind-${ind.id}`}>
            <h3 id={`ind-${ind.id}`} className="text-sm font-semibold text-slate-700">{ind.label}</h3>
            <p className="text-2xl font-bold tabular text-slate-900 mt-2">{indicatorValue(ind)}</p>
            {ind.inputs && ind.value !== null && (
              <p className="text-xs text-slate-500 mt-0.5">
                PM2.5 {ind.inputs.pm25} / PM10 {ind.inputs.pm10} {ind.inputs.unit} (24-hour means)
              </p>
            )}
            {ind.unavailableReason && <p className="text-xs text-amber-700 mt-1">{ind.unavailableReason}</p>}
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{ind.explanation}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-start gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" aria-hidden="true" /> {ind.caveat}
            </p>
          </section>
        ))}
      </div>

      <section className="panel p-5" aria-labelledby="categories-heading">
        <h3 id="categories-heading" className="text-sm font-semibold text-slate-700">Common urban source categories</h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">Listed for context only, in no particular order. Their contributions in {city.name} are not estimated here.</p>
        <dl className="divide-y divide-slate-100">
          {data.sourceCategories.map(s => (
            <div key={s.source} className="py-3 grid gap-1 sm:grid-cols-[12rem_1fr]">
              <dt className="text-sm font-semibold text-slate-800">{SOURCE_LABELS[s.source] || s.source}</dt>
              <dd className="text-sm text-slate-600">
                {s.description}
                <span className="block text-xs text-slate-500 mt-0.5">Typical measures: {s.mitigation}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
        <DataFreshness referenceTime={data.referenceTime} retrievedAt={data.provenance.airQuality.retrievedAt} timeZone={city.timezone} />
        <span className="text-xs text-slate-500">Season: {data.season.label} ({data.season.basis})</span>
      </div>
    </div>
  );
}
