'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { WalletProvider } from '@/context/WalletContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { MissingConfigBanner } from '@/components/ui/MissingConfigBanner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <WalletProvider>
          <MissingConfigBanner />
          {children}
          <ToastContainer />
        </WalletProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
