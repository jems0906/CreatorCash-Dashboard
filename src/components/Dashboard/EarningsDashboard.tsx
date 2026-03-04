import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import { PerformanceGraph } from './PerformanceGraph';
import { PayoutProjection } from './PayoutProjection';
import { MetricsTable } from './MetricsTable';
import type { EarningsSnapshot, EarningsHistory, PerformanceMetric, PayoutProjection as PayoutProjectionType } from '../../types';

interface EarningsDashboardProps {
  liveSnapshot: EarningsSnapshot | null;
  history: EarningsHistory[];
  metrics: PerformanceMetric[];
  projection: PayoutProjectionType;
  lifetimeEarnings: number;
  isConnected: boolean;
  isDark: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export const EarningsDashboard: React.FC<EarningsDashboardProps> = ({
  liveSnapshot,
  history,
  metrics,
  projection,
  lifetimeEarnings,
  isConnected,
  isDark,
}) => {
  return (
    <div className="earnings-dashboard">
      {/* Connection status */}
      <div className={`ws-status ${isConnected ? 'ws-status--connected' : 'ws-status--disconnected'}`}>
        {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
        <span>{isConnected ? 'Live' : 'Reconnecting…'}</span>
        {liveSnapshot && (
          <span className="ws-status__earned">
            ${liveSnapshot.totalEarned.toFixed(2)} earned
          </span>
        )}
      </div>

      {/* Metrics grid */}
      <motion.div
        className="metrics-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {metrics.map((m, i) => (
          <motion.div key={m.id} variants={item}>
            <MetricsCard metric={m} isLive={i < 3 && isConnected} />
          </motion.div>
        ))}
      </motion.div>

      {/* Payout projection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <PayoutProjection projection={projection} lifetimeEarnings={lifetimeEarnings} />
      </motion.div>

      {/* Performance graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <PerformanceGraph history={history} isDark={isDark} />
      </motion.div>

      {/* 100+ row hourly metrics table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <MetricsTable />
      </motion.div>
    </div>
  );
};
