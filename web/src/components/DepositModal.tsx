import React, { useState } from 'react';

export interface DepositModalProps {
  isOpen: boolean;
  vaultId: number;
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Deposit to Vault #{vaultId}</h2>
      </div>
    </div>
  );
};

export default DepositModal;
