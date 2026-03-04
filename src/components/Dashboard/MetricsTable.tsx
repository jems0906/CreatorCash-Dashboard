import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HourlyRow {
  hour: string;
  rpm: number;
  cpm: number;
  views: number;
  adImpressions: number;
  earned: number;
  engagement: number;
  lift: number;
}

function generateHourlyRows(): HourlyRow[] {
  const rows: HourlyRow[] = [];
  const now = new Date();
  for (let i = 119; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600_000);
    const hour = d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const base = 2 + Math.sin(i * 0.18) * 1.5 + Math.random() * 1.2;
    rows.push({
      hour,
      rpm:          parseFloat((base + Math.random() * 0.8).toFixed(2)),
      cpm:          parseFloat((base * 1.5 + Math.random()).toFixed(2)),
      views:        Math.floor(500 + Math.random() * 9500),
      adImpressions:Math.floor(200 + Math.random() * 4000),
      earned:       parseFloat((base * 0.6 + Math.random() * 1.2).toFixed(3)),
      engagement:   parseFloat((0.035 + Math.random() * 0.08).toFixed(4)),
      lift:         parseFloat((-2 + Math.random() * 9).toFixed(1)),
    });
  }
  return rows;
}

type SortKey = keyof HourlyRow;

const COL_CONFIG: { key: SortKey; label: string }[] = [
  { key: 'hour',          label: 'Hour'      },
  { key: 'rpm',           label: 'RPM'       },
  { key: 'cpm',           label: 'CPM'       },
  { key: 'views',         label: 'Views'     },
  { key: 'adImpressions', label: 'Ad Impr.'  },
  { key: 'earned',        label: 'Earned'    },
  { key: 'engagement',    label: 'Eng.'      },
  { key: 'lift',          label: 'Lift'      },
];

function fmt(key: SortKey, v: number | string): string {
  if (key === 'hour') return v as string;
  const n = v as number;
  if (key === 'views' || key === 'adImpressions')
    return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  if (key === 'engagement') return `${(n * 100).toFixed(1)}%`;
  if (key === 'earned' || key === 'rpm' || key === 'cpm') return `$${n.toFixed(2)}`;
  if (key === 'lift') return `${n > 0 ? '+' : ''}${n}%`;
  return String(n);
}

export const MetricsTable: React.FC = () => {
  const rows = useMemo(generateHourlyRows, []);
  const [sortKey, setSortKey] = useState<SortKey>('hour');
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    const filtered = search
      ? rows.filter(r => r.hour.toLowerCase().includes(search.toLowerCase()))
      : rows;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [rows, sortKey, sortAsc, search]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  return (
    <div className="metrics-table card" role="region" aria-label="Hourly earnings breakdown">
      <div className="metrics-table__header">
        <h2 className="card__title">Hourly Breakdown <span className="metrics-table__count">{sorted.length} rows</span></h2>
        <input
          className="metrics-table__search"
          type="search"
          placeholder="Filter by date/hour…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Filter rows"
        />
      </div>

      <div className="metrics-table__scroll" role="grid">
        {/* Sticky column headers */}
        <div className="mt-row mt-row--head" role="row">
        {COL_CONFIG.map(col => {
            const isSort = sortKey === col.key;
            const cls = `mt-cell mt-cell--head ${isSort ? 'mt-cell--sorted' : ''}`;
            const shared = {
              tabIndex: 0,
              'data-col': col.key,
              onClick: () => toggleSort(col.key),
              onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && toggleSort(col.key),
            };
            const label = <>{col.label}{isSort && (sortAsc ? ' ↑' : ' ↓')}</>;
            return isSort && sortAsc ? (
              <div key={col.key} role="columnheader" {...shared} className={cls} aria-sort="ascending">{label}</div>
            ) : isSort && !sortAsc ? (
              <div key={col.key} role="columnheader" {...shared} className={cls} aria-sort="descending">{label}</div>
            ) : (
              <div key={col.key} role="columnheader" {...shared} className={cls} aria-sort="none">{label}</div>
            );
          })}
        </div>

        {/* Data rows */}
        {sorted.map((row, i) => (
          <div
            key={i}
            className="mt-row"
            role="row"
          >
            {COL_CONFIG.map(col => {
              const val = row[col.key];
              const isLift = col.key === 'lift';
              const liftNum = isLift ? (val as number) : 0;
              const TrendIcon = !isLift ? null : liftNum > 0 ? TrendingUp : liftNum < 0 ? TrendingDown : Minus;
              return (
                <span
                  key={col.key}
                  className={`mt-cell ${isLift ? (liftNum > 0 ? 'trend-up' : liftNum < 0 ? 'trend-down' : 'trend-neutral') : ''}`}
                  data-col={col.key}
                  role="gridcell"
                >
                  {TrendIcon && <TrendIcon size={10} className="mt-cell__icon" />}
                  {fmt(col.key, val)}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
