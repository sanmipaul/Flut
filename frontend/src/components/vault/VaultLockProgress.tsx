'use client';

import { clsx } from 'clsx';
import { blocksRemaining, type Vault } from '@/types/vault';
import { formatBlockDuration } from '@/lib/stacks';

interface VaultLockProgressProps {
  vault: Vault;
  currentBlock: number;
}

const MILESTONES = [25, 50, 75];

export function VaultLockProgress({ vault, currentBlock }: VaultLockProgressProps) {
  const totalBlocks = vault.unlockHeight - vault.createdAt;
  const elapsed = Math.max(0, currentBlock - vault.createdAt);
  const pct = totalBlocks > 0 ? Math.min(100, (elapsed / totalBlocks) * 100) : 100;
  const remaining = blocksRemaining(vault, currentBlock);
  const isComplete = pct >= 100;

  const msLeft = remaining * 10 * 60 * 1000;
  const unlockDate = new Date(Date.now() + msLeft);
  const dateLabel = remaining > 0
    ? unlockDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Now';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Lock progress</span>
        <span className={clsx('font-medium', isComplete ? 'text-green-600 dark:text-green-400' : 'text-brand-500')}>
          {pct.toFixed(1)}%
        </span>
      </div>

      {/* Track with milestone markers */}
      <div className="relative h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            isComplete ? 'bg-green-500' : 'bg-brand-500',
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Vault lock progress"
        />
        {/* Milestone tick marks */}
        {MILESTONES.map((m) => (
          <div
            key={m}
            className="absolute top-0 bottom-0 w-px bg-white/40 dark:bg-black/30"
            style={{ left: `${m}%` }}
          />
        ))}
      </div>

      {/* Milestone labels */}
      <div className="relative flex text-xs text-gray-300 dark:text-zinc-600 select-none">
        {MILESTONES.map((m) => (
          <span
            key={m}
            className="absolute -translate-x-1/2"
            style={{ left: `${m}%` }}
          >
            {m}%
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-gray-400 dark:text-gray-500">
          Created block {vault.createdAt.toLocaleString()}
        </span>
        <span className={clsx(isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400')}>
          {isComplete
            ? 'Unlocked'
            : `${formatBlockDuration(remaining)} · ${remaining.toLocaleString()} blocks · ~${dateLabel}`}
        </span>
      </div>
    </div>
  );
}
