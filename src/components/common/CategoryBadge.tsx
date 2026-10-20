import React from 'react';
import { useAqiColor } from '../../hooks/useTheme';

interface CategoryBadgeProps {
  /** Index used for colour; the label is always shown as text. */
  index: number | null | undefined;
  label: string | null | undefined;
  size?: 'sm' | 'md';
}

// Severity glyphs give a second, non-colour cue (one more bar per category).
const LEVEL: Record<string, number> = { Good: 1, Satisfactory: 2, Moderate: 3, Poor: 4, 'Very Poor': 5, Severe: 6 };

/** CPCB category as text + colour + level bars, so colour is never the only cue. */
export default function CategoryBadge({ index, label, size = 'sm' }: CategoryBadgeProps) {
  const aqiColor = useAqiColor();
  const text = label ?? 'No estimate';
  const color = aqiColor(label ? index : null);
  const level = label ? LEVEL[label] ?? 0 : 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold whitespace-nowrap ${size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-1.5 py-0.5 text-xs'}`}
      style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}40` }}
    >
      <span className="inline-flex items-end gap-px h-2.5" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="w-[2px] rounded-sm" style={{ height: `${4 + i}px`, backgroundColor: i < level ? color : `${color}33` }} />
        ))}
      </span>
      {text}
    </span>
  );
}
