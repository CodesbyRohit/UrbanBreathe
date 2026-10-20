import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatCityTime, formatAge, hoursOld } from '../../utils/provenance';

interface DataFreshnessProps {
  /** Hour the values describe (UTC ISO). */
  referenceTime: string | null | undefined;
  /** When the server retrieved the data from the provider. */
  retrievedAt?: string | null;
  timeZone?: string;
  /** Hours after which the values are flagged as old. */
  staleAfterHours?: number;
  className?: string;
}

/**
 * States both times explicitly: the hour the values are for, and when they
 * were retrieved. Flags data that describes an hour well in the past.
 */
export default function DataFreshness({ referenceTime, retrievedAt, timeZone, staleAfterHours = 3, className = '' }: DataFreshnessProps) {
  const age = hoursOld(referenceTime);
  const stale = age !== null && age > staleAfterHours;
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 ${className}`}>
      {stale ? <AlertTriangle size={12} className="text-amber-600" aria-hidden="true" /> : <Clock size={12} aria-hidden="true" />}
      <span>
        Values for <strong className="font-semibold text-slate-700">{formatCityTime(referenceTime, timeZone)}</strong>
      </span>
      {retrievedAt && <span>· retrieved {formatAge(retrievedAt)}</span>}
      {stale && <span className="text-amber-700 font-medium">· {Math.floor(age as number)} h old</span>}
    </span>
  );
}
