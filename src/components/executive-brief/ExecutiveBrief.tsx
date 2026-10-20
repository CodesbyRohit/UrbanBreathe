import React from 'react';
import { FileText, Printer, RefreshCw } from 'lucide-react';
import { generateBrief } from '../../services/api';
import { useResource } from '../../hooks/useResource';
import { useAqiColor } from '../../hooks/useTheme';
import type { City, ExecutiveBrief as BriefData, SourceInfo } from '../../types';
import { formatIndex, formatValue, formatCityTime } from '../../utils/provenance';
import { POLLUTANT_LABELS } from '../../utils/constants';
import PageHeader from '../common/PageHeader';
import DataBasisBadge from '../common/DataBasisBadge';
import CategoryBadge from '../common/CategoryBadge';
import { LoadingPanel, ErrorPanel, StaleBanner } from '../common/StateViews';

interface ExecutiveBriefProps {
  city: City;
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="px-6 py-5 border-b border-slate-100 avoid-break">
      <h4 className="text-sm font-semibold text-slate-800 mb-2">{n}. {title}</h4>
      {children}
    </section>
  );
}

export default function ExecutiveBrief({ city }: ExecutiveBriefProps) {
  const { data: brief, loading, error, reload } = useResource<BriefData>(city.id, signal => generateBrief(city.id, signal));
  const aqiColor = useAqiColor();
  const tz = city.timezone;

  const header = (
    <PageHeader icon={<FileText size={18} />} title={`Situation brief — ${city.name}`} description="Printable summary built from the same data as the dashboard. Verify against official CPCB data before acting.">
      <button type="button" onClick={reload} className="btn-secondary" disabled={loading}>
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" /> Regenerate
      </button>
      <button type="button" onClick={() => window.print()} className="btn-primary" disabled={!brief}>
        <Printer size={14} aria-hidden="true" /> Print / Save as PDF
      </button>
    </PageHeader>
  );

  if (!brief) {
    return (
      <div className="space-y-5">
        {header}
        {loading ? <LoadingPanel label="Generating brief" rows={5} /> : <ErrorPanel title="The brief could not be generated" message={error} onRetry={reload} />}
      </div>
    );
  }

  const s = brief.executiveSummary;
  const prov = brief.dataBasis.provenance;
  const weather = 'status' in prov.weather ? null : (prov.weather as SourceInfo);

  return (
    <div className="space-y-5">
      <div className="no-print">{header}</div>
      {error && <div className="no-print"><StaleBanner message={error} onRetry={reload} /></div>}

      <article id="brief-content" className="panel overflow-hidden max-w-4xl mx-auto print:max-w-none" aria-labelledby="brief-title">
        <header className="px-6 py-5 border-b border-slate-200">
          <p className="print-only text-xs text-slate-500 mb-1">UrbanBreathe · {window.location.origin}</p>
          <div className="mb-2"><DataBasisBadge provenance={prov} referenceTime={brief.dataBasis.referenceTime} timeZone={tz} /></div>
          <h3 id="brief-title" className="text-xl font-bold text-slate-900">{brief.title}</h3>
          <p className="text-xs text-slate-500 mt-1">{brief.date} · generated {formatCityTime(brief.generatedAt, tz)}</p>
          <p className="text-xs text-slate-600 mt-1">{brief.dataBasis.label}</p>
        </header>

        <Section n={1} title="Summary">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">NAQI-method estimate</dt>
              <dd className="text-2xl font-bold tabular" style={{ color: aqiColor(s.currentAQI) }}>{formatIndex(s.currentAQI, s.currentAQIIsLowerBound)}</dd>
              <dd><CategoryBadge index={s.currentAQI} label={s.category} /></dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">72-h model peak (not evaluated)</dt>
              <dd className="text-2xl font-bold tabular" style={{ color: aqiColor(s.forecastPeakAQI) }}>{formatIndex(s.forecastPeakAQI, s.forecastPeakIsLowerBound)}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Dominant pollutant</dt>
              <dd className="text-lg font-semibold text-slate-800">{s.dominantPollutants.join(', ') || '—'}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">Season (IMD convention)</dt>
              <dd className="text-lg font-semibold text-slate-800">{s.season}</dd>
            </div>
          </dl>
        </Section>

        <Section n={2} title="Current situation">
          <p className="text-sm text-slate-700 leading-relaxed">{brief.currentSituation.overview}</p>
          <table className="data-table w-full text-xs mt-3">
            <caption className="text-left text-xs text-slate-500 pb-1">{brief.currentSituation.keyMetricsNote}</caption>
            <thead><tr>{Object.keys(brief.currentSituation.keyMetrics).map(k => <th key={k} scope="col">{POLLUTANT_LABELS[k] || k}</th>)}</tr></thead>
            <tbody><tr>{Object.entries(brief.currentSituation.keyMetrics).map(([k, v]) => <td key={k} className="font-mono tabular">{formatValue(v, 1)}</td>)}</tr></tbody>
          </table>
          <ul className="mt-3 space-y-1 text-xs text-slate-600 list-disc pl-5">
            {brief.currentSituation.weatherContext.map(w => <li key={w}>{w}</li>)}
          </ul>
        </Section>

        <Section n={3} title="Source context (no apportionment)">
          <p className="text-xs text-slate-600 mb-2">{brief.sourceContext.disclaimer}</p>
          <ul className="space-y-1 text-xs text-slate-700 list-disc pl-5">
            {brief.sourceContext.indicators.map(ind => (
              <li key={ind.id}>
                <strong>{ind.label}:</strong>{' '}
                {ind.value === null ? `unavailable — ${ind.unavailableReason}` : Array.isArray(ind.value) ? ind.value.map(p => POLLUTANT_LABELS[p] || p).join(', ') : String(ind.value)}
              </li>
            ))}
          </ul>
        </Section>

        <Section n={4} title="Model forecast">
          <p className="text-sm text-slate-700">{brief.forecast.summary}</p>
          <p className="text-xs text-slate-500 mt-1">{brief.forecast.evaluationNote}</p>
        </Section>

        <Section n={5} title="Recommended actions and their basis">
          <ol className="space-y-2">
            {brief.recommendations.map(r => (
              <li key={r.action} className="rounded-lg bg-slate-50 p-3">
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${r.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : r.priority === 'MEDIUM' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>{r.priority}</span>
                  <span className="text-sm text-slate-800">{r.action}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Basis: {r.basis}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section n={6} title="CPCB health statement">
          <p className="text-sm text-slate-700 leading-relaxed">{brief.healthStatement ?? 'No category available — data insufficient.'}</p>
          <p className="text-xs text-slate-500 mt-1">CPCB National Air Quality Index (CUPS/82/2014-15), Table 3.12 — official guidance text, quoted.</p>
        </Section>

        <section className="px-6 py-5 avoid-break">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">7. Data basis and limitations</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-700 mb-3">
            <div><dt className="inline text-slate-500">Air quality: </dt><dd className="inline">{prov.airQuality.model} ({prov.airQuality.kind}) via {prov.airQuality.provider === 'open-meteo' ? 'Open-Meteo (CC BY 4.0)' : prov.airQuality.provider}</dd></div>
            <div><dt className="inline text-slate-500">Values for: </dt><dd className="inline">{formatCityTime(brief.dataBasis.referenceTime, tz)}</dd></div>
            <div><dt className="inline text-slate-500">Retrieved: </dt><dd className="inline">{formatCityTime(prov.airQuality.retrievedAt, tz)}</dd></div>
            <div><dt className="inline text-slate-500">Weather: </dt><dd className="inline">{weather ? `${weather.model} (${weather.kind})` : 'unavailable'}</dd></div>
          </dl>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            {brief.limitations.map(l => <li key={l}>{l}</li>)}
          </ul>
          <p className="pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">{brief.methodology}</p>
          <p className="text-xs text-slate-500 mt-1">General information only; not medical or legal advice.</p>
        </section>
      </article>
    </div>
  );
}
