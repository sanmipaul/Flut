'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useVaults } from '@/hooks/useVaults';
import { useWallet } from '@/hooks/useWallet';
import { useVaultSort } from '@/hooks/useVaultSort';
import { VaultList } from '@/components/vault/VaultList';
import { VaultSearchBar } from '@/components/vault/VaultSearchBar';
import { VaultSortBar } from '@/components/vault/VaultSortBar';
import { VaultAnalyticsSummary } from '@/components/vault/VaultAnalyticsSummary';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  selectedVaultId: number | null;
  onSelect: (id: number) => void;
  onCreateClick: () => void;
}

export function Sidebar({ selectedVaultId, onSelect, onCreateClick }: SidebarProps) {
  const { connected } = useWallet();
  const { vaults, currentBlock, loading, refresh, error } = useVaults();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const { sortField, sortedVaults, setSortField, sortOptions } = useVaultSort(vaults, currentBlock);

  const filtered = query.trim()
    ? sortedVaults.filter((v) =>
        (v.label ?? `Vault #${v.vaultId}`)
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : sortedVaults;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setLastRefreshed(new Date());
    setRefreshing(false);
  }, [refresh]);

  // Keyboard shortcut: press "/" to focus search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const vaultCount = vaults.length;

  return (
    <aside className="flex flex-col h-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Your Vaults</h2>
          {vaultCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-semibold px-1.5">
              {vaultCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {connected && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh vaults"
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {connected && (
            <Button size="sm" onClick={onCreateClick}>
              + New
            </Button>
          )}
        </div>
      </div>

      {lastRefreshed && (
        <p className="text-xs text-gray-300 dark:text-zinc-600 mb-2">
          Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      {!connected ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Connect your wallet to view vaults.</p>
      ) : error ? (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-3 py-2.5 text-xs text-red-600 dark:text-red-400">
          {error}
          <button className="ml-2 underline" onClick={handleRefresh}>Retry</button>
        </div>
      ) : (
        <>
          <VaultAnalyticsSummary vaults={vaults} currentBlock={currentBlock} />
          <VaultSortBar sortField={sortField} options={sortOptions} onChange={setSortField} />
          {vaults.length > 3 && (
            <VaultSearchBar ref={searchRef} query={query} onQueryChange={setQuery} />
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
