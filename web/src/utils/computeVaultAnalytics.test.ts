import { computeVaultAnalytics } from './computeVaultAnalytics';
import type { AnalyticsVaultInput } from '../types/VaultAnalytics';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const locked: AnalyticsVaultInput = {
  vaultId: 1,
  amount: 1000,
  unlockHeight: 300,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 200,
};

const unlocked: AnalyticsVaultInput = {
  vaultId: 2,
  amount: 500,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 250,
};

const withdrawn: AnalyticsVaultInput = {
  vaultId: 3,
  amount: 750,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: true,
  currentBlockHeight: 300,
};

const allVaults = [locked, unlocked, withdrawn];

// ---------------------------------------------------------------------------
// Empty list
// ---------------------------------------------------------------------------

describe('computeVaultAnalytics — empty list', () => {
  const result = computeVaultAnalytics([]);

  it('hasData is false', () => expect(result.hasData).toBe(false));
  it('statusCounts.total is 0', () => expect(result.statusCounts.total).toBe(0));
  it('amountTotals.grandTotal is 0', () => expect(result.amountTotals.grandTotal).toBe(0));
  it('lockDurationStats.averageLockBlocks is 0', () => expect(result.lockDurationStats.averageLockBlocks).toBe(0));
  it('all distribution percentages are 0', () => {
    expect(result.statusDistribution.lockedPct).toBe(0);
    expect(result.statusDistribution.unlockedPct).toBe(0);
    expect(result.statusDistribution.withdrawnPct).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Status counts
// ---------------------------------------------------------------------------

describe('computeVaultAnalytics — status counts', () => {
  const result = computeVaultAnalytics(allVaults);

  it('hasData is true', () => expect(result.hasData).toBe(true));
  it('total is 3', () => expect(result.statusCounts.total).toBe(3));
  it('locked count is 1', () => expect(result.statusCounts.locked).toBe(1));
  it('unlocked count is 1', () => expect(result.statusCounts.unlocked).toBe(1));
  it('withdrawn count is 1', () => expect(result.statusCounts.withdrawn).toBe(1));
});

// ---------------------------------------------------------------------------
// Status distribution
// ---------------------------------------------------------------------------

describe('computeVaultAnalytics — distribution', () => {
  it('distributes evenly at 33% each (rounded)', () => {
    const result = computeVaultAnalytics(allVaults);
    expect(result.statusDistribution.lockedPct).toBe(33);
    expect(result.statusDistribution.unlockedPct).toBe(33);
    expect(result.statusDistribution.withdrawnPct).toBe(33);
  });

  it('100% locked when all vaults are locked', () => {
    const result = computeVaultAnalytics([locked, { ...locked, vaultId: 9 }]);
    expect(result.statusDistribution.lockedPct).toBe(100);
    expect(result.statusDistribution.unlockedPct).toBe(0);
    expect(result.statusDistribution.withdrawnPct).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Amount totals
// ---------------------------------------------------------------------------

describe('computeVaultAnalytics — amount totals', () => {
  const result = computeVaultAnalytics(allVaults);

  it('activeTotal is sum of non-withdrawn vaults', () => {
    expect(result.amountTotals.activeTotal).toBe(1500); // 1000 + 500
  });

  it('withdrawnTotal is sum of withdrawn vaults', () => {
    expect(result.amountTotals.withdrawnTotal).toBe(750);
  });

  it('grandTotal is activeTotal + withdrawnTotal', () => {
    expect(result.amountTotals.grandTotal).toBe(2250);
  });

  it('average is grandTotal / total vaults', () => {
    expect(result.amountTotals.average).toBe(750); // 2250 / 3
  });
});

// ---------------------------------------------------------------------------
// Lock duration stats
// ---------------------------------------------------------------------------

describe('computeVaultAnalytics — lock duration', () => {
  it('averageLockBlocks is correct', () => {
    // locked: 300-100=200, unlocked: 200-100=100, withdrawn: 200-100=100
    const result = computeVaultAnalytics(allVaults);
    expect(result.lockDurationStats.averageLockBlocks).toBe(133); // (200+100+100)/3 = 133.3 → 133
  });

  it('longestLockBlocks is the max duration', () => {
    const result = computeVaultAnalytics(allVaults);
    expect(result.lockDurationStats.longestLockBlocks).toBe(200);
  });

  it('shortestLockBlocks is the min duration', () => {
    const result = computeVaultAnalytics(allVaults);
    expect(result.lockDurationStats.shortestLockBlocks).toBe(100);
  });

  it('single vault has equal avg, longest, shortest', () => {
    const result = computeVaultAnalytics([locked]);
    const duration = 300 - 100; // 200
    expect(result.lockDurationStats.averageLockBlocks).toBe(duration);
    expect(result.lockDurationStats.longestLockBlocks).toBe(duration);
    expect(result.lockDurationStats.shortestLockBlocks).toBe(duration);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('computeVaultAnalytics — edge cases', () => {
  it('vault with zero lock duration does not crash', () => {
    const noLock: AnalyticsVaultInput = { ...locked, createdAt: 200, unlockHeight: 200 };
    expect(() => computeVaultAnalytics([noLock])).not.toThrow();
  });

  it('withdrawn vault is not counted as locked or unlocked', () => {
    const result = computeVaultAnalytics([withdrawn]);
    expect(result.statusCounts.locked).toBe(0);
    expect(result.statusCounts.unlocked).toBe(0);
    expect(result.statusCounts.withdrawn).toBe(1);
  });

  it('vault exactly at unlockHeight is counted as unlocked', () => {
    const atUnlock: AnalyticsVaultInput = { ...locked, currentBlockHeight: 300, unlockHeight: 300 };
    const result = computeVaultAnalytics([atUnlock]);
    expect(result.statusCounts.unlocked).toBe(1);
    expect(result.statusCounts.locked).toBe(0);
  });
});
