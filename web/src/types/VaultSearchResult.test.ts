import type { VaultSearchResult } from './VaultSearchResult';

describe('VaultSearchResult interface', () => {
  const makeResult = (overrides: Partial<VaultSearchResult> = {}): VaultSearchResult => ({
    vaults: [],
    totalCount: 0,
    matchCount: 0,
    isFiltered: false,
    ...overrides,
  });

  it('can be created with all fields', () => {
    const result = makeResult({ totalCount: 5, matchCount: 3, isFiltered: true });
    expect(result.totalCount).toBe(5);
    expect(result.matchCount).toBe(3);
    expect(result.isFiltered).toBe(true);
  });

  it('vaults defaults to an empty array', () => {
    const result = makeResult();
    expect(result.vaults).toEqual([]);
  });

  it('isFiltered is false when no filter is active', () => {
    const result = makeResult({ isFiltered: false });
    expect(result.isFiltered).toBe(false);
  });

  it('matchCount can equal totalCount when no filter is active', () => {
    const result = makeResult({ totalCount: 4, matchCount: 4, isFiltered: false });
    expect(result.matchCount).toBe(result.totalCount);
  });

  it('matchCount can be zero when no vaults match', () => {
    const result = makeResult({ totalCount: 3, matchCount: 0, isFiltered: true });
    expect(result.matchCount).toBe(0);
  });
});
