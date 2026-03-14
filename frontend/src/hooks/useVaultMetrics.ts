'use client';

import { useMemo } from 'react';
import type { Vault } from '@/types/vault';
import { getVaultStatus, blocksRemaining } from '@/types/vault';
import { microToStx } from '@/lib/stacks';

export interface VaultMetrics {
  totalVaults: number;
  activeVaults: number;
  lockedCount: number;
  unlockedCount: number;
  withdrawnCount: number;
  stackingCount: number;
  totalStxActive: number;      // STX (not micro)
  totalStxLocked: number;
  totalStxUnlocked: number;
  averageAmountStx: number;
  medianAmountStx: number;
  averageLockBlocks: number;
  nextUnlockVault: Vault | null;
  nextUnlockBlocks: number;
  oldestVaultId: number | null;
  newestVaultId: number | null;
  beneficiaryCount: number;    // vaults with a beneficiary set
}

export function useVaultMetrics(vaults: Vault[], currentBlock: number): VaultMetrics {
  return useMemo(() => {
    const active    = vaults.filter((v) => !v.isWithdrawn);
    const locked    = vaults.filter((v) => getVaultStatus(v, currentBlock) === 'locked');
    const unlocked  = vaults.filter((v) => getVaultStatus(v, currentBlock) === 'unlocked');
    const withdrawn = vaults.filter((v) => v.isWithdrawn);
    const stacking  = vaults.filter((v) => v.stackingEnabled);
    const withBeneficiary = vaults.filter((v) => v.beneficiaries.length > 0);

    const totalStxActive   = microToStx(active.reduce((s, v) => s + v.amount, 0));
    const totalStxLocked   = microToStx(locked.reduce((s, v) => s + v.amount, 0));
    const totalStxUnlocked = microToStx(unlocked.reduce((s, v) => s + v.amount, 0));

    const amounts = active.map((v) => microToStx(v.amount)).sort((a, b) => a - b);
    const averageAmountStx = amounts.length > 0
      ? amounts.reduce((s, n) => s + n, 0) / amounts.length
      : 0;
    const medianAmountStx = amounts.length > 0
      ? amounts.length % 2 === 0
        ? (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2
        : amounts[Math.floor(amounts.length / 2)]
      : 0;

    const lockDurations = active.map((v) => v.unlockHeight - v.createdAt).filter((d) => d > 0);
    const averageLockBlocks = lockDurations.length > 0
      ? lockDurations.reduce((s, n) => s + n, 0) / lockDurations.length
      : 0;

    const nextUnlockVault = locked.length > 0
      ? locked.reduce((min, v) =>
          blocksRemaining(v, currentBlock) < blocksRemaining(min, currentBlock) ? v : min,
        )
      : null;
    const nextUnlockBlocks = nextUnlockVault ? blocksRemaining(nextUnlockVault, currentBlock) : 0;

    const sortedByCreation = [...vaults].sort((a, b) => a.createdAt - b.createdAt);

    return {
      totalVaults:      vaults.length,
      activeVaults:     active.length,
      lockedCount:      locked.length,
      unlockedCount:    unlocked.length,
      withdrawnCount:   withdrawn.length,
      stackingCount:    stacking.length,
      totalStxActive,
      totalStxLocked,
      totalStxUnlocked,
      averageAmountStx,
      medianAmountStx,
      averageLockBlocks,
      nextUnlockVault,
      nextUnlockBlocks,
      oldestVaultId: sortedByCreation[0]?.vaultId ?? null,
      newestVaultId: sortedByCreation[sortedByCreation.length - 1]?.vaultId ?? null,
      beneficiaryCount: withBeneficiary.length,
    };
  }, [vaults, currentBlock]);
}
