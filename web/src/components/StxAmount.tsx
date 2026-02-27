/**
 * StxAmount
 *
 * A semantic display component for STX amounts. Renders the amount
 * inside a <span> with the machine-readable value in a `data-amount`
 * attribute for testing and accessibility.
 *
 * Props:
 *   amount      – the value in STX (or microSTX if fromMicroStx=true)
 *   compact     – show compact notation: 1.2M STX (default: false)
 *   fromMicroStx – treat amount as microSTX (default: false)
 *   decimals    – decimal places (default: 2)
 *   showSymbol  – show STX suffix (default: true)
 *   className   – additional CSS classes
 *   highlight   – apply a coloured highlight variant: "positive" | "negative" | "warning"
 */
import React from 'react';
import { useStxFormat } from '../hooks/useStxFormat';

export type StxAmountHighlight = 'positive' | 'negative' | 'warning' | 'neutral';

export interface StxAmountProps {
  amount: number;
  compact?: boolean;
  fromMicroStx?: boolean;
  decimals?: number;
  showSymbol?: boolean;
  className?: string;
  highlight?: StxAmountHighlight;
}

const StxAmount: React.FC<StxAmountProps> = ({
  amount,
  compact = false,
  fromMicroStx = false,
  decimals = 2,
  showSymbol = true,
  className = '',
  highlight = 'neutral',
}) => {
  const { fmt, fmtMicro } = useStxFormat();

  const displayValue = fromMicroStx
    ? fmtMicro(amount, showSymbol)
    : fmt(amount, { compact, decimals, showSymbol });

  const highlightClass = highlight !== 'neutral' ? `stx-amount--${highlight}` : '';

  return (
    <span
      className={`stx-amount ${highlightClass} ${className}`.trim()}
      data-amount={amount}
      data-unit={fromMicroStx ? 'microstx' : 'stx'}
    >
      {displayValue}
    </span>
  );
};

export default StxAmount;
