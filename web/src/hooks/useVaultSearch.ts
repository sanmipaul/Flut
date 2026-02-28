/**
 * useVaultSearch
 *
 * Manages vault list filtering, sorting, and free-text search state.
 * Accepts an array of VaultSnapshot objects and returns a filtered, sorted
 * subset together with search-state setters and a convenience reset function.
 *
 * All filtering is pure client-side — no network calls.
 */
import { useState, useMemo, useCallback } from 'react';
import type {
  VaultSnapshot,
  VaultSearchState,
  VaultStatusFilter,
  VaultSortField,
  VaultSortDirection,
} from '../types/VaultSearch';
import { defaultVaultSearchState } from '../types/VaultSearch';
import type { VaultSearchResult } from '../types/VaultSearchResult';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function deriveStatus(vault: VaultSnapshot): VaultStatusFilter {
  if (vault.isWithdrawn) return 'withdrawn';
  if (vault.currentBlockHeight >= vault.unlockHeight) return 'unlocked';
  return 'locked';
}

function matchesQuery(vault: VaultSnapshot, rawQuery: string): boolean {
  if (!rawQuery) return true;
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  // Match vault ID
  if (String(vault.vaultId).includes(q)) return true;
  // Match nickname (if present)
  if (vault.nickname && vault.nickname.toLowerCase().includes(q)) return true;
  return false;
}

function matchesStatus(vault: VaultSnapshot, filter: VaultStatusFilter): boolean {
  if (filter === 'all') return true;
  return deriveStatus(vault) === filter;
}

function compareVaults(
  a: VaultSnapshot,
  b: VaultSnapshot,
  field: VaultSortField,
  direction: VaultSortDirection,
): number {
  let diff = 0;
  switch (field) {
    case 'amount':
      diff = a.amount - b.amount;
      break;
    case 'unlockHeight':
      diff = a.unlockHeight - b.unlockHeight;
      break;
    case 'createdAt':
      diff = a.createdAt - b.createdAt;
      break;
    case 'id':
    default:
      diff = a.vaultId - b.vaultId;
  }
  return direction === 'asc' ? diff : -diff;
}

// ---------------------------------------------------------------------------
// Public hook interface
// ---------------------------------------------------------------------------

export interface UseVaultSearchReturn {
  /** Filtered and sorted vault array. */
  result: VaultSearchResult;
  /** Current search / filter state. */
  searchState: VaultSearchState;
  /** Update the free-text query. */
  setQuery: (query: string) => void;
  /** Update the status filter. */
  setStatusFilter: (filter: VaultStatusFilter) => void;
  /** Update the sort field. */
  setSortField: (field: VaultSortField) => void;
  /** Toggle sort direction between asc and desc. */
  toggleSortDirection: () => void;
  /** Set sort direction explicitly. */
  setSortDirection: (direction: VaultSortDirection) => void;
  /** Reset all filters and sort to their defaults. */
  resetSearch: () => void;
}

/**
 * @param vaults  The full list of vaults to search within.
 */
export function useVaultSearch(vaults: VaultSnapshot[]): UseVaultSearchReturn {
  const [searchState, setSearchState] = useState<VaultSearchState>(defaultVaultSearchState);

  const setQuery = useCallback((query: string) => {
    setSearchState((prev) => ({ ...prev, query }));
  }, []);

  const setStatusFilter = useCallback((statusFilter: VaultStatusFilter) => {
    setSearchState((prev) => ({ ...prev, statusFilter }));
  }, []);

  const setSortField = useCallback((sortField: VaultSortField) => {
    setSearchState((prev) => ({ ...prev, sortField }));
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const setSortDirection = useCallback((sortDirection: VaultSortDirection) => {
    setSearchState((prev) => ({ ...prev, sortDirection }));
  }, []);

  const resetSearch = useCallback(() => {
    setSearchState(defaultVaultSearchState());
  }, []);

  const result = useMemo((): VaultSearchResult => {
    const { query, statusFilter, sortField, sortDirection } = searchState;
    const totalCount = vaults.length;

    const filtered = vaults.filter(
      (v) => matchesQuery(v, query) && matchesStatus(v, statusFilter),
    );

    const sorted = [...filtered].sort((a, b) =>
      compareVaults(a, b, sortField, sortDirection),
    );

    const isFiltered = query.trim() !== '' || statusFilter !== 'all';

    return {
      vaults: sorted,
      totalCount,
      matchCount: sorted.length,
      isFiltered,
    };
  }, [vaults, searchState]);

  return {
    result,
    searchState,
    setQuery,
    setStatusFilter,
    setSortField,
    toggleSortDirection,
    setSortDirection,
    resetSearch,
  };
}
