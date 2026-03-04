import React, { useRef, useLayoutEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';
import type { ABVariant } from '../../types';

interface TestVariantCardProps {
  variant: ABVariant;
  isLeading: boolean;
  totalImpressions: number;
}

export const TestVariantCard: React.FC<TestVariantCardProps> = ({
  variant,
  isLeading,
  totalImpressions,
}) => {
  const sharePercent = totalImpressions > 0
    ? ((variant.impressions / totalImpressions) * 100).toFixed(1)
    : '0';
  const fillPct = totalImpressions > 0 ? (variant.impressions / totalImpressions) * 100 : 50;
  const fillRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    fillRef.current?.style.setProperty('--fill', `${fillPct}%`);
  }, [fillPct]);

  return (
    <div className={`variant-card ${variant.isControl ? 'variant-card--control' : 'variant-card--variant'} ${isLeading ? 'variant-card--leading' : ''}`}>
      <div className="variant-card__header">
        <div>
          <div className="variant-card__name">
            {variant.name}
            {variant.isWinner && <Trophy size={13} className="winner-icon" />}
          </div>
          <div className="variant-card__desc">{variant.description}</div>
        </div>
        <div className={`variant-badge ${variant.isControl ? 'variant-badge--control' : 'variant-badge--variant'}`}>
          {variant.isControl ? 'Control' : 'Variant'}
        </div>
      </div>

      {/* Traffic allocation bar */}
      <div className="traffic-bar">
        <div className="traffic-bar__fill" ref={fillRef} />
      </div>
      <div className="traffic-bar__label">{sharePercent}% traffic</div>

      <div className="variant-stats">
        <div className="vstat">
          <Users size={11} />
          <span className="vstat__value">{variant.impressions.toLocaleString()}</span>
          <span className="vstat__label">Impressions</span>
        </div>
        <div className="vstat">
          <TrendingUp size={11} />
          <span className="vstat__value">{(variant.ctr * 100).toFixed(2)}%</span>
          <span className="vstat__label">CTR</span>
        </div>
        <div className="vstat">
          <DollarSign size={11} />
          <span className="vstat__value">${variant.revenue.toLocaleString()}</span>
          <span className="vstat__label">Revenue</span>
        </div>
        <div className="vstat">
          {variant.conversionRate > 0.03 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span className="vstat__value">{(variant.conversionRate * 100).toFixed(2)}%</span>
          <span className="vstat__label">Conv. Rate</span>
        </div>
      </div>
    </div>
  );
};
