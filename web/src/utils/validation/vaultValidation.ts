import type { ValidationResult } from './validationTypes';

export const MIN_LOCK_DURATION = 1;
export const MAX_LOCK_DURATION = 525600; // ~1 year in blocks (10 min/block)

export function validateLockDuration(blocks: string): ValidationResult {
  const errors: string[] = [];
  
  if (!blocks || blocks.trim() === '') {
    errors.push('Lock duration is required');
    return { isValid: false, errors };
  }
  
  const numBlocks = parseInt(blocks, 10);
  
  if (isNaN(numBlocks)) {
    errors.push('Lock duration must be a valid number');
    return { isValid: false, errors };
  }
  
  if (numBlocks < MIN_LOCK_DURATION) {
    errors.push(`Minimum lock duration is ${MIN_LOCK_DURATION} block`);
  }
  
  if (numBlocks > MAX_LOCK_DURATION) {
    errors.push(`Maximum lock duration is ${MAX_LOCK_DURATION} blocks (~1 year)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateVaultName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name || name.trim() === '') {
    errors.push('Vault name is required');
    return { isValid: false, errors };
  }
  
  if (name.trim().length < 2) {
    errors.push('Vault name must be at least 2 characters');
  }
  
  if (name.trim().length > 50) {
    errors.push('Vault name must be less than 50 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
