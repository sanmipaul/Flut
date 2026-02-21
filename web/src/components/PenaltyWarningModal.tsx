import React, { useState } from 'react';

interface PenaltyWarningModalProps {
  isOpen: boolean;
  vaultId: number;
  vaultAmount: number;
  penaltyRate: number;
  penaltyAmount: number;
  userReceiveAmount: number;
  onConfirm: (vaultId: number) => Promise<void>;
  onCancel: () => void;
}

export const PenaltyWarningModal: React.FC<PenaltyWarningModalProps> = ({
  isOpen,
  vaultId,
  vaultAmount,
  penaltyRate,
  penaltyAmount,
  userReceiveAmount,
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const handleConfirm = async () => {
    if (!confirmed) {
      setError('You must confirm you understand the penalty');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await onConfirm(vaultId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process emergency withdrawal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content penalty-warning">
        <div className="warning-header">
          <span className="warning-icon">⚠️</span>
          <h2>Emergency Withdrawal Penalty</h2>
        </div>

        <div className="penalty-details">
          <p className="warning-text">
            You are about to withdraw from a locked vault before the unlock date. 
            A penalty fee will be deducted from your withdrawal.
          </p>

          <div className="penalty-calculation">
            <div className="calc-row">
              <span className="calc-label">Vault Amount:</span>
              <span className="calc-value">{vaultAmount} STX</span>
            </div>

            <div className="calc-row penalty-row">
              <span className="calc-label">Penalty Rate:</span>
              <span className="calc-value penalty-value">{penaltyRate}%</span>
            </div>

            <div className="calc-row penalty-amount">
              <span className="calc-label">Penalty Amount:</span>
              <span className="calc-value red-text">-{penaltyAmount} STX</span>
            </div>

            <div className="calc-divider"></div>

            <div className="calc-row total-row">
              <span className="calc-label">You Will Receive:</span>
              <span className="calc-value green-text">{userReceiveAmount} STX</span>
            </div>
          </div>

          <div className="penalty-info">
            <h3>Important Information</h3>
            <ul>
              <li>The penalty is non-refundable</li>
              <li>This withdrawal is permanent and cannot be reversed</li>
              <li>You will lose the savings discipline incentive</li>
              <li>The penalty will be sent to the protocol treasury</li>
            </ul>
          </div>

          <div className="confirmation-checkbox">
            <input
              type="checkbox"
              id="penalty-confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="penalty-confirm">
              I understand the penalty and wish to proceed with the emergency withdrawal
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={handleConfirm}
            disabled={loading || !confirmed}
          >
            {loading ? 'Processing...' : 'Emergency Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PenaltyWarningModal;
