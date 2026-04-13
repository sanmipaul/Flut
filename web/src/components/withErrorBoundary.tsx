/**
 * withErrorBoundary Higher-Order Component
 * Wraps a component with ErrorBoundary for error handling
 */

import React, { ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export interface WithErrorBoundaryProps {
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  fallback?: ReactNode;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: WithErrorBoundaryProps
) {
  return class WithErrorBoundary extends React.Component<P & WithErrorBoundaryProps> {
    static displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    render() {
      const { onError, maxRetries, fallback, ...rest } = this.props;
      
      return (
        <ErrorBoundary
          onError={onError}
          maxRetries={maxRetries}
          fallback={fallback}
        >
          <WrappedComponent {...(rest as P)} />
        </ErrorBoundary>
      );
    }
  };
}

export default withErrorBoundary;