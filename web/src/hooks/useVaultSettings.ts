/**
 * useVaultSettings
 *
 * React hook that reads and writes per-vault user preferences from/to
 * localStorage. Each vault's settings are stored under a separate key
 * so they never interfere with one another.
 *
 * Storage key format: `flut:vault-settings:{vaultId}`
 *
 * Usage:
 *   const { settings, updateSettings, resetSettings } = useVaultSettings(vaultId);
 */
import { useState, useCallback, useEffect } from 'react';
import {
  VaultSettings,
  defaultVaultSettings,
} from '../types/VaultSettings';

const STORAGE_PREFIX = 'flut:vault-settings:';

function storageKey(vaultId: number): string {
  return `${STORAGE_PREFIX}${vaultId}`;
}

function readFromStorage(vaultId: number): VaultSettings {
  try {
    const raw = localStorage.getItem(storageKey(vaultId));
    if (!raw) return defaultVaultSettings();
    const parsed = JSON.parse(raw) as Partial<VaultSettings>;
    // Merge with defaults so missing keys from older versions are filled in
    return { ...defaultVaultSettings(), ...parsed };
  } catch {
    return defaultVaultSettings();
  }
}

function writeToStorage(vaultId: number, settings: VaultSettings): void {
  try {
    localStorage.setItem(storageKey(vaultId), JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable (private browsing, storage quota exceeded)
  }
}

export interface UseVaultSettingsReturn {
  /** Current settings for the vault */
  settings: VaultSettings;
  /**
   * Merge a partial update into the settings and persist immediately.
   * @example updateSettings({ nickname: 'Emergency Fund' })
   */
  updateSettings: (patch: Partial<VaultSettings>) => void;
  /** Restore settings to defaults and clear from localStorage */
  resetSettings: () => void;
}

export function useVaultSettings(vaultId: number): UseVaultSettingsReturn {
  const [settings, setSettings] = useState<VaultSettings>(() =>
    readFromStorage(vaultId)
  );

  // Re-read from storage when the vaultId changes (e.g. user selects a different vault)
  useEffect(() => {
    setSettings(readFromStorage(vaultId));
  }, [vaultId]);

  const updateSettings = useCallback(
    (patch: Partial<VaultSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        writeToStorage(vaultId, next);
        return next;
      });
    },
    [vaultId]
  );

  const resetSettings = useCallback(() => {
    const defaults = defaultVaultSettings();
    setSettings(defaults);
    try {
      localStorage.removeItem(storageKey(vaultId));
    } catch {
      // ignore
    }
  }, [vaultId]);

  return { settings, updateSettings, resetSettings };
}
