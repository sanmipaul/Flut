/**
 * useToast
 *
 * Core hook that manages an ordered list of Toast notifications.
 * Provides helpers to add, dismiss (with an exit-animation flag),
 * and clear toasts.
 *
 * The returned `toast` convenience object exposes variant-specific
 * shorthand methods:
 *
 *   toast.success('Vault created!')
 *   toast.error('Transaction failed', { description: 'Insufficient funds' })
 *   toast.warning('Early withdrawal', { duration: 8000 })
 *   toast.info('Tip: …')
 *
 * Auto-dismiss is handled internally via setTimeout. The DISMISS_DELAY
 * gives CSS exit animations time to play before the item is removed
 * from state.
 */
import { useState, useCallback, useRef } from 'react';
import type { Toast, ToastVariant, ToastOptions } from '../types/Toast';
import {
  TOAST_DURATION_DEFAULT,
  TOAST_DURATION_ERROR,
} from '../types/Toast';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Duration the toast stays mounted after dismiss is called (exit animation) */
export const DISMISS_DELAY_MS = 300;

/** Maximum simultaneous toasts on screen */
export const MAX_TOASTS = 5;

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------

let _seq = 0;
function nextId(): string {
  _seq += 1;
  return `toast_${Date.now()}_${_seq}`;
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface ToastShortcuts {
  success: (message: string, opts?: Omit<ToastOptions, 'variant'>) => string;
  error: (message: string, opts?: Omit<ToastOptions, 'variant'>) => string;
  warning: (message: string, opts?: Omit<ToastOptions, 'variant'>) => string;
  info: (message: string, opts?: Omit<ToastOptions, 'variant'>) => string;
}

export interface UseToastReturn {
  /** Current list of toasts (newest first) */
  toasts: Toast[];
  /** Add a toast and return its id */
  addToast: (message: string, options?: ToastOptions) => string;
  /** Begin dismissal (triggers exit animation, then removes) */
  dismissToast: (id: string) => void;
  /** Remove all toasts immediately */
  clearAll: () => void;
  /** Shorthand variant helpers */
  toast: ToastShortcuts;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    timersRef.current.delete(id);
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      // Mark as dismissing (triggers CSS exit animation)
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
      );
      // Remove after animation completes
      const timer = setTimeout(() => removeToast(id), DISMISS_DELAY_MS);
      timersRef.current.set(`dismiss_${id}`, timer);
    },
    [removeToast]
  );

  const addToast = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      const {
        variant = 'info',
        description,
        duration = variant === 'error' ? TOAST_DURATION_ERROR : TOAST_DURATION_DEFAULT,
      } = options;

      const id = nextId();
      const toast: Toast = {
        id,
        variant,
        message,
        description,
        duration,
        dismissing: false,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const updated = [toast, ...prev];
        // Evict oldest if over cap
        if (updated.length > MAX_TOASTS) {
          const evicted = updated.splice(MAX_TOASTS);
          evicted.forEach((t) => {
            const timer = timersRef.current.get(t.id);
            if (timer) clearTimeout(timer);
            timersRef.current.delete(t.id);
          });
        }
        return updated;
      });

      // Schedule auto-dismiss
      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  const clearAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const makeShortcut =
    (variant: ToastVariant) =>
    (message: string, opts?: Omit<ToastOptions, 'variant'>): string =>
      addToast(message, { ...opts, variant });

  const toast: ToastShortcuts = {
    success: makeShortcut('success'),
    error: makeShortcut('error'),
    warning: makeShortcut('warning'),
    info: makeShortcut('info'),
  };

  return { toasts, addToast, dismissToast, clearAll, toast };
}
