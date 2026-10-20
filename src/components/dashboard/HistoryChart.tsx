import React from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export interface HistoryRow {
  time: string;
  label: string;
  pm25: number | null;
  pm10: number | null;
}

/**
 * Past-24-hour PM chart. Loaded lazily so the dashboard's estimate and table
 * render without waiting for the charting library.
 */
export default function HistoryChart({ rows }: { rows: HistoryRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={rows} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} interval={5} minTickGap={16} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} width={44} label={{ value: 'µg/m³', angle: -90, position: 'insideLeft', fontSize: 11 }} />
        <Tooltip formatter={(v, name) => [v == null ? '--' : `${Number(v).toFixed(1)} µg/m³`, name]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" name="PM10" dataKey="pm10" stroke="#a16207" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} isAnimationActive={false} />
        <Line type="monotone" name="PM2.5" dataKey="pm25" stroke="#2675dc" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
