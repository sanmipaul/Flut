import type { ValidationResult } from './validationTypes';

export const MIN_STX_AMOUNT = 0.000001;
export const MAX_STX_AMOUNT = 1000000000;

export function validateStxAmount(amount: string): ValidationResult {
  const errors: string[] = [];
  
  if (!amount || amount.trim() === '') {
    errors.push('Amount is required');
    return { isValid: false, errors };
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    errors.push('Amount must be a valid number');
    return { isValid: false, errors };
  }
  
  if (numAmount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (numAmount < MIN_STX_AMOUNT) {
    errors.push(`Minimum amount is ${MIN_STX_AMOUNT} STX`);
  }
  
  if (numAmount > MAX_STX_AMOUNT) {
    errors.push(`Maximum amount is ${MAX_STX_AMOUNT} STX`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
