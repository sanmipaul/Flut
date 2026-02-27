/**
 * Tests for VaultHistory panel component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VaultHistory from './VaultHistory';
import type { VaultEvent } from '../types/VaultEvent';

const makeEvent = (id: string, blockHeight: number): VaultEvent => ({
  id,
  vaultId: 1,
  kind: 'vault_created',
  blockHeight,
  timestamp: Date.now(),
  description: 'Test event',
  meta: { amount: 100, lockDuration: 10, unlockHeight: 110 },
});

describe('VaultHistory', () => {
  it('renders the heading', () => {
    render(<VaultHistory vaultId={1} events={[]} />);
    expect(screen.getByText('Transaction History')).toBeDefined();
  });

  it('shows empty state when no events', () => {
    render(<VaultHistory vaultId={1} events={[]} />);
    expect(screen.getByText(/No events recorded yet/)).toBeDefined();
  });

  it('shows event count badge when events are present', () => {
    const events = [makeEvent('a', 100), makeEvent('b', 200)];
    render(<VaultHistory vaultId={1} events={events} />);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('does not show badge when events list is empty', () => {
    render(<VaultHistory vaultId={1} events={[]} />);
    expect(screen.queryByLabelText(/events/)).toBeNull();
  });

  it('renders all events', () => {
    const events = [
      makeEvent('evt1', 100),
      makeEvent('evt2', 200),
      makeEvent('evt3', 300),
    ];
    render(<VaultHistory vaultId={1} events={events} />);
    const descriptions = screen.getAllByText('Test event');
    expect(descriptions).toHaveLength(3);
  });

  it('starts expanded', () => {
    const events = [makeEvent('a', 100)];
    render(<VaultHistory vaultId={1} events={events} />);
    expect(screen.getByText('Collapse')).toBeDefined();
  });

  it('collapses when toggle button is clicked', () => {
    const events = [makeEvent('a', 100)];
    render(<VaultHistory vaultId={1} events={events} />);
    fireEvent.click(screen.getByText('Collapse'));
    expect(screen.getByText('Expand')).toBeDefined();
    expect(screen.queryByText('Test event')).toBeNull();
  });

  it('expands again after second toggle click', () => {
    const events = [makeEvent('a', 100)];
    render(<VaultHistory vaultId={1} events={events} />);
    fireEvent.click(screen.getByText('Collapse'));
    fireEvent.click(screen.getByText('Expand'));
    expect(screen.getByText('Test event')).toBeDefined();
  });

  it('shows loading skeleton when loading is true', () => {
    render(<VaultHistory vaultId={1} events={[]} loading />);
    const skeletons = document.querySelectorAll('.vault-history__skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('hides events during loading', () => {
    const events = [makeEvent('a', 100)];
    render(<VaultHistory vaultId={1} events={events} loading />);
    expect(screen.queryByText('Test event')).toBeNull();
  });
});
