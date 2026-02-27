import React, { useState, useEffect } from 'react';
import CreateVaultModal from './components/CreateVaultModal';
import VaultDetail from './components/VaultDetail';
import VaultSearchBar from './components/VaultSearchBar';
import { useVaultFilter } from './hooks/useVaultFilter';

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

  const {
    filteredVaults,
    filterState,
    resultCount,
    hasActiveFilters,
    setSearchQuery,
    setStatusFilter,
    setLockFilter,
    setSortField,
    toggleSortDirection,
    clearFilters,
  } = useVaultFilter(vaults);

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

      const newVault: Vault = {
        vaultId: vaults.length,
        creator: userAddress || 'unknown',
        amount,
        unlockHeight: 0,
        createdAt: 0,
        isWithdrawn: false,
        beneficiary,
        currentBlockHeight: 0,
      };

      setVaults([...vaults, newVault]);
      console.log('Vault created:', newVault);
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
      console.log('Withdrawing from vault:', vaultId);
      setVaults((prev) => prev.map((v) => v.vaultId === vaultId ? { ...v, isWithdrawn: true } : v));
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
      console.log(`Setting beneficiary for vault ${vaultId}:`, beneficiary);
      setVaults((prev) => prev.map((v) => v.vaultId === vaultId ? { ...v, beneficiary } : v));
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
      console.log(`Emergency withdrawing from vault ${vaultId}`);
      setVaults((prev) => prev.map((v) => v.vaultId === vaultId ? { ...v, isWithdrawn: true } : v));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process emergency withdrawal');
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

          {vaults.length > 0 && (
            <VaultSearchBar
              filterState={filterState}
              resultCount={resultCount}
              totalCount={vaults.length}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onLockFilterChange={setLockFilter}
              onSortFieldChange={setSortField}
              onToggleSortDirection={toggleSortDirection}
              onClearFilters={clearFilters}
            />
          )}

          {vaults.length === 0 ? (
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
              {filteredVaults.map((vault) => (
                <li
                  key={vault.vaultId}
                  className={`vault-item ${selectedVaultId === vault.vaultId ? 'active' : ''}`}
                  onClick={() => setSelectedVaultId(vault.vaultId)}
                >
                  <span className="vault-id">Vault #{vault.vaultId}</span>
                  <span className="vault-amount">{vault.amount} STX</span>
                  {vault.beneficiary && <span className="badge-beneficiary">Has Beneficiary</span>}
                  {vault.isWithdrawn && <span className="badge-withdrawn">Withdrawn</span>}
                  {!vault.isWithdrawn && vault.currentBlockHeight >= vault.unlockHeight && (
                    <span className="badge-unlocked">Unlocked</span>
                  )}
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

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
};

export default App;
