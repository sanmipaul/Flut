import React, { useState } from 'react';
import StxAmountInput from './StxAmountInput';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVault: (amount: number, lockDuration: number, beneficiary?: string) => Promise<void>;
}

export const CreateVaultModal: React.FC<CreateVaultModalProps> = ({
  isOpen,
  onClose,
  onCreateVault,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [parsedAmount, setParsedAmount] = useState<number>(NaN);
  const [lockDuration, setLockDuration] = useState<string>('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [hasBeneficiary, setHasBeneficiary] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleCreateVault = async () => {
    try {
      setError('');
      setLoading(true);

      const amountNum = isNaN(parsedAmount) ? parseFloat(amount) : parsedAmount;
      const durationNum = parseInt(lockDuration, 10);

      if (!amount || isNaN(amountNum) || amountNum <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (!lockDuration || durationNum <= 0) {
        setError('Please enter a valid lock duration in blocks');
        setLoading(false);
        return;
      }

      if (hasBeneficiary && !beneficiaryAddress.trim()) {
        setError('Please enter a beneficiary address');
        setLoading(false);
        return;
      }

      const beneficiary = hasBeneficiary ? beneficiaryAddress.trim() : undefined;

      await onCreateVault(amountNum, durationNum, beneficiary);

      // Reset form
      setAmount('');
      setLockDuration('');
      setBeneficiaryAddress('');
      setHasBeneficiary(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vault');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Vault</h2>

        <div className="form-group">
          <label htmlFor="vault-amount">Amount (STX)</label>
          <StxAmountInput
            id="vault-amount"
            value={amount}
            onChange={setAmount}
            onParsed={setParsedAmount}
            min={0.000001}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lockDuration">Lock Duration (Blocks)</label>
          <input
            id="lockDuration"
            type="number"
            value={lockDuration}
            onChange={(e) => setLockDuration(e.target.value)}
            placeholder="Enter lock duration in blocks"
            disabled={loading}
            min="1"
          />
        </div>

        <div className="form-group checkbox">
          <input
            id="hasBeneficiary"
            type="checkbox"
            checked={hasBeneficiary}
            onChange={(e) => setHasBeneficiary(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="hasBeneficiary">Add a Beneficiary Address?</label>
        </div>

        {hasBeneficiary && (
          <div className="form-group">
            <label htmlFor="beneficiary">Beneficiary Address</label>
            <input
              id="beneficiary"
              type="text"
              value={beneficiaryAddress}
              onChange={(e) => setBeneficiaryAddress(e.target.value)}
              placeholder="SP... or ST..."
              disabled={loading}
            />
            <small>The address that will receive funds when the vault unlocks</small>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreateVault}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Vault'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVaultModal;
