/**
 * CopyButton
 *
 * A small icon button that copies a given text string to the clipboard.
 * It reflects the current copy state visually:
 *
 *   idle    → clipboard icon, neutral style
 *   copied  → checkmark, green flash animation
 *   error   → warning icon, red tint
 *
 * After 2 seconds the button automatically returns to the idle state.
 *
 * Props:
 *   text     – the string to copy
 *   label    – accessible label (default "Copy to clipboard")
 *   size     – "sm" | "md" (default "sm")
 *   showText – whether to show a short label beside the icon (default false)
 *   onCopy   – optional callback invoked with (text, success) after each attempt
 */
import React from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

export type CopyButtonSize = 'sm' | 'md';

export interface CopyButtonProps {
  text: string;
  label?: string;
  size?: CopyButtonSize;
  showText?: boolean;
  className?: string;
  onCopy?: (text: string, success: boolean) => void;
  disabled?: boolean;
}

const ICONS: Record<string, string> = {
  idle: '⎘',
  copied: '✓',
  error: '✕',
};

const LABELS: Record<string, string> = {
  idle: 'Copy',
  copied: 'Copied!',
  error: 'Failed',
};

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy to clipboard',
  size = 'sm',
  showText = false,
  className = '',
  onCopy,
  disabled = false,
}) => {
  const { copyState, copy } = useCopyToClipboard();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    await copy(text);
    if (onCopy) {
      onCopy(text, copyState !== 'error');
    }
  };

  const stateClass = `copy-btn--${copyState}`;
  const sizeClass = `copy-btn--${size}`;

  return (
    <button
      type="button"
      className={`copy-btn ${stateClass} ${sizeClass} ${className}`.trim()}
      onClick={handleClick}
      aria-label={copyState === 'idle' ? label : LABELS[copyState]}
      title={copyState === 'idle' ? label : LABELS[copyState]}
      disabled={disabled}
    >
      <span className="copy-btn__icon" aria-hidden="true">
        {ICONS[copyState]}
      </span>
      {showText && (
        <span className="copy-btn__text">{LABELS[copyState]}</span>
      )}
    </button>
  );
};

export default CopyButton;
