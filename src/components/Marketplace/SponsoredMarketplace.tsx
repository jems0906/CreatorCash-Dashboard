import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, TrendingUp } from 'lucide-react';
import { DealCarousel } from './DealCarousel';
import type { SponsoredPost, ContentCategory } from '../../types';

interface SponsoredMarketplaceProps {
  deals: SponsoredPost[];
}

const CATEGORIES: ContentCategory[] = ['tech', 'beauty', 'gaming', 'fitness', 'fashion', 'food', 'travel', 'finance'];

export const SponsoredMarketplace: React.FC<SponsoredMarketplaceProps> = ({ deals }) => {
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'payout' | 'match' | 'deadline'>('match');

  const filtered = useMemo(() => {
    const base = selectedCategory === 'all'
      ? deals
      : deals.filter(d => d.category === selectedCategory);

    return [...base].sort((a, b) => {
      if (sortBy === 'payout') return b.payout - a.payout;
      if (sortBy === 'match') return b.audienceMatch - a.audienceMatch;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [deals, selectedCategory, sortBy]);

  const totalPotential = filtered
    .filter(d => d.status === 'available')
    .reduce((s, d) => s + d.payout, 0);

  return (
    <div className="marketplace">
      {/* Summary banner */}
      <motion.div
        className="marketplace__banner card"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="banner-stat">
          <TrendingUp size={16} />
          <div>
            <div className="banner-stat__value">${totalPotential.toLocaleString()}</div>
            <div className="banner-stat__label">Available earnings</div>
          </div>
        </div>
        <div className="banner-stat">
          <div>
            <div className="banner-stat__value">{filtered.filter(d => d.status === 'available').length}</div>
            <div className="banner-stat__label">Open deals</div>
          </div>
        </div>
        <div className="banner-stat">
          <div>
            <div className="banner-stat__value">{filtered.filter(d => d.status === 'accepted').length}</div>
            <div className="banner-stat__label">Accepted</div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="marketplace__filters">
        <div className="filter-row">
          <Filter size={13} />
          <div className="category-chips">
            <button
              className={`category-chip ${selectedCategory === 'all' ? 'category-chip--active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`category-chip ${selectedCategory === c ? 'category-chip--active' : ''}`}
                onClick={() => setSelectedCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="sort-row">
          <span className="sort-label">Sort:</span>
          {(['match', 'payout', 'deadline'] as const).map(s => (
            <button
              key={s}
              className={`sort-btn ${sortBy === s ? 'sort-btn--active' : ''}`}
              onClick={() => setSortBy(s)}
            >
              {s === 'match' ? 'Best Match' : s === 'payout' ? 'Highest Pay' : 'Deadline'}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <DealCarousel deals={filtered} />
    </div>
  );
};
