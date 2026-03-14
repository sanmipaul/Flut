'use client';

import { useCallback } from 'react';

const BLOCK_DELAY_MS = 20_000; // ~2 blocks at 10 min/block
const SECOND_REFRESH_MS = 60_000; // second refresh after 1 min

/**
 * Returns a function that triggers `refresh` immediately,
 * then again after ~20s and ~60s to catch on-chain state changes.
 */
export function useDelayedRefresh(refresh: () => void | Promise<void>) {
  return useCallback(() => {
    void refresh();
    setTimeout(() => void refresh(), BLOCK_DELAY_MS);
    setTimeout(() => void refresh(), SECOND_REFRESH_MS);
  }, [refresh]);
}
