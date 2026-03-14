'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { VaultDetailPanel } from '@/components/vault/VaultDetailPanel';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { fetchVault, fetchBlockHeight } from '@/lib/contract';
import type { Vault } from '@/types/vault';

interface Params { id: string }

export default function VaultPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  const vaultId = parseInt(id, 10);

  const [vault, setVault]               = useState<Vault | null>(null);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [v, block] = await Promise.all([fetchVault(vaultId), fetchBlockHeight()]);
        if (!v) { setError('Vault not found'); return; }
        setVault(v);
        setCurrentBlock(block);
      } catch {
        setError('Failed to load vault');
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(vaultId)) load();
    else setError('Invalid vault ID');
  }, [vaultId]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-500 transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-6 py-8 text-center">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
            <Link href="/" className="mt-3 inline-block text-xs text-brand-500 underline">
              Return to Dashboard
            </Link>
          </div>
        )}

        {vault && !loading && (
          <ErrorBoundary>
            <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <VaultDetailPanel
                vault={vault}
                currentBlock={currentBlock}
                onWithdraw={async () => {}}
                onDeposit={async () => {}}
                onEmergencyWithdraw={async () => {}}
                onSetBeneficiary={async () => {}}
              />
            </div>
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}
