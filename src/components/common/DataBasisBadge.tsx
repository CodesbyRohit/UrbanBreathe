import React from 'react';
import { FlaskConical, Info, Radio, AlertTriangle } from 'lucide-react';
import type { Provenance } from '../../types';
import { provenanceBadge, formatCityTime } from '../../utils/provenance';

interface DataBasisBadgeProps {
  provenance: Provenance | null | undefined;
  referenceTime?: string;
  timeZone?: string;
  className?: string;
}

const TONE_STYLES = {
  modelled: 'bg-sky-50 text-sky-800 border-sky-200',
  measured: 'bg-teal-50 text-teal-800 border-teal-200',
  demo: 'bg-amber-100 text-amber-900 border-amber-300',
  unknown: 'bg-slate-100 text-slate-700 border-slate-200',
} as const;

/** States where the values in a view come from: modelled, measured, demo or unknown. */
export default function DataBasisBadge({ provenance, referenceTime, timeZone, className = '' }: DataBasisBadgeProps) {
  const badge = provenanceBadge(provenance);
  const Icon = badge.tone === 'demo' ? AlertTriangle : badge.tone === 'modelled' ? FlaskConical : badge.tone === 'measured' ? Radio : Info;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${TONE_STYLES[badge.tone]} ${className}`}
      title={badge.detail}
    >
      <Icon size={12} aria-hidden="true" />
      <span>{badge.text}</span>
      {referenceTime && <span className="opacity-80">· {formatCityTime(referenceTime, timeZone)}</span>}
      <span className="sr-only">. {badge.detail}</span>
    </span>
  );
}
