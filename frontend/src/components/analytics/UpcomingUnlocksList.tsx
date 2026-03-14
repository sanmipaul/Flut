'use client';

import Link from 'next/link';
import type { Vault } from '@/types/vault';
import { blocksRemaining } from '@/types/vault';
import { formatBlockDuration } from '@/lib/stacks';
import { microToStx } from '@/lib/stacks';

interface UpcomingUnlocksListProps {
  vaults: Vault[];
  currentBlock: number;
  limit?: number;
}

export function UpcomingUnlocksList({ vaults, currentBlock, limit = 5 }: UpcomingUnlocksListProps) {
  const locked = vaults
    .filter((v) => !v.isWithdrawn && currentBlock < v.unlockHeight)
    .sort((a, b) => blocksRemaining(a, currentBlock) - blocksRemaining(b, currentBlock))
    .slice(0, limit);

  if (locked.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Upcoming Unlocks</p>
      </div>
      <ul className="divide-y divide-gray-50 dark:divide-zinc-800">
        {locked.map((vault, idx) => {
          const remaining = blocksRemaining(vault, currentBlock);
          const isFirst = idx === 0;
          return (
            <li key={vault.vaultId} className="flex items-center justify-between px-5 py-3 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {isFirst && (
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                )}
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  <Link href={`/vault/${vault.vaultId}`} className="hover:text-brand-500 transition-colors">
                    #{vault.vaultId}
                  </Link>
                  {vault.label && (
                    <span className="ml-1.5 text-gray-400 dark:text-zinc-500">{vault.label}</span>
                  )}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {formatBlockDuration(remaining)}
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  {microToStx(vault.amount).toFixed(2)} STX
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
