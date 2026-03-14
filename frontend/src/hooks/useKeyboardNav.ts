'use client';

import { useCallback } from 'react';

/**
 * Returns a keydown handler that moves focus to the previous or next item
 * in a list when the user presses ArrowUp / ArrowDown.
 *
 * Attach the handler to each list item's `onKeyDown`.
 * Items must be individually focusable (e.g. buttons).
 */
export function useKeyboardNav(containerSelector: string) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();

      const container = (e.currentTarget as HTMLElement).closest(containerSelector);
      if (!container) return;

      const items = Array.from(
        container.querySelectorAll<HTMLElement>('[data-navitem]'),
      );
      const idx = items.indexOf(e.currentTarget as HTMLElement);
      if (idx === -1) return;

      const next = e.key === 'ArrowDown' ? items[idx + 1] : items[idx - 1];
      next?.focus();
    },
    [containerSelector],
  );
}
