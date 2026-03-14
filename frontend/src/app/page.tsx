'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { VaultDetailPanel } from '@/components/vault/VaultDetailPanel';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { CreateVaultModal } from '@/components/vault/create/CreateVaultModal';
import { useVaults } from '@/hooks/useVaults';
import { useVaultActions } from '@/hooks/useVaultActions';
import { useDelayedRefresh } from '@/hooks/useDelayedRefresh';

export default function Home() {
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { vaults, currentBlock, refresh } = useVaults();
  const delayedRefresh = useDelayedRefresh(refresh);
  const actions = useVaultActions(delayedRefresh);

  const selectedVault = selectedVaultId !== null
    ? vaults.find((v) => v.vaultId === selectedVaultId) ?? null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Header />

      <main className="flex flex-1 flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full p-4">
            <ErrorBoundary>
              <Sidebar
                selectedVaultId={selectedVaultId}
                onSelect={setSelectedVaultId}
                onCreateClick={() => setShowCreate(true)}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Main content */}
        <section className="flex-1 min-w-0">
          <ErrorBoundary>
            {selectedVault ? (
              <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <VaultDetailPanel
                  vault={selectedVault}
                  currentBlock={currentBlock}
                  onWithdraw={actions.withdraw}
                  onDeposit={actions.deposit}
                  onEmergencyWithdraw={actions.emergencyWithdraw}
                  onSetBeneficiary={actions.setBeneficiary}
                  pendingTxid={actions.lastTxid}
                  onDismissTx={actions.clearTxid}
                />
              </div>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                <div className="text-center space-y-2 p-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                    <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">No vault selected</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Select a vault from the sidebar or create a new one to get started.
                  </p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Vault
                  </button>
                </div>
              </div>
            )}
          </ErrorBoundary>
        </section>
      </main>

      <CreateVaultModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={async () => {
          await refresh();
          setShowCreate(false);
        }}
      />
    </div>
  );
}
