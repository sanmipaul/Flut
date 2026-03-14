'use client';

import { explorerUrl } from '@/lib/stacks';

interface TxPendingBannerProps {
  txid: string;
  label?: string;
  onDismiss?: () => void;
}

/**
 * Shows a dismissible "transaction pending" bar with an explorer link.
 * Designed to be placed just below the vault detail header.
 */
export function TxPendingBanner({ txid, label = 'Transaction submitted', onDismiss }: TxPendingBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800 px-4 py-2.5 text-xs">
      {/* Spinner */}
      <svg className="w-4 h-4 text-brand-500 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>

      <span className="flex-1 text-brand-700 dark:text-brand-300 font-medium">{label}</span>

      <a
        href={explorerUrl('txid', txid)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-500 hover:text-brand-700 underline underline-offset-2 shrink-0"
      >
        View on Explorer
      </a>

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-brand-400 hover:text-brand-600 shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
