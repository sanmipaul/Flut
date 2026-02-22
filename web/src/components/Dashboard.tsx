import React, { useEffect, useState } from 'react';
import { useIsMobile, useScreenSize } from '../context/ResponsiveContext';
import VaultCard from './VaultCard';
import CreateVaultDrawer from './CreateVaultDrawer';
import OfflineIndicator from './OfflineIndicator';
import { saveVaultToOfflineStorage, getOfflineVaults, clearOfflineStorage } from '../utils/OfflineStorage';
import { initializePushNotifications, scheduleVaultUnlockNotification } from '../utils/PushNotifications';

interface DashboardVault {
  vaultId: string;
  vaultName?: string;
  amount: number;
  unlockDate: string;
  status: 'locked' | 'unlocked' | 'withdrawn';
  owner: string;
  daysRemaining?: number;
}

interface DashboardProps {
  vaults?: DashboardVault[];
  onCreateVault?: (data: { amount: number; unlockDate: string; beneficiary?: string }) => Promise<void>;
  onWithdraw?: (vaultId: string) => Promise<void>;
  onViewVaultDetail?: (vaultId: string) => void;
  isLoadingVaults?: boolean;
  error?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ vaults = [], onCreateVault, onWithdraw, onViewVaultDetail, isLoadingVaults = false, error }) => {
  const isMobile = useIsMobile();
  const screenSize = useScreenSize();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [displayedVaults, setDisplayedVaults] = useState<DashboardVault[]>(vaults);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissOfflineAlert, setDismissOfflineAlert] = useState(false);

  useEffect(() => {
    const initPWA = async () => {
      try {
        await initializePushNotifications();
        console.log('PWA features initialized');
      } catch (err) {
        console.error('Failed to initialize PWA:', err);
      }
    };
    initPWA();
  }, []);

  useEffect(() => {
    if (vaults.length > 0 && isOnline) {
      vaults.forEach((vault) => {
        saveVaultToOfflineStorage({
          vaultId: vault.vaultId,
          vaultName: vault.vaultName || `Vault #${vault.vaultId}`,
          owner: vault.owner,
          amount: vault.amount,
          unlockDate: vault.unlockDate,
          status: vault.status,
          locked: vault.status === 'locked',
          timestamp: Date.now(),
        });
        if (vault.status === 'locked') {
          scheduleVaultUnlockNotification(
            vault.vaultId,
            vault.vaultName || `Vault #${vault.vaultId}`,
            vault.unlockDate
          );
        }
      });
    }
  }, [vaults, isOnline]);

  useEffect(() => {
    if (!isOnline && vaults.length === 0) {
      const cachedVaults = getOfflineVaults();
      if (cachedVaults.length > 0) {
        const formattedVaults: DashboardVault[] = cachedVaults.map((v) => ({
          vaultId: v.vaultId,
          vaultName: v.vaultName,
          amount: v.amount,
          unlockDate: v.unlockDate,
          status: v.locked ? 'locked' : 'unlocked',
          owner: v.owner,
          daysRemaining: Math.ceil((new Date(v.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        }));
        setDisplayedVaults(formattedVaults);
      }
    } else {
      setDisplayedVaults(vaults);
    }
  }, [isOnline, vaults]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissOfflineAlert(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCreateVault = async (data: { amount: number; unlockDate: string; beneficiary?: string }) => {
    if (!onCreateVault) {
      console.error('onCreateVault callback not provided');
      return;
    }
    try {
      await onCreateVault(data);
      setIsCreateDrawerOpen(false);
    } catch (err) {
      console.error('Failed to create vault:', err);
      throw err;
    }
  };

  const handleWithdraw = async (vaultId: string) => {
    if (!onWithdraw) {
      console.error('onWithdraw callback not provided');
      return;
    }
    try {
      await onWithdraw(vaultId);
    } catch (err) {
      console.error('Failed to withdraw:', err);
      throw err;
    }
  };

  const handleViewDetails = (vaultId: string) => {
    if (onViewVaultDetail) {
      onViewVaultDetail(vaultId);
    }
  };

  return (
    <div className={`dashboard min-h-screen ${isMobile ? 'pt-16' : 'pt-8'} pb-8 bg-gray-50`}>
      {!isOnline && !dismissOfflineAlert && (
        <OfflineIndicator isOnline={isOnline} onDismiss={() => setDismissOfflineAlert(true)} />
      )}
      <div className={`${isMobile ? 'px-4' : 'px-6 max-w-7xl mx-auto'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'flex-col gap-4 mb-6' : 'mb-8'}`}>
          <div>
            <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl text-center' : 'text-4xl'}`}>My Vaults</h1>
            <p className={`text-gray-600 ${isMobile ? 'text-center text-sm mt-1' : 'mt-2'}`}>
              {!isOnline && <span className="text-yellow-600 font-medium">Offline Mode - Showing Cached Data</span>}
              {isOnline && displayedVaults.length > 0 && <span>You have {displayedVaults.length} vault{displayedVaults.length !== 1 ? 's' : ''}</span>}
            </p>
          </div>
          <button
            onClick={() => setIsCreateDrawerOpen(true)}
            disabled={isLoadingVaults || !isOnline}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium ${isMobile ? 'w-full' : ''}`}
          >
            + Create Vault
          </button>
        </div>
        {error && (
          <div className={`${isMobile ? 'mb-4 p-3' : 'mb-6 p-4'} bg-red-100 border border-red-400 text-red-800 rounded-lg`}>
            {error}
          </div>
        )}
        {isLoadingVaults && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <p className="mt-4 text-gray-600">Loading vaults...</p>
          </div>
        )}
        {!isLoadingVaults && displayedVaults.length === 0 && (
          <div className={`text-center ${isMobile ? 'py-12' : 'py-20'}`}>
            <div className={`${isMobile ? 'text-4xl mb-3' : 'text-6xl mb-4'}`}>🏦</div>
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>No Vaults Yet</h3>
            <p className={`text-gray-600 ${isMobile ? 'text-sm mt-2' : 'mt-3'}`}>Create your first vault to get started</p>
            {isOnline && (
              <button
                onClick={() => setIsCreateDrawerOpen(true)}
                className={`mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium ${isMobile ? 'text-sm w-full' : ''}`}
              >
                Create First Vault
              </button>
            )}
          </div>
        )}
        {!isLoadingVaults && displayedVaults.length > 0 && (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : screenSize === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {displayedVaults.map((vault) => (
              <VaultCard
                key={vault.vaultId}
                vaultId={vault.vaultId}
                vaultName={vault.vaultName}
                amount={vault.amount}
                unlockDate={vault.unlockDate}
                status={vault.status}
                owner={vault.owner}
                daysRemaining={vault.daysRemaining}
                onViewDetails={() => handleViewDetails(vault.vaultId)}
                onWithdraw={vault.status === 'unlocked' && isOnline ? () => handleWithdraw(vault.vaultId) : undefined}
              />
            ))}
          </div>
        )}
      </div>
      {isOnline && (
        <CreateVaultDrawer
          isOpen={isCreateDrawerOpen}
          onClose={() => setIsCreateDrawerOpen(false)}
          onSubmit={handleCreateVault}
          isLoading={isLoadingVaults}
        />
      )}
    </div>
  );
};

export default Dashboard;
