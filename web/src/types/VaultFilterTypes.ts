/**
 * VaultFilterTypes
 * Shared types for the vault search, filter, and sort system.
 */

/** Status filter options for the vault list */
export type VaultStatusFilter = 'all' | 'active' | 'withdrawn';

/** Lock state filter options */
export type VaultLockFilter = 'all' | 'locked' | 'unlocked';

/** Fields that the vault list can be sorted by */
export type VaultSortField = 'id' | 'amount' | 'unlockHeight' | 'createdAt';

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Complete filter + sort state for the vault list */
export interface VaultFilterState {
  /** Free-text query matched against vault ID and creator address */
  searchQuery: string;
  /** Show all, only active, or only withdrawn vaults */
  statusFilter: VaultStatusFilter;
  /** Show all, only locked, or only unlocked vaults */
  lockFilter: VaultLockFilter;
  /** Field to sort by */
  sortField: VaultSortField;
  /** Sort direction */
  sortDirection: SortDirection;
}

/** Default filter state — no filters applied, sorted by ID ascending */
export const DEFAULT_FILTER_STATE: VaultFilterState = {
  searchQuery: '',
  statusFilter: 'all',
  lockFilter: 'all',
  sortField: 'id',
  sortDirection: 'asc',
};
