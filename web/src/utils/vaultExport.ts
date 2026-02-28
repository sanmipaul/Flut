/**
 * vaultExport
 *
 * Serialises the current vault list and their localStorage settings into
 * a VaultExportData document, and conversely parses + validates an imported
 * document for correctness before handing it back to the caller.
 */
import {
  VaultExportData,
  VaultImportResult,
  ExportedVault,
  ExportedVaultSettings,
  VAULT_EXPORT_SCHEMA_VERSION,
} from '../types/VaultExport';

const SETTINGS_PREFIX = 'flut:vault-settings:';

function defaultExportedSettings(): ExportedVaultSettings {
  return {
    nickname: '',
    note: '',
    colorTag: 'none',
    compactDisplay: false,
    pinned: false,
  };
}

function readSettingsFromStorage(vaultId: number): ExportedVaultSettings {
  try {
    const raw = localStorage.getItem(`${SETTINGS_PREFIX}${vaultId}`);
    if (!raw) return defaultExportedSettings();
    return { ...defaultExportedSettings(), ...(JSON.parse(raw) as Partial<ExportedVaultSettings>) };
  } catch {
    return defaultExportedSettings();
  }
}

/** The minimal shape of a vault object expected from the app state */
export interface VaultSnapshot {
  vaultId: number;
  creator: string;
  amount: number;
  unlockHeight: number;
  createdAt: number;
  isWithdrawn: boolean;
  beneficiary?: string;
  currentBlockHeight: number;
}

/**
 * Build a VaultExportData document from the current vault list.
 * Settings are read from localStorage automatically.
 */
export function serializeVaultExport(vaults: VaultSnapshot[]): VaultExportData {
  const exportedVaults: ExportedVault[] = vaults.map((v) => ({
    vaultId: v.vaultId,
    creator: v.creator,
    amount: v.amount,
    unlockHeight: v.unlockHeight,
    createdAt: v.createdAt,
    isWithdrawn: v.isWithdrawn,
    beneficiary: v.beneficiary,
    currentBlockHeight: v.currentBlockHeight,
    settings: readSettingsFromStorage(v.vaultId),
  }));

  return {
    schemaVersion: VAULT_EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    vaults: exportedVaults,
  };
}

/**
 * Convert a VaultExportData document to a pretty-printed JSON string.
 */
export function serializeToJson(data: VaultExportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Parse and validate a raw JSON string as a VaultExportData document.
 * Returns a tagged result so callers can display a user-friendly error.
 */
export function parseVaultImport(raw: string): VaultImportResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'The file does not contain valid JSON.' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'Expected a JSON object at the top level.' };
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.schemaVersion !== 'number') {
    return { ok: false, error: 'Missing or invalid "schemaVersion" field.' };
  }

  if (obj.schemaVersion > VAULT_EXPORT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `This backup was created with a newer version of Flut (schema v${obj.schemaVersion}). Please update the app.`,
    };
  }

  if (typeof obj.exportedAt !== 'string') {
    return { ok: false, error: 'Missing or invalid "exportedAt" field.' };
  }

  if (!Array.isArray(obj.vaults)) {
    return { ok: false, error: 'Missing or invalid "vaults" array.' };
  }

  for (let i = 0; i < obj.vaults.length; i++) {
    const v = obj.vaults[i] as Record<string, unknown>;
    if (typeof v.vaultId !== 'number') {
      return { ok: false, error: `Vault at index ${i} has an invalid "vaultId".` };
    }
    if (typeof v.amount !== 'number') {
      return { ok: false, error: `Vault ${v.vaultId} has an invalid "amount".` };
    }
  }

  return { ok: true, data: parsed as VaultExportData };
}

/**
 * Write imported vault settings back to localStorage.
 * Returns the number of vaults whose settings were restored.
 */
export function applyImportedSettings(data: VaultExportData): number {
  let restored = 0;
  for (const v of data.vaults) {
    if (v.settings) {
      try {
        localStorage.setItem(`${SETTINGS_PREFIX}${v.vaultId}`, JSON.stringify(v.settings));
        restored++;
      } catch {
        // Ignore storage errors
      }
    }
  }
  return restored;
}
