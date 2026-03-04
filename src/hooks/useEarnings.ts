import { useMemo, useRef } from 'react';
import type { EarningsSnapshot, PayoutProjection, PerformanceMetric, EarningsHistory } from '../types';
import { generateEarningsHistory } from '../services/mockData';

interface UseEarningsResult {
  history: EarningsHistory[];
  projection: PayoutProjection;
  metrics: PerformanceMetric[];
}

export function useEarnings(liveSnapshot: EarningsSnapshot | null): UseEarningsResult {
  const historyRef = useRef<EarningsHistory[]>(generateEarningsHistory());

  const projection = useMemo<PayoutProjection>(() => {
    const snap = liveSnapshot;
    // Use last 7 days avg as daily base
    const last7 = historyRef.current.slice(-7);
    const avgDaily = last7.reduce((s, d) => s + d.earnings, 0) / 7;
    const liveMult = snap ? 1 + (snap.engagementRate - 0.067) * 2 : 1;
    const daily = avgDaily * liveMult;
    return {
      daily: parseFloat(daily.toFixed(2)),
      weekly: parseFloat((daily * 7).toFixed(2)),
      monthly: parseFloat((daily * 30).toFixed(2)),
      yearly: parseFloat((daily * 365).toFixed(2)),
      confidence: snap ? Math.min(0.95, 0.7 + snap.engagementRate * 3) : 0.7,
    };
  }, [liveSnapshot]);

  const metrics = useMemo<PerformanceMetric[]>(() => {
    const snap = liveSnapshot;
    const prev = historyRef.current;
    const last = prev[prev.length - 1];
    const prevLast = prev[prev.length - 2];

    const rpmChange = prevLast ? ((snap?.rpm ?? last?.rpm) - prevLast.rpm) / prevLast.rpm * 100 : 0;
    const cpmChange = prevLast ? (((snap?.cpm ?? last?.cpm) - prevLast.cpm) / prevLast.cpm) * 100 : 0;
    const viewChange = prevLast ? (((snap?.viewCount ?? last?.views) - prevLast.views) / prevLast.views) * 100 : 0;

    return [
      {
        id: 'rpm',
        label: 'RPM',
        value: parseFloat((snap?.rpm ?? last?.rpm ?? 0).toFixed(2)),
        change: parseFloat(rpmChange.toFixed(1)),
        trend: rpmChange > 0 ? 'up' : rpmChange < 0 ? 'down' : 'neutral',
        unit: '$/1K views',
      },
      {
        id: 'cpm',
        label: 'CPM',
        value: parseFloat((snap?.cpm ?? last?.cpm ?? 0).toFixed(2)),
        change: parseFloat(cpmChange.toFixed(1)),
        trend: cpmChange > 0 ? 'up' : cpmChange < 0 ? 'down' : 'neutral',
        unit: '$/1K impr.',
      },
      {
        id: 'views',
        label: 'Live Views',
        value: snap?.viewCount ?? last?.views ?? 0,
        change: parseFloat(viewChange.toFixed(1)),
        trend: viewChange > 0 ? 'up' : viewChange < 0 ? 'down' : 'neutral',
        unit: 'total',
      },
      {
        id: 'engagement',
        label: 'Engagement',
        value: parseFloat(((snap?.engagementRate ?? 0.067) * 100).toFixed(2)),
        change: 0.3,
        trend: 'up',
        unit: '%',
      },
      {
        id: 'adImpr',
        label: 'Ad Impressions',
        value: snap?.adImpressions ?? 0,
        change: 2.1,
        trend: 'up',
        unit: 'total',
      },
      {
        id: 'earned',
        label: 'Total Earned',
        value: parseFloat((snap?.totalEarned ?? 0).toFixed(2)),
        change: 1.8,
        trend: 'up',
        unit: 'USD',
      },
    ];
  }, [liveSnapshot]);

  return {
    history: historyRef.current,
    projection,
    metrics,
  };
}
