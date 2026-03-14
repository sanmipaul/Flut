'use client';

import { useEffect } from 'react';
import type { VaultMetrics } from './useVaultMetrics';

const STORAGE_KEY = 'flut:analytics:snapshot';

/**
 * Persists the latest VaultMetrics to localStorage so the analytics page
 * can show stale values while fresh data is loading.
 */
export function useAnalyticsSnapshot(metrics: VaultMetrics, loaded: boolean): VaultMetrics | null {
  useEffect(() => {
    if (!loaded || metrics.totalVaults === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
    } catch {
      // localStorage may be unavailable in SSR or private browsing
    }
  }, [metrics, loaded]);

  // Read synchronously (only called during hydration)
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VaultMetrics) : null;
  } catch {
    return null;
  }
}
