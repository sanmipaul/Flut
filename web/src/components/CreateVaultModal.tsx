import React, { useState } from 'react';
import AddressInput from './AddressInput';
import { AddressValidationResult } from '../utils/StacksAddressUtils';

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
  const [lockDuration, setLockDuration] = useState<string>('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [beneficiaryValidation, setBeneficiaryValidation] = useState<AddressValidationResult | null>(null);
  const [hasBeneficiary, setHasBeneficiary] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleBeneficiaryChange = (value: string, validation: AddressValidationResult) => {
    setBeneficiaryAddress(value);
    setBeneficiaryValidation(validation);
  };

  const isBeneficiaryValid = !hasBeneficiary || (beneficiaryAddress.trim() !== '' && beneficiaryValidation?.isValid === true);

  const handleCreateVault = async () => {
    try {
      setError('');
      setLoading(true);

      const amountNum = parseFloat(amount);
      const durationNum = parseInt(lockDuration, 10);

      if (!amount || amountNum <= 0) {
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

      if (hasBeneficiary && beneficiaryValidation && !beneficiaryValidation.isValid) {
        setError('Beneficiary address is not a valid Stacks address');
        setLoading(false);
        return;
      }

      const beneficiary = hasBeneficiary ? beneficiaryValidation?.normalised || beneficiaryAddress.trim() : undefined;

      await onCreateVault(amountNum, durationNum, beneficiary);

      // Reset form
      setAmount('');
      setLockDuration('');
      setBeneficiaryAddress('');
      setBeneficiaryValidation(null);
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
          <label htmlFor="amount">Amount (STX)</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in STX"
            disabled={loading}
            step="0.01"
            min="0"
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
            onChange={(e) => {
              setHasBeneficiary(e.target.checked);
              if (!e.target.checked) {
                setBeneficiaryAddress('');
                setBeneficiaryValidation(null);
              }
            }}
            disabled={loading}
          />
          <label htmlFor="hasBeneficiary">Add a Beneficiary Address?</label>
        </div>

        {hasBeneficiary && (
          <AddressInput
            id="beneficiary"
            value={beneficiaryAddress}
            onChange={handleBeneficiaryChange}
            label="Beneficiary Address"
            helpText="The Stacks address that will receive funds when the vault unlocks"
            disabled={loading}
            required
            validateOnBlur={false}
          />
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
            disabled={loading || !isBeneficiaryValid}
          >
            {loading ? 'Creating...' : 'Create Vault'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVaultModal;
