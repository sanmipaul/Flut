'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { microToStx } from '@/lib/stacks';

const PENALTY_RATE = 10; // 10%

interface EmergencyWithdrawModalProps {
  open: boolean;
  vaultId: number;
  vaultAmount: number; // micro-STX
  onClose: () => void;
  onConfirm: (vaultId: number) => Promise<void>;
}

export function EmergencyWithdrawModal({
  open, vaultId, vaultAmount, onClose, onConfirm,
}: EmergencyWithdrawModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const totalStx   = microToStx(vaultAmount);
  const penaltyStx = (totalStx * PENALTY_RATE) / 100;
  const receiveStx = totalStx - penaltyStx;

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm(vaultId);
      setConfirmed(false);
      onClose();
    } catch (err) {
      // only show error if it's not a user cancellation
      const msg = err instanceof Error ? err.message : '';
      if (msg && !msg.toLowerCase().includes('cancel')) {
        setError(msg || 'Emergency withdrawal failed');
      } else {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Emergency Withdrawal" size="sm">
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            ⚠ {PENALTY_RATE}% penalty applies
          </p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-1">
            Withdrawing before the lock expires incurs a penalty. Funds are sent immediately.
          </p>
        </div>

        {/* Breakdown */}
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700 text-sm">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-gray-500 dark:text-gray-400">Vault balance</span>
            <span className="font-mono">{totalStx.toFixed(6)} STX</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-red-600 dark:text-red-400">Penalty ({PENALTY_RATE}%)</span>
            <span className="font-mono text-red-600 dark:text-red-400">- {penaltyStx.toFixed(6)} STX</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 font-semibold">
            <span className="text-gray-900 dark:text-white">You receive</span>
            <span className="font-mono text-green-600 dark:text-green-400">{receiveStx.toFixed(6)} STX</span>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 accent-brand-500"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            I understand the {PENALTY_RATE}% penalty and wish to proceed.
          </span>
        </label>

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" disabled={!confirmed} loading={loading} onClick={handleConfirm}>
            Withdraw Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}
