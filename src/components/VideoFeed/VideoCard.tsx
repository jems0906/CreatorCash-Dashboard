import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Eye, DollarSign, Play, Clock } from 'lucide-react';
import type { VideoPost } from '../../types';
import { InlineAdCard } from './InlineAdCard';

interface VideoCardProps {
  video: VideoPost;
  showAds?: boolean;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Deterministic thumb index 0-5 based on video id
function getThumbIndex(id: string): number {
  return [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0) % 6;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, showAds = true }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="video-card">
      {/* Thumbnail */}
      <div className="video-card__thumb" data-thumb={getThumbIndex(video.id)}>
        <Play size={28} className="video-card__play-icon" />
        <span className="video-card__duration">
          <Clock size={10} /> {fmtDuration(video.duration)}
        </span>
        <div className="video-card__earnings-badge">
          <DollarSign size={10} />
          ${video.earnings.toFixed(2)}
        </div>
      </div>

      {/* Info */}
      <div className="video-card__info">
        <h3 className="video-card__title">{video.title}</h3>

        <div className="video-card__tags">
          {video.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
        </div>

        <div className="video-card__stats">
          <span><Eye size={11} /> {fmtNum(video.views)}</span>
          <button
            className={`video-stat-btn ${liked ? 'video-stat-btn--active' : ''}`}
            onClick={() => setLiked(v => !v)}
            aria-label="Like"
          >
            <Heart size={11} fill={liked ? 'currentColor' : 'none'} />
            {fmtNum(video.likes + (liked ? 1 : 0))}
          </button>
          <span><MessageCircle size={11} /> {fmtNum(video.comments)}</span>
          <span><Share2 size={11} /> {fmtNum(video.shares)}</span>
        </div>

        <div className="video-card__revenue">
          <div className="rev-split">
            <span className="rev-split__label">Ad Revenue</span>
            <span className="rev-split__value rev-split__value--ad">${video.adRevenue.toFixed(2)}</span>
          </div>
          <div className="rev-split">
            <span className="rev-split__label">Organic</span>
            <span className="rev-split__value">${video.organicRevenue.toFixed(2)}</span>
          </div>
          <div className="rev-split">
            <span className="rev-split__label">RPM</span>
            <span className="rev-split__value">${video.rpm.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Injected inline ads */}
      {showAds && video.injectedAds.length > 0 && (
        <div className="video-card__injected-ads">
          {video.injectedAds.map(ad => (
            <InlineAdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
};
