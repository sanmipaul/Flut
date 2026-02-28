/**
 * Tests for ToastContext provider and useToastContext hook.
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToastContext } from './ToastContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>{children}</ToastProvider>
);

function ConsumerComponent() {
  const { toast } = useToastContext();
  return (
    <button onClick={() => toast.success('From context')}>Fire toast</button>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ToastProvider / useToastContext', () => {
  it('renders children without error', () => {
    render(
      <ToastProvider>
        <p>Child</p>
      </ToastProvider>
    );
    expect(screen.getByText('Child')).toBeDefined();
  });

  it('useToastContext returns toast shortcuts inside ToastProvider', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper: Wrapper });
    expect(typeof result.current.toast.success).toBe('function');
    expect(typeof result.current.toast.error).toBe('function');
  });

  it('addToast via context adds a toast to the list', () => {
    const { result } = renderHook(() => useToastContext(), { wrapper: Wrapper });
    act(() => {
      result.current.toast.info('Context toast');
    });
    expect(result.current.toasts[0].message).toBe('Context toast');
  });

  it('throws when used outside ToastProvider', () => {
    // Suppress the expected console.error from React
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useToastContext());
    }).toThrow('useToastContext must be used inside <ToastProvider>');
    spy.mockRestore();
  });
});
