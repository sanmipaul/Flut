'use client';

import { explorerUrl } from '@/lib/stacks';

interface Props {
  vaultId: number | null;
  txid: string | null;
  onDone: () => void;
}

export function CreateVaultSuccess({ vaultId, txid, onDone }: Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-5 py-4">
      {/* Success icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/20">
        <svg
          className="h-8 w-8 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Vault Created!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your vault has been submitted to the network.
        </p>
      </div>

      {/* Details */}
      <div className="w-full rounded-xl bg-gray-50 dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700 text-sm text-left">
        {vaultId != null && (
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-gray-500 dark:text-gray-400">Vault ID</span>
            <span className="font-mono font-medium text-gray-900 dark:text-white">#{vaultId}</span>
          </div>
        )}
        {txid && (
          <div className="flex justify-between items-center px-4 py-2.5 gap-3">
            <span className="text-gray-500 dark:text-gray-400 shrink-0">Transaction</span>
            <a
              href={explorerUrl('txid', txid)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-brand-500 hover:text-brand-700 truncate"
            >
              {txid.slice(0, 16)}…{txid.slice(-8)}
            </a>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        It may take 1–2 blocks for the vault to appear in your dashboard.
      </p>

      <button
        onClick={onDone}
        className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
