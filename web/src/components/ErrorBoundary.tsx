/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  className?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (typeof window !== 'undefined') {
      const isDev = typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (isDev) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { retryCount, error, errorInfo } = this.state;
      const { maxRetries = 3 } = this.props;

      return (
        <div 
          className={`error-boundary ${this.props.className || ''}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="error-boundary-content">
            <div className="error-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            
            <h2 id="error-title" className="error-title">Something went wrong</h2>
            <p id="error-message" className="error-message">
              We're sorry, but something unexpected happened. Please try again.
            </p>

            {error && (
              <details className="error-details">
                <summary className="error-summary">Error Details</summary>
                <pre className="error-stack" aria-label="Technical error details">
                  {error.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              {retryCount < maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="error-action-button retry focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  type="button"
                  aria-label={`Try again to recover from error (${maxRetries - retryCount} attempts remaining)`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Try Again ({maxRetries - retryCount} attempts left)
                </button>
              )}
              
              <button
                onClick={this.handleReset}
                className="error-action-button reset focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                type="button"
                aria-label="Reset application state and return to home"
              >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Reset
              </button>
            </div>

            <p className="error-hint">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;