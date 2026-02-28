import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  cacheExpiration: number;
  autoRefresh: boolean;
  autoRefreshInterval: number;
}

const STORAGE_KEY = 'flut-app-settings';
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  enableNotifications: true,
  enableOfflineMode: true,
  cacheExpiration: 24,
  autoRefresh: true,
  autoRefreshInterval: 5,
};

export const useAppSettings = (): AppSettings & { updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void; resetSettings: () => void; exportSettings: () => string } => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  return { ...settings, updateSetting, resetSettings, exportSettings };
};

export default useAppSettings;
