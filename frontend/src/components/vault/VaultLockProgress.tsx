'use client';

import { clsx } from 'clsx';
import { blocksRemaining, type Vault } from '@/types/vault';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface VaultLockProgressProps {
  vault: Vault;
  currentBlock: number;
}

export function VaultLockProgress({ vault, currentBlock }: VaultLockProgressProps) {
  const reducedMotion = useReducedMotion();
  const totalBlocks = vault.unlockHeight - vault.createdAt;
  const elapsed = Math.max(0, currentBlock - vault.createdAt);
  const pct = totalBlocks > 0 ? Math.min(100, (elapsed / totalBlocks) * 100) : 100;
  const remaining = blocksRemaining(vault, currentBlock);
  const isComplete = pct >= 100;

  // Rough date estimate: ~10 min per block
  const msLeft = remaining * 10 * 60 * 1000;
  const unlockDate = new Date(Date.now() + msLeft);
  const dateLabel = remaining > 0
    ? unlockDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Now';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Lock progress</span>
        <span>{pct.toFixed(1)}%</span>
      </div>

      {/* Track */}
      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full',
            !reducedMotion && 'transition-all duration-500',
            isComplete ? 'bg-green-500' : 'bg-brand-500',
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Vault lock progress"
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 dark:text-gray-500">
          Block {vault.createdAt.toLocaleString()}
        </span>
        <span className={clsx(isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400')}>
          {isComplete ? 'Unlocked' : `~${dateLabel} · ${remaining.toLocaleString()} blocks`}
        </span>
      </div>
    </div>
  );
}
