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
import { useLiveAnnouncer } from '../hooks/useLiveAnnouncer';

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
  const { message: announcement, announce } = useLiveAnnouncer();

  useEffect(() => {
    if (!touched) return;

    const parsed = parseStxInput(value);

    if (value === '' || value === undefined) {
      setError('');
      onParsed?.(NaN);
      return;
    }

    if (isNaN(parsed)) {
      setError('Enter a valid number (e.g. 100, 1.5, 2k, 1M)');
      onParsed?.(NaN);
      announce('Error: Enter a valid number', 'polite');
      return;
    }

    if (parsed < min) {
      const minAmount = formatStx(min, { decimals: 0 });
      setError(`Minimum amount is ${minAmount}`);
      onParsed?.(NaN);
      announce(`Error: Minimum amount is ${minAmount}`, 'polite');
      return;
    }

    if (max !== undefined && parsed > max) {
      const maxAmount = formatStx(max, { decimals: 0 });
      setError(`Maximum amount is ${maxAmount}`);
      onParsed?.(NaN);
      announce(`Error: Maximum amount is ${maxAmount}`, 'polite');
      return;
    }

    setError('');
    onParsed?.(parsed);
    announce(`Valid amount: ${formatStx(parsed, { decimals: 2 })} STX`, 'polite');
  }, [value, touched, min, max, onParsed, announce]);

  const inputId = id ?? 'stx-amount-input';
  const errorId = `${inputId}-error`;
  const hasValue = value !== '' && value !== undefined;
  const isValid = hasValue && !error;

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
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
    </>
  );
};

export default StxAmountInput;
