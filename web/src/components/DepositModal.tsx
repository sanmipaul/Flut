import React, { useState, useEffect, useRef } from 'react';

export interface DepositModalProps {
  isOpen: boolean;
  vaultId: number;
  currentAmount?: number;
  onDeposit: (vaultId: number, amount: number) => Promise<void>;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  vaultId,
  onDeposit,
  onClose,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setAmount('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  const isAmountValid = (val: string): boolean => {
    const n = parseFloat(val);
    return val.trim() !== '' && !isNaN(n) && n > 0;
  };

  const handleDeposit = async () => {
    setError('');
    if (!isAmountValid(amount)) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    try {
      setLoading(true);
      await onDeposit(vaultId, parseFloat(amount));
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="deposit-modal-title">
      <div className="modal-content">
        <h2 id="deposit-modal-title">Deposit to Vault #{vaultId}</h2>
        <p className="deposit-hint">Add more STX to this vault. The lock period remains unchanged.</p>

        <div className="form-group">
          <label htmlFor="deposit-amount">Amount (STX)</label>
          <input
            id="deposit-amount"
            ref={inputRef}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleDeposit(); }}
            placeholder="Enter amount in STX"
            min="0.000001"
            step="0.000001"
            disabled={loading}
            aria-describedby="deposit-amount-hint"
          />
          <small id="deposit-amount-hint">Minimum deposit is 1 microSTX. Funds are added to the existing lock.</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleDeposit}
            disabled={loading || !isAmountValid(amount)}
          >
            {loading ? 'Depositing...' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
