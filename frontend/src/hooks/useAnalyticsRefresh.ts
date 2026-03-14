'use client';

import { useEffect } from 'react';

const REFRESH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Calls `refresh` on mount and then on a fixed interval so the analytics
 * page always shows reasonably current data without manual intervention.
 */
export function useAnalyticsRefresh(refresh: () => void | Promise<void>) {
  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);
}
