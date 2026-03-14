'use client';

import { VaultCard } from './VaultCard';
import { EmptyVaultState } from './EmptyVaultState';
import type { Vault } from '@/types/vault';

interface VaultListProps {
  vaults: Vault[];
  currentBlock: number;
  selectedVaultId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
  onCreateClick?: () => void;
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

export function VaultList({
  vaults,
  currentBlock,
  selectedVaultId,
  loading,
  onSelect,
  onCreateClick,
}: VaultListProps) {
  if (loading) return <Skeleton />;

  if (vaults.length === 0) {
    return <EmptyVaultState onCreateClick={onCreateClick} />;
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
          />
        </li>
      ))}
    </ul>
  );
}
