import React, { useEffect, useState } from 'react';

export interface PWAInstallPrompt {
  canInstall: boolean;
  installPrompt: Event | null;
  isInstalledAsPWA: boolean;
}

export const usePWAInstall = (): PWAInstallPrompt & { install: () => Promise<void>; dismissPrompt: () => void } => {
  const [canInstall, setCanInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalledAsPWA, setIsInstalledAsPWA] = useState(false);

  useEffect(() => {
    if (window.navigator.standalone === true) {
      setIsInstalledAsPWA(true);
    } else if ('mediaDevices' in navigator) {
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      if (mediaQuery.matches) {
        setIsInstalledAsPWA(true);
      }
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setCanInstall(true);
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    const handleAppInstalled = () => {
      setIsInstalledAsPWA(true);
      setCanInstall(false);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<void> => {
    if (!installPrompt || !(installPrompt as any).prompt) {
      console.log('Install prompt not available');
      return;
    }

    try {
      (installPrompt as any).prompt();
      const { outcome } = await (installPrompt as any).userChoice;
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
        setCanInstall(false);
        setInstallPrompt(null);
      } else {
        console.log('PWA installation dismissed');
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const dismissPrompt = (): void => {
    setCanInstall(false);
    setInstallPrompt(null);
  };

  return { canInstall, installPrompt, isInstalledAsPWA, install, dismissPrompt };
};

export default usePWAInstall;
