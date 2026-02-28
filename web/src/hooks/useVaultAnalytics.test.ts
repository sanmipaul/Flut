import { renderHook } from '@testing-library/react';
import { useVaultAnalytics } from './useVaultAnalytics';
import type { AnalyticsVaultInput } from '../types/VaultAnalytics';

const locked: AnalyticsVaultInput = {
  vaultId: 1,
  amount: 1000,
  unlockHeight: 300,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 200,
};

const withdrawn: AnalyticsVaultInput = {
  vaultId: 2,
  amount: 500,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: true,
  currentBlockHeight: 300,
};

describe('useVaultAnalytics', () => {
  it('returns hasData=false for empty vault list', () => {
    const { result } = renderHook(() => useVaultAnalytics([]));
    expect(result.current.hasData).toBe(false);
  });

  it('returns hasData=true for non-empty vault list', () => {
    const { result } = renderHook(() => useVaultAnalytics([locked]));
    expect(result.current.hasData).toBe(true);
  });

  it('returns correct statusCounts for a single locked vault', () => {
    const { result } = renderHook(() => useVaultAnalytics([locked]));
    expect(result.current.statusCounts.locked).toBe(1);
    expect(result.current.statusCounts.total).toBe(1);
  });

  it('returns correct amountTotals', () => {
    const { result } = renderHook(() => useVaultAnalytics([locked]));
    expect(result.current.amountTotals.activeTotal).toBe(1000);
    expect(result.current.amountTotals.grandTotal).toBe(1000);
  });

  it('counts withdrawn vault correctly', () => {
    const { result } = renderHook(() => useVaultAnalytics([withdrawn]));
    expect(result.current.statusCounts.withdrawn).toBe(1);
    expect(result.current.amountTotals.withdrawnTotal).toBe(500);
  });

  it('re-computes when vault list changes', () => {
    let vaults = [locked];
    const { result, rerender } = renderHook(() => useVaultAnalytics(vaults));
    expect(result.current.statusCounts.total).toBe(1);
    vaults = [locked, withdrawn];
    rerender();
    expect(result.current.statusCounts.total).toBe(2);
  });

  it('returns lockDurationStats with averageLockBlocks', () => {
    const { result } = renderHook(() => useVaultAnalytics([locked]));
    // 300 - 100 = 200 blocks
    expect(result.current.lockDurationStats.averageLockBlocks).toBe(200);
  });
});
