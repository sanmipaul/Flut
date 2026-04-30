import { useState, useCallback, useMemo } from 'react';
import type { ValidationResult } from '../utils/validation';

type FieldValidators<T> = {
  [K in keyof T]: (value: T[K]) => ValidationResult;
};

interface UseFormValidationOptions<T> {
  initialValues: T;
  validators: FieldValidators<T>;
}

interface UseFormValidationReturn<T> {
  values: T;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  validations: { [K in keyof T]: ValidationResult };
  isValid: boolean;
  isDirty: boolean;
  reset: () => void;
}

export function useFormValidation<T extends Record<string, unknown>>({
  initialValues,
  validators
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [dirtyFields, setDirtyFields] = useState<Set<keyof T>>(new Set());
  
  const validations = useMemo(() => {
    const result = {} as { [K in keyof T]: ValidationResult };
    for (const key in validators) {
      result[key] = validators[key](values[key]);
    }
    return result;
  }, [values, validators]);
  
  const isValid = useMemo(() => {
    return Object.values(validations).every(v => v.isValid);
  }, [validations]);
  
  const isDirty = dirtyFields.size > 0;
  
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setDirtyFields(prev => new Set(prev).add(field));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setDirtyFields(new Set());
  }, [initialValues]);
  
  return {
    values,
    setFieldValue,
    validations,
    isValid,
    isDirty,
    reset
  };
}
