/**
 * Tests for storage utilities.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isStorageAvailable,
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  saveDualStorage,
  loadDualStorage,
  clearDualStorage,
} from './storage';

describe('Storage utilities', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  const mockSessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
  });

  describe('isStorageAvailable', () => {
    it('returns true when storage is available', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.removeItem.mockImplementation(() => {});
      expect(isStorageAvailable(mockLocalStorage as Storage)).toBe(true);
    });

    it('returns false when storage throws error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      expect(isStorageAvailable(mockLocalStorage as Storage)).toBe(false);
    });
  });

  describe('saveToStorage', () => {
    it('saves data to localStorage by default', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});
      const result = saveToStorage('test-key', { foo: 'bar' }, 'local');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'flut-test-key',
        JSON.stringify({ foo: 'bar' })
      );
      expect(result).toBe(true);
    });

    it('saves data to sessionStorage when specified', () => {
      mockSessionStorage.setItem.mockImplementation(() => {});
      const result = saveToStorage('test-key', { foo: 'bar' }, 'session');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'flut-test-key',
        JSON.stringify({ foo: 'bar' })
      );
      expect(result).toBe(true);
    });

    it('returns false when storage fails', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Failed');
      });
      const result = saveToStorage('test-key', { foo: 'bar' }, 'local');
      expect(result).toBe(false);
    });
  });

  describe('loadFromStorage', () => {
    it('loads data from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ foo: 'bar' }));
      const result = loadFromStorage('test-key', 'local');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('returns null when item does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const result = loadFromStorage('test-key', 'local');
      expect(result).toBeNull();
    });

    it('returns null when storage throws error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Failed');
      });
      const result = loadFromStorage('test-key', 'local');
      expect(result).toBeNull();
    });
  });

  describe('removeFromStorage', () => {
    it('removes item from localStorage', () => {
      removeFromStorage('test-key', 'local');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flut-test-key');
    });

    it('returns true when successful', () => {
      const result = removeFromStorage('test-key', 'local');
      expect(result).toBe(true);
    });

    it('returns false when storage throws error', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Failed');
      });
      const result = removeFromStorage('test-key', 'local');
      expect(result).toBe(false);
    });
  });

  describe('saveDualStorage', () => {
    it('saves to both localStorage and sessionStorage', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockSessionStorage.setItem.mockImplementation(() => {});
      saveDualStorage('test-key', { foo: 'bar' });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'flut-test-key',
        JSON.stringify({ foo: 'bar' })
      );
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'flut-test-key',
        JSON.stringify({ foo: 'bar' })
      );
    });
  });

  describe('loadDualStorage', () => {
    it('loads from localStorage first', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ source: 'local' }));
      const result = loadDualStorage('test-key');
      expect(result).toEqual({ source: 'local' });
      expect(mockSessionStorage.getItem).not.toHaveBeenCalled();
    });

    it('falls back to sessionStorage when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ source: 'session' }));
      const result = loadDualStorage('test-key');
      expect(result).toEqual({ source: 'session' });
    });

    it('returns null when both storages are empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockSessionStorage.getItem.mockReturnValue(null);
      const result = loadDualStorage('test-key');
      expect(result).toBeNull();
    });
  });

  describe('clearDualStorage', () => {
    it('removes item from both storages', () => {
      clearDualStorage('test-key');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flut-test-key');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('flut-test-key');
    });
  });
});
