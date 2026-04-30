/**
 * ValidatedInput
 *
 * A controlled text input with built-in validation and screen reader support.
 * Uses useValidatedInput hook for validation logic and useLiveAnnouncer for
 * accessibility announcements.
 *
 * Props:
 *   id          – unique identifier for the input
 *   label       – label text shown above the input
 *   validator   – validation function that returns ValidationResult
 *   placeholder – placeholder text (optional)
 *   required    – whether the field is required (default: false)
 *   helpText    – helper text shown below the input (optional)
 *   type        – input type: text, number, or password (default: text)
 *   enableAnnouncements – enable screen reader announcements (default: true)
 */
import React, { useEffect } from 'react';
import { FormField } from './FormField';
import { useValidatedInput } from '../hooks/useValidatedInput';
import { useLiveAnnouncer } from '../hooks/useLiveAnnouncer';
import type { Validator } from '../utils/validation';

interface ValidatedInputProps {
  id: string;
  label: string;
  validator: Validator<string>;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  type?: 'text' | 'number' | 'password';
  /** Enable screen reader announcements for validation changes (default: true) */
  enableAnnouncements?: boolean;
}

export function ValidatedInput({
  id,
  label,
  validator,
  placeholder,
  required = false,
  helpText,
  type = 'text',
  enableAnnouncements = true,
}: ValidatedInputProps) {
  const { value, setValue, validation, handleBlur } = useValidatedInput({
    initialValue: '',
    validator,
    validateOnBlur: true,
  });
  const { message: announcement, announce } = useLiveAnnouncer();
  
  useEffect(() => {
    if (!enableAnnouncements) return;
    
    if (!validation.isValid && validation.errors.length > 0) {
      const errorText = `Error: ${validation.errors.join('. ')}`;
      announce(errorText, 'polite');
    } else if (validation.isValid && value !== '') {
      announce('Input is valid', 'polite');
    }
  }, [validation, value, announce, enableAnnouncements]);
  
  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <FormField
        id={id}
        label={label}
        validation={validation}
        required={required}
        helpText={helpText}
        showAnnouncement={enableAnnouncements}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-invalid={!validation.isValid}
          aria-describedby={!validation.isValid ? `${id}-error` : undefined}
        />
      </FormField>
    </>
  );
}
