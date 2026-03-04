import React from 'react';
import { Zap, Eye, ExternalLink } from 'lucide-react';
import type { Ad } from '../../types';

interface InlineAdCardProps {
  ad: Ad;
}

export const InlineAdCard: React.FC<InlineAdCardProps> = ({ ad }) => {
  return (
    <div className="inline-ad-card" data-brand={ad.brand.category}>
      <div className="inline-ad-card__badge">
        <Zap size={10} />
        Sponsored · {ad.durationSeconds}s {ad.format.replace('-', ' ')}
      </div>

      <div className="inline-ad-card__body">
        <div className="inline-ad-card__brand-avatar">
          {ad.brand.name.charAt(0)}
        </div>
        <div className="inline-ad-card__content">
          <div className="inline-ad-card__brand-name">{ad.brand.name}</div>
          <div className="inline-ad-card__cta-text">
            Tap to {ad.cta.toLowerCase()}
          </div>
        </div>
        <button
          className="inline-ad-card__cta-btn"
          aria-label={ad.cta}
        >
          {ad.cta} <ExternalLink size={11} />
        </button>
      </div>

      <div className="inline-ad-card__metrics">
        <span><Eye size={10} /> {ad.impressions.toLocaleString()} impr.</span>
        <span>CTR {(ad.ctr * 100).toFixed(1)}%</span>
        <span className="inline-ad-card__revenue">+${ad.estimatedRevenue.toFixed(2)}</span>
      </div>
    </div>
  );
};
