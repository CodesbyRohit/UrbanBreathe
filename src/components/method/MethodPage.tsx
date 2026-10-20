import React from 'react';
import { BookOpen } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Notice from '../common/Notice';
import CategoryBadge from '../common/CategoryBadge';
import { CATEGORY_RANGES } from '../../utils/formatters';

// CPCB CUPS/82/2014-15 Table 3.11, as implemented in server/domain/naqi.js.
const BREAKPOINTS: { label: string; window: string; unit: string; bands: string[] }[] = [
  { label: 'PM10', window: '24 h', unit: 'µg/m³', bands: ['0–50', '51–100', '101–250', '251–350', '351–430', '430+'] },
  { label: 'PM2.5', window: '24 h', unit: 'µg/m³', bands: ['0–30', '31–60', '61–90', '91–120', '121–250', '250+'] },
  { label: 'NO₂', window: '24 h', unit: 'µg/m³', bands: ['0–40', '41–80', '81–180', '181–280', '281–400', '400+'] },
  { label: 'O₃', window: '8 h', unit: 'µg/m³', bands: ['0–50', '51–100', '101–168', '169–208', '209–748', '748+'] },
  { label: 'CO', window: '8 h', unit: 'mg/m³', bands: ['0–1.0', '1.1–2.0', '2.1–10', '10.1–17', '17.1–34', '34+'] },
  { label: 'SO₂', window: '24 h', unit: 'µg/m³', bands: ['0–40', '41–80', '81–380', '381–800', '801–1600', '1600+'] },
];

const REPO = 'https://github.com/CodesbyRohit/UrbanBreathe';

