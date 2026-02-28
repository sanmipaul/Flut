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

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

describe('useVaultSearch — sort', () => {
  const sortVaults: VaultSnapshot[] = [
    { vaultId: 3, amount: 3000, unlockHeight: 500, createdAt: 300, isWithdrawn: false, currentBlockHeight: 100 },
    { vaultId: 1, amount: 1000, unlockHeight: 200, createdAt: 100, isWithdrawn: false, currentBlockHeight: 100 },
    { vaultId: 2, amount: 2000, unlockHeight: 350, createdAt: 200, isWithdrawn: false, currentBlockHeight: 100 },
  ];

  it('sorts by id asc by default', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    const ids = result.current.result.vaults.map((v) => v.vaultId);
    expect(ids).toEqual([1, 2, 3]);
  });

  it('sorts by id desc when direction toggled', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    act(() => { result.current.toggleSortDirection(); });
    const ids = result.current.result.vaults.map((v) => v.vaultId);
    expect(ids).toEqual([3, 2, 1]);
  });

  it('sorts by amount asc', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    act(() => { result.current.setSortField('amount'); });
    const amounts = result.current.result.vaults.map((v) => v.amount);
    expect(amounts).toEqual([1000, 2000, 3000]);
  });

  it('sorts by amount desc', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    act(() => { result.current.setSortField('amount'); result.current.setSortDirection('desc'); });
    const amounts = result.current.result.vaults.map((v) => v.amount);
    expect(amounts).toEqual([3000, 2000, 1000]);
  });

  it('sorts by unlockHeight asc', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    act(() => { result.current.setSortField('unlockHeight'); });
    const heights = result.current.result.vaults.map((v) => v.unlockHeight);
    expect(heights).toEqual([200, 350, 500]);
  });

  it('sorts by createdAt asc', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    act(() => { result.current.setSortField('createdAt'); });
    const created = result.current.result.vaults.map((v) => v.createdAt);
    expect(created).toEqual([100, 200, 300]);
  });

  it('toggleSortDirection twice returns to original direction', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    act(() => { result.current.toggleSortDirection(); });
    act(() => { result.current.toggleSortDirection(); });
    expect(result.current.searchState.sortDirection).toBe('asc');
  });

  it('setSortDirection to "desc" sorts correctly', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    act(() => { result.current.setSortDirection('desc'); });
    const ids = result.current.result.vaults.map((v) => v.vaultId);
    expect(ids).toEqual([3, 2, 1]);
  });

  it('setSortDirection to "asc" after "desc" restores ascending order', () => {
    const { result } = renderHook(() => useVaultSearch(sortVaults));
    act(() => { result.current.setSortDirection('desc'); });
    act(() => { result.current.setSortDirection('asc'); });
    const ids = result.current.result.vaults.map((v) => v.vaultId);
    expect(ids).toEqual([1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// Combined filter + sort + reset
// ---------------------------------------------------------------------------

describe('useVaultSearch — combined and reset', () => {
  it('applies text search and status filter together', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('fund'); result.current.setStatusFilter('locked'); });
    // 'Emergency fund' matches query and is locked
    expect(result.current.result.matchCount).toBe(1);
    expect(result.current.result.vaults[0].vaultId).toBe(1);
  });

  it('returns 0 when text and status filter conflict', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('rainy'); result.current.setStatusFilter('locked'); });
    // 'Rainy day' is withdrawn, not locked
    expect(result.current.result.matchCount).toBe(0);
  });

  it('resetSearch clears query and statusFilter', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setQuery('fund'); result.current.setStatusFilter('locked'); });
    act(() => { result.current.resetSearch(); });
    expect(result.current.searchState.query).toBe('');
    expect(result.current.searchState.statusFilter).toBe('all');
    expect(result.current.result.matchCount).toBe(3);
  });

  it('resetSearch resets sortField to id', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.setSortField('amount'); });
    act(() => { result.current.resetSearch(); });
    expect(result.current.searchState.sortField).toBe('id');
  });

  it('resetSearch resets sortDirection to asc', () => {
    const { result } = renderHook(() => useVaultSearch(vaults));
    act(() => { result.current.toggleSortDirection(); });
    act(() => { result.current.resetSearch(); });
    expect(result.current.searchState.sortDirection).toBe('asc');
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('useVaultSearch — edge cases', () => {
  it('handles an empty vault list gracefully', () => {
    const { result } = renderHook(() => useVaultSearch([]));
    expect(result.current.result.totalCount).toBe(0);
    expect(result.current.result.matchCount).toBe(0);
    expect(result.current.result.vaults).toHaveLength(0);
  });

  it('isFiltered is false for empty list with no filter', () => {
    const { result } = renderHook(() => useVaultSearch([]));
    expect(result.current.result.isFiltered).toBe(false);
  });

  it('handles vault with no nickname — does not crash on query match', () => {
    const noNick: VaultSnapshot = {
      vaultId: 99,
      amount: 100,
      unlockHeight: 200,
      createdAt: 100,
      isWithdrawn: false,
      currentBlockHeight: 150,
    };
    const { result } = renderHook(() => useVaultSearch([noNick]));
    act(() => { result.current.setQuery('99'); });
    expect(result.current.result.matchCount).toBe(1);
  });

  it('vault exactly at unlockHeight is treated as unlocked', () => {
    const atUnlock: VaultSnapshot = {
      vaultId: 10,
      amount: 100,
      unlockHeight: 200,
      createdAt: 100,
      isWithdrawn: false,
      currentBlockHeight: 200,
    };
    const { result } = renderHook(() => useVaultSearch([atUnlock]));
    act(() => { result.current.setStatusFilter('unlocked'); });
    expect(result.current.result.matchCount).toBe(1);
  });

  it('vault past unlockHeight is also treated as unlocked', () => {
    const past: VaultSnapshot = {
      vaultId: 11,
      amount: 100,
      unlockHeight: 200,
      createdAt: 100,
      isWithdrawn: false,
      currentBlockHeight: 500,
    };
    const { result } = renderHook(() => useVaultSearch([past]));
    act(() => { result.current.setStatusFilter('unlocked'); });
    expect(result.current.result.matchCount).toBe(1);
  });

  it('withdrawn vault is not counted as unlocked even past unlockHeight', () => {
    const wd: VaultSnapshot = {
      vaultId: 12,
      amount: 100,
      unlockHeight: 200,
      createdAt: 100,
      isWithdrawn: true,
      currentBlockHeight: 500,
    };
    const { result } = renderHook(() => useVaultSearch([wd]));
    act(() => { result.current.setStatusFilter('unlocked'); });
    expect(result.current.result.matchCount).toBe(0);
  });
});
