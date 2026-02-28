/**
 * Offline Storage Utility
 * Handles local caching of vault data for offline-first reading
 */

const VAULT_STORAGE_KEY = 'flut_vault_cache';
const CACHE_METADATA_KEY = 'flut_cache_metadata';
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface VaultCacheEntry {
  vaultId: string;
  vaultName: string;
  owner: string;
  amount: number;
  unlockDate: string;
  status: string;
  locked: boolean;
  timestamp: number;
}

interface CacheMetadata {
  lastUpdated: number;
  vaultCount: number;
  version: string;
}

/**
 * Save vault data to local storage
 */
export const saveVaultToOfflineStorage = (vault: VaultCacheEntry): void => {
  try {
    const vaults = getOfflineVaults();
    const index = vaults.findIndex((v) => v.vaultId === vault.vaultId);

    if (index >= 0) {
      vaults[index] = { ...vault, timestamp: Date.now() };
    } else {
      vaults.push({ ...vault, timestamp: Date.now() });
    }

    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vaults));

    // Update metadata
    const metadata: CacheMetadata = {
      lastUpdated: Date.now(),
      vaultCount: vaults.length,
      version: '1.0',
    };
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));

    console.log(`Saved vault ${vault.vaultId} to offline storage`);
  } catch (error) {
    console.error('Failed to save vault to offline storage:', error);
  }
};

/**
 * Get all cached vaults from local storage
 */
export const getOfflineVaults = (): VaultCacheEntry[] => {
  try {
    const cached = localStorage.getItem(VAULT_STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Failed to retrieve offline vaults:', error);
    return [];
  }
};

/**
 * Get specific vault from offline storage
 */
export const getOfflineVault = (vaultId: string): VaultCacheEntry | null => {
  try {
    const vaults = getOfflineVaults();
    return vaults.find((v) => v.vaultId === vaultId) || null;
  } catch (error) {
    console.error('Failed to retrieve specific vault:', error);
    return null;
  }
};

/**
 * Check if cache data is still valid (not expired)
 */
export const isCacheValid = (): boolean => {
  try {
    const metadata = localStorage.getItem(CACHE_METADATA_KEY);
    if (!metadata) return false;

    const { lastUpdated } = JSON.parse(metadata) as CacheMetadata;
    const age = Date.now() - lastUpdated;
    return age < CACHE_EXPIRATION_MS;
  } catch (error) {
    console.error('Failed to check cache validity:', error);
    return false;
  }
};

/**
 * Get cache metadata
 */
export const getCacheMetadata = (): CacheMetadata | null => {
  try {
    const metadata = localStorage.getItem(CACHE_METADATA_KEY);
    return metadata ? JSON.parse(metadata) : null;
  } catch (error) {
    console.error('Failed to retrieve cache metadata:', error);
    return null;
  }
};

/**
 * Clear all cached vault data
 */
export const clearOfflineStorage = (): void => {
  try {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    localStorage.removeItem(CACHE_METADATA_KEY);
    console.log('Offline storage cleared');
  } catch (error) {
    console.error('Failed to clear offline storage:', error);
  }
};

/**
 * Remove specific vault from offline storage
 */
export const removeVaultFromOfflineStorage = (vaultId: string): void => {
  try {
    const vaults = getOfflineVaults();
    const filtered = vaults.filter((v) => v.vaultId !== vaultId);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(filtered));

    // Update metadata
    const metadata: CacheMetadata = {
      lastUpdated: Date.now(),
      vaultCount: filtered.length,
      version: '1.0',
    };
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));

    console.log(`Removed vault ${vaultId} from offline storage`);
  } catch (error) {
    console.error('Failed to remove vault from offline storage:', error);
  }
};

/**
 * Update vault status in offline storage
 */
export const updateVaultStatusOffline = (
  vaultId: string,
  status: string,
  locked: boolean
): void => {
  try {
    const vault = getOfflineVault(vaultId);
    if (vault) {
      saveVaultToOfflineStorage({
        ...vault,
        status,
        locked,
      });
    }
  } catch (error) {
    console.error('Failed to update vault status in offline storage:', error);
  }
};

/**
 * Get cache age in milliseconds
 */
export const getCacheAge = (): number | null => {
  try {
    const metadata = getCacheMetadata();
    if (!metadata) return null;
    return Date.now() - metadata.lastUpdated;
  } catch (error) {
    console.error('Failed to get cache age:', error);
    return null;
  }
};

/**
 * Export offline storage for debugging
 */
export const exportOfflineStorage = (): {
  vaults: VaultCacheEntry[];
  metadata: CacheMetadata | null;
} => {
  return {
    vaults: getOfflineVaults(),
    metadata: getCacheMetadata(),
  };
};
