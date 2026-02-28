import { renderHook, act } from '@testing-library/react';
import { useAllVaultSettings } from './useAllVaultSettings';
import { defaultVaultSettings } from '../types/VaultSettings';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const STORAGE_PREFIX = 'flut:vault-settings:';

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('useAllVaultSettings', () => {
  it('returns default settings for unknown vault ids', () => {
    const { result } = renderHook(() => useAllVaultSettings([1, 2, 3]));
    expect(result.current.getSettings(1)).toEqual(defaultVaultSettings());
  });

  it('reads pre-existing settings for a vault', () => {
    localStorageMock.setItem(
      `${STORAGE_PREFIX}10`,
      JSON.stringify({ ...defaultVaultSettings(), nickname: 'MyVault' })
    );
    const { result } = renderHook(() => useAllVaultSettings([10]));
    expect(result.current.getSettings(10).nickname).toBe('MyVault');
  });

  it('clearAll removes all flut:vault-settings: keys', () => {
    localStorageMock.setItem(`${STORAGE_PREFIX}1`, JSON.stringify(defaultVaultSettings()));
    localStorageMock.setItem(`${STORAGE_PREFIX}2`, JSON.stringify(defaultVaultSettings()));
    const { result } = renderHook(() => useAllVaultSettings([1, 2]));
    act(() => {
      result.current.clearAll();
    });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(`${STORAGE_PREFIX}1`);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(`${STORAGE_PREFIX}2`);
  });

  it('clearAll resets in-memory settings to defaults', () => {
    localStorageMock.setItem(
      `${STORAGE_PREFIX}5`,
      JSON.stringify({ ...defaultVaultSettings(), pinned: true })
    );
    const { result } = renderHook(() => useAllVaultSettings([5]));
    act(() => { result.current.clearAll(); });
    expect(result.current.getSettings(5).pinned).toBe(false);
  });

  it('refresh re-reads from localStorage', () => {
    const { result } = renderHook(() => useAllVaultSettings([20]));
    // Simulate an external write (e.g. from useVaultSettings in another component)
    localStorageMock.setItem(
      `${STORAGE_PREFIX}20`,
      JSON.stringify({ ...defaultVaultSettings(), nickname: 'Updated' })
    );
    act(() => { result.current.refresh(); });
    expect(result.current.getSettings(20).nickname).toBe('Updated');
  });

  it('getSettings returns defaults for an id not in the list', () => {
    const { result } = renderHook(() => useAllVaultSettings([1]));
    expect(result.current.getSettings(999)).toEqual(defaultVaultSettings());
  });
});
