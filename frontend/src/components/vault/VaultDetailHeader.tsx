'use client';

import { Badge } from '@/components/ui/Badge';
import { microToStx, truncateAddress } from '@/lib/stacks';
import { getVaultStatus, type Vault } from '@/types/vault';

interface VaultDetailHeaderProps {
  vault: Vault;
  currentBlock: number;
}

const statusConfig = {
  locked:    { variant: 'locked'    as const, label: 'Locked'    },
  unlocked:  { variant: 'unlocked'  as const, label: 'Unlocked'  },
  withdrawn: { variant: 'default'   as const, label: 'Withdrawn' },
};

export function VaultDetailHeader({ vault, currentBlock }: VaultDetailHeaderProps) {
  const status = getVaultStatus(vault, currentBlock);
  const { variant, label } = statusConfig[status];
  const stx = microToStx(vault.amount).toFixed(6);

  return (
    <div className="pb-5 border-b border-gray-100 dark:border-zinc-800 mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {vault.label ?? `Vault #${vault.vaultId}`}
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
            Creator: {truncateAddress(vault.creator)}
          </p>
        </div>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono mt-0.5">{stx} STX</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Unlock Block</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono mt-0.5">{vault.unlockHeight.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Created Block</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono mt-0.5">{vault.createdAt.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Stacking</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
            {vault.stackingEnabled ? '⚡ Active' : 'Off'}
          </p>
        </div>
      </div>
    </div>
  );
}
