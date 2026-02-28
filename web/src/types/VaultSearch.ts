/**
 * VaultSearch types
 *
 * Defines the filter, sort, and state shapes used by the vault search and
 * filter feature in the sidebar vault list.
 */

/** Which status category to show ('all' means no status filter is applied). */
export type VaultStatusFilter = 'all' | 'locked' | 'unlocked' | 'withdrawn';

/** The field by which the vault list is sorted. */
export type VaultSortField = 'id' | 'amount' | 'unlockHeight' | 'createdAt';

/** Whether to sort ascending or descending. */
export type VaultSortDirection = 'asc' | 'desc';

/**
 * Full search / sort state managed by useVaultSearch.
 * Every field has a well-defined default so the initial state is always valid.
 */
export interface VaultSearchState {
  /** Free-text query matched against vault ID and optional nickname. */
  query: string;
  /** Status category filter. */
  statusFilter: VaultStatusFilter;
  /** Field to sort by. */
  sortField: VaultSortField;
  /** Sort direction. */
  sortDirection: VaultSortDirection;
}

/**
 * Minimal vault shape consumed by useVaultSearch.
 * Components pass their richer vault objects; the hook only reads these fields.
 */
export interface VaultSnapshot {
  vaultId: number;
  amount: number;
  unlockHeight: number;
  createdAt: number;
  isWithdrawn: boolean;
  currentBlockHeight: number;
  /** Optional user-defined label from VaultSettings (Issue 8). */
  nickname?: string;
}

/** Default VaultSearchState — no filter, no query, sorted by id asc. */
export function defaultVaultSearchState(): VaultSearchState {
  return {
    query: '',
    statusFilter: 'all',
    sortField: 'id',
    sortDirection: 'asc',
  };
}
