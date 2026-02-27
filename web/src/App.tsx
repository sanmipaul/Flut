import React, { useState, useEffect } from 'react';
import CreateVaultModal from './components/CreateVaultModal';
import VaultDetail from './components/VaultDetail';
import VaultHistory from './components/VaultHistory';
import { useVaultHistory } from './hooks/useVaultHistory';
import {
  createVaultCreatedEvent,
  createBeneficiarySetEvent,
  createWithdrawalEvent,
  createEmergencyWithdrawalEvent,
} from './hooks/useVaultHistory';

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

export const App: React.FC = () => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const { getEvents, addEvent } = useVaultHistory();

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      console.log('Initializing user connection...');
    } catch (err) {
      console.error('Failed to initialize user:', err);
    }
  };

  const handleCreateVault = async (amount: number, lockDuration: number, beneficiary?: string) => {
    try {
      setLoading(true);
      setError('');

      const vaultId = vaults.length;
      const unlockHeight = lockDuration;

      const newVault: Vault = {
        vaultId,
        creator: userAddress || 'unknown',
        amount,
        unlockHeight,
        createdAt: 0,
        isWithdrawn: false,
        beneficiary,
        currentBlockHeight: 0,
      };

      setVaults([...vaults, newVault]);

      addEvent(
        createVaultCreatedEvent(vaultId, 0, {
          amount,
          lockDuration,
          unlockHeight,
          beneficiary,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vault');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (vaultId: number) => {
    try {
      setLoading(true);
      setError('');

      const vault = vaults.find((v) => v.vaultId === vaultId);
      if (!vault) throw new Error('Vault not found');

      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, isWithdrawn: true } : v
      );
      setVaults(updatedVaults);

      addEvent(
        createWithdrawalEvent(vaultId, vault.currentBlockHeight, {
          amount: vault.amount,
          recipient: vault.beneficiary ?? vault.creator,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBeneficiary = async (vaultId: number, beneficiary: string) => {
    try {
      setLoading(true);
      setError('');

      const vault = vaults.find((v) => v.vaultId === vaultId);
      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, beneficiary } : v
      );
      setVaults(updatedVaults);

      addEvent(
        createBeneficiarySetEvent(vaultId, vault?.currentBlockHeight ?? 0, {
          newBeneficiary: beneficiary,
          previousBeneficiary: vault?.beneficiary,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyWithdraw = async (vaultId: number) => {
    try {
      setLoading(true);
      setError('');

      const vault = vaults.find((v) => v.vaultId === vaultId);
      if (!vault) throw new Error('Vault not found');

      const penaltyRate = 10;
      const penaltyAmount = Math.floor((vault.amount * penaltyRate) / 100);
      const netAmount = vault.amount - penaltyAmount;

      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, isWithdrawn: true } : v
      );
      setVaults(updatedVaults);

      addEvent(
        createEmergencyWithdrawalEvent(vaultId, vault.currentBlockHeight, {
          amount: vault.amount,
          penaltyAmount,
          netAmount,
          recipient: vault.beneficiary ?? vault.creator,
          penaltyRate,
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process emergency withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchVault = async (vaultId: number): Promise<Vault> => {
    const vault = vaults.find((v) => v.vaultId === vaultId);
    if (!vault) {
      throw new Error('Vault not found');
    }
    return vault;
  };

  const selectedVault = selectedVaultId !== null ? vaults.find((v) => v.vaultId === selectedVaultId) : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Flut — STX Savings Vault</h1>
        <p>Lock your STX, designate beneficiaries, withdraw when unlocked</p>
      </header>

      <main className="app-main">
        <section className="sidebar">
          <div className="sidebar-header">
            <h2>Your Vaults</h2>
            <button
              className="btn-primary btn-small"
              onClick={() => setShowCreateModal(true)}
              disabled={loading}
            >
              New Vault
            </button>
          </div>

          {vaults.length === 0 ? (
            <div className="empty-state">
              <p>No vaults yet. Create one to get started!</p>
            </div>
          ) : (
            <ul className="vault-list">
              {vaults.map((vault) => (
                <li
                  key={vault.vaultId}
                  className={`vault-item ${selectedVaultId === vault.vaultId ? 'active' : ''}`}
                  onClick={() => setSelectedVaultId(vault.vaultId)}
                >
                  <span className="vault-id">Vault #{vault.vaultId}</span>
                  <span className="vault-amount">{vault.amount} STX</span>
                  {vault.beneficiary && <span className="badge-beneficiary">Has Beneficiary</span>}
                  {vault.isWithdrawn && <span className="badge-withdrawn">Withdrawn</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="content">
          {selectedVault ? (
            <>
              <VaultDetail
                vaultId={selectedVault.vaultId}
                onWithdraw={handleWithdraw}
                onSetBeneficiary={handleSetBeneficiary}
                onFetchVault={handleFetchVault}
                onEmergencyWithdraw={handleEmergencyWithdraw}
                penaltyRate={10}
              />
              <VaultHistory
                vaultId={selectedVault.vaultId}
                events={getEvents(selectedVault.vaultId)}
              />
            </>
          ) : (
            <div className="empty-content">
              <h2>No vault selected</h2>
              <p>Select a vault from the list or create a new one to get started.</p>
            </div>
          )}
        </section>
      </main>

      <CreateVaultModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateVault={handleCreateVault}
      />

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
};

export default App;
