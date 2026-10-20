import React, { useMemo, useState } from 'react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, LineChart, ReferenceLine, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useForecast } from '../../hooks/useForecast';
import { useAqiColor } from '../../hooks/useTheme';
import { getAQILabel } from '../../utils/formatters';
import { formatIndex, formatValue, formatCityTime, formatAxisTime, formatAge } from '../../utils/provenance';
import { buildForecastRows, valueRange, type ChartRow } from '../../utils/forecastSeries';
import { pollutantList } from '../../utils/constants';
import PageHeader from '../common/PageHeader';
import DataBasisBadge from '../common/DataBasisBadge';
import CategoryBadge from '../common/CategoryBadge';
import Notice from '../common/Notice';
import { LoadingPanel, ErrorPanel, StaleBanner } from '../common/StateViews';

interface PredictiveIntelligenceProps {
  cityId: string;
}

const CATEGORY_LINES = [
  { y: 100, label: 'Satisfactory ≤100' },
  { y: 200, label: 'Moderate ≤200' },
  { y: 300, label: 'Poor ≤300' },
  { y: 400, label: 'Very Poor ≤400' },
];

function ChartTooltip({ active, payload, tz }: { active?: boolean; payload?: { payload: ChartRow }[]; tz: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const value = d.segment === 'recent' ? d.recent : d.forecast;
  return (
    <div className="panel shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-900">{formatCityTime(d.time, tz)}</p>
      <p className="text-slate-500">{d.hoursAhead === 0 ? 'Current hour' : d.hoursAhead < 0 ? `${-d.hoursAhead} h ago — recent model hours` : `+${d.hoursAhead} h — model forecast`}</p>
      <p className="text-slate-700 mt-1">NAQI est.: <strong>{formatIndex(value, d.isLowerBound)}</strong> ({value === null ? 'insufficient data' : getAQILabel(value)})</p>
      <p className="text-slate-500">PM2.5 hourly: {formatValue(d.pm25, 1)} µg/m³</p>
    </div>
  );
}

export default function PredictiveIntelligence({ cityId }: PredictiveIntelligenceProps) {
  const { data, loading, error, reload } = useForecast(cityId);
  const aqiColor = useAqiColor();
  const [step, setStep] = useState<1 | 3 | 6>(3);

  const rows = useMemo(() => (data ? buildForecastRows(data.recent, data.points) : []), [data]);

  const header = (
    <PageHeader icon={<TrendingUp size={18} />} title="72-hour model forecast" description="CAMS model forecast via Open-Meteo, passed through unchanged. Not evaluated against observations.">
      {data && <DataBasisBadge provenance={data.provenance} />}
    </PageHeader>
  );

  if (!data) {
    return (
      <div className="space-y-5">
        {header}
        {loading ? <LoadingPanel label="Loading forecast" rows={4} /> : <ErrorPanel message={error} onRetry={reload} />}
      </div>
    );
  }

  const tz = data.season.timeZone;
  const peak = data.peak;
  const current = data.recent.find(p => p.hoursAhead === 0) ?? null;
  const range = valueRange(data.points);
  const tableRows = data.points.filter(p => p.hoursAhead % step === 0);
  const maxY = Math.max(250, ...rows.map(r => (r.recent ?? r.forecast ?? 0))) * 1.1;

  return (
    <div className="space-y-5">
      {header}
      {error && <StaleBanner message={error} onRetry={reload} />}

      <Notice tone="caution" title="A model forecast is not a guarantee">
        {data.evaluationNote} Forecast values can differ substantially from what monitoring stations later record, especially for local sources the global model does not resolve.
      </Notice>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="panel p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Now (model)</dt>
          <dd className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold tabular" style={{ color: aqiColor(current?.naqi) }}>{formatIndex(current?.naqi, current?.naqiIsLowerBound)}</span>
            <CategoryBadge index={current?.naqi} label={current?.category} />
          </dd>
          <dd className="text-xs text-slate-500 mt-1">{formatCityTime(data.referenceTime, tz)}</dd>
        </div>
        <div className="panel p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Highest in next {data.horizonHours} h</dt>
          <dd className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold tabular" style={{ color: aqiColor(peak?.naqi) }}>{formatIndex(peak?.naqi, peak?.naqiIsLowerBound)}</span>
            <CategoryBadge index={peak?.naqi} label={peak?.category} />
          </dd>
          <dd className="text-xs text-slate-500 mt-1">
            {peak ? `${formatCityTime(peak.time, tz)} (+${peak.hoursAhead} h) · ${pollutantList(peak.dominantPollutants)}` : 'No estimate in the horizon'}
          </dd>
        </div>
        <div className="panel p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Forecast range</dt>
          <dd className="mt-1 text-2xl font-bold tabular text-slate-900">{range ? `${range.min}–${range.max}` : '--'}</dd>
          <dd className="text-xs text-slate-500 mt-1">{data.points.length} hourly points, NAQI-method estimates</dd>
        </div>
        <div className="panel p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Data retrieved</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">{formatCityTime(data.retrievedAt, tz)}</dd>
          <dd className="text-xs text-slate-500 mt-1">{formatAge(data.retrievedAt)} · model run time not reported</dd>
        </div>
      </dl>

      <section className="panel p-5" aria-labelledby="forecast-chart-heading">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 id="forecast-chart-heading" className="text-sm font-semibold text-slate-700">NAQI-method estimate: past 24 h and next {data.horizonHours} h</h3>
          <span className="text-xs text-slate-500">Times in {tz === 'Asia/Kolkata' ? 'IST' : tz} · dashed = forecast</span>
        </div>
        <div aria-hidden="true">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={rows} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={t => formatAxisTime(t, tz)} tick={{ fontSize: 11 }} tickLine={false} minTickGap={40} />
              <YAxis domain={[0, Math.ceil(maxY / 50) * 50]} tick={{ fontSize: 11 }} tickLine={false} width={44} label={{ value: 'NAQI est.', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip content={<ChartTooltip tz={tz} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {CATEGORY_LINES.filter(l => l.y < maxY).map(l => (
                <ReferenceLine key={l.y} y={l.y} stroke="#94a3b8" strokeDasharray="2 4" label={{ value: l.label, position: 'insideTopRight', fontSize: 10 }} />
              ))}
              {current && <ReferenceLine x={current.time} stroke="#475569" label={{ value: 'Now', position: 'insideTopLeft', fontSize: 11 }} />}
              <Line name="Recent hours (modelled)" type="monotone" dataKey="recent" stroke="#475569" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
              <Line name="Model forecast" type="monotone" dataKey="forecast" stroke="#c2410c" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-slate-500 list-disc pl-4">
          <li>{data.recentNote}</li>
          <li>{data.naqiNote}</li>
          <li>{data.modelRunNote}</li>
        </ul>
      </section>

      <section className="panel" aria-labelledby="forecast-table-heading">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <h3 id="forecast-table-heading" className="text-sm font-semibold text-slate-700">Hourly forecast details</h3>
          <div className="segmented" role="group" aria-label="Rows to show">
            {([1, 3, 6] as const).map(s => (
              <button key={s} type="button" aria-pressed={step === s} onClick={() => setStep(s)}>{s === 1 ? 'Every hour' : `Every ${s} h`}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto max-h-[28rem]">
          <table className="data-table w-full text-sm">
            <caption className="sr-only">NAQI-method estimates from the model forecast for {tableRows.length} hours</caption>
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200">
                <th scope="col">Time ({tz === 'Asia/Kolkata' ? 'IST' : tz})</th>
                <th scope="col">Ahead</th>
                <th scope="col" className="!text-right">NAQI est.</th>
                <th scope="col">Category</th>
                <th scope="col">Dominant</th>
                <th scope="col" className="!text-right">PM2.5 hourly</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(p => (
                <tr key={p.time}>
                  <td className="whitespace-nowrap text-slate-800">{formatCityTime(p.time, tz)}</td>
                  <td className="text-slate-500 tabular">+{p.hoursAhead} h</td>
                  <td className="text-right font-mono font-semibold tabular" style={{ color: aqiColor(p.naqi) }}>{formatIndex(p.naqi, p.naqiIsLowerBound)}</td>
                  <td>{p.category ? <CategoryBadge index={p.naqi} label={p.category} /> : <span className="text-xs text-amber-700">Insufficient data</span>}</td>
                  <td className="text-xs text-slate-600">{pollutantList(p.dominantPollutants) || '—'}</td>
                  <td className="text-right font-mono tabular text-slate-700 whitespace-nowrap">{formatValue(p.pm25, 1)} µg/m³</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Notice title="What a proper evaluation would need">
        Hourly CPCB station observations for the same period (CAAQMS data), a time-ordered hold-out (no future data in training or tuning),
        baselines such as persistence (“tomorrow equals today”), and error metrics per lead time and category (e.g. MAE, category hit rate).
        None of this has been done yet, so no accuracy figure is shown.
      </Notice>
    </div>
  );
}
