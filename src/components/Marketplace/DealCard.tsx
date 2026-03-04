import React from 'react';
import { Check, X, Clock, Users, DollarSign, Star } from 'lucide-react';
import type { SponsoredPost } from '../../types';

interface DealCardProps {
  deal: SponsoredPost;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export const DealCard: React.FC<DealCardProps> = ({ deal, onAccept, onReject }) => {
  const { brand, title, payout, cpmOffer, audienceMatch, estimatedReach, deadline, requirements, status, duration } = deal;
  // description is intentionally omitted — not rendered in card view
  const matchPct = Math.round(audienceMatch * 100);

  const isActionable = status === 'available';

  return (
    <div className="deal-card" data-brand={brand.category}>
      {/* Brand header */}
      <div className="deal-card__brand">
        <div className="deal-card__brand-avatar">
          {brand.name.charAt(0)}
        </div>
        <div>
          <div className="deal-card__brand-name">
            {brand.name}
            {brand.verified && <Star size={11} className="verified-star" />}
          </div>
          <div className="deal-card__category">{brand.category}</div>
        </div>
        <div className="deal-card__match">
          {matchPct}% match
        </div>
      </div>

      {/* Content */}
      <div className="deal-card__body">
        <h3 className="deal-card__title">{title}</h3>

        <div className="deal-card__stats">
          <div className="deal-stat">
            <DollarSign size={12} />
            <span className="deal-stat__value">${payout.toLocaleString()}</span>
            <span className="deal-stat__label">flat fee</span>
          </div>
          <div className="deal-stat">
            <DollarSign size={12} />
            <span className="deal-stat__value">${cpmOffer}</span>
            <span className="deal-stat__label">CPM</span>
          </div>
          <div className="deal-stat">
            <Users size={12} />
            <span className="deal-stat__value">{formatReach(estimatedReach)}</span>
            <span className="deal-stat__label">reach</span>
          </div>
          <div className="deal-stat">
            <Clock size={12} />
            <span className="deal-stat__value">{duration}s</span>
            <span className="deal-stat__label">segment</span>
          </div>
        </div>

        <div className="deal-card__requirements">
          {requirements.map((req, i) => (
            <span key={i} className="req-chip">{req}</span>
          ))}
        </div>

        <div className="deal-card__deadline">
          <Clock size={11} /> Deadline: {deadline}
        </div>
      </div>

      {/* Actions */}
      {isActionable ? (
        <div className="deal-card__actions">
          <button
            className="deal-btn deal-btn--reject"
            onClick={() => onReject(deal.id)}
            aria-label="Reject deal"
          >
            <X size={18} /> Pass
          </button>
          <button
            className="deal-btn deal-btn--accept"
            onClick={() => onAccept(deal.id)}
            aria-label="Accept deal"
          >
            <Check size={18} /> Accept ${payout.toLocaleString()}
          </button>
        </div>
      ) : (
        <div className="deal-card__status-badge" data-status={status}>
          {status.toUpperCase()}
        </div>
      )}
    </div>
  );
};
