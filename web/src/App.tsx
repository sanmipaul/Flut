import React, { useState, useEffect, useMemo } from 'react';
import CreateVaultModal from './components/CreateVaultModal';
import CopyButton from './components/CopyButton';
import VaultDetail from './components/VaultDetail';
import { useAllVaultSettings } from './hooks/useAllVaultSettings';

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

const AppInner: React.FC = () => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [settingsVersion, setSettingsVersion] = useState(0);

  const vaultIds = useMemo(() => vaults.map((v) => v.vaultId), [vaults]);
  const { getSettings, refresh: refreshSettings } = useAllVaultSettings(vaultIds);

  // Refresh sidebar settings when VaultSettingsPanel signals a change
  const handleSettingsChange = () => {
    setSettingsVersion((v) => v + 1);
    refreshSettings();
  };

  const { toasts, dismissToast, clearAll, toast } = useToast();

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

  const handleCreateVault = async (amount: number, lockDuration: number, beneficiary?: string, enableStacking?: boolean, stackingPool?: string) => {
    try {
      setLoading(true);

      const newVault: Vault = {
        vaultId,
        creator: userAddress || 'unknown',
        amount,
        unlockHeight: lockDuration,
        createdAt: 0,
        isWithdrawn: false,
        beneficiary,
        currentBlockHeight: 0,
        stackingEnabled: enableStacking ?? false,
        stackingPool,
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
    if (!vault) throw new Error('Vault not found');
    return vault;
  };

  const selectedVault = selectedVaultId !== null
    ? vaults.find((v) => v.vaultId === selectedVaultId)
    : null;

  // Sort vaults: pinned first, then by vaultId
  const sortedVaults = useMemo(() => {
    return [...vaults].sort((a, b) => {
      const aPinned = getSettings(a.vaultId).pinned ? 0 : 1;
      const bPinned = getSettings(b.vaultId).pinned ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;
      return a.vaultId - b.vaultId;
    });
  // settingsVersion triggers re-sort when settings change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaults, getSettings, settingsVersion]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-toggle">
          <ThemeToggle />
        </div>
        <div className="app-header-inner">
          <h1>Flut — STX Savings Vault</h1>
          <p>Lock your STX, designate beneficiaries, withdraw when unlocked</p>
        </div>
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

          {sortedVaults.length === 0 ? (
            <div className="empty-state">
              <p>No vaults yet. Create one to get started!</p>
            </div>
          ) : filteredVaults.length === 0 ? (
            <div className="vault-list-empty">
              <span className="empty-icon" aria-hidden="true">🔍</span>
              <p>No vaults match your filters.</p>
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters} type="button">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <ul className="vault-list">
              {sortedVaults.map((vault) => {
                const vs = getSettings(vault.vaultId);
                const colorClass = vs.colorTag !== 'none' ? `vault-item--tag-${vs.colorTag}` : '';
                const pinnedClass = vs.pinned ? 'vault-item--pinned' : '';
                return (
                  <li
                    key={vault.vaultId}
                    className={`vault-item ${selectedVaultId === vault.vaultId ? 'active' : ''} ${colorClass} ${pinnedClass}`}
                    onClick={() => setSelectedVaultId(vault.vaultId)}
                  >
                    <span className="vault-id">
                      {vs.pinned && <span className="pin-icon" aria-label="Pinned" title="Pinned">📌</span>}
                      {vs.nickname ? vs.nickname : `Vault #${vault.vaultId}`}
                    </span>
                    <span className="vault-amount">
                      {vs.compactDisplay && vault.amount >= 1_000
                        ? `${(vault.amount / (vault.amount >= 1_000_000 ? 1_000_000 : 1_000)).toFixed(1)}${vault.amount >= 1_000_000 ? 'M' : 'k'} STX`
                        : `${vault.amount.toLocaleString()} STX`}
                    </span>
                    {vault.beneficiary && <span className="badge-beneficiary">Has Beneficiary</span>}
                    {vault.isWithdrawn && <span className="badge-withdrawn">Withdrawn</span>}
                  </li>
                );
              })}
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
              onSettingsChange={handleSettingsChange}
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

      <ToastContainer toasts={toasts} onDismiss={dismissToast} onClearAll={clearAll} />
    </div>
  );
};

export const App: React.FC = () => (
  <ThemeProvider>
    <AppInner />
  </ThemeProvider>
);

export default App;
