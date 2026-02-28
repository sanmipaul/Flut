/**
 * VaultAnalytics types
 *
 * Shapes used by computeVaultAnalytics and the VaultAnalyticsDashboard
 * component to display aggregate statistics across all vaults.
 */

/** Count of vaults in each lifecycle status. */
export interface VaultStatusCounts {
  locked: number;
  unlocked: number;
  withdrawn: number;
  total: number;
}

/** Percentage (0–100) of vaults in each status bucket. */
export interface VaultStatusDistribution {
  lockedPct: number;
  unlockedPct: number;
  withdrawnPct: number;
}

/** Aggregate STX amounts across all vaults (in whole STX, not microSTX). */
export interface VaultAmountTotals {
  /** Sum of all active (non-withdrawn) vault amounts. */
  activeTotal: number;
  /** Sum of amounts that have already been withdrawn. */
  withdrawnTotal: number;
  /** Sum of all vault amounts regardless of status. */
  grandTotal: number;
  /** Average amount per vault (0 when no vaults). */
  average: number;
}

/** Lock duration statistics derived from block heights. */
export interface VaultLockDurationStats {
  /** Average total lock period in blocks across all vaults. */
  averageLockBlocks: number;
  /** Vault with the longest lock period (null when no vaults). */
  longestLockBlocks: number;
  /** Vault with the shortest lock period (null when no vaults). */
  shortestLockBlocks: number;
}

/** The complete analytics payload produced by computeVaultAnalytics. */
export interface VaultAnalytics {
  statusCounts: VaultStatusCounts;
  statusDistribution: VaultStatusDistribution;
  amountTotals: VaultAmountTotals;
  lockDurationStats: VaultLockDurationStats;
  /** True when the analytics are computed from at least one vault. */
  hasData: boolean;
}

/**
 * Minimal vault shape required by computeVaultAnalytics.
 * Mirrors the fields available in App.tsx without pulling in UI concerns.
 */
export interface AnalyticsVaultInput {
  vaultId: number;
  amount: number;
  unlockHeight: number;
  createdAt: number;
  isWithdrawn: boolean;
  currentBlockHeight: number;
}
