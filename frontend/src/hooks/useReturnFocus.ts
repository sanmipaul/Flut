'use client';

import { useEffect, useRef } from 'react';

/**
 * Saves the currently focused element before `active` becomes true,
 * then restores focus to it when `active` becomes false.
 * Use this alongside modals / drawers to return focus to the trigger element.
 */
export function useReturnFocus(active: boolean) {
  const savedRef = useRef<Element | null>(null);

  useEffect(() => {
    if (active) {
      savedRef.current = document.activeElement;
    } else if (savedRef.current instanceof HTMLElement) {
      savedRef.current.focus();
      savedRef.current = null;
    }
  }, [active]);
}
