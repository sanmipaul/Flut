/**
 * useAllVaultSettings
 *
 * Provides a map of settings for a set of vault IDs and exposes a
 * helper to clear all stored settings at once. Useful in App.tsx for
 * sorting (pinned) and labelling vault list items.
 *
 * Usage:
 *   const { getSettings, clearAll } = useAllVaultSettings(vaultIds);
 */
import { useState, useCallback, useEffect } from 'react';
import { VaultSettings, defaultVaultSettings } from '../types/VaultSettings';

const STORAGE_PREFIX = 'flut:vault-settings:';

function readOne(vaultId: number): VaultSettings {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${vaultId}`);
    if (!raw) return defaultVaultSettings();
    return { ...defaultVaultSettings(), ...(JSON.parse(raw) as Partial<VaultSettings>) };
  } catch {
    return defaultVaultSettings();
  }
}

export interface UseAllVaultSettingsReturn {
  /** Retrieve the settings for a specific vault */
  getSettings: (vaultId: number) => VaultSettings;
  /** Remove all vault settings from localStorage */
  clearAll: () => void;
  /** Trigger a re-read of all settings (call after external writes) */
  refresh: () => void;
}

export function useAllVaultSettings(vaultIds: number[]): UseAllVaultSettingsReturn {
  const [settingsMap, setSettingsMap] = useState<Map<number, VaultSettings>>(
    () => new Map(vaultIds.map((id) => [id, readOne(id)]))
  );

  // Re-read when the vault list changes
  useEffect(() => {
    setSettingsMap(new Map(vaultIds.map((id) => [id, readOne(id)])));
  }, [vaultIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const getSettings = useCallback(
    (vaultId: number): VaultSettings =>
      settingsMap.get(vaultId) ?? defaultVaultSettings(),
    [settingsMap]
  );

  const clearAll = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setSettingsMap(new Map(vaultIds.map((id) => [id, defaultVaultSettings()])));
  }, [vaultIds]);

  const refresh = useCallback(() => {
    setSettingsMap(new Map(vaultIds.map((id) => [id, readOne(id)])));
  }, [vaultIds]);

  return { getSettings, clearAll, refresh };
}
