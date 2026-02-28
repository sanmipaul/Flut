import { useState, useEffect, useCallback } from 'react';

export interface ConnectivityStatus {
  isOnline: boolean;
  wasOffline: boolean;
  offlineDuration: number;
  lastOnlineTime: number | null;
  lastOfflineTime: number | null;
}

export const useConnectivity = (): ConnectivityStatus & { getConnectionSpeed: () => Promise<string | null>; checkConnectivity: () => Promise<boolean> } => {
  const [status, setStatus] = useState<ConnectivityStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
    offlineDuration: 0,
    lastOnlineTime: Date.now(),
    lastOfflineTime: null,
  });

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/manifest.json', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const getConnectionSpeed = useCallback(async (): Promise<string | null> => {
    try {
      const connection = (navigator as any).connection || (navigator as any).mozConnection;
      if (!connection) return null;
      const effectiveType = connection.effectiveType;
      return effectiveType;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        wasOffline: prev.wasOffline || prev.offlineDuration > 0,
        offlineDuration: prev.lastOfflineTime ? Date.now() - prev.lastOfflineTime : prev.offlineDuration,
        lastOnlineTime: Date.now(),
      }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false, lastOfflineTime: Date.now() }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { ...status, checkConnectivity, getConnectionSpeed };
};

export default useConnectivity;
