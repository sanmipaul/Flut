'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchBlockHeight } from '@/lib/contract';

const POLL_INTERVAL_MS = 60_000; // re-fetch every ~1 min

interface UseBlockHeightResult {
  blockHeight: number;
  lastUpdated: Date | null;
  error: boolean;
  refresh: () => Promise<void>;
}

/**
 * Polls the Stacks API for the current block height every minute.
 */
export function useBlockHeight(): UseBlockHeightResult {
  const [blockHeight, setBlockHeight] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const h = await fetchBlockHeight();
    if (h > 0) {
      setBlockHeight(h);
      setLastUpdated(new Date());
      setError(false);
    } else {
      setError(true);
      console.error('[useBlockHeight] Failed to fetch block height or received 0');
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh]);

  return { blockHeight, lastUpdated, error, refresh };
}
