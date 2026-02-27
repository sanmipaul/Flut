export { useToast, DISMISS_DELAY_MS, MAX_TOASTS } from './useToast';
export type { UseToastReturn, ToastShortcuts } from './useToast';

/**
 * Re-export useToastContext so consumers can import from the hooks barrel
 * without knowing about the context directory.
 */
export { useToastContext } from '../context/ToastContext';
