import React, { useEffect, useState } from 'react';
import { FormField } from './FormField';
import { useValidatedInput } from '../hooks/useValidatedInput';
import type { Validator } from '../utils/validation';

interface ValidatedInputProps {
  id: string;
  label: string;
  validator: Validator<string>;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  type?: 'text' | 'number' | 'password';
}

export function ValidatedInput({
  id,
  label,
  validator,
  placeholder,
  required = false,
  helpText,
  type = 'text'
}: ValidatedInputProps) {
  const { value, setValue, validation, handleBlur } = useValidatedInput({
    initialValue: '',
    validator,
    validateOnBlur: true
  });
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    if (!validation.isValid && validation.errors.length > 0) {
      const errorText = `Error: ${validation.errors.join('. ')}`;
      setAnnouncement(errorText);
    } else if (validation.isValid && value !== '') {
      setAnnouncement('Input is valid');
    } else {
      setAnnouncement('');
    }
  }, [validation, value]);
  
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

export function ValidatedInput({
  id,
  label,
  validator,
  placeholder,
  required = false,
  helpText,
  type = 'text'
}: ValidatedInputProps) {
  const { value, setValue, validation, handleBlur } = useValidatedInput({
    initialValue: '',
    validator,
    validateOnBlur: true
  });
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    if (!validation.isValid && validation.errors.length > 0) {
      const errorText = `Error: ${validation.errors.join('. ')}`;
      setAnnouncement(errorText);
    } else if (validation.isValid && value !== '') {
      setAnnouncement('Input is valid');
    } else {
      setAnnouncement('');
    }
  }, [validation, value]);
  
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