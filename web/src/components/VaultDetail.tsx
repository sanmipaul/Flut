import React, { useEffect, useState } from 'react';
import PenaltyWarningModal from './PenaltyWarningModal';
import StxAmount from './StxAmount';

interface Vault {
  vaultId: number;
  creator: string;
  amount: number;
  unlockHeight: number;
  createdAt: number;
  isWithdrawn: boolean;
  beneficiary?: string;
  currentBlockHeight: number;
}

interface VaultDetailProps {
  vaultId: number;
  onWithdraw: (vaultId: number) => Promise<void>;
  onSetBeneficiary: (vaultId: number, beneficiary: string) => Promise<void>;
  onFetchVault: (vaultId: number) => Promise<Vault>;
  onEmergencyWithdraw?: (vaultId: number) => Promise<void>;
  penaltyRate?: number;
}

export const VaultDetail: React.FC<VaultDetailProps> = ({
  vaultId,
  onWithdraw,
  onSetBeneficiary,
  onFetchVault,
  onEmergencyWithdraw,
  penaltyRate = 10,
}) => {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [newBeneficiary, setNewBeneficiary] = useState<string>('');
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchVault = async () => {
      try {
        setLoading(true);
        setError('');
        const vaultData = await onFetchVault(vaultId);
        setVault(vaultData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vault');
      } finally {
        setLoading(false);
      }
    };

    fetchVault();
  }, [vaultId, onFetchVault]);

  const isUnlocked = vault ? vault.currentBlockHeight >= vault.unlockHeight : false;
  const blocksUntilUnlock = vault ? Math.max(0, vault.unlockHeight - vault.currentBlockHeight) : 0;
  const lockedDays = vault ? Math.ceil((blocksUntilUnlock * 10) / (24 * 60 * 6)) : 0;

  const handleWithdraw = async () => {
    if (!vault) return;
    try {
      setSubmitting(true);
      await onWithdraw(vault.vaultId);
      // Refresh vault data
      const updated = await onFetchVault(vaultId);
      setVault(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetBeneficiary = async () => {
    if (!vault || !newBeneficiary.trim()) return;
    try {
      setSubmitting(true);
      await onSetBeneficiary(vault.vaultId, newBeneficiary);
      setNewBeneficiary('');
      setShowBeneficiaryForm(false);
      // Refresh vault data
      const updated = await onFetchVault(vaultId);
      setVault(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="vault-detail loading">Loading vault details...</div>;
  }

  if (error) {
    return <div className="vault-detail error">Error: {error}</div>;
  }

  if (!vault) {
    return <div className="vault-detail not-found">Vault not found</div>;
  }

  return (
    <div className="vault-detail">
      <header className="vault-header">
        <h2>Vault #{vault.vaultId}</h2>
        <span className={vault.isWithdrawn ? 'status withdrawn' : 'status active'}>
          {vault.isWithdrawn ? 'Withdrawn' : 'Active'}
        </span>
      </header>

      <section className="vault-info">
        <div className="info-item">
          <label>Creator</label>
          <code>{vault.creator}</code>
        </div>

        <div className="info-item">
          <label>Amount</label>
          <StxAmount amount={vault.amount} highlight="positive" />
        </div>

        <div className="info-item">
          <label>Created At Block</label>
          <span>{vault.createdAt}</span>
        </div>

        <div className="info-item">
          <label>Unlock Block</label>
          <span>{vault.unlockHeight}</span>
        </div>

        <div className="info-item">
          <label>Status</label>
          {isUnlocked ? (
            <span className="status-badge unlocked">
              ✓ Unlocked
            </span>
          ) : (
            <span className="status-badge locked">
              Locked ({blocksUntilUnlock} blocks, ~{lockedDays} days)
            </span>
          )}
        </div>
      </section>

      {vault.beneficiary && (
        <section className="beneficiary-info">
          <h3>Beneficiary Details</h3>
          <div className="info-item">
            <label>Beneficiary Address</label>
            <code>{vault.beneficiary}</code>
          </div>
          <p className="info-text">
            When unlocked, funds will be transferred to this beneficiary address instead of the creator.
          </p>
        </section>
      )}

      {!vault.beneficiary && !vault.isWithdrawn && (
        <section className="beneficiary-setup">
          {!showBeneficiaryForm ? (
            <button
              className="btn-secondary"
              onClick={() => setShowBeneficiaryForm(true)}
              disabled={submitting}
            >
              Set Beneficiary
            </button>
          ) : (
            <div className="beneficiary-form">
              <input
                type="text"
                value={newBeneficiary}
                onChange={(e) => setNewBeneficiary(e.target.value)}
                placeholder="SP... or ST..."
                disabled={submitting}
              />
              <button
                className="btn-primary"
                onClick={handleSetBeneficiary}
                disabled={submitting || !newBeneficiary.trim()}
              >
                {submitting ? 'Setting...' : 'Set'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowBeneficiaryForm(false);
                  setNewBeneficiary('');
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          )}
        </section>
      )}

      {isUnlocked && !vault.isWithdrawn && (
        <section className="vault-actions">
          <button
            className="btn-primary btn-large"
            onClick={handleWithdraw}
            disabled={submitting || vault.isWithdrawn}
          >
            {submitting ? 'Withdrawing...' : 'Withdraw Funds'}
          </button>
          {vault.beneficiary && (
            <p className="info-text">
              Clicking "Withdraw Funds" will transfer {vault.amount} STX to {vault.beneficiary}.
            </p>
          )}
        </section>
      )}

      {!isUnlocked && !vault.isWithdrawn && (
        <section className="vault-actions emergency-section">
          <button
            className="btn-danger"
            onClick={() => setShowPenaltyModal(true)}
            disabled={submitting}
          >
            Emergency Withdraw
          </button>
          <p className="warning-text">
            Withdraw before unlock date with a {penaltyRate}% penalty fee
          </p>
        </section>
      )}

      {error && <div className="error-message">{error}</div>}

      {vault && (
        <PenaltyWarningModal
          isOpen={showPenaltyModal}
          vaultId={vault.vaultId}
          vaultAmount={vault.amount}
          penaltyRate={penaltyRate}
          penaltyAmount={Math.floor((vault.amount * penaltyRate) / 100)}
          userReceiveAmount={vault.amount - Math.floor((vault.amount * penaltyRate) / 100)}
          onConfirm={async (id) => {
            try {
              setSubmitting(true);
              if (onEmergencyWithdraw) {
                await onEmergencyWithdraw(id);
              }
              setShowPenaltyModal(false);
              // Refresh vault data
              const updated = await onFetchVault(vaultId);
              setVault(updated);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to process emergency withdrawal');
            } finally {
              setSubmitting(false);
            }
          }}
          onCancel={() => setShowPenaltyModal(false)}
        />
      )}
    </div>
  );
};

export default VaultDetail;
