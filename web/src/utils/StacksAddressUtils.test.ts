/**
 * Unit tests for StacksAddressUtils
 *
 * These tests are written as plain assertions that can be run with any
 * test runner (Jest, Vitest, etc.) using only the standard `expect` API.
 */

import {
  isValidStacksAddress,
  getAddressNetwork,
  getAddressVersion,
  getAddressErrorMessage,
  truncateAddress,
  normalizeAddress,
  validateAddress,
  isMainnetAddress,
  isTestnetAddress,
  isMultiSigAddress,
  isSingleSigAddress,
  areAddressesOnSameNetwork,
  ADDRESS_VERSIONS,
  MIN_ADDRESS_LENGTH,
  MAX_ADDRESS_LENGTH,
} from './StacksAddressUtils';

// ---------------------------------------------------------------------------
// isValidStacksAddress
// ---------------------------------------------------------------------------
describe('isValidStacksAddress', () => {
  it('accepts a well-formed mainnet SP address', () => {
    // 41 characters — within valid range
    expect(isValidStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(true);
  });

  it('accepts a well-formed testnet ST address', () => {
    expect(isValidStacksAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isValidStacksAddress('')).toBe(false);
  });

  it('rejects an address that does not start with S', () => {
    expect(isValidStacksAddress('ABCDE1234567890ABCDE1234567890ABCDE12345')).toBe(false);
  });

  it('rejects an address with an unknown second character', () => {
    expect(isValidStacksAddress('SX2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(false);
  });

  it('rejects an address that is too short', () => {
    expect(isValidStacksAddress('SP12345')).toBe(false);
  });

  it('rejects an address that is too long', () => {
    expect(isValidStacksAddress('SP' + 'A'.repeat(MAX_ADDRESS_LENGTH))).toBe(false);
  });

  it('rejects an address containing invalid c32 characters (lowercase)', () => {
    expect(isValidStacksAddress('SP2j6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(false);
  });

  it('accepts input with surrounding whitespace after trimming', () => {
    expect(isValidStacksAddress('  SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ  ')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getAddressNetwork
// ---------------------------------------------------------------------------
describe('getAddressNetwork', () => {
  it('identifies SP as mainnet', () => {
    expect(getAddressNetwork('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe('mainnet');
  });

  it('identifies SM as mainnet', () => {
    expect(getAddressNetwork('SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe('mainnet');
  });

  it('identifies ST as testnet', () => {
    expect(getAddressNetwork('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe('testnet');
  });

  it('identifies SN as testnet', () => {
    expect(getAddressNetwork('SN1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe('testnet');
  });

  it('returns null for an unrecognised prefix', () => {
    expect(getAddressNetwork('SX2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(getAddressNetwork('')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getAddressVersion
// ---------------------------------------------------------------------------
describe('getAddressVersion', () => {
  it('returns 22 for SP prefix', () => {
    expect(getAddressVersion('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(
      ADDRESS_VERSIONS['SP']
    );
  });

  it('returns 26 for ST prefix', () => {
    expect(getAddressVersion('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe(26);
  });

  it('returns null for unrecognised prefix', () => {
    expect(getAddressVersion('SZ12345678901234567890123456789012345678')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// truncateAddress
// ---------------------------------------------------------------------------
describe('truncateAddress', () => {
  const addr = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ';

  it('truncates a long address with default parameters', () => {
    const result = truncateAddress(addr);
    expect(result).toContain('…');
    expect(result.startsWith('SP2J6ZY4')).toBe(true);
    expect(result.endsWith('V9EJ')).toBe(true);
  });

  it('returns the full address when it is short enough', () => {
    const short = 'SP12345';
    expect(truncateAddress(short)).toBe(short);
  });

  it('returns empty string for falsy input', () => {
    expect(truncateAddress('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// normalizeAddress
// ---------------------------------------------------------------------------
describe('normalizeAddress', () => {
  it('converts lowercase to uppercase', () => {
    expect(normalizeAddress('sp2j6zy48gv1ez5v2v5rb9mp66sw86pykknrv9ej')).toBe(
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ'
    );
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeAddress('  SP2J6ZY48GV1EZ5  ')).toBe('SP2J6ZY48GV1EZ5');
  });

  it('returns empty string for falsy input', () => {
    expect(normalizeAddress('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// validateAddress
// ---------------------------------------------------------------------------
describe('validateAddress', () => {
  it('returns isValid true and network for a good address', () => {
    const result = validateAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ');
    expect(result.isValid).toBe(true);
    expect(result.network).toBe('mainnet');
    expect(result.errorMessage).toBe('');
  });

  it('returns isValid false with an error message for a bad address', () => {
    const result = validateAddress('not-an-address');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage.length).toBeGreaterThan(0);
    expect(result.network).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------
describe('address predicates', () => {
  it('isMainnetAddress returns true for SP', () => {
    expect(isMainnetAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(true);
  });

  it('isTestnetAddress returns true for ST', () => {
    expect(isTestnetAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBe(true);
  });

  it('isMultiSigAddress returns true for SM', () => {
    expect(isMultiSigAddress('SM2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(true);
  });

  it('isSingleSigAddress returns true for SP', () => {
    expect(isSingleSigAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// areAddressesOnSameNetwork
// ---------------------------------------------------------------------------
describe('areAddressesOnSameNetwork', () => {
  const mainnet1 = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ';
  const mainnet2 = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
  const testnet1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

  it('returns true for two mainnet addresses', () => {
    expect(areAddressesOnSameNetwork(mainnet1, mainnet2)).toBe(true);
  });

  it('returns false when one address is mainnet and one is testnet', () => {
    expect(areAddressesOnSameNetwork(mainnet1, testnet1)).toBe(false);
  });

  it('returns false when either address is invalid', () => {
    expect(areAddressesOnSameNetwork('invalid', mainnet1)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Boundary / length constants
// ---------------------------------------------------------------------------
describe('address length constants', () => {
  it('MIN_ADDRESS_LENGTH is a positive number', () => {
    expect(MIN_ADDRESS_LENGTH).toBeGreaterThan(0);
  });

  it('MAX_ADDRESS_LENGTH is greater than MIN_ADDRESS_LENGTH', () => {
    expect(MAX_ADDRESS_LENGTH).toBeGreaterThan(MIN_ADDRESS_LENGTH);
  });
});
