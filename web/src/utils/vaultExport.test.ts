import {
  serializeVaultExport,
  serializeToJson,
  parseVaultImport,
  applyImportedSettings,
  VaultSnapshot,
} from './vaultExport';
import { VAULT_EXPORT_SCHEMA_VERSION } from '../types/VaultExport';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

const sampleVaults: VaultSnapshot[] = [
  {
    vaultId: 1,
    creator: 'SP1ABC',
    amount: 5000,
    unlockHeight: 100,
    createdAt: 10,
    isWithdrawn: false,
    currentBlockHeight: 50,
  },
  {
    vaultId: 2,
    creator: 'SP2DEF',
    amount: 1000,
    unlockHeight: 200,
    createdAt: 20,
    isWithdrawn: true,
    currentBlockHeight: 50,
  },
];

describe('serializeVaultExport', () => {
  it('produces a document with the current schema version', () => {
    const data = serializeVaultExport(sampleVaults);
    expect(data.schemaVersion).toBe(VAULT_EXPORT_SCHEMA_VERSION);
  });

  it('sets exportedAt to an ISO-8601 date string', () => {
    const data = serializeVaultExport(sampleVaults);
    expect(() => new Date(data.exportedAt)).not.toThrow();
    expect(data.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('includes all vaults', () => {
    const data = serializeVaultExport(sampleVaults);
    expect(data.vaults).toHaveLength(2);
  });

  it('includes vault fields correctly', () => {
    const data = serializeVaultExport(sampleVaults);
    const v = data.vaults.find((x) => x.vaultId === 1)!;
    expect(v.creator).toBe('SP1ABC');
    expect(v.amount).toBe(5000);
    expect(v.isWithdrawn).toBe(false);
  });

  it('reads settings from localStorage for each vault', () => {
    localStorageMock.setItem(
      'flut:vault-settings:1',
      JSON.stringify({ nickname: 'My Fund', note: '', colorTag: 'blue', compactDisplay: false, pinned: false })
    );
    const data = serializeVaultExport(sampleVaults);
    const v = data.vaults.find((x) => x.vaultId === 1)!;
    expect(v.settings.nickname).toBe('My Fund');
    expect(v.settings.colorTag).toBe('blue');
  });

  it('uses default settings for vaults without stored settings', () => {
    const data = serializeVaultExport(sampleVaults);
    const v = data.vaults.find((x) => x.vaultId === 2)!;
    expect(v.settings.nickname).toBe('');
    expect(v.settings.colorTag).toBe('none');
  });
});

describe('serializeToJson', () => {
  it('returns a parseable JSON string', () => {
    const data = serializeVaultExport(sampleVaults);
    const json = serializeToJson(data);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('pretty-prints with 2-space indent', () => {
    const data = serializeVaultExport(sampleVaults);
    const json = serializeToJson(data);
    expect(json).toContain('\n  ');
  });
});

describe('parseVaultImport', () => {
  it('returns ok:true for a valid document', () => {
    const data = serializeVaultExport(sampleVaults);
    const json = serializeToJson(data);
    const result = parseVaultImport(json);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false for non-JSON input', () => {
    const result = parseVaultImport('not json {{{}}}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('JSON');
  });

  it('returns ok:false when vaults array is missing', () => {
    const result = parseVaultImport(JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString() }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('vaults');
  });

  it('returns ok:false when schemaVersion is missing', () => {
    const result = parseVaultImport(JSON.stringify({ exportedAt: new Date().toISOString(), vaults: [] }));
    expect(result.ok).toBe(false);
  });

  it('returns ok:false for a newer schema version', () => {
    const result = parseVaultImport(JSON.stringify({
      schemaVersion: VAULT_EXPORT_SCHEMA_VERSION + 1,
      exportedAt: new Date().toISOString(),
      vaults: [],
    }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('newer version');
  });
});

describe('applyImportedSettings', () => {
  it('writes each vault settings to localStorage', () => {
    const data = serializeVaultExport(sampleVaults);
    const count = applyImportedSettings(data);
    expect(count).toBe(sampleVaults.length);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(sampleVaults.length);
  });
});
