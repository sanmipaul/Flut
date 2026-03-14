'use client';

interface Props {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}

export function CreateVaultError({ message, onRetry, onClose }: Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-5 py-4">
      {/* Error icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
        <svg
          className="h-8 w-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Transaction Failed</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs break-words">
          {message}
        </p>
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
