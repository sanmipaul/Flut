'use client';

import { useState, useCallback } from 'react';

/**
 * Returns a tuple of [copied, copy(text)].
 * `copied` resets to false after `resetMs` milliseconds (default 2000).
 */
export function useCopyToClipboard(resetMs = 2000): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (text: string) => {
      if (!navigator?.clipboard) return;
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
      });
    },
    [resetMs],
  );

  return [copied, copy];
}
