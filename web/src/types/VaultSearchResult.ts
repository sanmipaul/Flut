/**
 * VaultSearchResult
 *
 * The shaped output returned by useVaultSearch alongside the filtered vault
 * array. Consumers use these counts to render result labels and empty states.
 */
import type { VaultSnapshot } from './VaultSearch';

export interface VaultSearchResult {
  /** Filtered and sorted vaults ready for rendering. */
  vaults: VaultSnapshot[];
  /** Total number of vaults before any filtering. */
  totalCount: number;
  /** Number of vaults that passed all active filters. */
  matchCount: number;
  /**
   * True when any filter or query is active (i.e. the result set may differ
   * from the full unfiltered list).
   */
  isFiltered: boolean;
}
