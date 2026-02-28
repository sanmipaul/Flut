import { renderHook, act } from '@testing-library/react';
import { useVaultSearch } from './useVaultSearch';
import type { VaultSnapshot } from '../types/VaultSearch';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const locked: VaultSnapshot = {
  vaultId: 1,
  amount: 1000,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 150,
  nickname: 'Emergency fund',
};

const unlocked: VaultSnapshot = {
  vaultId: 2,
  amount: 500,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 250,
};

const withdrawn: VaultSnapshot = {
  vaultId: 3,
  amount: 750,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: true,
  currentBlockHeight: 300,
  nickname: 'Rainy day',
};

const vaults: VaultSnapshot[] = [locked, unlocked, withdrawn];

// ---------------------------------------------------------------------------
// Text search
// ---------------------------------------------------------------------------

describe('useVaultSearch — text search', () => {
  it('returns all vaults when query is empty', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    expect(result.current.result.matchCount).toBe(3);
  });

  it('filters by vault ID', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('2'); });
    expect(result.current.result.matchCount).toBe(1);
    expect(result.current.result.vaults[0].vaultId).toBe(2);
  });

  it('filters by nickname (case-insensitive)', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('emergency'); });
    expect(result.current.result.matchCount).toBe(1);
    expect(result.current.result.vaults[0].vaultId).toBe(1);
  });

  it('partial nickname match works', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('rainy'); });
    expect(result.current.result.matchCount).toBe(1);
    expect(result.current.result.vaults[0].vaultId).toBe(3);
  });

  it('returns empty array when no vaults match', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('xyznotfound'); });
    expect(result.current.result.matchCount).toBe(0);
    expect(result.current.result.vaults).toHaveLength(0);
  });

  it('trims whitespace from query before matching', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('  2  '); });
    expect(result.current.result.matchCount).toBe(1);
  });

  it('marks isFiltered=true when query is non-empty', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('1'); });
    expect(result.current.result.isFiltered).toBe(true);
  });

  it('marks isFiltered=false when query is whitespace only', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('   '); });
    expect(result.current.result.isFiltered).toBe(false);
  });

  it('totalCount is always the full vault list length', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('1'); });
    expect(result.current.result.totalCount).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Status filter
// ---------------------------------------------------------------------------

describe('useVaultSearch — status filter', () => {
  it('shows all vaults with statusFilter="all"', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    expect(result.current.result.matchCount).toBe(3);
  });

  it('filters to locked vaults', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setStatusFilter('locked'); });
    expect(result.current.result.matchCount).toBe(1);
    expect(result.current.result.vaults[0].vaultId).toBe(1);
  });

  it('filters to unlocked vaults', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setStatusFilter('unlocked'); });
    expect(result.current.result.matchCount).toBe(1);
    expect(result.current.result.vaults[0].vaultId).toBe(2);
  });

  it('filters to withdrawn vaults', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setStatusFilter('withdrawn'); });
    expect(result.current.result.matchCount).toBe(1);
    expect(result.current.result.vaults[0].vaultId).toBe(3);
  });

  it('marks isFiltered=true when status is not "all"', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setStatusFilter('locked'); });
    expect(result.current.result.isFiltered).toBe(true);
  });

  it('marks isFiltered=false when status is reset to "all"', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setStatusFilter('locked'); });
    act(() => { result.current.setStatusFilter('all'); });
    expect(result.current.result.isFiltered).toBe(false);
  });
});
