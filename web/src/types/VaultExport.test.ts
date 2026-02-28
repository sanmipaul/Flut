import {
  VAULT_EXPORT_SCHEMA_VERSION,
  VAULT_EXPORT_MIME_TYPE,
  VAULT_EXPORT_FILENAME,
} from './VaultExport';

describe('VaultExport constants', () => {
  it('VAULT_EXPORT_SCHEMA_VERSION is a positive integer', () => {
    expect(typeof VAULT_EXPORT_SCHEMA_VERSION).toBe('number');
    expect(VAULT_EXPORT_SCHEMA_VERSION).toBeGreaterThan(0);
    expect(Number.isInteger(VAULT_EXPORT_SCHEMA_VERSION)).toBe(true);
  });

  it('VAULT_EXPORT_MIME_TYPE is application/json', () => {
    expect(VAULT_EXPORT_MIME_TYPE).toBe('application/json');
  });

  it('VAULT_EXPORT_FILENAME ends with .json', () => {
    expect(VAULT_EXPORT_FILENAME).toMatch(/\.json$/);
  });

  it('VAULT_EXPORT_FILENAME starts with flut', () => {
    expect(VAULT_EXPORT_FILENAME).toMatch(/^flut/);
  });
});
