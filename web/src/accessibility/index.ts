/**
 * Accessibility exports
 *
 * Re-exports all accessibility-related components, hooks, and utilities
 * for easy consumption across the application.
 */

// Components
export { default as StxAmountInput } from './components/StxAmountInput';
export type { StxAmountInputProps } from './components/StxAmountInput';

export { ValidatedInput } from './components/ValidatedInput';
export type { ValidatedInputProps } from './components/ValidatedInput';

export { FormField } from './components/FormField';
export type { FormFieldProps } from './components/FormField';

export { LiveAnnouncer, type SSRSafeAnnouncementProps } from './components/LiveAnnouncer';
export type { LiveAnnouncerProps } from './components/LiveAnnouncer';

// Hooks
export { useLiveAnnouncer } from './hooks/useLiveAnnouncer';
export type { UseLiveAnnouncerReturn, UseLiveAnnouncerOptions } from './hooks/useLiveAnnouncer';

// Utilities
export {
  isStorageAvailable,
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  saveDualStorage,
  loadDualStorage,
  clearDualStorage,
} from './utils/storage';

export {
  trapFocus,
  useFocusReturn,
  announce,
} from './utils/accessibility';

// Types
export type { ValidationResultWithAnnouncement, AnnouncementOptions } from './utils/validation';
export type { FilterPanelState } from './components/FilterPanel';
export type { HeatmapData } from './components/ActivityHeatmap';
