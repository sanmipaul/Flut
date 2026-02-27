/**
 * Tests for ToastItem component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToastItem from './ToastItem';
import type { Toast } from '../types/Toast';

const makeToast = (overrides: Partial<Toast> = {}): Toast => ({
  id: 'test-toast-1',
  variant: 'info',
  message: 'Test message',
  duration: 4000,
  dismissing: false,
  createdAt: Date.now(),
  ...overrides,
});

describe('ToastItem', () => {
  it('renders the message', () => {
    render(<ToastItem toast={makeToast()} onDismiss={vi.fn()} />);
    expect(screen.getByText('Test message')).toBeDefined();
  });

  it('renders the description when provided', () => {
    render(
      <ToastItem
        toast={makeToast({ description: 'Extra details' })}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('Extra details')).toBeDefined();
  });

  it('does not render description paragraph when absent', () => {
    render(<ToastItem toast={makeToast()} onDismiss={vi.fn()} />);
    expect(screen.queryByText('Extra details')).toBeNull();
  });

  it('renders the close button', () => {
    render(<ToastItem toast={makeToast()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeDefined();
  });

  it('calls onDismiss with the toast id when close is clicked', () => {
    const onDismiss = vi.fn();
    render(<ToastItem toast={makeToast({ id: 'abc-123' })} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledWith('abc-123');
  });

  it('applies success variant class', () => {
    render(<ToastItem toast={makeToast({ variant: 'success' })} onDismiss={vi.fn()} />);
    expect(document.querySelector('.toast--success')).not.toBeNull();
  });

  it('applies error variant class', () => {
    render(<ToastItem toast={makeToast({ variant: 'error' })} onDismiss={vi.fn()} />);
    expect(document.querySelector('.toast--error')).not.toBeNull();
  });

  it('applies warning variant class', () => {
    render(<ToastItem toast={makeToast({ variant: 'warning' })} onDismiss={vi.fn()} />);
    expect(document.querySelector('.toast--warning')).not.toBeNull();
  });

  it('applies enter animation class when not dismissing', () => {
    render(<ToastItem toast={makeToast({ dismissing: false })} onDismiss={vi.fn()} />);
    expect(document.querySelector('.toast--enter')).not.toBeNull();
  });

  it('applies exit animation class when dismissing', () => {
    render(<ToastItem toast={makeToast({ dismissing: true })} onDismiss={vi.fn()} />);
    expect(document.querySelector('.toast--exit')).not.toBeNull();
  });

  it('renders a progress bar when duration > 0', () => {
    render(<ToastItem toast={makeToast({ duration: 4000 })} onDismiss={vi.fn()} />);
    expect(document.querySelector('.toast__progress-track')).not.toBeNull();
  });

  it('does not render progress bar when duration is 0', () => {
    render(<ToastItem toast={makeToast({ duration: 0 })} onDismiss={vi.fn()} />);
    expect(document.querySelector('.toast__progress-track')).toBeNull();
  });

  it('uses role=alert for error variant', () => {
    render(<ToastItem toast={makeToast({ variant: 'error' })} onDismiss={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('uses role=status for success variant', () => {
    render(<ToastItem toast={makeToast({ variant: 'success' })} onDismiss={vi.fn()} />);
    expect(screen.getByRole('status')).toBeDefined();
  });
});
