import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { City, AirQualityData, Forecast } from '../../types';
import { useAqiColor } from '../../hooks/useTheme';
import { formatIndex, formatCityTime } from '../../utils/provenance';
import { getForecast } from '../../services/api';
import { pollutantList } from '../../utils/constants';
import { rankCities, type RankSort } from '../../utils/ranking';
import PageHeader from '../common/PageHeader';
import CategoryBadge from '../common/CategoryBadge';
import IndiaMap from '../common/IndiaMap';
import Notice from '../common/Notice';

interface ComparativeIntelligenceProps {
  cities: City[];
  airQualityMap: Record<string, AirQualityData | null>;
  selectedId: string;
  onSelectCity: (id: string) => void;
}

interface Row {
  cityId: string;
  cityName: string;
  aqi: number | null;
  isLowerBound: boolean;
  category: string | null;
  dominant: string;
  referenceTime: string | null;
  status: 'loading' | 'unavailable' | 'insufficient' | 'ok';
  isDemo: boolean;
  peak: Forecast['peak'] | undefined;
}

const SORTS: { key: RankSort; label: string }[] = [
  { key: 'aqi_desc', label: 'Highest first' },
  { key: 'aqi_asc', label: 'Lowest first' },
  { key: 'name', label: 'City name' },
];

export default function ComparativeIntelligence({ cities, airQualityMap, selectedId, onSelectCity }: ComparativeIntelligenceProps) {
  const aqiColor = useAqiColor();
  const [sort, setSort] = useState<RankSort>('aqi_desc');
  const [peaks, setPeaks] = useState<Record<string, Forecast['peak'] | null>>({});

  // Forecast peaks per city. The server shares the cached provider response
  // with the air-quality request, so this adds no upstream calls.
  useEffect(() => {
    const controller = new AbortController();
    cities.forEach(c => {
      getForecast(c.id, controller.signal)
        .then(f => setPeaks(prev => ({ ...prev, [c.id]: f.peak })))
        .catch(err => { if (err?.name !== 'AbortError') setPeaks(prev => ({ ...prev, [c.id]: null })); });
    });
    return () => controller.abort();
  }, [cities]);

  const rows = useMemo((): Row[] => rankCities(cities.map(city => {
    const aq = airQualityMap[city.id];
    return {
      cityId: city.id,
      cityName: city.name,
      aqi: aq?.aqi ?? null,
      isLowerBound: aq?.aqiIsLowerBound ?? false,
      category: aq?.aqiCategory ?? null,
      dominant: aq ? pollutantList(aq.naqi.dominantPollutants) : '',
      referenceTime: aq?.referenceTime ?? null,
      status: aq === undefined ? 'loading' : aq === null ? 'unavailable' : aq.aqiStatus === 'ok' ? 'ok' : 'insufficient',
      isDemo: aq?.provenance.mode === 'demo',
      peak: peaks[city.id] === undefined ? undefined : peaks[city.id],
    };
  }), sort), [cities, airQualityMap, peaks, sort]);

  const refTimes = [...new Set(rows.map(r => r.referenceTime).filter(Boolean))] as string[];
  const chartData = rows.filter(r => r.aqi !== null).map(r => ({ name: r.cityName, value: r.aqi as number, label: formatIndex(r.aqi, r.isLowerBound), category: r.category }));
  const missing = rows.filter(r => r.status === 'unavailable' || r.status === 'insufficient');

  return (
    <div className="space-y-5">
      <PageHeader icon={<BarChart3 size={18} />} title="City comparison" description="Current NAQI-method estimates from modelled CAMS data, ranked. A screening view, not an enforcement or inspection priority." />

      <Notice>
        Metric: CPCB NAQI method applied to 24-hour (8-hour for O₃, CO) means of CAMS model concentrations,{' '}
        {refTimes.length === 1 ? <>all for <strong>{formatCityTime(refTimes[0])}</strong></> : refTimes.length > 1 ? 'for the hours shown in each row' : 'times shown when loaded'}.
        Each value is a ~45 km grid-cell estimate around the city centre, not an official CPCB station AQI. Differences of a few points are within what the model cannot resolve.
      </Notice>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-slate-600" id="sort-label">Order:</span>
        <div className="segmented" role="group" aria-labelledby="sort-label">
          {SORTS.map(s => (
            <button key={s.key} type="button" aria-pressed={sort === s.key} onClick={() => setSort(s.key)}>{s.label}</button>
          ))}
        </div>
      </div>

      <section className="panel" aria-labelledby="compare-table-heading">
        <h3 id="compare-table-heading" className="sr-only">Cities ranked by NAQI-method estimate</h3>
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="w-10">#</th>
                <th scope="col">City</th>
                <th scope="col" className="!text-right">NAQI est.</th>
                <th scope="col">Category</th>
                <th scope="col">Dominant</th>
                <th scope="col">Values for</th>
                <th scope="col" className="!text-right">72-h model peak</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.cityId} className={r.cityId === selectedId ? 'bg-brand-50' : ''}>
                  <td className="tabular text-slate-500">{r.aqi !== null && sort !== 'name' ? i + 1 : '—'}</td>
                  <th scope="row" className="!normal-case !text-sm !tracking-normal">
                    <button type="button" onClick={() => onSelectCity(r.cityId)} className="font-semibold text-slate-800 hover:text-brand-700 underline-offset-2 hover:underline" aria-pressed={r.cityId === selectedId}>
                      {r.cityName}
                    </button>
                    {r.isDemo && <span className="ml-1.5 text-xs font-semibold text-amber-900 bg-amber-100 px-1 rounded">DEMO</span>}
                  </th>
                  <td className="text-right font-mono font-semibold tabular" style={{ color: aqiColor(r.aqi) }}>{r.status === 'loading' ? '…' : formatIndex(r.aqi, r.isLowerBound)}</td>
                  <td>
                    {r.status === 'ok' && <CategoryBadge index={r.aqi} label={r.category} />}
                    {r.status === 'loading' && <span className="text-xs text-slate-500">Loading…</span>}
                    {r.status === 'unavailable' && <span className="text-xs text-amber-700">Data unavailable</span>}
                    {r.status === 'insufficient' && <span className="text-xs text-amber-700">Insufficient data</span>}
                  </td>
                  <td className="text-xs text-slate-600">{r.dominant || '—'}</td>
                  <td className="text-xs text-slate-600 whitespace-nowrap">{r.referenceTime ? formatCityTime(r.referenceTime) : '—'}</td>
                  <td className="text-right font-mono tabular text-slate-700 whitespace-nowrap">
                    {r.peak === undefined ? '…' : r.peak === null ? '--' : `${formatIndex(r.peak.naqi, r.peak.naqiIsLowerBound)} (+${r.peak.hoursAhead} h)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="space-y-5">
        <section className="panel p-5" aria-labelledby="compare-chart-heading">
          <h3 id="compare-chart-heading" className="text-sm font-semibold text-slate-700 mb-3">NAQI-method estimate by city</h3>
          <div aria-hidden="true">
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 30 + 40)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(_v, _n, item) => [`${item.payload.label} (${item.payload.category})`, 'NAQI est.']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {chartData.map(entry => <Cell key={entry.name} fill={aqiColor(entry.value)} />)}
                  <LabelList dataKey="label" position="right" fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            The table above holds the same values. {missing.length ? `Not shown (no valid estimate): ${missing.map(m => m.cityName).join(', ')}.` : ''}
          </p>
        </section>
        <IndiaMap cities={cities} selectedId={selectedId} airQualityMap={airQualityMap} onSelect={onSelectCity} />
      </div>
    </div>
  );
}
