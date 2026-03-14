'use client';

import { CONTRACT_ADDRESS } from '@/lib/stacks';

/**
 * Renders a sticky banner when the contract address env var is not set.
 * Only visible in the browser — safe to render on all pages.
 */
export function MissingConfigBanner() {
  if (CONTRACT_ADDRESS && CONTRACT_ADDRESS.trim() !== '') return null;

  return (
    <div className="sticky top-14 z-40 w-full bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span>
          <strong>Config missing:</strong> Set{' '}
          <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code>{' '}
          in <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">.env.local</code> to connect to the contract.
        </span>
      </div>
    </div>
  );
}
