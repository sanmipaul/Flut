'use client';

import { VaultDetailHeader } from './VaultDetailHeader';
import { VaultLockProgress } from './VaultLockProgress';
import { VaultActionBar } from './VaultActionBar';
import { BeneficiaryPanel } from './BeneficiaryPanel';
import type { Vault } from '@/types/vault';

interface VaultDetailPanelProps {
  vault: Vault;
  currentBlock: number;
  onWithdraw: (id: number) => Promise<void>;
  onDeposit: (id: number, amount: number) => Promise<void>;
  onEmergencyWithdraw: (id: number) => Promise<void>;
  onSetBeneficiary: (id: number, address: string) => Promise<void>;
}

export function VaultDetailPanel({
  vault,
  currentBlock,
  onWithdraw,
  onDeposit,
  onEmergencyWithdraw,
  onSetBeneficiary,
}: VaultDetailPanelProps) {
  return (
    <div className="space-y-6">
      <VaultDetailHeader vault={vault} currentBlock={currentBlock} />

      <VaultLockProgress vault={vault} currentBlock={currentBlock} />

      <VaultActionBar
        vault={vault}
        currentBlock={currentBlock}
        onWithdraw={onWithdraw}
        onDeposit={onDeposit}
        onEmergencyWithdraw={onEmergencyWithdraw}
      />

      <BeneficiaryPanel
        vaultId={vault.vaultId}
        currentBeneficiary={vault.beneficiaries[0]}
        onSetBeneficiary={onSetBeneficiary}
      />

      {vault.stackingEnabled && vault.stackingPool && (
        <div className="rounded-xl border border-brand-100 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/10 px-4 py-3">
          <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1">⚡ Stacking Pool</p>
          <p className="text-xs font-mono text-brand-600 dark:text-brand-400 break-all">{vault.stackingPool}</p>
        </div>
      )}
    </div>
  );
}
