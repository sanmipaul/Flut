import { defaultVaultSearchState } from './VaultSearch';
import type { VaultSearchState, VaultStatusFilter, VaultSortField, VaultSortDirection, VaultSnapshot } from './VaultSearch';

describe('defaultVaultSearchState', () => {
  it('returns an object with query=""', () => {
    expect(defaultVaultSearchState().query).toBe('');
  });

  it('returns statusFilter="all"', () => {
    expect(defaultVaultSearchState().statusFilter).toBe('all');
  });

  it('returns sortField="id"', () => {
    expect(defaultVaultSearchState().sortField).toBe('id');
  });

  it('returns sortDirection="asc"', () => {
    expect(defaultVaultSearchState().sortDirection).toBe('asc');
  });

  it('returns a new object on each call (not a singleton)', () => {
    const a = defaultVaultSearchState();
    const b = defaultVaultSearchState();
    expect(a).not.toBe(b);
  });
});

describe('VaultStatusFilter type', () => {
  it('accepts all valid status filter values', () => {
    const values: VaultStatusFilter[] = ['all', 'locked', 'unlocked', 'withdrawn'];
    expect(values.length).toBe(4);
  });
});

describe('VaultSortField type', () => {
  it('accepts all valid sort field values', () => {
    const values: VaultSortField[] = ['id', 'amount', 'unlockHeight', 'createdAt'];
    expect(values.length).toBe(4);
  });
});

describe('VaultSortDirection type', () => {
  it('accepts asc and desc', () => {
    const values: VaultSortDirection[] = ['asc', 'desc'];
    expect(values.length).toBe(2);
  });
});

describe('VaultSnapshot interface', () => {
  it('can be created with required fields', () => {
    const snap: VaultSnapshot = {
      vaultId: 1,
      amount: 1000,
      unlockHeight: 200,
      createdAt: 100,
      isWithdrawn: false,
      currentBlockHeight: 150,
    };
    expect(snap.vaultId).toBe(1);
  });

  it('accepts optional nickname', () => {
    const snap: VaultSnapshot = {
      vaultId: 2,
      amount: 500,
      unlockHeight: 300,
      createdAt: 200,
      isWithdrawn: true,
      currentBlockHeight: 400,
      nickname: 'Rainy day fund',
    };
    expect(snap.nickname).toBe('Rainy day fund');
  });

  it('nickname is undefined when not provided', () => {
    const snap: VaultSnapshot = {
      vaultId: 3,
      amount: 100,
      unlockHeight: 150,
      createdAt: 100,
      isWithdrawn: false,
      currentBlockHeight: 120,
    };
    expect(snap.nickname).toBeUndefined();
  });
});

describe('VaultSearchState interface', () => {
  it('can be created from defaultVaultSearchState', () => {
    const state: VaultSearchState = defaultVaultSearchState();
    expect(state.query).toBeDefined();
    expect(state.statusFilter).toBeDefined();
    expect(state.sortField).toBeDefined();
    expect(state.sortDirection).toBeDefined();
  });
});
