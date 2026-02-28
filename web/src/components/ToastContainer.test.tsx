/**
 * Tests for ToastContainer component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToastContainer from './ToastContainer';
import type { Toast } from '../types/Toast';

const makeToast = (id: string, message: string): Toast => ({
  id,
  variant: 'info',
  message,
  duration: 4000,
  dismissing: false,
  createdAt: Date.now(),
});

describe('ToastContainer', () => {
  it('renders nothing when toasts array is empty', () => {
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders one toast', () => {
    render(
      <ToastContainer
        toasts={[makeToast('t1', 'First toast')]}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('First toast')).toBeDefined();
  });

  it('renders multiple toasts', () => {
    render(
      <ToastContainer
        toasts={[
          makeToast('t1', 'Toast A'),
          makeToast('t2', 'Toast B'),
          makeToast('t3', 'Toast C'),
        ]}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('Toast A')).toBeDefined();
    expect(screen.getByText('Toast B')).toBeDefined();
    expect(screen.getByText('Toast C')).toBeDefined();
  });

  it('applies the default position class (top-right)', () => {
    render(
      <ToastContainer
        toasts={[makeToast('t1', 'Positioned')]}
        onDismiss={vi.fn()}
      />
    );
    expect(document.querySelector('.toast-container--top-right')).not.toBeNull();
  });

  it('applies a custom position class', () => {
    render(
      <ToastContainer
        toasts={[makeToast('t1', 'Bottom')]}
        onDismiss={vi.fn()}
        position="bottom-center"
      />
    );
    expect(document.querySelector('.toast-container--bottom-center')).not.toBeNull();
  });
});
