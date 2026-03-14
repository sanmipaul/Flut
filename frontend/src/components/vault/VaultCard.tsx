'use client';

import { clsx } from 'clsx';
import { Badge } from '@/components/ui/Badge';
import { microToStx, formatBlockDuration } from '@/lib/stacks';
import { getVaultStatus, blocksRemaining, type Vault } from '@/types/vault';
import { useVaultLabel } from '@/hooks/useVaultLabel';

interface VaultCardProps {
  vault: Vault;
  currentBlock: number;
  active?: boolean;
  onClick?: () => void;
}

const statusConfig = {
  locked:    { badge: 'locked'    as const, label: 'Locked',    dot: 'bg-brand-400' },
  unlocked:  { badge: 'unlocked'  as const, label: 'Unlocked',  dot: 'bg-green-400' },
  withdrawn: { badge: 'default'   as const, label: 'Withdrawn', dot: 'bg-gray-400' },
};

export function VaultCard({ vault, currentBlock, active = false, onClick }: VaultCardProps) {
  const status = getVaultStatus(vault, currentBlock);
  const { badge, label } = statusConfig[status];
  const remaining = blocksRemaining(vault, currentBlock);
  const stx = microToStx(vault.amount).toFixed(2);
  const [vaultLabel] = useVaultLabel(vault.vaultId);

  const displayName = vaultLabel || vault.label || `Vault #${vault.vaultId}`;

  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'w-full text-left rounded-xl px-3 py-3 transition-all',
        active
          ? 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-300 dark:ring-brand-700'
          : 'hover:bg-gray-50 dark:hover:bg-zinc-800',
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {displayName}
        </span>
        <Badge variant={badge}>{label}</Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="font-mono">{stx} STX</span>
        {status === 'locked' && remaining > 0 && (
          <span title={`${remaining.toLocaleString()} blocks`}>{formatBlockDuration(remaining)} left</span>
        )}
        {status === 'unlocked' && <span className="text-green-600 dark:text-green-400">Ready to withdraw</span>}
        {status === 'withdrawn' && <span>Completed</span>}
      </div>

      {vault.stackingEnabled && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-brand-500 dark:text-brand-400">
          <span>⚡</span>
          <span>Stacking active</span>
        </div>
      )}
    </button>
  );
}
