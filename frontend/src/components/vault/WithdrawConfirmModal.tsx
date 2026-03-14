'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { microToStx } from '@/lib/stacks';

interface WithdrawConfirmModalProps {
  open: boolean;
  vaultId: number;
  vaultAmount: number; // micro-STX
  onClose: () => void;
  onConfirm: (vaultId: number) => Promise<void>;
}

export function WithdrawConfirmModal({
  open,
  vaultId,
  vaultAmount,
  onClose,
  onConfirm,
}: WithdrawConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const stx = microToStx(vaultAmount).toFixed(6);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(vaultId);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg && !msg.toLowerCase().includes('cancel')) {
        setError(msg || 'Withdrawal failed');
      } else {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Withdrawal"
      description={`Vault #${vaultId}`}
      size="sm"
    >
      <div className="space-y-4">
        {/* Summary */}
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700 text-sm">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-gray-500 dark:text-gray-400">Amount</span>
            <span className="font-mono font-semibold text-gray-900 dark:text-white">{stx} STX</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-gray-500 dark:text-gray-400">Penalty</span>
            <span className="text-green-600 dark:text-green-400 font-medium">None (unlocked)</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Funds will be sent to the vault&apos;s beneficiary address, or back to you if none is set.
        </p>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={handleConfirm}>
            Withdraw
          </Button>
        </div>
      </div>
    </Modal>
  );
}
