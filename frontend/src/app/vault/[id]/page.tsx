'use client';

import { use, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { VaultDetailPanel } from '@/components/vault/VaultDetailPanel';
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
  }, [vaultId]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        )}
        {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        {vault && (
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
        )}
      </main>
    </div>
  );
}
