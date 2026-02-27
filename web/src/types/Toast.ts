/**
 * Toast — type definitions for the notification system.
 *
 * Toasts are transient messages that appear in a fixed overlay region
 * and auto-dismiss after a configurable duration. They are also
 * dismissible manually via a close button.
 *
 * Variants:
 *   success  – green; used for completed vault actions
 *   error    – red; used for failed operations
 *   warning  – amber; used for advisory messages (e.g. penalty notices)
 *   info     – blue; used for neutral informational messages
 */

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/** Position of the toast stack on screen */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface Toast {
  /** Unique identifier (auto-generated) */
  id: string;
  /** Visual treatment */
  variant: ToastVariant;
  /** Main message (required) */
  message: string;
  /** Optional secondary description shown below the message */
  description?: string;
  /** Auto-dismiss delay in ms (0 = persistent until manually closed) */
  duration: number;
  /** Whether the toast is in the process of being removed (exit animation) */
  dismissing: boolean;
  /** Timestamp when the toast was created */
  createdAt: number;
}

/** Options accepted by the `toast()` helper */
export interface ToastOptions {
  variant?: ToastVariant;
  description?: string;
  /** Duration in ms; defaults to TOAST_DURATION_DEFAULT */
  duration?: number;
}

/** Default auto-dismiss durations in ms */
export const TOAST_DURATION_DEFAULT = 4000;
export const TOAST_DURATION_ERROR = 6000;
export const TOAST_DURATION_PERSISTENT = 0;

/** Icon for each variant */
export const TOAST_ICON: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

/** Accessible role for each variant */
export const TOAST_ROLE: Record<ToastVariant, 'status' | 'alert'> = {
  success: 'status',
  error: 'alert',
  warning: 'alert',
  info: 'status',
};
