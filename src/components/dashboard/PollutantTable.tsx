import React from 'react';
import type { AirQualityData } from '../../types';
import { POLLUTANTS } from '../../utils/constants';
import { formatValue, formatIndex, formatConcentration } from '../../utils/provenance';
import CategoryBadge from '../common/CategoryBadge';

interface PollutantTableProps {
  data: AirQualityData;
}

/**
 * Per-pollutant basis of the NAQI-method estimate: the hourly model value,
 * the averaged concentration the sub-index uses, data completeness and the
 * resulting CPCB sub-index.
 */
export default function PollutantTable({ data }: PollutantTableProps) {
  const dominant = new Set(data.naqi.dominantPollutants);
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="data-table w-full min-w-[560px] text-sm">
        <caption className="sr-only">Pollutant concentrations and CPCB sub-indices for the NAQI-method estimate</caption>
        <thead>
          <tr className="border-b border-slate-200">
            <th scope="col">Pollutant</th>
            <th scope="col" className="!text-right">Hourly value</th>
            <th scope="col" className="!text-right">Mean used</th>
            <th scope="col" className="!text-right">Valid hours</th>
            <th scope="col" className="!text-right">Sub-index</th>
            <th scope="col">Category</th>
          </tr>
        </thead>
        <tbody>
          {POLLUTANTS.map(p => {
            const sub = data.naqi.subIndices[p.key];
            const ok = sub?.status === 'ok';
            const hourly = data[p.key as 'pm25' | 'pm10' | 'no2' | 'o3' | 'so2' | 'co'];
            return (
              <tr key={p.key}>
                <th scope="row" className="!normal-case !text-sm !font-semibold !text-slate-800 !tracking-normal">
                  {p.label}
                  {dominant.has(p.key) && (
                    <span className="ml-1.5 align-middle rounded bg-slate-100 px-1 py-px text-xs font-semibold uppercase text-slate-600">Dominant</span>
                  )}
                  <span className="block text-xs font-normal text-slate-500">{p.description}</span>
                </th>
                <td className="text-right font-mono tabular text-slate-800 whitespace-nowrap">{formatValue(hourly, 1)} <span className="text-xs text-slate-500">µg/m³</span></td>
                <td className="text-right font-mono tabular text-slate-800 whitespace-nowrap">
                  {ok ? formatConcentration(sub.average, sub.unit, sub.unit === 'mg/m3' ? 2 : 1) : '--'}
                  <span className="block text-xs font-sans text-slate-500">{sub ? `${sub.averagingHours}-h mean` : ''}</span>
                </td>
                <td className={`text-right tabular whitespace-nowrap ${sub && sub.validHours < sub.requiredHours ? 'text-amber-700 font-semibold' : 'text-slate-600'}`}>
                  {sub ? `${sub.validHours}/${sub.averagingHours}` : '--'}
                  {sub && <span className="block text-xs text-slate-500">{sub.requiredHours} required</span>}
                </td>
                <td className="text-right font-mono tabular font-semibold text-slate-900">{ok ? formatIndex(sub.subIndex, sub.isLowerBound) : '--'}</td>
                <td>
                  {ok ? <CategoryBadge index={sub.subIndex} label={sub.category} /> : <span className="text-xs text-amber-700">Insufficient data</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
