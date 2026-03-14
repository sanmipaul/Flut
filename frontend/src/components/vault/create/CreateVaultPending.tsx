'use client';

export function CreateVaultPending() {
  return (
    <div className="flex flex-col items-center text-center space-y-5 py-6">
      {/* Spinner */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-900/30" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
        <svg
          className="h-6 w-6 text-brand-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Creating Vault…</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Please sign the transaction in your wallet.
        </p>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
        Do not close this window. The transaction will be broadcast once you approve it.
      </p>
    </div>
  );
}
