import { combineValidators, createRequiredValidator } from './combineValidators';
import type { ValidationResult } from './validationTypes';

describe('combineValidators', () => {
  const minLength = (min: number) => (value: string): ValidationResult => ({
    isValid: value.length >= min,
    errors: value.length < min ? [`Min length is ${min}`] : []
  });

  const containsUppercase = (value: string): ValidationResult => ({
    isValid: /[A-Z]/.test(value),
    errors: /[A-Z]/.test(value) ? [] : ['Must contain uppercase']
  });

  it('returns valid when all validators pass', () => {
    const validator = combineValidators(minLength(3), containsUppercase);
    const result = validator('ABC');
    expect(result.isValid).toBe(true);
  });

  it('aggregates errors from all failing validators', () => {
    const validator = combineValidators(minLength(5), containsUppercase);
    const result = validator('abc');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Min length is 5');
    expect(result.errors).toContain('Must contain uppercase');
  });
});

describe('createRequiredValidator', () => {
  it('fails for empty string', () => {
    const validator = createRequiredValidator();
    expect(validator('').isValid).toBe(false);
  });

  it('fails for whitespace only', () => {
    const validator = createRequiredValidator();
    expect(validator('   ').isValid).toBe(false);
  });

  it('fails for null', () => {
    const validator = createRequiredValidator();
    expect(validator(null as unknown as string).isValid).toBe(false);
  });

  it('passes for non-empty string', () => {
    const validator = createRequiredValidator();
    expect(validator('value').isValid).toBe(true);
  });
});
