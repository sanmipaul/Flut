'use client';

interface EmptyVaultStateProps {
  onCreateClick?: () => void;
}

export function EmptyVaultState({ onCreateClick }: EmptyVaultStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center select-none">
      {/* Animated lock icon */}
      <div className="mb-4 relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rounded-2xl bg-brand-100 dark:bg-brand-900/20 animate-pulse" />
        <svg
          className="relative h-7 w-7 text-brand-400 dark:text-brand-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>

      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No vaults yet</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[160px]">
        Create your first time-locked vault to start saving.
      </p>

      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Vault
        </button>
      )}
    </div>
  );
}
