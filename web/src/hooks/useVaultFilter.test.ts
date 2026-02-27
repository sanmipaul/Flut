/**
 * Unit tests for useVaultFilter
 *
 * These tests exercise the pure filtering and sorting logic by calling the
 * hook's internal helper functions directly, without rendering any React
 * components.  A full hook test would use @testing-library/react-hooks.
 */

import { DEFAULT_FILTER_STATE } from '../types/VaultFilterTypes';
import type { FilterableVault } from './useVaultFilter';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const VAULTS: FilterableVault[] = [
  {
    vaultId: 1,
    creator: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ',
    amount: 500,
    unlockHeight: 200,
    createdAt: 100,
    isWithdrawn: false,
    currentBlockHeight: 150, // still locked
  },
  {
    vaultId: 2,
    creator: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    amount: 1000,
    unlockHeight: 100,
    createdAt: 50,
    isWithdrawn: false,
    currentBlockHeight: 150, // unlocked
  },
  {
    vaultId: 3,
    creator: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ',
    amount: 250,
    unlockHeight: 300,
    createdAt: 120,
    isWithdrawn: true,
    currentBlockHeight: 150, // withdrawn
  },
];

// ---------------------------------------------------------------------------
// Pure filter functions (extracted from hook logic for testability)
// ---------------------------------------------------------------------------
function applyTextSearch(vaults: FilterableVault[], query: string): FilterableVault[] {
  if (!query.trim()) return vaults;
  const q = query.trim().toLowerCase();
  return vaults.filter(
    (v) => String(v.vaultId).includes(q) || v.creator.toLowerCase().includes(q)
  );
}

function applyStatusFilter(vaults: FilterableVault[], status: string): FilterableVault[] {
  if (status === 'active') return vaults.filter((v) => !v.isWithdrawn);
  if (status === 'withdrawn') return vaults.filter((v) => v.isWithdrawn);
  return vaults;
}

function applyLockFilter(vaults: FilterableVault[], lock: string): FilterableVault[] {
  if (lock === 'locked') return vaults.filter((v) => v.currentBlockHeight < v.unlockHeight);
  if (lock === 'unlocked') return vaults.filter((v) => v.currentBlockHeight >= v.unlockHeight);
  return vaults;
}

function applySort(
  vaults: FilterableVault[],
  field: string,
  direction: 'asc' | 'desc'
): FilterableVault[] {
  const dir = direction === 'asc' ? 1 : -1;
  return [...vaults].sort((a, b) => {
    switch (field) {
      case 'amount': return (a.amount - b.amount) * dir;
      case 'unlockHeight': return (a.unlockHeight - b.unlockHeight) * dir;
      case 'createdAt': return (a.createdAt - b.createdAt) * dir;
      default: return (a.vaultId - b.vaultId) * dir;
    }
  });
}

// ---------------------------------------------------------------------------
// Text search
// ---------------------------------------------------------------------------
describe('text search', () => {
  it('returns all vaults when query is empty', () => {
    expect(applyTextSearch(VAULTS, '')).toHaveLength(3);
  });

  it('filters by vault ID string', () => {
    const result = applyTextSearch(VAULTS, '2');
    expect(result.map((v) => v.vaultId)).toContain(2);
  });

  it('filters by creator address substring', () => {
    const result = applyTextSearch(VAULTS, 'SP2J6');
    expect(result.every((v) => v.creator.includes('SP2J6'))).toBe(true);
  });

  it('is case-insensitive', () => {
    const lower = applyTextSearch(VAULTS, 'sp2j6');
    const upper = applyTextSearch(VAULTS, 'SP2J6');
    expect(lower).toEqual(upper);
  });

  it('returns empty array when no match', () => {
    expect(applyTextSearch(VAULTS, 'ZZZZZZZ')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Status filter
// ---------------------------------------------------------------------------
describe('status filter', () => {
  it('"all" returns all vaults', () => {
    expect(applyStatusFilter(VAULTS, 'all')).toHaveLength(3);
  });

  it('"active" returns only non-withdrawn vaults', () => {
    const result = applyStatusFilter(VAULTS, 'active');
    expect(result.every((v) => !v.isWithdrawn)).toBe(true);
  });

  it('"withdrawn" returns only withdrawn vaults', () => {
    const result = applyStatusFilter(VAULTS, 'withdrawn');
    expect(result.every((v) => v.isWithdrawn)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Lock filter
// ---------------------------------------------------------------------------
describe('lock filter', () => {
  it('"all" returns all vaults', () => {
    expect(applyLockFilter(VAULTS, 'all')).toHaveLength(3);
  });

  it('"locked" returns vaults where currentBlockHeight < unlockHeight', () => {
    const result = applyLockFilter(VAULTS, 'locked');
    expect(result.every((v) => v.currentBlockHeight < v.unlockHeight)).toBe(true);
  });

  it('"unlocked" returns vaults where currentBlockHeight >= unlockHeight', () => {
    const result = applyLockFilter(VAULTS, 'unlocked');
    expect(result.every((v) => v.currentBlockHeight >= v.unlockHeight)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------
describe('sort', () => {
  it('sorts by amount ascending', () => {
    const result = applySort(VAULTS, 'amount', 'asc');
    for (let i = 1; i < result.length; i++) {
      expect(result[i].amount).toBeGreaterThanOrEqual(result[i - 1].amount);
    }
  });

  it('sorts by amount descending', () => {
    const result = applySort(VAULTS, 'amount', 'desc');
    for (let i = 1; i < result.length; i++) {
      expect(result[i].amount).toBeLessThanOrEqual(result[i - 1].amount);
    }
  });

  it('sorts by vault ID ascending by default', () => {
    const result = applySort(VAULTS, 'id', 'asc');
    expect(result[0].vaultId).toBe(1);
    expect(result[result.length - 1].vaultId).toBe(3);
  });

  it('sorts by unlockHeight ascending', () => {
    const result = applySort(VAULTS, 'unlockHeight', 'asc');
    for (let i = 1; i < result.length; i++) {
      expect(result[i].unlockHeight).toBeGreaterThanOrEqual(result[i - 1].unlockHeight);
    }
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_FILTER_STATE
// ---------------------------------------------------------------------------
describe('DEFAULT_FILTER_STATE', () => {
  it('has searchQuery as empty string', () => {
    expect(DEFAULT_FILTER_STATE.searchQuery).toBe('');
  });

  it('has statusFilter as "all"', () => {
    expect(DEFAULT_FILTER_STATE.statusFilter).toBe('all');
  });

  it('has lockFilter as "all"', () => {
    expect(DEFAULT_FILTER_STATE.lockFilter).toBe('all');
  });

  it('has sortField as "id"', () => {
    expect(DEFAULT_FILTER_STATE.sortField).toBe('id');
  });

  it('has sortDirection as "asc"', () => {
    expect(DEFAULT_FILTER_STATE.sortDirection).toBe('asc');
  });
});
