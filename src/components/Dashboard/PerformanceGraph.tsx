import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { EarningsHistory } from '../../types';

interface PerformanceGraphProps {
  history: EarningsHistory[];
  isDark: boolean;
}

type GraphMetric = 'earnings' | 'rpm' | 'cpm' | 'views';

const METRIC_CONFIG: Record<GraphMetric, { label: string; color: string; unit: string }> = {
  earnings: { label: 'Daily Earnings', color: '#6366f1', unit: '$' },
  rpm:      { label: 'RPM',            color: '#10b981', unit: '$' },
  cpm:      { label: 'CPM',            color: '#f59e0b', unit: '$' },
  views:    { label: 'Views',          color: '#06b6d4', unit: ''  },
};

const LABEL_TO_KEY: Record<string, GraphMetric> = Object.fromEntries(
  Object.entries(METRIC_CONFIG).map(([k, v]) => [v.label, k as GraphMetric]));

interface TooltipEntry { name: string; value: number; color: string; }
interface CustomTooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: string; }

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="graph-tooltip">
      <p className="graph-tooltip__date">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} data-metric={LABEL_TO_KEY[p.name] ?? ''}>
          {p.name}: {typeof p.value === 'number' && p.name !== 'Views'
            ? `$${p.value.toFixed(2)}`
            : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ history, isDark }) => {
  const [activeMetrics, setActiveMetrics] = useState<GraphMetric[]>(['earnings', 'rpm']);

  const toggleMetric = (m: GraphMetric) => {
    setActiveMetrics(prev =>
      prev.includes(m)
        ? prev.length > 1 ? prev.filter(x => x !== m) : prev
        : [...prev, m]
    );
  };

  const gridColor = isDark ? '#1e1e2e' : '#f0f0f5';
  const axisColor = isDark ? '#6b6b8a' : '#9ca3af';

  // Downsample to every other day if > 20 points for readability
  const displayData = history.length > 20
    ? history.filter((_, i) => i % 2 === 0)
    : history;

  return (
    <div className="perf-graph card">
      <div className="perf-graph__header">
        <h2 className="card__title">30-Day Performance</h2>
        <div className="perf-graph__toggles">
          {(Object.keys(METRIC_CONFIG) as GraphMetric[]).map(m => (
            <button
              key={m}
              data-metric={m}
              onClick={() => toggleMetric(m)}
              className={`metric-toggle ${activeMetrics.includes(m) ? 'metric-toggle--active' : ''}`}
            >
              {METRIC_CONFIG[m].label}
            </button>
          ))}
        </div>
      </div>

      <div className="perf-graph__chart">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={displayData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              {activeMetrics.map(m => (
                <linearGradient key={m} id={`grad-${m}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={METRIC_CONFIG[m].color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={METRIC_CONFIG[m].color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tick={{ fill: axisColor, fontSize: 10 }}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: axisColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            {activeMetrics.map(m => (
              <Area
                key={m}
                type="monotone"
                dataKey={m === 'views' ? 'views' : m}
                name={METRIC_CONFIG[m].label}
                stroke={METRIC_CONFIG[m].color}
                strokeWidth={2}
                fill={`url(#grad-${m})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
