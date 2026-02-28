import { renderHook, act } from '@testing-library/react';
import { useVaultSettings } from './useVaultSettings';
import { defaultVaultSettings } from '../types/VaultSettings';

// Mock localStorage
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

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('useVaultSettings', () => {
  it('returns default settings for a new vault', () => {
    const { result } = renderHook(() => useVaultSettings(1));
    expect(result.current.settings).toEqual(defaultVaultSettings());
  });

  it('updateSettings merges a partial patch', () => {
    const { result } = renderHook(() => useVaultSettings(1));
    act(() => {
      result.current.updateSettings({ nickname: 'Emergency Fund' });
    });
    expect(result.current.settings.nickname).toBe('Emergency Fund');
    expect(result.current.settings.pinned).toBe(false);
  });

  it('persists settings to localStorage on update', () => {
    const { result } = renderHook(() => useVaultSettings(2));
    act(() => {
      result.current.updateSettings({ colorTag: 'blue' });
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'flut:vault-settings:2',
      expect.stringContaining('"colorTag":"blue"')
    );
  });

  it('resetSettings restores defaults', () => {
    const { result } = renderHook(() => useVaultSettings(1));
    act(() => {
      result.current.updateSettings({ nickname: 'Test', pinned: true });
    });
    act(() => {
      result.current.resetSettings();
    });
    expect(result.current.settings).toEqual(defaultVaultSettings());
  });

  it('resetSettings removes the localStorage entry', () => {
    const { result } = renderHook(() => useVaultSettings(3));
    act(() => {
      result.current.updateSettings({ nickname: 'Gone' });
    });
    act(() => {
      result.current.resetSettings();
    });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('flut:vault-settings:3');
  });

  it('reads existing settings from localStorage on mount', () => {
    localStorageMock.setItem(
      'flut:vault-settings:5',
      JSON.stringify({ ...defaultVaultSettings(), nickname: 'Loaded', pinned: true })
    );
    const { result } = renderHook(() => useVaultSettings(5));
    expect(result.current.settings.nickname).toBe('Loaded');
    expect(result.current.settings.pinned).toBe(true);
  });

  it('fills in missing keys from older stored versions', () => {
    // Simulate an older version without compactDisplay or pinned
    localStorageMock.setItem('flut:vault-settings:6', JSON.stringify({ nickname: 'Old' }));
    const { result } = renderHook(() => useVaultSettings(6));
    expect(result.current.settings.compactDisplay).toBe(false);
    expect(result.current.settings.pinned).toBe(false);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorageMock.setItem('flut:vault-settings:7', 'NOT_JSON{{{');
    const { result } = renderHook(() => useVaultSettings(7));
    expect(result.current.settings).toEqual(defaultVaultSettings());
  });

  it('multiple updates accumulate correctly', () => {
    const { result } = renderHook(() => useVaultSettings(8));
    act(() => { result.current.updateSettings({ nickname: 'Step 1' }); });
    act(() => { result.current.updateSettings({ colorTag: 'red' }); });
    act(() => { result.current.updateSettings({ pinned: true }); });
    expect(result.current.settings.nickname).toBe('Step 1');
    expect(result.current.settings.colorTag).toBe('red');
    expect(result.current.settings.pinned).toBe(true);
  });
});
