import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Play, Pause, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { TestVariantCard } from './TestVariantCard';
import type { ABTest } from '../../types';
import { ABTestingFramework } from '../../services/abTesting';
import { generateABTests } from '../../services/mockData';

const framework = new ABTestingFramework(generateABTests());

function StatusBadge({ status }: { status: ABTest['status'] }) {
  const cfg: Record<ABTest['status'], { label: string; cls: string }> = {
    running:   { label: '● Running',   cls: 'status-running'   },
    completed: { label: '✓ Completed', cls: 'status-completed' },
    paused:    { label: '⏸ Paused',    cls: 'status-paused'    },
    draft:     { label: '○ Draft',     cls: 'status-draft'     },
  };
  const { label, cls } = cfg[status];
  return <span className={`status-badge ${cls}`}>{label}</span>;
}

function ConfidenceGauge({ value }: { value: number }) {
  const pct = value * 100;
  const color = pct >= 95 ? '#10b981' : pct >= 80 ? '#f59e0b' : '#6b6b8a';
  return (
    <div className="confidence-gauge">
      <svg viewBox="0 0 80 40" className="gauge-svg">
        <path d="M 8 38 A 32 32 0 0 1 72 38" fill="none" stroke="#2a2a3e" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 8 38 A 32 32 0 0 1 72 38"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 100.5} 100.5`}
        />
        <text x="40" y="36" textAnchor="middle" fontSize="11" fill={color} fontWeight="700">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <span className="gauge-label">Confidence</span>
    </div>
  );
}

export const ABTestPanel: React.FC = () => {
  const [tests, setTests] = useState<ABTest[]>(framework.getAll());
  const [expandedId, setExpandedId] = useState<string | null>(tests[0]?.id ?? null);

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id);
  }

  function toggleRunning(test: ABTest) {
    if (test.status === 'running') {
      framework.pause(test.id);
    } else if (test.status === 'paused') {
      framework.resume(test.id);
    }
    setTests(framework.getAll());
  }

  const runningCount = tests.filter(t => t.status === 'running').length;
  const totalUplift = tests
    .filter(t => t.status === 'completed' && t.uplift > 0)
    .reduce((s, t) => s + t.uplift, 0);

  return (
    <div className="abt-panel">
      {/* Summary */}
      <motion.div
        className="abt-summary card"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="abt-summary__stat">
          <FlaskConical size={16} />
          <div>
            <div className="abt-summary__value">{runningCount}</div>
            <div className="abt-summary__label">Active Tests</div>
          </div>
        </div>
        <div className="abt-summary__stat">
          <BarChart3 size={16} />
          <div>
            <div className="abt-summary__value">{tests.length}</div>
            <div className="abt-summary__label">Total Tests</div>
          </div>
        </div>
        <div className="abt-summary__stat">
          <div>
            <div className="abt-summary__value abt-summary__value--positive">
              +{totalUplift.toFixed(1)}%
            </div>
            <div className="abt-summary__label">Avg. Revenue Uplift</div>
          </div>
        </div>
      </motion.div>

      {/* Tests list */}
      <div className="abt-tests-list">
        {tests.map(test => {
          const isExpanded = expandedId === test.id;
          const totalImpressions = test.variants.reduce((s, v) => s + v.impressions, 0);
          const leader = [...test.variants].sort((a, b) => b.revenue - a.revenue)[0];

          return (
            <motion.div
              key={test.id}
              className="abt-test-card card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header row */}
              <div className="abt-test-card__header" onClick={() => toggleExpand(test.id)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleExpand(test.id)}>
                <div className="abt-test-card__title-row">
                  <h3 className="abt-test-card__name">{test.name}</h3>
                  <StatusBadge status={test.status} />
                </div>
                <div className="abt-test-card__meta">
                  <span className="abt-meta-badge">{test.type}</span>
                  <span>{test.sampleSize.toLocaleString()} samples</span>
                  {test.uplift !== 0 && (
                    <span className={`uplift-badge ${test.uplift > 0 ? 'uplift-positive' : 'uplift-negative'}`}>
                      {test.uplift > 0 ? '+' : ''}{test.uplift.toFixed(1)}% uplift
                    </span>
                  )}
                </div>
                <div className="abt-test-card__controls">
                  {(test.status === 'running' || test.status === 'paused') && (
                    <button
                      className="abt-control-btn"
                      onClick={e => { e.stopPropagation(); toggleRunning(test); }}
                      aria-label={test.status === 'running' ? 'Pause test' : 'Resume test'}
                    >
                      {test.status === 'running' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                  )}
                  <button className="expand-btn" aria-label="Toggle details">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    key="details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="abt-details-overflow"
                  >
                    <div className="abt-test-card__details">
                      <div className="abt-variants-row">
                        {test.variants.map(v => (
                          <TestVariantCard
                            key={v.id}
                            variant={v}
                            isLeading={v.id === leader?.id}
                            totalImpressions={totalImpressions}
                          />
                        ))}
                        <ConfidenceGauge value={test.confidenceLevel} />
                      </div>
                      <div className="abt-test-card__dates">
                        Started {test.startDate}
                        {test.endDate && ` · Ended ${test.endDate}`}
                        {' · '}Primary metric: <strong>{test.primaryMetric}</strong>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