/** Data provenance and calculation method, in the app (not only in the README). */
export default function MethodPage() {
  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader icon={<BookOpen size={18} />} title="Data & method" description="Where the numbers come from, how they are calculated and what they cannot tell you." />

      <Notice tone="caution" title="These are estimates from a model, not official measurements">
        UrbanBreathe applies the CPCB National Air Quality Index method to modelled concentrations. The result is labelled a
        “NAQI-method estimate” and is not the official CPCB station AQI published at airquality.cpcb.gov.in.
      </Notice>

      <section className="panel p-5 space-y-3 text-sm text-slate-700 leading-relaxed" aria-labelledby="m-data">
        <h3 id="m-data" className="text-base font-semibold text-slate-900">Data sources</h3>
        <dl className="space-y-3">
          <div>
            <dt className="font-semibold text-slate-800">Air quality — modelled</dt>
            <dd>
              Copernicus Atmosphere Monitoring Service (CAMS) global atmospheric composition forecast, served by the{' '}
              <a className="text-brand-700 underline underline-offset-2" href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener noreferrer">Open-Meteo Air Quality API</a>.
              Hourly PM2.5, PM10, NO₂, O₃, SO₂ and CO in µg/m³ for the grid cell containing each city centre (about 45 km over India),
              from two days before to four days after the current hour. It is model output, not station data, and cannot resolve local hotspots.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Weather — modelled</dt>
            <dd>Open-Meteo forecast API, current conditions. Shown for context only; it does not enter the index.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Freshness</dt>
            <dd>
              Each view shows the hour its values describe and when they were retrieved. The server caches provider responses for up to 10 minutes and
              the CDN may serve an API response for up to 5 minutes more; timestamps always refer to the original retrieval. Open-Meteo does not report
              which CAMS model run produced the values.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Licence and attribution</dt>
            <dd>Open-Meteo data are provided under CC BY 4.0 and the free API is for non-commercial use. CAMS data: Copernicus Atmosphere Monitoring Service.</dd>
          </div>
        </dl>
      </section>

      <section className="panel p-5 space-y-3 text-sm text-slate-700 leading-relaxed" aria-labelledby="m-calc">
        <h3 id="m-calc" className="text-base font-semibold text-slate-900">How the NAQI-method estimate is calculated</h3>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>For each pollutant, average the hourly values over the window ending at the current hour: 24 hours for PM10, PM2.5, NO₂ and SO₂; 8 hours for O₃ and CO.</li>
          <li>A 24-hour mean needs at least 16 valid hours (CPCB). For 8-hour means CPCB states no minimum; UrbanBreathe requires all 8 hours.</li>
          <li>Convert CO to mg/m³ and round the mean to the precision of the breakpoint table.</li>
          <li>Interpolate a sub-index within the CPCB band: I = (I<sub>HI</sub> − I<sub>LO</sub>)/(B<sub>HI</sub> − B<sub>LO</sub>) × (C − B<sub>LO</sub>) + I<sub>LO</sub>, with I<sub>LO</sub> reduced by one when it is above 50 (CPCB §3.5).</li>
          <li>The estimate is the highest sub-index. It is only reported when at least three pollutants have valid sub-indices and one of them is PM2.5 or PM10; otherwise the view says the data are insufficient.</li>
          <li>The Severe band has no upper breakpoint, so concentrations above it are reported as “401+”.</li>
        </ol>
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[640px] text-xs mt-2">
            <caption className="text-left text-xs text-slate-500 pb-1">CPCB breakpoints (CUPS/82/2014-15, Table 3.11) and index ranges</caption>
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col">Pollutant</th>
                <th scope="col">Window</th>
                {CATEGORY_RANGES.map(c => (
                  <th scope="col" key={c.label} className="!normal-case">
                    <CategoryBadge index={c.min} label={c.label} />
                    <span className="block mt-1 font-normal text-slate-500">{c.max === null ? `${c.min}+` : `${c.min}–${c.max}`}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BREAKPOINTS.map(b => (
                <tr key={b.label}>
                  <th scope="row" className="!normal-case !text-xs !text-slate-800">{b.label} <span className="font-normal text-slate-500">({b.unit})</span></th>
                  <td>{b.window}</td>
                  {b.bands.map(band => <td key={band} className="tabular">{band}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Sources: CPCB, <em>National Air Quality Index</em> (CUPS/82/2014-15); CPCB, <em>How is AQI calculated?</em>. Open questions and implementation
          choices are listed in <a className="text-brand-700 underline underline-offset-2" href={`${REPO}/blob/main/docs/methodology/naqi.md`} target="_blank" rel="noopener noreferrer">docs/methodology/naqi.md</a>.
        </p>
      </section>

      <section className="panel p-5 space-y-2 text-sm text-slate-700 leading-relaxed" aria-labelledby="m-limits">
        <h3 id="m-limits" className="text-base font-semibold text-slate-900">What UrbanBreathe does not do</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>No station measurements: every value is model output (or labelled demo data).</li>
          <li>No forecast accuracy claim: the 72-hour model forecast has not been evaluated against observations or a persistence baseline.</li>
          <li>No source apportionment: the source view shows descriptive indicators only.</li>
          <li>No health, exposure, cost or policy-effect estimates: scenarios are arithmetic on stated, unvalidated assumptions.</li>
          <li>No anomaly detection: it needs a historical baseline that is not implemented.</li>
        </ul>
      </section>

      <section className="panel p-5 space-y-2 text-sm text-slate-700 leading-relaxed" aria-labelledby="m-verify">
        <h3 id="m-verify" className="text-base font-semibold text-slate-900">Verify a number yourself</h3>
        <p>
          Every view is built from a public JSON endpoint, e.g. <code className="font-mono text-xs bg-slate-100 px-1 rounded">/api/air-quality/delhi</code>,
          which returns the hourly series behind the estimate, each pollutant’s mean, valid-hour count and sub-index, and the provenance block.
          The calculation is in <code className="font-mono text-xs bg-slate-100 px-1 rounded">server/domain/naqi.js</code> with hand-computed tests in the{' '}
          <a className="text-brand-700 underline underline-offset-2" href={REPO} target="_blank" rel="noopener noreferrer">source repository</a>.
        </p>
      </section>
    </div>
  );
}
