'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DepositModal } from './DepositModal';
import { EmergencyWithdrawModal } from './EmergencyWithdrawModal';
import { getVaultStatus, type Vault } from '@/types/vault';

interface VaultActionBarProps {
  vault: Vault;
  currentBlock: number;
  onWithdraw: (vaultId: number) => Promise<void>;
  onDeposit: (vaultId: number, amountMicroStx: number) => Promise<void>;
  onEmergencyWithdraw: (vaultId: number) => Promise<void>;
}

export function VaultActionBar({
  vault, currentBlock, onWithdraw, onDeposit, onEmergencyWithdraw,
}: VaultActionBarProps) {
  const [showDeposit, setShowDeposit]     = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [withdrawing, setWithdrawing]     = useState(false);

  const status = getVaultStatus(vault, currentBlock);

  async function handleWithdraw() {
    setWithdrawing(true);
    try { await onWithdraw(vault.vaultId); } finally { setWithdrawing(false); }
  }

  if (status === 'withdrawn') {
    return (
      <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
        This vault has been fully withdrawn.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Deposit always available while vault is active */}
        <Button variant="secondary" size="sm" onClick={() => setShowDeposit(true)}>
          Deposit
        </Button>

        {/* Withdraw — only when unlocked */}
        <Button
          size="sm"
          onClick={handleWithdraw}
          loading={withdrawing}
          disabled={status === 'locked'}
          title={status === 'locked' ? 'Vault is still locked' : undefined}
        >
          Withdraw
        </Button>

        {/* Emergency — only while locked */}
        {status === 'locked' && (
          <Button variant="danger" size="sm" onClick={() => setShowEmergency(true)}>
            Emergency Withdraw
          </Button>
        )}
      </div>

      <DepositModal
        open={showDeposit}
        vaultId={vault.vaultId}
        onClose={() => setShowDeposit(false)}
        onDeposit={onDeposit}
      />

      <EmergencyWithdrawModal
        open={showEmergency}
        vaultId={vault.vaultId}
        vaultAmount={vault.amount}
        onClose={() => setShowEmergency(false)}
        onConfirm={onEmergencyWithdraw}
      />
    </>
  );
}
