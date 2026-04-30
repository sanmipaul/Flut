/**
 * Storage utilities for persisting application state
 */

const STORAGE_PREFIX = 'flut-';

/**
 * Check if a storage type is available (handles private browsing)
 */
export function isStorageAvailable(storage: Storage): boolean {
  try {
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Save data to storage with error handling
 */
export function saveToStorage<T>(
  key: string,
  data: T,
  storageType: 'local' | 'session' = 'local'
): boolean {
  try {
    const storage = storageType === 'session' ? sessionStorage : localStorage;
    if (isStorageAvailable(storage)) {
      storage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
      return true;
    }
  } catch (e) {
    console.warn(`Failed to save to ${storageType}Storage:`, e);
  }
  return false;
}

/**
 * Load data from storage with error handling
 */
export function loadFromStorage<T>(
  key: string,
  storageType: 'local' | 'session' = 'local'
): T | null {
  try {
    const storage = storageType === 'session' ? sessionStorage : localStorage;
    if (isStorageAvailable(storage)) {
      const item = storage.getItem(`${STORAGE_PREFIX}${key}`);
      if (item) {
        return JSON.parse(item);
      }
    }
  } catch (e) {
    console.warn(`Failed to load from ${storageType}Storage:`, e);
  }
  return null;
}

/**
 * Remove data from storage
 */
export function removeFromStorage(
  key: string,
  storageType: 'local' | 'session' = 'local'
): boolean {
  try {
    const storage = storageType === 'session' ? sessionStorage : localStorage;
    if (isStorageAvailable(storage)) {
      storage.removeItem(`${STORAGE_PREFIX}${key}`);
      return true;
    }
  } catch (e) {
    console.warn(`Failed to remove from ${storageType}Storage:`, e);
  }
  return false;
}

/**
 * Save to both localStorage and sessionStorage (dual-persistence)
 */
export function saveDualStorage<T>(key: string, data: T): void {
  saveToStorage(key, data, 'local');
  saveToStorage(key, data, 'session');
}

/**
 * Load from localStorage with sessionStorage fallback
 */
export function loadDualStorage<T>(key: string): T | null {
  return loadFromStorage<T>(key, 'local') || loadFromStorage<T>(key, 'session');
}

/**
 * Clear data from both storages
 */
export function clearDualStorage(key: string): void {
  removeFromStorage(key, 'local');
  removeFromStorage(key, 'session');
}
