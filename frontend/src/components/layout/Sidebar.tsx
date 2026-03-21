'use client';

import { useEffect, useState } from 'react';
import { useVaults } from '@/hooks/useVaults';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/context/ToastContext';
import { VaultList } from '@/components/vault/VaultList';
import { VaultSearchBar } from '@/components/vault/VaultSearchBar';
import { VaultAnalyticsSummary } from '@/components/vault/VaultAnalyticsSummary';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  selectedVaultId: number | null;
  onSelect: (id: number) => void;
  onCreateClick: () => void;
}

export function Sidebar({ selectedVaultId, onSelect, onCreateClick }: SidebarProps) {
  const { connected } = useWallet();
  const { vaults, currentBlock, loading, error, refresh } = useVaults();
  const { toast } = useToast();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (error) {
      toast.error('Failed to load vaults', { description: error });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const filtered = query.trim()
    ? vaults.filter((v) =>
        (v.label ?? `Vault #${v.vaultId}`)
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : vaults;

  return (
    <aside className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Your Vaults</h2>
        {connected && (
          <Button size="sm" onClick={onCreateClick}>
            + New
          </Button>
        )}
      </div>

      {!connected ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Connect your wallet to view vaults.</p>
      ) : (
        <>
          <VaultAnalyticsSummary vaults={vaults} currentBlock={currentBlock} />
          {error && !loading && (
            <div role="alert" className="mb-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 px-3 py-2 text-xs text-red-600 dark:text-red-400 flex items-center justify-between gap-2">
              <span>Could not load vaults.</span>
              <button
                type="button"
                onClick={refresh}
                className="underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Retry
              </button>
            </div>
          )}
          {vaults.length > 3 && (
            <VaultSearchBar
              query={query}
              onQueryChange={setQuery}
              resultCount={filtered.length}
            />
          )}
          <VaultList
            vaults={filtered}
            currentBlock={currentBlock}
            selectedVaultId={selectedVaultId}
            loading={loading}
            onSelect={onSelect}
          />
        </>
      )}
    </aside>
  );
}
