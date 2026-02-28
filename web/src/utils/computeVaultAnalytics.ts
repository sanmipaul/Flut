/**
 * computeVaultAnalytics
 *
 * Pure function that derives VaultAnalytics from an array of vault inputs.
 * No side-effects, no network calls — safe to call in useMemo.
 */
import type {
  AnalyticsVaultInput,
  VaultAnalytics,
  VaultStatusCounts,
  VaultStatusDistribution,
  VaultAmountTotals,
  VaultLockDurationStats,
} from '../types/VaultAnalytics';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isUnlocked(vault: AnalyticsVaultInput): boolean {
  return !vault.isWithdrawn && vault.currentBlockHeight >= vault.unlockHeight;
}

function isLocked(vault: AnalyticsVaultInput): boolean {
  return !vault.isWithdrawn && vault.currentBlockHeight < vault.unlockHeight;
}

function lockDuration(vault: AnalyticsVaultInput): number {
  return Math.max(0, vault.unlockHeight - vault.createdAt);
}

function pct(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

// ---------------------------------------------------------------------------
// Public function
// ---------------------------------------------------------------------------

export function computeVaultAnalytics(vaults: AnalyticsVaultInput[]): VaultAnalytics {
  const total = vaults.length;

  if (total === 0) {
    const zeroCounts: VaultStatusCounts = { locked: 0, unlocked: 0, withdrawn: 0, total: 0 };
    const zeroDistribution: VaultStatusDistribution = { lockedPct: 0, unlockedPct: 0, withdrawnPct: 0 };
    const zeroAmounts: VaultAmountTotals = { activeTotal: 0, withdrawnTotal: 0, grandTotal: 0, average: 0 };
    const zeroDuration: VaultLockDurationStats = { averageLockBlocks: 0, longestLockBlocks: 0, shortestLockBlocks: 0 };
    return {
      statusCounts: zeroCounts,
      statusDistribution: zeroDistribution,
      amountTotals: zeroAmounts,
      lockDurationStats: zeroDuration,
      hasData: false,
    };
  }

  // Status counts
  const lockedCount = vaults.filter(isLocked).length;
  const unlockedCount = vaults.filter(isUnlocked).length;
  const withdrawnCount = vaults.filter((v) => v.isWithdrawn).length;

  const statusCounts: VaultStatusCounts = {
    locked: lockedCount,
    unlocked: unlockedCount,
    withdrawn: withdrawnCount,
    total,
  };

  const statusDistribution: VaultStatusDistribution = {
    lockedPct: pct(lockedCount, total),
    unlockedPct: pct(unlockedCount, total),
    withdrawnPct: pct(withdrawnCount, total),
  };

  // Amount totals
  const activeTotal = vaults
    .filter((v) => !v.isWithdrawn)
    .reduce((sum, v) => sum + v.amount, 0);
  const withdrawnTotal = vaults
    .filter((v) => v.isWithdrawn)
    .reduce((sum, v) => sum + v.amount, 0);
  const grandTotal = activeTotal + withdrawnTotal;

  const amountTotals: VaultAmountTotals = {
    activeTotal,
    withdrawnTotal,
    grandTotal,
    average: Math.round(grandTotal / total),
  };

  // Lock duration stats
  const durations = vaults.map(lockDuration);
  const totalDuration = durations.reduce((sum, d) => sum + d, 0);

  const lockDurationStats: VaultLockDurationStats = {
    averageLockBlocks: Math.round(totalDuration / total),
    longestLockBlocks: Math.max(...durations),
    shortestLockBlocks: Math.min(...durations),
  };

  return {
    statusCounts,
    statusDistribution,
    amountTotals,
    lockDurationStats,
    hasData: true,
  };
}
