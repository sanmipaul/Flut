/**
 * VaultSettings
 *
 * Per-vault user preferences stored in localStorage. Each vault
 * can have its own nickname, personal note, colour tag, and display
 * preferences that are independent of the on-chain state.
 */

/**
 * Visual colour tag applied to a vault in the sidebar and detail view.
 * 'none' means no tag is applied.
 */
export type VaultColorTag = 'none' | 'red' | 'green' | 'blue' | 'orange' | 'purple';

/** All colour tag options in display order */
export const VAULT_COLOR_TAGS: VaultColorTag[] = [
  'none',
  'red',
  'green',
  'blue',
  'orange',
  'purple',
];

/** Human-readable labels for each colour tag */
export const VAULT_COLOR_TAG_LABELS: Record<VaultColorTag, string> = {
  none: 'None',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  orange: 'Orange',
  purple: 'Purple',
};

/**
 * All user-defined settings for a single vault.
 * Fields intentionally mirror localStorage JSON so they must be
 * serialisable primitives.
 */
export interface VaultSettings {
  /** Short user-defined name for the vault (e.g. "Emergency Fund") */
  nickname: string;

  /** Freeform personal memo visible only to the user */
  note: string;

  /** Visual colour tag for quick identification */
  colorTag: VaultColorTag;

  /** When true, show amounts in compact notation (1.2M instead of 1,200,000) */
  compactDisplay: boolean;

  /** When true, the vault is sorted to the top of the sidebar list */
  pinned: boolean;
}

/** Factory for a blank settings object with sensible defaults */
export function defaultVaultSettings(): VaultSettings {
  return {
    nickname: '',
    note: '',
    colorTag: 'none',
    compactDisplay: false,
    pinned: false,
  };
}
