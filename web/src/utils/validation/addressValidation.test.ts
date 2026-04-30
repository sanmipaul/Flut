import { validateStacksAddress } from './addressValidation';

describe('validateStacksAddress', () => {
  it('returns error for empty string', () => {
    const result = validateStacksAddress('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Address is required');
  });

  it('returns error for invalid prefix', () => {
    const result = validateStacksAddress('SP123');
    expect(result.isValid).toBe(false);
  });

  it('returns error for address without correct length', () => {
    const result = validateStacksAddress('SP123456789');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Address length must be between 40 and 43 characters');
  });

  it('passes for valid mainnet address (SP)', () => {
    const result = validateStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV8E63');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes for valid testnet address (ST)', () => {
    const result = validateStacksAddress('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('handles whitespace by trimming', () => {
    const result = validateStacksAddress('  SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV8E63  ');
    expect(result.isValid).toBe(true);
  });
});
