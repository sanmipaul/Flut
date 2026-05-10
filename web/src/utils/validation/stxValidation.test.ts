import { validateStxAmount, MIN_STX_AMOUNT, MAX_STX_AMOUNT } from './stxValidation';

describe('validateStxAmount', () => {
  it('returns error for empty string', () => {
    const result = validateStxAmount('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount is required');
  });

  it('returns error for whitespace only', () => {
    const result = validateStxAmount('   ');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount is required');
  });

  it('returns error for non-numeric input', () => {
    const result = validateStxAmount('abc');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be a valid number');
  });

  it('returns error for zero amount', () => {
    const result = validateStxAmount('0');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be greater than 0');
  });

  it('returns error for negative amount', () => {
    const result = validateStxAmount('-1');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Amount must be greater than 0');
  });

  it('returns error for amount below minimum', () => {
    const result = validateStxAmount('0.0000001');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(`Minimum amount is ${MIN_STX_AMOUNT} STX`);
  });

  it('returns error for amount above maximum', () => {
    const result = validateStxAmount('1000000001');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(`Maximum amount is ${MAX_STX_AMOUNT} STX`);
  });

  it('passes for minimum amount', () => {
    const result = validateStxAmount('0.000001');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes for regular amount', () => {
    const result = validateStxAmount('100');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes for decimal amount', () => {
    const result = validateStxAmount('10.5');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
