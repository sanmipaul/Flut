'use client';

import Link from 'next/link';

export function AnalyticsEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 py-20 text-center space-y-4 px-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-zinc-800">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No vault data yet</p>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
          Create your first vault to start tracking analytics. Your portfolio stats will appear here.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Create a Vault
      </Link>
    </div>
  );
}
