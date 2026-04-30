import React from 'react';
import type { ValidationResult } from '../utils/validation';

interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  validation?: ValidationResult;
  required?: boolean;
  helpText?: string;
}

export function FormField({ 
  id, 
  label, 
  children, 
  validation, 
  required = false,
  helpText 
}: FormFieldProps) {
  const hasError = validation && !validation.isValid;
  
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      
      <div className={`form-input-wrapper ${hasError ? 'has-error' : ''}`}>
        {children}
      </div>
      
      {helpText && !hasError && (
        <span className="form-help-text">{helpText}</span>
      )}
      
      {hasError && validation?.errors.map((error, index) => (
        <span key={index} className="form-error-text" role="alert">
          {error}
        </span>
      ))}
    </div>
  );
}
