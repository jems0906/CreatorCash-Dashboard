import React from 'react';
import { BarChart2, ShoppingBag, Play, FlaskConical, type LucideIcon } from 'lucide-react';
import type { DashboardTab } from '../../types';

interface NavTabsProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const TABS: { id: DashboardTab; label: string; Icon: LucideIcon }[] = [
  { id: 'earnings',    label: 'Earnings',    Icon: BarChart2 },
  { id: 'marketplace', label: 'Deals',       Icon: ShoppingBag },
  { id: 'feed',        label: 'Feed',        Icon: Play },
  { id: 'abtests',     label: 'A/B Tests',   Icon: FlaskConical },
];

export const NavTabs: React.FC<NavTabsProps> = ({ active, onChange }) => (
  <nav className="nav-tabs" role="tablist" aria-label="Dashboard sections">
    {TABS.map(({ id, label, Icon }) =>
      id === active ? (
        <button key={id} role="tab" aria-selected="true" className="nav-tab nav-tab--active" onClick={() => onChange(id)}>
          <Icon size={18} />
          <span className="nav-tab__label">{label}</span>
        </button>
      ) : (
        <button key={id} role="tab" aria-selected="false" className="nav-tab" onClick={() => onChange(id)}>
          <Icon size={18} />
          <span className="nav-tab__label">{label}</span>
        </button>
      )
    )}
  </nav>
);
