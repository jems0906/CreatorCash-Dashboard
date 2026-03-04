import React, { useRef, useLayoutEffect } from 'react';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import type { PayoutProjection as PayoutProjectionType } from '../../types';

interface PayoutProjectionProps {
  projection: PayoutProjectionType;
  lifetimeEarnings: number;
}

const ConfidenceBar: React.FC<{ value: number }> = ({ value }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.style.setProperty('--fill', `${value * 100}%`);
  }, [value]);
  return (
    <div className="confidence-bar">
      <div className="confidence-bar__fill" ref={ref} />
    </div>
  );
};

export const PayoutProjection: React.FC<PayoutProjectionProps> = ({
  projection,
  lifetimeEarnings,
}) => {
  const tiers = [
    { label: 'Today', value: projection.daily, icon: <DollarSign size={14} /> },
    { label: 'This Week', value: projection.weekly, icon: <Calendar size={14} /> },
    { label: 'This Month', value: projection.monthly, icon: <Calendar size={14} /> },
    { label: 'Projected Year', value: projection.yearly, icon: <TrendingUp size={14} /> },
  ];

  return (
    <div className="payout-card card">
      <div className="payout-card__header">
        <h2 className="card__title">Payout Projections</h2>
        <span className="confidence-label">
          Confidence: {(projection.confidence * 100).toFixed(0)}%
        </span>
      </div>
      <ConfidenceBar value={projection.confidence} />

      <div className="payout-grid">
        {tiers.map(t => (
          <div key={t.label} className="payout-item">
            <div className="payout-item__icon">{t.icon}</div>
            <div className="payout-item__amount">${t.value.toLocaleString()}</div>
            <div className="payout-item__label">{t.label}</div>
          </div>
        ))}
      </div>

      <div className="lifetime-earnings">
        <span className="lifetime-earnings__label">Lifetime Earnings</span>
        <span className="lifetime-earnings__value">
          ${lifetimeEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};
