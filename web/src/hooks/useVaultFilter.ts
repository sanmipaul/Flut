import { useState, useMemo, useEffect } from 'react';
import {
  VaultFilterState,
  VaultStatusFilter,
  VaultLockFilter,
  VaultSortField,
  SortDirection,
  DEFAULT_FILTER_STATE,
} from '../types/VaultFilterTypes';
import { useDebounce } from './useDebounce';

const STORAGE_KEY = 'flut-vault-filter';

function loadPersistedFilters(): VaultFilterState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_FILTER_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore parse / access errors
  }
  return DEFAULT_FILTER_STATE;
}

/** Minimal vault shape required by the filter hook */
export interface FilterableVault {
  vaultId: number;
  creator: string;
  amount: number;
  unlockHeight: number;
  createdAt: number;
  isWithdrawn: boolean;
  currentBlockHeight: number;
}

export interface UseVaultFilterReturn<T extends FilterableVault> {
  /** Filtered and sorted subset of the input vaults */
  filteredVaults: T[];
  /** Current filter/sort state */
  filterState: VaultFilterState;
  /** Number of vaults matching the active filters */
  resultCount: number;
  /** True when any filter differs from the default */
  hasActiveFilters: boolean;
  setSearchQuery: (q: string) => void;
  setStatusFilter: (f: VaultStatusFilter) => void;
  setLockFilter: (f: VaultLockFilter) => void;
  setSortField: (f: VaultSortField) => void;
  setSortDirection: (d: SortDirection) => void;
  toggleSortDirection: () => void;
  clearFilters: () => void;
}

/**
 * Manages search, filter, and sort state for a list of vaults.
 * The returned `filteredVaults` array is derived via `useMemo` and is
 * only recomputed when the vault list or filter state changes.
 */
export function useVaultFilter<T extends FilterableVault>(
  vaults: T[]
): UseVaultFilterReturn<T> {
  const [filterState, setFilterState] = useState<VaultFilterState>(loadPersistedFilters);
  const debouncedQuery = useDebounce(filterState.searchQuery, 200);

  // Persist filter state (excluding search query) to sessionStorage
  useEffect(() => {
    try {
      const { searchQuery, ...persistable } = filterState;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      // ignore
    }
  }, [filterState]);

  const filteredVaults = useMemo(() => {
    let result = [...vaults];

    // ── Text search ──────────────────────────────────────────────
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase();
      result = result.filter(
        (v) =>
          String(v.vaultId).includes(q) ||
          v.creator.toLowerCase().includes(q)
      );
    }

    // ── Status filter ────────────────────────────────────────────
    if (filterState.statusFilter === 'active') {
      result = result.filter((v) => !v.isWithdrawn);
    } else if (filterState.statusFilter === 'withdrawn') {
      result = result.filter((v) => v.isWithdrawn);
    }

    // ── Lock filter ──────────────────────────────────────────────
    if (filterState.lockFilter === 'locked') {
      result = result.filter((v) => v.currentBlockHeight < v.unlockHeight);
    } else if (filterState.lockFilter === 'unlocked') {
      result = result.filter((v) => v.currentBlockHeight >= v.unlockHeight);
    }

    // ── Sort ─────────────────────────────────────────────────────
    const dir = filterState.sortDirection === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      switch (filterState.sortField) {
        case 'amount':
          return (a.amount - b.amount) * dir;
        case 'unlockHeight':
          return (a.unlockHeight - b.unlockHeight) * dir;
        case 'createdAt':
          return (a.createdAt - b.createdAt) * dir;
        case 'id':
        default:
          return (a.vaultId - b.vaultId) * dir;
      }
    });

    return result;
  }, [vaults, debouncedQuery, filterState]);

  const hasActiveFilters =
    filterState.searchQuery !== DEFAULT_FILTER_STATE.searchQuery ||
    filterState.statusFilter !== DEFAULT_FILTER_STATE.statusFilter ||
    filterState.lockFilter !== DEFAULT_FILTER_STATE.lockFilter ||
    filterState.sortField !== DEFAULT_FILTER_STATE.sortField ||
    filterState.sortDirection !== DEFAULT_FILTER_STATE.sortDirection;

  const setSearchQuery = (searchQuery: string) =>
    setFilterState((s) => ({ ...s, searchQuery }));

  const setStatusFilter = (statusFilter: VaultStatusFilter) =>
    setFilterState((s) => ({ ...s, statusFilter }));

  const setLockFilter = (lockFilter: VaultLockFilter) =>
    setFilterState((s) => ({ ...s, lockFilter }));

  /**
   * Sets the sort field.  When the same field is selected again the sort
   * direction is automatically reversed (toggle behaviour).
   */
  const setSortField = (sortField: VaultSortField) =>
    setFilterState((s) => ({
      ...s,
      sortField,
      sortDirection:
        s.sortField === sortField
          ? s.sortDirection === 'asc' ? 'desc' : 'asc'
          : 'asc',
    }));

  const setSortDirection = (sortDirection: SortDirection) =>
    setFilterState((s) => ({ ...s, sortDirection }));

  const toggleSortDirection = () =>
    setFilterState((s) => ({
      ...s,
      sortDirection: s.sortDirection === 'asc' ? 'desc' : 'asc',
    }));

  const clearFilters = () => setFilterState(DEFAULT_FILTER_STATE);

  return {
    filteredVaults,
    filterState,
    resultCount: filteredVaults.length,
    hasActiveFilters,
    setSearchQuery,
    setStatusFilter,
    setLockFilter,
    setSortField,
    setSortDirection,
    toggleSortDirection,
    clearFilters,
  };
}

export default useVaultFilter;
