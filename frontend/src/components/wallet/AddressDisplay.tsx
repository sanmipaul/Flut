'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface AddressDisplayProps {
  address: string;
  truncated?: string;
  className?: string;
}

export function AddressDisplay({ address, truncated, className }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[AddressDisplay] Failed to copy address to clipboard:', err);
    }
  }

  return (
    <button
      onClick={copy}
      title={address}
      aria-label={copied ? 'Copied!' : 'Copy address'}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono',
        'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300',
        'hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors',
        className,
      )}
    >
      {truncated ?? address}
      <span aria-hidden="true">
        {copied ? (
          <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </span>
    </button>
  );
}
