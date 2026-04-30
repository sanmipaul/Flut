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
