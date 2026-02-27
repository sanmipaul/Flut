import { useState, useCallback } from 'react';
import {
  validateAddress,
  AddressValidationResult,
  normalizeAddress,
} from '../utils/StacksAddressUtils';

const EMPTY_RESULT: AddressValidationResult = {
  isValid: false,
  errorMessage: '',
  network: null,
  normalised: '',
};

export interface UseAddressValidationReturn {
  value: string;
  validation: AddressValidationResult;
  isDirty: boolean;
  handleChange: (raw: string) => void;
  handleBlur: () => void;
  reset: () => void;
}

/**
 * Manages address field state together with its validation result.
 * Normalises (trims + uppercases) the value on blur.
 *
 * @param initialValue - Optional starting value
 */
export function useAddressValidation(initialValue: string = ''): UseAddressValidationReturn {
  const [value, setValue] = useState<string>(initialValue);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const validation: AddressValidationResult = value.trim()
    ? validateAddress(value)
    : EMPTY_RESULT;

  const handleChange = useCallback((raw: string) => {
    setValue(raw);
    setIsDirty(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsDirty(true);
    if (value.trim()) {
      const normalised = normalizeAddress(value);
      if (normalised !== value) {
        setValue(normalised);
      }
    }
  }, [value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setIsDirty(false);
  }, [initialValue]);

  return { value, validation, isDirty, handleChange, handleBlur, reset };
}

export default useAddressValidation;
