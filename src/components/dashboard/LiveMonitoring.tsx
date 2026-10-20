import React, { Suspense, lazy } from 'react';
import { Activity } from 'lucide-react';
import AQIGauge from './AQIGauge';
import PollutantTable from './PollutantTable';
import DataBasisBadge from '../common/DataBasisBadge';
import DataFreshness from '../common/DataFreshness';
import CategoryBadge from '../common/CategoryBadge';
import PageHeader from '../common/PageHeader';
import IndiaMap from '../common/IndiaMap';
import Notice from '../common/Notice';
import { LoadingPanel, ErrorPanel, StaleBanner } from '../common/StateViews';
import type { City, AirQualityData } from '../../types';
import type { Resource } from '../../hooks/useResource';
import { pollutantList } from '../../utils/constants';
import { formatValue, formatAxisTime, formatCityTime } from '../../utils/provenance';

const HistoryChart = lazy(() => import('./HistoryChart'));

interface LiveMonitoringProps {
  city: City;
  resource: Resource<AirQualityData>;
  cities: City[];
  airQualityMap: Record<string, AirQualityData | null>;
  onSelectCity: (id: string) => void;
}

function WeatherList({ data, timeZone }: { data: AirQualityData; timeZone: string }) {
  const unavailable = 'status' in data.provenance.weather ? data.provenance.weather : null;
  const rows: [string, string][] = [
    ['Temperature', `${formatValue(data.temperature)} °C`],
    ['Relative humidity', `${formatValue(data.humidity)} %`],
    ['Wind', `${formatValue(data.windSpeed, 1)} km/h${data.windDirection ? ` from ${data.windDirection}` : ''}`],
    ['Surface pressure', `${formatValue(data.pressure)} hPa`],
    ['Visibility', `${formatValue(data.visibility, 1)} km`],
  ];
  return (
    <section className="panel p-5" aria-labelledby="weather-heading">
      <h3 id="weather-heading" className="text-sm font-semibold text-slate-700">Weather (modelled)</h3>
      {unavailable ? (
        <p className="text-xs text-amber-700 mt-2">Weather data unavailable: {unavailable.reason ?? 'provider error'}. Air-quality values are unaffected.</p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800 tabular">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-slate-500 mt-3">
            Open-Meteo weather model, current conditions at {formatCityTime((data.provenance.weather as { observedAt?: string | null }).observedAt ?? null, timeZone)}. Context only; it does not change the index.
          </p>
        </>
      )}
    </section>
  );
}

export default function LiveMonitoring({ city, resource, cities, airQualityMap, onSelectCity }: LiveMonitoringProps) {
  const { data, loading, error, reload } = resource;
  const tz = city.timezone;

  const header = (
    <PageHeader
      icon={<Activity size={18} />}
      title={`Current conditions — ${city.name}`}
      description="CPCB NAQI method applied to modelled CAMS concentrations. Not an official CPCB station AQI."
    >
      {data && <DataBasisBadge provenance={data.provenance} />}
    </PageHeader>
  );

  if (!data) {
    return (
      <div className="space-y-5">
        {header}
        {loading ? <LoadingPanel label={`Loading current conditions for ${city.name}`} rows={4} /> : <ErrorPanel message={error} onRetry={reload} />}
      </div>
    );
  }

  const history = data.history.map(p => ({ ...p, label: formatAxisTime(p.time, tz) }));
  const ok = data.aqiStatus === 'ok';

  return (
    <div className="space-y-5">
      {header}
      {error && <StaleBanner message={error} onRetry={reload} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="panel p-5 flex flex-col items-center text-center gap-3" aria-labelledby="estimate-heading">
          <h3 id="estimate-heading" className="self-start text-sm font-semibold text-slate-700">NAQI-method estimate</h3>
          <AQIGauge aqi={data.aqi} isLowerBound={data.aqiIsLowerBound} />
          <CategoryBadge index={data.aqi} label={data.aqiCategory} size="md" />
          {ok ? (
            <p className="text-sm text-slate-600">
              Dominant pollutant: <strong className="text-slate-800">{pollutantList(data.naqi.dominantPollutants)}</strong>
              {data.aqiIsLowerBound && <span className="block text-xs text-slate-500 mt-1">“401+”: the CPCB Severe band has no upper breakpoint, so only a lower bound can be given.</span>}
            </p>
          ) : (
            <p className="text-sm text-amber-700" role="status">Not enough valid data for an estimate. {data.naqi.reasons.join(' ')}</p>
          )}
          <DataFreshness referenceTime={data.referenceTime} retrievedAt={data.provenance.airQuality.retrievedAt} timeZone={tz} className="justify-center" />
          <p className="text-xs text-slate-500 leading-snug">
            Highest of the pollutant sub-indices, from 24-hour means (8-hour for O₃ and CO) ending at this hour. Needs at least three pollutants including PM2.5 or PM10.
          </p>
        </section>

        <section className="panel p-5 lg:col-span-2" aria-labelledby="pollutants-heading">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <h3 id="pollutants-heading" className="text-sm font-semibold text-slate-700">Pollutants behind the estimate</h3>
            <span className="text-xs text-slate-500">Modelled concentrations · CO converted to mg/m³ for the CPCB table</span>
          </div>
          <PollutantTable data={data} />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="panel p-5 lg:col-span-2" aria-labelledby="history-heading">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h3 id="history-heading" className="text-sm font-semibold text-slate-700">Past 24 hours — hourly PM2.5 and PM10 (µg/m³)</h3>
            <span className="text-xs text-slate-500">CAMS model values for the {city.name} grid cell, not station measurements</span>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No hourly values available.</p>
          ) : (
            <>
              <div aria-hidden="true" className="h-[220px]">
                <Suspense fallback={<div className="skeleton w-full h-full" />}>
                  <HistoryChart rows={history} />
                </Suspense>
              </div>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-slate-600 hover:text-slate-800">Show the hourly values as a table</summary>
                <div className="overflow-x-auto mt-2 max-h-64">
                  <table className="data-table w-full text-xs">
                    <caption className="sr-only">Hourly modelled PM2.5 and PM10 for the past 24 hours</caption>
                    <thead><tr><th scope="col">Hour ({tz === 'Asia/Kolkata' ? 'IST' : tz})</th><th scope="col">PM2.5 µg/m³</th><th scope="col">PM10 µg/m³</th></tr></thead>
                    <tbody>
                      {history.map(p => (
                        <tr key={p.time}><td>{p.label}</td><td className="tabular">{formatValue(p.pm25, 1)}</td><td className="tabular">{formatValue(p.pm10, 1)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
        </section>
        <WeatherList data={data} timeZone={tz} />
      </div>

      <IndiaMap cities={cities} selectedId={city.id} airQualityMap={airQualityMap} onSelect={onSelectCity} />

      <Notice>
        {data.provenance.airQuality.attribution}. The CAMS global model has a grid of about 45 km over India, so these values describe a regional average around {city.name}, not a street or a monitoring station.
        For official measurements see the CPCB station AQI.
      </Notice>
    </div>
  );
}
