'use client';

import { useState } from 'react';
import { useVaults } from '@/hooks/useVaults';
import { useWallet } from '@/hooks/useWallet';
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
  const { vaults, currentBlock, loading } = useVaults();
  const [query, setQuery] = useState('');

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
          {vaults.length > 3 && (
            <VaultSearchBar query={query} onQueryChange={setQuery} />
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
