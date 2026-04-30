import { useState, useCallback, useMemo } from 'react';
import type { ValidationResult, Validator } from '../utils/validation';

interface UseValidatedInputOptions<T> {
  initialValue: T;
  validator: Validator<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseValidatedInputReturn<T> {
  value: T;
  setValue: (value: T) => void;
  validation: ValidationResult;
  isDirty: boolean;
  isTouched: boolean;
  handleBlur: () => void;
  reset: () => void;
}

export function useValidatedInput<T>({
  initialValue,
  validator,
  validateOnChange = false,
  validateOnBlur = true
}: UseValidatedInputOptions<T>): UseValidatedInputReturn<T> {
  const [value, setValueState] = useState<T>(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  
  const validation = useMemo(() => validator(value), [value, validator]);
  
  const setValue = useCallback((newValue: T) => {
    setValueState(newValue);
    setIsDirty(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setIsTouched(true);
  }, []);
  
  const reset = useCallback(() => {
    setValueState(initialValue);
    setIsDirty(false);
    setIsTouched(false);
  }, [initialValue]);
  
  const effectiveValidation: ValidationResult = useMemo(() => {
    if (!validateOnChange && !isTouched) {
      return { isValid: true, errors: [] };
    }
    return validation;
  }, [validation, validateOnChange, isTouched]);
  
  return {
    value,
    setValue,
    validation: effectiveValidation,
    isDirty,
    isTouched,
    handleBlur,
    reset
  };
}
