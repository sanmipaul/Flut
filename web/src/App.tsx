import React, { useState, useEffect } from 'react';
import CreateVaultModal from './components/CreateVaultModal';
import VaultDetail from './components/VaultDetail';
import VaultSearchBar from './components/VaultSearchBar';
import { useVaultSearch } from './hooks/useVaultSearch';

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

  useEffect(() => {
    // Initialize user connection
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // This would connect to Stacks wallet
      // For now, this is a placeholder
      console.log('Initializing user connection...');
    } catch (err) {
      console.error('Failed to initialize user:', err);
    }
  };

  const handleCreateVault = async (amount: number, lockDuration: number, beneficiary?: string) => {
    try {
      setLoading(true);
      setError('');

      // Call smart contract create-vault function
      // This is a placeholder that would call the actual blockchain function
      const newVault: Vault = {
        vaultId: vaults.length,
        creator: userAddress || 'unknown',
        amount,
        unlockHeight: 0, // Would be set by contract
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

      // Call smart contract withdraw function
      console.log('Withdrawing from vault:', vaultId);

      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, isWithdrawn: true } : v
      );
      setVaults(updatedVaults);
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

      // Call smart contract set-beneficiary function
      console.log(`Setting beneficiary for vault ${vaultId}:`, beneficiary);

      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, beneficiary } : v
      );
      setVaults(updatedVaults);
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

      // Call smart contract emergency-withdraw function
      console.log(`Emergency withdrawing from vault ${vaultId}`);

      const updatedVaults = vaults.map((v) =>
        v.vaultId === vaultId ? { ...v, isWithdrawn: true } : v
      );
      setVaults(updatedVaults);
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

  const {
    result: searchResult,
    searchState,
    setQuery,
    setStatusFilter,
    setSortField,
    toggleSortDirection,
    resetSearch,
  } = useVaultSearch(vaults);

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
            <>
              <VaultSearchBar
                query={searchState.query}
                statusFilter={searchState.statusFilter}
                sortField={searchState.sortField}
                sortDirection={searchState.sortDirection}
                matchCount={searchResult.matchCount}
                totalCount={searchResult.totalCount}
                isFiltered={searchResult.isFiltered}
                onQueryChange={setQuery}
                onStatusFilterChange={setStatusFilter}
                onSortFieldChange={setSortField}
                onSortDirectionToggle={toggleSortDirection}
                onReset={resetSearch}
              />

              {searchResult.vaults.length === 0 ? (
                <div className="empty-state empty-state--search">
                  <p>No vaults match your search.</p>
                  <button type="button" className="btn-ghost" onClick={resetSearch}>
                    Clear filters
                  </button>
                </div>
              ) : (
                <ul className="vault-list">
                  {searchResult.vaults.map((vault) => (
                    <li
                      key={vault.vaultId}
                      className={`vault-item ${selectedVaultId === vault.vaultId ? 'active' : ''}`}
                      onClick={() => setSelectedVaultId(vault.vaultId)}
                    >
                      <span className="vault-id">
                        {vault.nickname ? vault.nickname : `Vault #${vault.vaultId}`}
                      </span>
                      <span className="vault-amount">{vault.amount} STX</span>
                      {(vault as Vault).beneficiary && (
                        <span className="badge-beneficiary">Has Beneficiary</span>
                      )}
                      {vault.isWithdrawn && <span className="badge-withdrawn">Withdrawn</span>}
                    </li>
                  ))}
                </ul>
              )}
            </>
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
