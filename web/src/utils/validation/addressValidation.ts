import type { ValidationResult } from './validationTypes';

const STACKS_ADDRESS_REGEX = /^S[PTM][A-Z0-9]{38,41}$/;

export function validateStacksAddress(address: string): ValidationResult {
  const errors: string[] = [];
  
  if (!address || address.trim() === '') {
    errors.push('Address is required');
    return { isValid: false, errors };
  }
  
  const trimmedAddress = address.trim();
  
  if (!STACKS_ADDRESS_REGEX.test(trimmedAddress)) {
    errors.push('Invalid Stacks address format. Address must start with S followed by P, T, or M');
  }
  
  if (trimmedAddress.length < 40 || trimmedAddress.length > 43) {
    errors.push('Address length must be between 40 and 43 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
