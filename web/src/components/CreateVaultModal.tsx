import React, { useState } from 'react';

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
  const [lockDuration, setLockDuration] = useState<string>('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [hasBeneficiary, setHasBeneficiary] = useState<boolean>(false);
  const [enableStacking, setEnableStacking] = useState<boolean>(false);
  const [stackingPool, setStackingPool] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

      if (enableStacking && !stackingPool.trim()) {
        setError('Please enter a stacking pool address');
        setLoading(false);
        return;
      }

      const beneficiary = hasBeneficiary ? beneficiaryAddress.trim() : undefined;
      const pool = enableStacking ? stackingPool.trim() : undefined;

      await onCreateVault(amountNum, durationNum, beneficiary, enableStacking, pool);

      // Reset form
      setAmount('');
      setLockDuration('');
      setBeneficiaryAddress('');
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

        <div className="form-group checkbox">
          <input
            id="enableStacking"
            type="checkbox"
            checked={enableStacking}
            onChange={(e) => setEnableStacking(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="enableStacking">Enable STX Stacking (earn BTC yield while locked)</label>
        </div>

        {enableStacking && (
          <>
            <div className="form-group">
              <label htmlFor="stackingPool">Stacking Pool Address</label>
              <input
                id="stackingPool"
                type="text"
                value={stackingPool}
                onChange={(e) => setStackingPool(e.target.value)}
                placeholder="SP... stacking pool principal"
                disabled={loading}
              />
              <small>Your STX will be delegated to this pool via pox-4 while the vault is locked</small>
            </div>

            <div className="stacking-apy-banner">
              <div className="apy-info">
                <span className="apy-label">Estimated BTC Yield APY</span>
                <span className="apy-value">~8–12%</span>
              </div>
              <p className="apy-note">
                BTC rewards are distributed each Stacking cycle (~2 weeks). Actual APY varies
                with network participation. Rewards accrue to the pool and are claimable
                separately from your STX principal.
              </p>
            </div>
          </>
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
