'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/hooks/useWallet';
import { microToStx } from '@/lib/stacks';

const MAX_DEPOSIT_STX = 1000;
const MIN_DEPOSIT_STX = 0.000001;

interface DepositModalProps {
  open: boolean;
  vaultId: number;
  onClose: () => void;
  onDeposit: (vaultId: number, amountMicroStx: number) => Promise<void>;
}

export function DepositModal({ open, vaultId, onClose, onDeposit }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { stxBalance } = useWallet();

  // Reset form state whenever modal opens
  useEffect(() => {
    if (open) { setAmount(''); setError(null); }
  }, [open]);

  const walletStx = stxBalance != null ? microToStx(stxBalance) : null;
  const parsed = parseFloat(amount);
  const valid = !isNaN(parsed) && parsed >= MIN_DEPOSIT_STX && parsed <= MAX_DEPOSIT_STX;

  const validationMessage = (() => {
    if (!amount) return null;
    if (isNaN(parsed) || parsed <= 0) return 'Enter a positive amount';
    if (parsed < MIN_DEPOSIT_STX) return `Minimum deposit is ${MIN_DEPOSIT_STX} STX`;
    if (parsed > MAX_DEPOSIT_STX) return `Maximum deposit is ${MAX_DEPOSIT_STX} STX per transaction`;
    if (walletStx != null && parsed > walletStx) return `Insufficient balance (${walletStx.toFixed(2)} STX available)`;
    return null;
  })();

  function handleMaxClick() {
    if (walletStx != null) {
      setAmount(Math.min(walletStx, MAX_DEPOSIT_STX).toFixed(6));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      await onDeposit(vaultId, Math.round(parsed * 1_000_000));
      setAmount('');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg && !msg.toLowerCase().includes('cancel')) {
        setError(msg || 'Deposit failed');
      } else {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Deposit STX" description={`Add funds to Vault #${vaultId}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="deposit-amount" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Amount (STX)
            </label>
            {walletStx != null && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Balance: {walletStx.toFixed(2)} STX
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="deposit-amount"
              type="number"
              min={MIN_DEPOSIT_STX}
              max={MAX_DEPOSIT_STX}
              step="0.000001"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null); }}
              placeholder="0.00"
              required
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 pr-14 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {walletStx != null && (
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-brand-500 hover:text-brand-700 font-medium"
              >
                MAX
              </button>
            )}
          </div>
          {validationMessage ? (
            <p className="mt-1 text-xs text-red-500">{validationMessage}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Max {MAX_DEPOSIT_STX} STX per transaction
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!valid} loading={loading}>
            Deposit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
