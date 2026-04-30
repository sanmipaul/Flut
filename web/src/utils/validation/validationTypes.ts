export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export type Validator<T> = (value: T) => ValidationResult;

/**
 * Options for controlling announcement behavior in validation contexts
 */
export interface AnnouncementOptions {
  /** Whether to announce validation changes to screen readers (default: true) */
  announceChanges?: boolean;
  /** Politeness level for announcements (default: 'polite') */
  politeness?: 'polite' | 'assertive';
  /** Custom announcement message override */
  announcementMessage?: string;
}

/**
 * Extended validation result that includes announcement-related metadata
 */
export interface ValidationResultWithAnnouncement extends ValidationResult {
  /** Optional announcement message for screen readers */
  announcement?: string;
  /** Whether this result should be announced */
  shouldAnnounce?: boolean;
}
