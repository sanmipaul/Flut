import type {
  VaultAnalytics,
  VaultStatusCounts,
  VaultStatusDistribution,
  VaultAmountTotals,
  VaultLockDurationStats,
  AnalyticsVaultInput,
} from './VaultAnalytics';

describe('VaultAnalytics types', () => {
  it('VaultStatusCounts has all four keys', () => {
    const counts: VaultStatusCounts = { locked: 1, unlocked: 2, withdrawn: 0, total: 3 };
    expect(counts.total).toBe(3);
    expect(counts.locked + counts.unlocked + counts.withdrawn).toBe(3);
  });

  it('VaultStatusDistribution values are percentages 0–100', () => {
    const dist: VaultStatusDistribution = { lockedPct: 50, unlockedPct: 30, withdrawnPct: 20 };
    expect(dist.lockedPct + dist.unlockedPct + dist.withdrawnPct).toBe(100);
  });

  it('VaultAmountTotals grandTotal equals activeTotal + withdrawnTotal', () => {
    const totals: VaultAmountTotals = {
      activeTotal: 1000,
      withdrawnTotal: 500,
      grandTotal: 1500,
      average: 750,
    };
    expect(totals.grandTotal).toBe(totals.activeTotal + totals.withdrawnTotal);
  });

  it('VaultLockDurationStats can hold block counts', () => {
    const stats: VaultLockDurationStats = {
      averageLockBlocks: 144,
      longestLockBlocks: 288,
      shortestLockBlocks: 72,
    };
    expect(stats.longestLockBlocks).toBeGreaterThanOrEqual(stats.shortestLockBlocks);
  });

  it('VaultAnalytics hasData is boolean', () => {
    const analytics: VaultAnalytics = {
      statusCounts: { locked: 0, unlocked: 0, withdrawn: 0, total: 0 },
      statusDistribution: { lockedPct: 0, unlockedPct: 0, withdrawnPct: 0 },
      amountTotals: { activeTotal: 0, withdrawnTotal: 0, grandTotal: 0, average: 0 },
      lockDurationStats: { averageLockBlocks: 0, longestLockBlocks: 0, shortestLockBlocks: 0 },
      hasData: false,
    };
    expect(typeof analytics.hasData).toBe('boolean');
  });

  it('AnalyticsVaultInput requires all core vault fields', () => {
    const input: AnalyticsVaultInput = {
      vaultId: 1,
      amount: 1000,
      unlockHeight: 200,
      createdAt: 100,
      isWithdrawn: false,
      currentBlockHeight: 150,
    };
    expect(input.vaultId).toBe(1);
  });
});
