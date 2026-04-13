/**
 * useErrorBoundary Hook
 * Provides error boundary functionality for functional components
 */

import { useCallback, useState } from 'react';

export interface UseErrorBoundaryOptions {
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

export interface UseErrorBoundaryReturn {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  resetError: () => void;
  retry: () => void;
  triggerError: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function useErrorBoundary(options: UseErrorBoundaryOptions = {}): UseErrorBoundaryReturn {
  const { onError, maxRetries = 3 } = options;
  
  const [state, setState] = useState<{
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    retryCount: number;
  }>({
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  });

  const resetError = useCallback(() => {
    setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  }, []);

  const retry = useCallback(() => {
    if (state.retryCount < maxRetries) {
      setState(prev => ({
        ...prev,
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prev.retryCount + 1,
      }));
    }
  }, [state.retryCount, maxRetries]);

  const triggerError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    setState(prev => ({
      hasError: true,
      error,
      errorInfo,
      retryCount: prev.retryCount,
    }));

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Log error to console in development
    if (typeof window !== 'undefined') {
      const isDev = typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (isDev) {
        console.error('useErrorBoundary caught an error:', error, errorInfo);
      }
    }
  }, [onError]);

  return {
    hasError: state.hasError,
    error: state.error,
    errorInfo: state.errorInfo,
    retryCount: state.retryCount,
    resetError,
    retry,
    triggerError,
  };
}

export default useErrorBoundary;