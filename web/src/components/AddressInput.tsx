/**
 * AddressInput
 *
 * A controlled text input designed specifically for entering Stacks (STX)
 * addresses.  It validates the value on every keystroke and provides:
 *
 * - Real-time error messages explaining *why* the address is invalid.
 * - A visual checkmark / cross icon inside the field.
 * - A colour-coded "Mainnet" or "Testnet" badge when the address is valid.
 * - Auto-normalisation (trim + uppercase) on blur.
 * - Full accessibility attributes (aria-invalid, aria-required, aria-describedby).
 *
 * The component does NOT manage its own value — the caller controls `value`
 * and receives updates through the `onChange` callback, which also forwards
 * the full `AddressValidationResult` so that the parent can react to
 * validity changes without re-running the validation itself.
 */
import React, { useState, useCallback } from 'react';
import {
  validateAddress,
  AddressValidationResult,
  normalizeAddress,
} from '../utils/StacksAddressUtils';

export interface AddressInputProps {
  id: string;
  value: string;
  onChange: (value: string, validation: AddressValidationResult) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  helpText?: string;
  required?: boolean;
  /** When true the field is only validated once the user leaves the input */
  validateOnBlur?: boolean;
}

const EMPTY_RESULT: AddressValidationResult = {
  isValid: false,
  errorMessage: '',
  network: null,
  normalised: '',
};

const AddressInput: React.FC<AddressInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'SP… or ST…',
  disabled = false,
  label,
  helpText = 'Stacks address starting with SP (mainnet) or ST (testnet)',
  required = false,
  validateOnBlur = false,
}) => {
  const [touched, setTouched] = useState(false);

  const validation: AddressValidationResult = value.trim()
    ? validateAddress(value)
    : EMPTY_RESULT;

  const showValidation = touched || !validateOnBlur;
  const showError =
    showValidation && value.trim() !== '' && !validation.isValid;
  const showSuccess = showValidation && validation.isValid;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const result = raw.trim() ? validateAddress(raw) : EMPTY_RESULT;
      onChange(raw, result);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (value.trim()) {
      const normalised = normalizeAddress(value);
      if (normalised !== value) {
        const result = validateAddress(normalised);
        onChange(normalised, result);
      }
    }
  }, [value, onChange]);

  const inputClasses = [
    showError && 'address-input-invalid',
    showSuccess && 'address-input-valid',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <div className="address-input-wrapper">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className={inputClasses}
          aria-describedby={`${id}-hint`}
          aria-required={required ? 'true' : undefined}
          aria-invalid={showError ? 'true' : undefined}
        />
        {showSuccess && (
          <span className="address-validation-icon" aria-hidden="true">
            ✓
          </span>
        )}
        {showError && (
          <span className="address-validation-icon" aria-hidden="true">
            ✕
          </span>
        )}
      </div>

      {showError && (
        <span className="address-error-text" role="alert" id={`${id}-hint`}>
          {validation.errorMessage}
        </span>
      )}

      {showSuccess && validation.network && (
        <span
          className={`network-badge ${validation.network}`}
          aria-label={`${validation.network} address`}
        >
          <span className="network-badge-dot" />
          {validation.network === 'mainnet' ? 'Mainnet' : 'Testnet'}
        </span>
      )}

      {!showError && !showSuccess && helpText && (
        <span className="address-help-text" id={`${id}-hint`}>
          {helpText}
        </span>
      )}
    </div>
  );
};

export default AddressInput;
