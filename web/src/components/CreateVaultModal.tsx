import React, { useState } from 'react';
import StxAmountInput from './StxAmountInput';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVault: (amount: number, lockDuration: number, beneficiary?: string, enableStacking?: boolean, stackingPool?: string) => Promise<void>;
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
  const [beneficiaryValidation, setBeneficiaryValidation] = useState<AddressValidationResult | null>(null);
  const [hasBeneficiary, setHasBeneficiary] = useState<boolean>(false);
  const [enableStacking, setEnableStacking] = useState<boolean>(false);
  const [stackingPool, setStackingPool] = useState<string>('');
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

      if (hasBeneficiary && beneficiaryValidation && !beneficiaryValidation.isValid) {
        setError('Beneficiary address is not a valid Stacks address');
        setLoading(false);
        return;
      }

      const beneficiary = hasBeneficiary ? beneficiaryValidation?.normalised || beneficiaryAddress.trim() : undefined;

      await onCreateVault(amountNum, durationNum, beneficiary, enableStacking, pool);

      // Reset form
      setAmount('');
      setLockDuration('');
      setBeneficiaryAddress('');
      setBeneficiaryValidation(null);
      setHasBeneficiary(false);
      setEnableStacking(false);
      setStackingPool('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vault');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div 
        className="modal-content"
        role="dialog"
        aria-labelledby="create-vault-title"
        aria-describedby="create-vault-description"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-vault-title">Create New Vault</h2>
        <p id="create-vault-description" className="sr-only">
          Fill out the form below to create a new STX savings vault with a lock duration and optional beneficiary
        </p>

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
            required
            aria-required="true"
            aria-describedby="lockDuration-hint"
          />
          <small id="lockDuration-hint">Minimum 1 block (approximately 10 minutes per block)</small>
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
          <div className="form-group">
            <label htmlFor="beneficiary">Beneficiary Address</label>
            <div className="input-with-copy">
              <input
                id="beneficiary"
                type="text"
                value={beneficiaryAddress}
                onChange={(e) => setBeneficiaryAddress(e.target.value)}
                placeholder="SP... or ST..."
                disabled={loading}
              />
              {beneficiaryAddress.trim() && (
                <CopyButton
                  text={beneficiaryAddress.trim()}
                  label="Copy beneficiary address"
                  size="sm"
                />
              )}
            </div>
            <small>The address that will receive funds when the vault unlocks</small>
          </div>
        )}

        {error && (
          <div className="error-message" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
            aria-label="Cancel creating a new vault"
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreateVault}
            disabled={loading || (hasBeneficiary && !isBeneficiaryValid)}
            title={hasBeneficiary && !isBeneficiaryValid ? 'Enter a valid Stacks address before creating the vault' : undefined}
            aria-label="Create new vault with specified settings"
          >
            {loading ? 'Creating...' : 'Create Vault'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVaultModal;
