'use client';

import { createContext, useCallback, useContext, useReducer } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

type Action =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string };

function reducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

interface ToastContextValue {
  toasts: Toast[];
  toast: {
    success: (title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => void;
    error:   (title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => void;
    warning: (title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => void;
    info:    (title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => void;
  };
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const add = useCallback((variant: ToastVariant, title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => {
    const id = crypto.randomUUID();
    const duration = opts?.duration ?? 5000;
    dispatch({ type: 'ADD', toast: { id, variant, title, ...opts } });
    setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
  }, []);

  const dismiss = useCallback((id: string) => dispatch({ type: 'REMOVE', id }), []);

  const toast = {
    success: (title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => add('success', title, opts),
    error:   (title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => add('error',   title, opts),
    warning: (title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => add('warning', title, opts),
    info:    (title: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'title'>>) => add('info',    title, opts),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
