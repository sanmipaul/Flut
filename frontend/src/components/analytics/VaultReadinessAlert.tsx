'use client';

import Link from 'next/link';
import type { Vault } from '@/types/vault';
import { getVaultStatus } from '@/types/vault';
import { microToStx } from '@/lib/stacks';

interface VaultReadinessAlertProps {
  vaults: Vault[];
  currentBlock: number;
}

export function VaultReadinessAlert({ vaults, currentBlock }: VaultReadinessAlertProps) {
  const ready = vaults.filter((v) => getVaultStatus(v, currentBlock) === 'unlocked');
  if (ready.length === 0) return null;

  const totalStx = microToStx(ready.reduce((s, v) => s + v.amount, 0));

  return (
    <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-5 py-4 flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
          <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
          {ready.length} vault{ready.length > 1 ? 's' : ''} ready to withdraw
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
          {totalStx.toFixed(2)} STX unlocked across{' '}
          {ready.length > 3
            ? `${ready.slice(0, 3).map((v) => `#${v.vaultId}`).join(', ')} and ${ready.length - 3} more`
            : ready.map((v) => `#${v.vaultId}`).join(', ')}
        </p>
      </div>
      <Link
        href="/"
        className="shrink-0 text-xs font-semibold text-green-700 dark:text-green-300 hover:underline"
      >
        Go to Dashboard →
      </Link>
    </div>
  );
}
