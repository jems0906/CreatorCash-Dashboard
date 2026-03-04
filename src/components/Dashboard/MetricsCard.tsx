import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PerformanceMetric } from '../../types';

interface MetricsCardProps {
  metric: PerformanceMetric;
  isLive?: boolean;
}

function formatValue(metric: PerformanceMetric): string {
  const { id, value, unit } = metric;
  if (id === 'views' || id === 'adImpr') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  }
  if (unit === 'USD' || unit.startsWith('$/')) return `$${value.toFixed(2)}`;
  if (unit === '%') return `${value}%`;
  return value.toLocaleString();
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ metric, isLive }) => {
  const { label, trend, change, unit } = metric;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendClass = trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral';

  return (
    <div className={`metrics-card ${isLive ? 'metrics-card--live' : ''}`}>
      <div className="metrics-card__header">
        <span className="metrics-card__label">{label}</span>
        {isLive && <span className="live-badge">LIVE</span>}
      </div>
      <div className="metrics-card__value">{formatValue(metric)}</div>
      <div className={`metrics-card__trend ${trendClass}`}>
        <TrendIcon size={12} />
        <span>{Math.abs(change)}%</span>
        <span className="metrics-card__unit">{unit}</span>
      </div>
    </div>
  );
};
