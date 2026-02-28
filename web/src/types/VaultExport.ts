/**
 * VaultExport
 *
 * Types for the vault backup/restore feature. A VaultExportData document
 * captures a point-in-time snapshot of the user's vault list together with
 * their localStorage settings so the whole state can be transferred to
 * another device or restored after clearing browser storage.
 *
 * Schema version is bumped whenever the shape changes so that importers
 * can reject or migrate documents from older versions.
 */

/** Bump this when the export shape changes incompatibly */
export const VAULT_EXPORT_SCHEMA_VERSION = 1;

/** Mime type used when offering the file for download */
export const VAULT_EXPORT_MIME_TYPE = 'application/json';

/** Suggested filename for the downloaded backup file */
export const VAULT_EXPORT_FILENAME = 'flut-vault-backup.json';

/**
 * Per-vault settings captured in the export.
 * Mirrors `VaultSettings` but kept as a standalone type so the export
 * format is self-contained and decoupled from future internal renames.
 */
export interface ExportedVaultSettings {
  nickname: string;
  note: string;
  colorTag: string;
  compactDisplay: boolean;
  pinned: boolean;
}

/** On-chain snapshot of a single vault */
export interface ExportedVault {
  vaultId: number;
  creator: string;
  amount: number;
  unlockHeight: number;
  createdAt: number;
  isWithdrawn: boolean;
  beneficiary?: string;
  currentBlockHeight: number;
  /** User-defined settings associated with this vault */
  settings: ExportedVaultSettings;
}

/** The root document stored in the backup JSON file */
export interface VaultExportData {
  /** Schema version for forward/backward compatibility checks */
  schemaVersion: number;
  /** ISO-8601 timestamp of when the backup was created */
  exportedAt: string;
  /** All vaults included in this backup */
  vaults: ExportedVault[];
}

/** Result of attempting to parse an imported document */
export type VaultImportResult =
  | { ok: true; data: VaultExportData }
  | { ok: false; error: string };
