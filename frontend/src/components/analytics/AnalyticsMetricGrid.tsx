'use client';

import type { VaultMetrics } from '@/hooks/useVaultMetrics';
import { formatBlockDuration } from '@/lib/stacks';

interface AnalyticsMetricGridProps {
  metrics: VaultMetrics;
}

export function AnalyticsMetricGrid({ metrics }: AnalyticsMetricGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <MetricCard
        label="Total vaults"
        value={metrics.totalVaults}
      />
      <MetricCard
        label="Active vaults"
        value={metrics.activeVaults}
      />
      <MetricCard
        label="STX locked"
        value={`${metrics.totalStxLocked.toFixed(2)} STX`}
        highlight="amber"
      />
      <MetricCard
        label="STX unlocked"
        value={`${metrics.totalStxUnlocked.toFixed(2)} STX`}
        highlight={metrics.totalStxUnlocked > 0 ? 'green' : undefined}
      />
      <MetricCard
        label="Avg vault size"
        value={`${metrics.averageAmountStx.toFixed(2)} STX`}
      />
      <MetricCard
        label="Median vault size"
        value={`${metrics.medianAmountStx.toFixed(2)} STX`}
      />
      <MetricCard
        label="Avg lock duration"
        value={metrics.averageLockBlocks > 0 ? formatBlockDuration(Math.round(metrics.averageLockBlocks)) : '—'}
      />
      <MetricCard
        label="With beneficiary"
        value={metrics.beneficiaryCount}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: 'amber' | 'green' | 'brand';
}) {
  const valueClass =
    highlight === 'amber' ? 'text-amber-600 dark:text-amber-400' :
    highlight === 'green' ? 'text-green-600 dark:text-green-400' :
    highlight === 'brand' ? 'text-brand-600 dark:text-brand-400' :
    'text-gray-900 dark:text-white';

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3.5">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${valueClass}`}>{value}</p>
    </div>
  );
}
