export type {
  Toast,
  ToastVariant,
  ToastPosition,
  ToastOptions,
} from './Toast';

export {
  TOAST_DURATION_DEFAULT,
  TOAST_DURATION_ERROR,
  TOAST_DURATION_PERSISTENT,
  TOAST_ICON,
  TOAST_ROLE,
} from './Toast';

/**
 * Runtime behaviour constants (from hook implementation).
 * Re-exported here so consumers of the types package can access
 * the full public surface without importing from hooks directly.
 */
export { DISMISS_DELAY_MS, MAX_TOASTS } from '../hooks/useToast';
