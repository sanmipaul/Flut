'use client';

import { Header } from '@/components/layout/Header';
import { VaultAnalyticsSummary } from '@/components/vault/VaultAnalyticsSummary';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useVaults } from '@/hooks/useVaults';
import { useWallet } from '@/hooks/useWallet';
import { microToStx, formatBlockDuration } from '@/lib/stacks';
import { getVaultStatus, blocksRemaining } from '@/types/vault';

export default function AnalyticsPage() {
  const { connected } = useWallet();
  const { vaults, currentBlock, loading } = useVaults();

  const active   = vaults.filter((v) => !v.isWithdrawn);
  const locked   = vaults.filter((v) => getVaultStatus(v, currentBlock) === 'locked');
  const unlocked = vaults.filter((v) => getVaultStatus(v, currentBlock) === 'unlocked');
  const totalStx = microToStx(active.reduce((s, v) => s + v.amount, 0));
  const stackingVaults = vaults.filter((v) => v.stackingEnabled);

  const nextUnlock = locked.length > 0
    ? locked.reduce((min, v) => blocksRemaining(v, currentBlock) < blocksRemaining(min, currentBlock) ? v : min)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your Flut vault activity.</p>
        </div>

        {!connected ? (
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 py-16 text-center">
            <p className="text-sm text-gray-400">Connect your wallet to view analytics.</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <ErrorBoundary>
            <VaultAnalyticsSummary vaults={vaults} currentBlock={currentBlock} />

            {/* Extended stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total STX (active)" value={`${totalStx.toFixed(2)} STX`} />
              <StatCard label="Stacking vaults" value={stackingVaults.length} />
              <StatCard label="Ready to withdraw" value={unlocked.length} highlight={unlocked.length > 0} />
            </div>

            {nextUnlock && (
              <div className="rounded-2xl border border-brand-100 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/10 px-5 py-4">
                <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1">Next Unlock</p>
                <p className="text-sm text-brand-600 dark:text-brand-400">
                  Vault #{nextUnlock.vaultId} unlocks in{' '}
                  <span className="font-semibold">
                    {formatBlockDuration(blocksRemaining(nextUnlock, currentBlock))}
                  </span>{' '}
                  ({blocksRemaining(nextUnlock, currentBlock).toLocaleString()} blocks)
                </p>
              </div>
            )}
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}
