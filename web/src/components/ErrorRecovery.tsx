/**
 * Error Recovery Component
 * Provides a simple error recovery UI for functional components
 */

import React from 'react';
import { useErrorBoundary } from '../hooks/useErrorBoundary';

interface ErrorRecoveryProps {
  children: (errorState: {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    retryCount: number;
    resetError: () => void;
    retry: () => void;
  }) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  children,
  onError,
  maxRetries = 3,
}) => {
  const errorState = useErrorBoundary({ onError, maxRetries });

  return <>{children(errorState)}</>;
};

export default ErrorRecovery;