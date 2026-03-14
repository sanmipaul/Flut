'use client';

import { useCallback, useState } from 'react';
import { getVaultStatus, type Vault } from '@/types/vault';

export type SortField = 'default' | 'amount-desc' | 'amount-asc' | 'unlock-asc' | 'unlock-desc' | 'status';

const SORT_LABELS: Record<SortField, string> = {
  'default':     'Default',
  'amount-desc': 'Amount ↓',
  'amount-asc':  'Amount ↑',
  'unlock-asc':  'Soonest unlock',
  'unlock-desc': 'Latest unlock',
  'status':      'By status',
};

const STATUS_ORDER: Record<string, number> = { unlocked: 0, locked: 1, withdrawn: 2 };

function sortVaults(vaults: Vault[], currentBlock: number, field: SortField): Vault[] {
  const copy = [...vaults];
  switch (field) {
    case 'amount-desc':
      return copy.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':
      return copy.sort((a, b) => a.amount - b.amount);
    case 'unlock-asc':
      return copy.sort((a, b) => a.unlockHeight - b.unlockHeight);
    case 'unlock-desc':
      return copy.sort((a, b) => b.unlockHeight - a.unlockHeight);
    case 'status':
      return copy.sort((a, b) => {
        const sa = STATUS_ORDER[getVaultStatus(a, currentBlock)] ?? 9;
        const sb = STATUS_ORDER[getVaultStatus(b, currentBlock)] ?? 9;
        return sa - sb;
      });
    default:
      return copy.sort((a, b) => a.vaultId - b.vaultId);
  }
}

interface UseVaultSortResult {
  sortField: SortField;
  sortedVaults: Vault[];
  setSortField: (f: SortField) => void;
  sortLabel: string;
  sortOptions: { value: SortField; label: string }[];
}

export function useVaultSort(vaults: Vault[], currentBlock: number): UseVaultSortResult {
  const [sortField, setSortField] = useState<SortField>('default');

  const sortedVaults = sortVaults(vaults, currentBlock, sortField);
  const sortLabel = SORT_LABELS[sortField];
  const sortOptions = Object.entries(SORT_LABELS).map(([value, label]) => ({
    value: value as SortField,
    label,
  }));

  const handleSetSort = useCallback((f: SortField) => setSortField(f), []);

  return { sortField, sortedVaults, setSortField: handleSetSort, sortLabel, sortOptions };
}
