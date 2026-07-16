import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Brain, Shield, Info, RefreshCw } from 'lucide-react';
import { useSourceAttribution } from '../../hooks/useSources';
import { SOURCE_LABELS, SOURCE_COLORS } from '../../utils/constants';

interface SourceAttributionProps {
  cityId: string;
}

export default function SourceAttribution({ cityId }: SourceAttributionProps) {
  const { data, loading, refresh } = useSourceAttribution(cityId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="skeleton w-40 h-4 mb-6" />
            <div className="skeleton w-full h-64" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-slate-500">Unable to analyze pollution sources.</p>
          <button
            onClick={refresh}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors mx-auto"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = data.sortedSources.map(s => ({
    name: SOURCE_LABELS[s.source] || s.source,
    value: s.percentage,
    fill: SOURCE_COLORS[s.source] || '#94a3b8',
    confidence: s.confidence,
    description: s.description,
    mitigation: s.mitigation,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Brain size={18} className="text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Source Attribution</h2>
          <p className="text-sm text-slate-500">Explainable AI analysis of pollution contributors</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <Shield size={14} />
          Confidence: {Math.round(data.sortedSources.reduce((s, x) => s + x.confidence, 0) / data.sortedSources.length)}%
        </div>
        <button onClick={refresh} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Source Contribution (%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#475569' }} width={110} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
                      <p className="font-semibold text-slate-900">{d.name}</p>
                      <p className="text-slate-600 mt-1">Contribution: <strong>{d.value}%</strong></p>
                      <p className="text-slate-500">Confidence: {d.confidence}%</p>
                      <p className="text-slate-400 mt-1">{d.description}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
                      <p className="font-semibold text-slate-900">{d.name}</p>
                      <p className="text-slate-600">{d.value}% contribution</p>
                    </div>
                  );
                }}
              />
              <Legend verticalAlign="bottom" formatter={(value) => <span className="text-xs text-slate-600">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Source-wise Analysis</h3>
        <div className="space-y-4">
          {data.sortedSources.map(s => {
            const color = SOURCE_COLORS[s.source] || '#94a3b8';
            return (
              <div key={s.source} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm font-semibold text-slate-800">{SOURCE_LABELS[s.source] || s.source}</span>
                    <span className="text-sm font-bold" style={{ color }}>{s.percentage}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Shield size={12} />
                    {s.confidence}% confidence
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-2">{s.description}</p>
                <div className="flex items-start gap-1.5 text-xs text-brand-700 bg-brand-50 rounded px-2 py-1.5">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  <span>{s.mitigation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Methodology</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{data.methodology}</p>
        <p className="text-xs text-slate-400 mt-2">Season: {data.season} • Analysis uses multi-factor pollutant correlation with seasonal adjustment</p>
      </div>
    </div>
  );
}
