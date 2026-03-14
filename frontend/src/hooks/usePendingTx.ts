'use client';

import { useCallback, useState } from 'react';

interface PendingTx {
  txid: string;
  label: string;
}

/**
 * Tracks a single in-flight transaction txid for display in the UI.
 * Auto-clears after `autoExpireMs` milliseconds (default 60s).
 */
export function usePendingTx(autoExpireMs = 60_000) {
  const [pending, setPending] = useState<PendingTx | null>(null);

  const set = useCallback(
    (txid: string, label = 'Transaction submitted') => {
      setPending({ txid, label });
      setTimeout(() => setPending(null), autoExpireMs);
    },
    [autoExpireMs],
  );

  const clear = useCallback(() => setPending(null), []);

  return { pending, set, clear };
}
