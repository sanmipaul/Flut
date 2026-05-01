import { useState, useCallback, useMemo } from 'react';
import type { ValidationResult, ValidationResultWithAnnouncement } from '../utils/validation';

type FieldValidators<T> = {
  [K in keyof T]: (value: T[K]) => ValidationResult;
};

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validators: FieldValidators<T>;
  /** Enable screen reader announcements for validation changes (default: false) */
  enableAnnouncements?: boolean;
}

export interface UseFormValidationReturn<T> {
  values: T;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  validations: { [K in keyof T]: ValidationResultWithAnnouncement };
  isValid: boolean;
  isDirty: boolean;
  reset: () => void;
}

/**
 * Form validation hook with optional screen reader announcement support
 *
 * @example
 * const { values, setFieldValue, validations, isValid } = useFormValidation({
 *   initialValues: { email: '', password: '' },
 *   validators: {
 *     email: (v) => ({ isValid: v.includes('@'), errors: v.includes('@') ? [] : ['Invalid email'] }),
 *     password: (v) => ({ isValid: v.length >= 8, errors: v.length >= 8 ? [] : ['Min 8 chars'] }),
 *   },
 *   enableAnnouncements: true,
 * });
 */
export function useFormValidation<T extends Record<string, unknown>>({
  initialValues,
  validators,
  enableAnnouncements = false,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [dirtyFields, setDirtyFields] = useState<Set<keyof T>>(new Set());

  const validations = useMemo(() => {
    const result = {} as { [K in keyof T]: ValidationResultWithAnnouncement };
    for (const key in validators) {
      const validation = validators[key](values[key]);
      result[key] = {
        ...validation,
        shouldAnnounce: enableAnnouncements && !validation.isValid,
        announcement: enableAnnouncements && !validation.isValid
          ? `Error in ${String(key)}: ${validation.errors.join('. ')}`
          : undefined,
      };
    }
    return result;
  }, [values, validators, enableAnnouncements]);

  const isValid = useMemo(() => {
    return Object.values(validations).every((v) => v.isValid);
  }, [validations]);

  const isDirty = dirtyFields.size > 0;

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setDirtyFields((prev) => new Set(prev).add(field));
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
    reset,
  };
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
