'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns an `announce` function that injects a message into a visually-hidden
 * aria-live region so screen readers speak it immediately.
 * Useful for dynamic status changes that don't use a toast.
 */
export function useAnnounce(politeness: 'polite' | 'assertive' = 'polite') {
  const regionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement('div');
    div.setAttribute('aria-live', politeness);
    div.setAttribute('aria-atomic', 'true');
    div.className = 'sr-only';
    document.body.appendChild(div);
    regionRef.current = div;
    return () => { div.remove(); regionRef.current = null; };
  }, [politeness]);

  const announce = useCallback((message: string) => {
    const el = regionRef.current;
    if (!el) return;
    // Clear then set to trigger re-announcement
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = message; });
  }, []);

  return announce;
}
