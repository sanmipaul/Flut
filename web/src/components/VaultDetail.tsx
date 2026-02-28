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
  stackingEnabled?: boolean;
  stackingPool?: string;
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
  const [beneficiaryValidation, setBeneficiaryValidation] = useState<AddressValidationResult | null>(null);
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState<boolean>(false);
  const [copyAnnouncement, setCopyAnnouncement] = useState<string>('');

  const handleAddressCopied = (text: string, success: boolean) => {
    const truncated = text.length > 12 ? `${text.slice(0, 6)}…${text.slice(-4)}` : text;
    setCopyAnnouncement(
      success ? `Copied ${truncated} to clipboard` : 'Failed to copy address'
    );
    setTimeout(() => setCopyAnnouncement(''), 2500);
  };

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

  const handleBeneficiaryChange = (value: string, validation: AddressValidationResult) => {
    setNewBeneficiary(value);
    setBeneficiaryValidation(validation);
  };

  const handleWithdraw = async () => {
    if (!vault) return;
    try {
      setSubmitting(true);
      await onWithdraw(vault.vaultId);
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
    if (beneficiaryValidation && !beneficiaryValidation.isValid) {
      setError('Please enter a valid Stacks address for the beneficiary');
      return;
    }
    try {
      setSubmitting(true);
      const addressToSet = beneficiaryValidation?.normalised || newBeneficiary.trim();
      await onSetBeneficiary(vault.vaultId, addressToSet);
      setNewBeneficiary('');
      setBeneficiaryValidation(null);
      setShowBeneficiaryForm(false);
      const updated = await onFetchVault(vaultId);
      setVault(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set beneficiary');
    } finally {
      setSubmitting(false);
    }
  };

  const networkMismatch =
    vault !== null &&
    beneficiaryValidation?.isValid === true &&
    !areAddressesOnSameNetwork(vault.creator, beneficiaryValidation.normalised);

  const canSetBeneficiary =
    newBeneficiary.trim() !== '' &&
    beneficiaryValidation !== null &&
    beneficiaryValidation.isValid &&
    !networkMismatch;

  if (loading) {
    return <div className="vault-detail loading">Loading vault details...</div>;
  }

  if (error && !vault) {
    return <div className="vault-detail error">Error: {error}</div>;
  }

  if (!vault) {
    return <div className="vault-detail not-found">Vault not found</div>;
  }

  return (
    <div className="vault-detail">
      {/* Screen-reader live region for copy announcements */}
      <span
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {copyAnnouncement}
      </span>

      <header className="vault-header">
        <h2>Vault #{vault.vaultId}</h2>
        <span className={vault.isWithdrawn ? 'status withdrawn' : 'status active'}>
          {vault.isWithdrawn ? 'Withdrawn' : 'Active'}
        </span>
      </header>

      <section className="vault-info">
        <div className="info-item">
          <label>Creator</label>
          <span className="address-with-copy">
            <code>{vault.creator}</code>
            <CopyButton
                text={vault.creator}
                label="Copy creator address"
                onCopy={handleAddressCopied}
              />
          </span>
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
            <span className="address-with-copy">
              <code>{vault.beneficiary}</code>
              <CopyButton
                  text={vault.beneficiary}
                  label="Copy beneficiary address"
                  onCopy={handleAddressCopied}
                />
            </span>
          </div>
          <p className="info-text">
            When unlocked, funds will be transferred to this beneficiary address instead of the creator.
          </p>
        </section>
      )}

      {vault.stackingEnabled && (
        <section className="stacking-info">
          <h3>Stacking &amp; Yield</h3>
          <div className="info-item">
            <label>Stacking Status</label>
            <span className="status-badge stacking-active">Active — delegated via pox-4</span>
          </div>
          {vault.stackingPool && (
            <div className="info-item">
              <label>Pool Address</label>
              <code>{vault.stackingPool}</code>
            </div>
          )}
          <div className="info-item">
            <label>Estimated BTC APY</label>
            <span className="apy-value">~8–12%</span>
          </div>
          <p className="info-text">
            Your STX is being stacked. BTC rewards accrue each cycle (~2 weeks) and are
            claimable through your pool. Delegation is automatically revoked on withdrawal.
          </p>
        </section>
      )}

      {!vault.stackingEnabled && !vault.isWithdrawn && (
        <section className="stacking-info stacking-inactive">
          <h3>Stacking &amp; Yield</h3>
          <p className="info-text">
            Stacking is not enabled for this vault. Use the pool update function to start
            earning BTC yield on your locked STX.
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
            <div className="beneficiary-form-stack">
              <AddressInput
                id="new-beneficiary"
                value={newBeneficiary}
                onChange={handleBeneficiaryChange}
                label="Beneficiary Address"
                helpText="Enter a Stacks mainnet (SP) or testnet (ST) address"
                disabled={submitting}
                required
              />
              {networkMismatch && (
                <p className="warning-text" role="alert">
                  The beneficiary address is on a different network than this vault's creator. Please use a matching network address.
                </p>
              )}
              <div className="beneficiary-form-actions">
                <button
                  className="btn-primary"
                  onClick={handleSetBeneficiary}
                  disabled={submitting || !canSetBeneficiary}
                  title={!canSetBeneficiary ? 'Enter a valid Stacks address' : undefined}
                >
                  {submitting ? 'Setting...' : 'Set'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowBeneficiaryForm(false);
                    setNewBeneficiary('');
                    setBeneficiaryValidation(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
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
