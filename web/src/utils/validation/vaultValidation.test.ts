import { validateLockDuration, validateVaultName, MIN_LOCK_DURATION, MAX_LOCK_DURATION } from './vaultValidation';

describe('validateLockDuration', () => {
  it('returns error for empty string', () => {
    const result = validateLockDuration('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Lock duration is required');
  });

  it('returns error for non-numeric input', () => {
    const result = validateLockDuration('abc');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Lock duration must be a valid number');
  });

  it('returns error for duration below minimum', () => {
    const result = validateLockDuration('0');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(`Minimum lock duration is ${MIN_LOCK_DURATION} block`);
  });

  it('returns error for duration above maximum', () => {
    const result = validateLockDuration((MAX_LOCK_DURATION + 1).toString());
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(`Maximum lock duration is ${MAX_LOCK_DURATION} blocks (~1 year)`);
  });

  it('passes for minimum duration', () => {
    const result = validateLockDuration(MIN_LOCK_DURATION.toString());
    expect(result.isValid).toBe(true);
  });

  it('passes for valid duration', () => {
    const result = validateLockDuration('1000');
    expect(result.isValid).toBe(true);
  });
});

describe('validateVaultName', () => {
  it('returns error for empty string', () => {
    const result = validateVaultName('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Vault name is required');
  });

  it('returns error for name too short', () => {
    const result = validateVaultName('A');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Vault name must be at least 2 characters');
  });

  it('returns error for name too long', () => {
    const result = validateVaultName('A'.repeat(51));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Vault name must be less than 50 characters');
  });

  it('passes for valid name', () => {
    const result = validateVaultName('My Savings Vault');
    expect(result.isValid).toBe(true);
  });

  it('trims whitespace before validation', () => {
    const result = validateVaultName('  Valid Name  ');
    expect(result.isValid).toBe(true);
  });
});
