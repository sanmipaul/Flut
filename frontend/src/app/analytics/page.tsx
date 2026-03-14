'use client';

import { Header } from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useVaults } from '@/hooks/useVaults';
import { useWallet } from '@/hooks/useWallet';
import { useVaultMetrics } from '@/hooks/useVaultMetrics';
import {
  AnalyticsMetricGrid,
  VaultStatusDistributionBar,
  UpcomingUnlocksList,
  VaultBreakdownTable,
  AnalyticsExportButton,
  VaultAmountRangeBar,
} from '@/components/analytics';

export default function AnalyticsPage() {
  const { connected } = useWallet();
  const { vaults, currentBlock, loading, error, refresh } = useVaults();
  const metrics = useVaultMetrics(vaults, currentBlock);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Overview of your Flut vault portfolio.
            </p>
          </div>
          {connected && !loading && (
            <AnalyticsExportButton vaults={vaults} currentBlock={currentBlock} />
          )}
        </div>

        {/* Not connected */}
        {!connected && (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 py-20 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Connect your wallet to view analytics.</p>
          </div>
        )}

        {/* Loading skeleton */}
        {connected && loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
            <div className="h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-48 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        )}

        {/* Error state */}
        {connected && !loading && error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-6 py-8 text-center">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => refresh()}
              className="mt-3 text-xs text-brand-500 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* No vaults */}
        {connected && !loading && !error && vaults.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 py-20 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No vaults found. Create your first vault to see analytics.
            </p>
          </div>
        )}

        {/* Analytics content */}
        {connected && !loading && !error && vaults.length > 0 && (
          <ErrorBoundary>
            <AnalyticsMetricGrid metrics={metrics} />

            <VaultStatusDistributionBar
              locked={metrics.lockedCount}
              unlocked={metrics.unlockedCount}
              withdrawn={metrics.withdrawnCount}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UpcomingUnlocksList vaults={vaults} currentBlock={currentBlock} limit={5} />

              {/* Stacking summary panel */}
              <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4 space-y-1">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Stacking Activity</p>
                <StatRow label="Stacking vaults"     value={metrics.stackingCount} />
                <StatRow label="Non-stacking vaults" value={metrics.activeVaults - metrics.stackingCount} />
                <StatRow
                  label="Stacking %"
                  value={
                    metrics.activeVaults > 0
                      ? `${Math.round((metrics.stackingCount / metrics.activeVaults) * 100)}%`
                      : '—'
                  }
                />
                <StatRow label="Total active STX" value={`${metrics.totalStxActive.toFixed(2)} STX`} />
              </div>
            </div>

            <VaultAmountRangeBar vaults={vaults} />

            <VaultBreakdownTable vaults={vaults} currentBlock={currentBlock} />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-zinc-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xs font-semibold font-mono text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
