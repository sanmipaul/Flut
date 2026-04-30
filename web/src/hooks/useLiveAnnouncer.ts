/**
 * useLiveAnnouncer
 *
 * Hook for managing screen reader announcements via aria-live regions.
 * Provides a centralized way to announce important state changes to
 * assistive technology users without disrupting visual UI.
 *
 * Usage:
 *   const { announce, clear } = useLiveAnnouncer();
 *   announce('Form submitted successfully');
 */
import { useState, useCallback, useEffect } from 'react';

export interface UseLiveAnnouncerReturn {
  /** Announce a message to screen readers */
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  /** Clear the current announcement */
  clear: () => void;
  /** Current announcement message */
  message: string;
  /** Current politeness level */
  politeness: 'polite' | 'assertive';
}

/**
 * Options for useLiveAnnouncer
 */
export interface UseLiveAnnouncerOptions {
  /** Default politeness level for announcements (default: 'polite') */
  defaultPoliteness?: 'polite' | 'assertive';
  /** Debounce delay in ms to prevent rapid-fire announcements (default: 100) */
  debounceMs?: number;
}

/**
 * Custom hook that provides screen reader announcement capabilities
 */
export function useLiveAnnouncer({
  defaultPoliteness = 'polite',
  debounceMs = 100,
}: UseLiveAnnouncerOptions = {}): UseLiveAnnouncerReturn {
  const [message, setMessage] = useState<string>('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>(
    defaultPoliteness
  );
  const debounceTimer = useState<NodeJS.Timeout | null>(() => null)[0];

  const announce = useCallback(
    (newMessage: string, newPoliteness: 'polite' | 'assertive' = defaultPoliteness) => {
      // Clear any pending announcement
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new message and politeness
      setMessage(newMessage);
      setPoliteness(newPoliteness);
    },
    [debounceTimer, defaultPoliteness]
  );

  const clear = useCallback(() => {
    setMessage('');
  }, []);

  // Clear announcement after a delay to allow it to be read
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return {
    announce,
    clear,
    message,
    politeness,
  };
}
