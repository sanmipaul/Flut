/**
 * StxAmountInput
 *
 * A controlled text input for STX amounts with built-in validation.
 * Accepts decimal values (e.g. "1.5") and compact suffixes ("1.5k", "2M").
 *
 * Props:
 *   value       – raw string from user
 *   onChange    – receives new raw string
 *   onParsed    – receives parsed numeric STX value (NaN if invalid)
 *   min         – minimum allowed STX value (default: 0)
 *   max         – maximum allowed STX value
 *   disabled    – disables the input
 *   placeholder – input placeholder text
 *   id          – element id for <label> association
 */
import React, { useState, useEffect } from 'react';
import { parseStxInput, formatStx } from '../utils/formatStx';
import { STX_SYMBOL } from '../utils/stxConstants';

export interface StxAmountInputProps {
  value: string;
  onChange: (raw: string) => void;
  onParsed?: (stx: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}

const StxAmountInput: React.FC<StxAmountInputProps> = ({
  value,
  onChange,
  onParsed,
  min = 0,
  max,
  disabled = false,
  placeholder = `Amount in ${STX_SYMBOL}`,
  id,
  className = '',
}) => {
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!touched) return;

    const parsed = parseStxInput(value);

    if (value === '' || value === undefined) {
      setError('');
      onParsed?.(NaN);
      setAnnouncement('');
      return;
    }

    if (isNaN(parsed)) {
      setError('Enter a valid number (e.g. 100, 1.5, 2k, 1M)');
      onParsed?.(NaN);
      setAnnouncement('Error: Enter a valid number');
      return;
    }

    if (parsed < min) {
      setError(`Minimum amount is ${formatStx(min, { decimals: 0 })}`);
      onParsed?.(NaN);
      setAnnouncement(`Error: Minimum amount is ${formatStx(min, { decimals: 0 })}`);
      return;
    }

    if (max !== undefined && parsed > max) {
      setError(`Maximum amount is ${formatStx(max, { decimals: 0 })}`);
      onParsed?.(NaN);
      setAnnouncement(`Error: Maximum amount is ${formatStx(max, { decimals: 0 })}`);
      return;
    }

    setError('');
    onParsed?.(parsed);
    setAnnouncement(`Valid amount: ${formatStx(parsed, { decimals: 2 })} STX`);
  }, [value, touched, min, max, onParsed]);

  const inputId = id ?? 'stx-amount-input';
  const errorId = `${inputId}-error`;
  const hasValue = value !== '' && value !== undefined;
  const isValid = hasValue && !error;

  return (
    <div className={`stx-amount-input ${className} ${error ? 'stx-amount-input--invalid' : ''} ${isValid ? 'stx-amount-input--valid' : ''}`.trim()}>
      <div className="stx-amount-input__field">
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            setTouched(true);
            onChange(e.target.value);
          }}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          placeholder={placeholder}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={`stx-amount-input__text ${error ? 'stx-amount-input__text--error' : ''}`.trim()}
        />
        <span className="stx-amount-input__suffix" aria-hidden="true">
          {STX_SYMBOL}
        </span>
      </div>
      {error && (
        <p id={errorId} className="stx-amount-input__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default StxAmountInput;
