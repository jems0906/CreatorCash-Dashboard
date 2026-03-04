import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, LayoutList, DollarSign } from 'lucide-react';
import { VideoCard } from './VideoCard';
import { InlineAdCard } from './InlineAdCard';
import type { VideoPost, InjectedAd } from '../../types';
import { adEngine } from '../../services/adEngine';

interface VideoFeedProps {
  videos: VideoPost[];
}

type FeedItem =
  | { type: 'video'; data: VideoPost }
  | { type: 'ad'; data: InjectedAd };

export const VideoFeed: React.FC<VideoFeedProps> = ({ videos }) => {
  const [showAds, setShowAds] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'earnings' | 'views'>('recent');

  const sorted = useMemo(() => {
    return [...videos].sort((a, b) => {
      if (sortBy === 'earnings') return b.earnings - a.earnings;
      if (sortBy === 'views') return b.views - a.views;
      return 0; // recent = default order
    });
  }, [videos, sortBy]);

  // Build the interleaved feed and project ad revenue in one pass to avoid
  // calling adEngine.inject() twice (which would double impression-log side-effects).
  const { feedItems, projectedAdRevenue } = useMemo(() => {
    if (!showAds) {
      return {
        feedItems: sorted.map<FeedItem>(v => ({ type: 'video', data: v })),
        projectedAdRevenue: 0,
      };
    }
    const injections = adEngine.inject(sorted, 'feed-default');
    const injMap = new Map<number, InjectedAd>();
    injections.forEach(inj => injMap.set(inj.insertAfterIndex, inj));
    const items: FeedItem[] = [];
    sorted.forEach((v, i) => {
      items.push({ type: 'video', data: v });
      const inj = injMap.get(i);
      if (inj) items.push({ type: 'ad', data: inj });
    });
    return {
      feedItems: items,
      projectedAdRevenue: adEngine.projectRevenue(injections),
    };
  }, [sorted, showAds]);

  const totalRevenue = videos.reduce((s, v) => s + v.earnings, 0);

  return (
    <div className="video-feed">
      {/* Feed header */}
      <div className="video-feed__header card">
        <div className="feed-stat">
          <DollarSign size={14} />
          <div>
            <div className="feed-stat__value">${totalRevenue.toLocaleString()}</div>
            <div className="feed-stat__label">Total feed revenue</div>
          </div>
        </div>
        {showAds && (
          <div className="feed-stat">
            <Zap size={14} />
            <div>
              <div className="feed-stat__value">+${projectedAdRevenue.toFixed(2)}</div>
              <div className="feed-stat__label">Projected ad lift</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="video-feed__controls">
        <div className="sort-row">
          <LayoutList size={13} />
          {(['recent', 'earnings', 'views'] as const).map(s => (
            <button
              key={s}
              className={`sort-btn ${sortBy === s ? 'sort-btn--active' : ''}`}
              onClick={() => setSortBy(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showAds}
            onChange={e => setShowAds(e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-text">Inline Ads</span>
        </label>
      </div>

      {/* Feed list */}
      <div className="video-feed__list">
        {feedItems.map((item, i) => (
          <motion.div
            key={item.type === 'video' ? item.data.id : `ad-${i}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
          >
            {item.type === 'video' ? (
              <VideoCard video={item.data} showAds={false} />
            ) : (
              <InlineAdCard ad={item.data.ad} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
