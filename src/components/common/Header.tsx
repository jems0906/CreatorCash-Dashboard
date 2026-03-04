import React from 'react';
import { Sun, Moon, Wifi, WifiOff, Bell } from 'lucide-react';
import type { CreatorProfile } from '../../types';

interface HeaderProps {
  creator: CreatorProfile;
  isDark: boolean;
  isConnected: boolean;
  onToggleDark: () => void;
}

const TIER_LABELS: Record<string, string> = {
  starter: '🌱 Starter',
  growing: '📈 Growing',
  pro: '⚡ Pro',
  elite: '👑 Elite',
};

export const Header: React.FC<HeaderProps> = ({ creator, isDark, isConnected, onToggleDark }) => {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="creator-avatar" aria-hidden>
          {creator.displayName.charAt(0)}
        </div>
        <div>
          <div className="creator-name">{creator.displayName}</div>
          <div className="creator-meta">
            <span className="creator-handle">{creator.handle}</span>
            <span className="creator-tier">{TIER_LABELS[creator.accountTier]}</span>
          </div>
        </div>
      </div>

      <div className="app-header__right">
        {/* Connection dot */}
        <div
          className={`conn-dot ${isConnected ? 'conn-dot--on' : 'conn-dot--off'}`}
          title={isConnected ? 'WebSocket connected' : 'Reconnecting…'}
          aria-label={isConnected ? 'Connected' : 'Disconnected'}
        >
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
        </div>

        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <button
          className="icon-btn"
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
