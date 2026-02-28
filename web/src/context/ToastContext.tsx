/**
 * ToastContext
 *
 * Provides the toast notification system to the entire component tree.
 * Wrap the app with <ToastProvider> and consume via useToastContext().
 *
 * @example
 *   const { toast } = useToastContext();
 *   toast.success('Vault created!');
 */
import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import type { UseToastReturn } from '../hooks/useToast';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<UseToastReturn | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastState = useToast();
  return (
    <ToastContext.Provider value={toastState}>
      {children}
    </ToastContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

export function useToastContext(): UseToastReturn {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastContext must be used inside <ToastProvider>');
  }
  return ctx;
}
