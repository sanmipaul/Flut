/**
 * VaultAnalyticsDashboard
 *
 * Collapsible panel that shows aggregate statistics for all vaults:
 *   - Metric cards: total STX locked, vault count, average amount
 *   - Status distribution bar (locked / unlocked / withdrawn)
 *   - Lock duration summary (avg, longest, shortest)
 *
 * Uses useVaultAnalytics for all data and formatAnalytics for display strings.
 */
import React, { useState } from 'react';
import { useVaultAnalytics } from '../hooks/useVaultAnalytics';
import {
  formatStxAmount,
  formatBlockDuration,
  formatPct,
  formatVaultCount,
} from '../utils/formatAnalytics';
import type { AnalyticsVaultInput } from '../types/VaultAnalytics';

export interface VaultAnalyticsDashboardProps {
  vaults: AnalyticsVaultInput[];
  /** When true, the panel starts expanded. Default: false. */
  defaultExpanded?: boolean;
}

// ---------------------------------------------------------------------------
// Small helper sub-components
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  modifier?: 'positive' | 'neutral' | 'muted';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, sub, modifier = 'neutral' }) => (
  <div className={`analytics-metric-card analytics-metric-card--${modifier}`}>
    <span className="analytics-metric-card__value">{value}</span>
    <span className="analytics-metric-card__label">{label}</span>
    {sub && <span className="analytics-metric-card__sub">{sub}</span>}
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const VaultAnalyticsDashboard: React.FC<VaultAnalyticsDashboardProps> = ({
  vaults,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const analytics = useVaultAnalytics(vaults);
  const { statusCounts, statusDistribution, amountTotals, lockDurationStats, hasData } = analytics;

  const toggleId = 'analytics-panel-body';

  return (
    <section className="analytics-dashboard" aria-label="Vault analytics">
      {/* Collapsible header */}
      <button
        type="button"
        className="analytics-dashboard__toggle"
        aria-expanded={expanded}
        aria-controls={toggleId}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="analytics-dashboard__toggle-label">Analytics</span>
        <span className="analytics-dashboard__toggle-icon" aria-hidden="true">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Collapsible body */}
      <div
        id={toggleId}
        className={`analytics-dashboard__body ${expanded ? 'analytics-dashboard__body--open' : ''}`}
        hidden={!expanded}
      >
        {!hasData ? (
          <p className="analytics-dashboard__empty">No vaults to analyse yet.</p>
        ) : (
          <>
            {/* Metric cards */}
            <div className="analytics-metric-grid" role="list" aria-label="Key vault metrics">
              <div role="listitem">
                <MetricCard
                  label="Active STX"
                  value={formatStxAmount(amountTotals.activeTotal)}
                  sub={`${formatStxAmount(amountTotals.grandTotal)} total`}
                  modifier="positive"
                />
              </div>
              <div role="listitem">
                <MetricCard
                  label="Total vaults"
                  value={String(statusCounts.total)}
                  sub={formatVaultCount(statusCounts.locked) + ' locked'}
                />
              </div>
              <div role="listitem">
                <MetricCard
                  label="Avg. amount"
                  value={formatStxAmount(amountTotals.average)}
                  modifier="neutral"
                />
              </div>
            </div>

            {/* Status distribution bar */}
            <div className="analytics-distribution" aria-label="Vault status distribution">
              <p className="analytics-distribution__heading">Status distribution</p>
              <div
                className="analytics-distribution__bar"
                role="img"
                aria-label={`Locked ${statusDistribution.lockedPct}%, Unlocked ${statusDistribution.unlockedPct}%, Withdrawn ${statusDistribution.withdrawnPct}%`}
              >
                {statusDistribution.lockedPct > 0 && (
                  <span
                    className="analytics-distribution__segment analytics-distribution__segment--locked"
                    style={{ width: `${statusDistribution.lockedPct}%` }}
                    title={`Locked: ${statusCounts.locked} (${formatPct(statusDistribution.lockedPct)})`}
                  />
                )}
                {statusDistribution.unlockedPct > 0 && (
                  <span
                    className="analytics-distribution__segment analytics-distribution__segment--unlocked"
                    style={{ width: `${statusDistribution.unlockedPct}%` }}
                    title={`Unlocked: ${statusCounts.unlocked} (${formatPct(statusDistribution.unlockedPct)})`}
                  />
                )}
                {statusDistribution.withdrawnPct > 0 && (
                  <span
                    className="analytics-distribution__segment analytics-distribution__segment--withdrawn"
                    style={{ width: `${statusDistribution.withdrawnPct}%` }}
                    title={`Withdrawn: ${statusCounts.withdrawn} (${formatPct(statusDistribution.withdrawnPct)})`}
                  />
                )}
              </div>
              <div className="analytics-distribution__legend" aria-hidden="true">
                <span className="analytics-distribution__legend-item analytics-distribution__legend-item--locked">
                  Locked {formatPct(statusDistribution.lockedPct)}
                </span>
                <span className="analytics-distribution__legend-item analytics-distribution__legend-item--unlocked">
                  Unlocked {formatPct(statusDistribution.unlockedPct)}
                </span>
                <span className="analytics-distribution__legend-item analytics-distribution__legend-item--withdrawn">
                  Withdrawn {formatPct(statusDistribution.withdrawnPct)}
                </span>
              </div>
            </div>

            {/* Lock duration summary */}
            <div className="analytics-duration" aria-label="Lock duration statistics">
              <p className="analytics-duration__heading">Lock durations</p>
              <dl className="analytics-duration__list">
                <div className="analytics-duration__row">
                  <dt>Average</dt>
                  <dd>{formatBlockDuration(lockDurationStats.averageLockBlocks)}</dd>
                </div>
                <div className="analytics-duration__row">
                  <dt>Longest</dt>
                  <dd>{formatBlockDuration(lockDurationStats.longestLockBlocks)}</dd>
                </div>
                <div className="analytics-duration__row">
                  <dt>Shortest</dt>
                  <dd>{formatBlockDuration(lockDurationStats.shortestLockBlocks)}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default VaultAnalyticsDashboard;
