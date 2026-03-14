'use client';

import { VaultCard } from './VaultCard';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import type { Vault } from '@/types/vault';

interface VaultListProps {
  vaults: Vault[];
  currentBlock: number;
  selectedVaultId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
      ))}
    </div>
  );
}

export function VaultList({ vaults, currentBlock, selectedVaultId, loading, onSelect }: VaultListProps) {
  const handleKeyDown = useKeyboardNav('[aria-label="Your vaults"]');
  if (loading) return (
    <div role="status" aria-label="Loading vaults" aria-busy="true">
      <Skeleton />
      <span className="sr-only">Loading your vaults…</span>
    </div>
  );

  if (vaults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 text-lg">
          🔒
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No vaults yet.</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create one to start saving.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1" role="list" aria-label="Your vaults">
      {vaults.map((vault) => (
        <li key={vault.vaultId}>
          <VaultCard
            vault={vault}
            currentBlock={currentBlock}
            active={selectedVaultId === vault.vaultId}
            onClick={() => onSelect(vault.vaultId)}
            onKeyDown={handleKeyDown}
            data-navitem
          />
        </li>
      ))}
    </ul>
  );
}
