import React, { useEffect, useState } from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { getCacheMetadata, getCacheAge } from '../utils/OfflineStorage';

interface OfflineIndicatorProps {
  isOnline?: boolean;
  onDismiss?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline, onDismiss }) => {
  const isMobile = useIsMobile();
  const [displayOnline, setDisplayOnline] = useState<boolean>(true);
  const [cacheAge, setCacheAge] = useState<string>('');

  useEffect(() => {
    if (isOnline === undefined) {
      setDisplayOnline(navigator.onLine);
      const handleOnline = () => setDisplayOnline(true);
      const handleOffline = () => setDisplayOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      setDisplayOnline(isOnline);
    }
  }, [isOnline]);

  useEffect(() => {
    const updateCacheAge = () => {
      const age = getCacheAge();
      if (age !== null) {
        const minutes = Math.floor(age / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
          setCacheAge(`${days}d ago`);
        } else if (hours > 0) {
          setCacheAge(`${hours}h ago`);
        } else if (minutes > 0) {
          setCacheAge(`${minutes}m ago`);
        } else {
          setCacheAge('just now');
        }
      }
    };
    updateCacheAge();
    const interval = setInterval(updateCacheAge, 60000);
    return () => clearInterval(interval);
  }, []);

  if (displayOnline) {
    return null;
  }

  const metadata = getCacheMetadata();
  const hasCachedData = metadata && metadata.vaultCount > 0;

  return (
    <div className={`fixed top-0 left-0 right-0 ${isMobile ? 'z-40' : 'z-50'} bg-yellow-50 border-b-2 border-yellow-400 shadow-md`}>
      <div className={`flex items-center justify-between ${isMobile ? 'px-3 py-2 gap-2' : 'px-6 py-3 gap-4'} max-w-7xl mx-auto`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18.364 5.364l-3.536 3.536m0 0L9 16.728M4.172 9.172L.636 5.636m0 0l3.536-3.536m-3.536 3.536L1.414 1.414" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-yellow-800 font-medium ${isMobile ? 'text-sm' : ''}`}>You're offline</p>
            {hasCachedData && (
              <p className={`text-yellow-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Showing {metadata!.vaultCount} cached vault{metadata!.vaultCount !== 1 ? 's' : ''} {cacheAge && `from ${cacheAge}`}
              </p>
            )}
            {!hasCachedData && (
              <p className={`text-yellow-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                No cached data available. Check your connection.
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          {onDismiss && (
            <button onClick={onDismiss} className={`text-yellow-700 hover:text-yellow-900 font-medium transition ${isMobile ? 'text-sm px-2 py-1' : 'px-3 py-1'}`}>
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
