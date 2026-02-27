import React, { useState, useEffect } from 'react';
import CreateVaultModal from './components/CreateVaultModal';
import VaultDetail from './components/VaultDetail';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';

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
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const { toasts, dismissToast, toast } = useToast();

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

      const newVault: Vault = {
        vaultId: vaults.length,
        creator: userAddress || 'unknown',
        amount,
        unlockHeight: lockDuration,
        createdAt: 0,
        isWithdrawn: false,
        beneficiary,
        currentBlockHeight: 0,
      };

      setVaults([...vaults, newVault]);
      toast.success('Vault created!', {
        description: `${amount} STX locked for ${lockDuration} blocks${beneficiary ? ' with beneficiary' : ''}.`,
      });
    } catch (err) {
      toast.error('Failed to create vault', {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (vaultId: number) => {
    try {
      setLoading(true);

      const vault = vaults.find((v) => v.vaultId === vaultId);
      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, isWithdrawn: true } : v
      );
      setVaults(updatedVaults);

      toast.success('Withdrawal successful!', {
        description: vault
          ? `${vault.amount} STX sent to ${vault.beneficiary ?? vault.creator}.`
          : undefined,
      });
    } catch (err) {
      toast.error('Withdrawal failed', {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetBeneficiary = async (vaultId: number, beneficiary: string) => {
    try {
      setLoading(true);

      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, beneficiary } : v
      );
      setVaults(updatedVaults);

      toast.success('Beneficiary updated', {
        description: `Vault #${vaultId} will pay out to ${beneficiary}.`,
      });
    } catch (err) {
      toast.error('Failed to set beneficiary', {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyWithdraw = async (vaultId: number) => {
    try {
      setLoading(true);

      const vault = vaults.find((v) => v.vaultId === vaultId);
      const penaltyRate = 10;
      const netAmount = vault
        ? vault.amount - Math.floor((vault.amount * penaltyRate) / 100)
        : 0;

      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, isWithdrawn: true } : v
      );
      setVaults(updatedVaults);

      toast.warning('Emergency withdrawal complete', {
        description: vault
          ? `${netAmount} STX received after ${penaltyRate}% penalty.`
          : undefined,
        duration: 8000,
      });
    } catch (err) {
      toast.error('Emergency withdrawal failed', {
        description: err instanceof Error ? err.message : undefined,
      });
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
            <VaultDetail
              vaultId={selectedVault.vaultId}
              onWithdraw={handleWithdraw}
              onSetBeneficiary={handleSetBeneficiary}
              onFetchVault={handleFetchVault}
              onEmergencyWithdraw={handleEmergencyWithdraw}
              penaltyRate={10}
            />
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

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
