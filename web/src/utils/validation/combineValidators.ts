import type { ValidationResult, Validator } from './validationTypes';

export function combineValidators<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T): ValidationResult => {
    const allErrors: string[] = [];
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  };
}

export function createRequiredValidator<T>(message = 'This field is required'): Validator<T> {
  return (value: T): ValidationResult => {
    const isEmpty = value === null || value === undefined || 
                  (typeof value === 'string' && value.trim() === '');
    
    return {
      isValid: !isEmpty,
      errors: isEmpty ? [message] : []
    };
  };
}
