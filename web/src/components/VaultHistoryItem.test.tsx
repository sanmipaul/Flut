/**
 * Tests for VaultHistoryItem component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VaultHistoryItem from './VaultHistoryItem';
import type { VaultEvent } from '../types/VaultEvent';

const baseEvent: VaultEvent = {
  id: 'evt_test_1',
  vaultId: 1,
  kind: 'vault_created',
  blockHeight: 12345,
  timestamp: new Date('2024-01-15T10:30:00Z').getTime(),
  description: 'Vault created with 500 STX, unlocks at block 14361',
  meta: { amount: 500, lockDuration: 2016, unlockHeight: 14361 },
};

describe('VaultHistoryItem', () => {
  it('renders the event description', () => {
    render(<ul><VaultHistoryItem event={baseEvent} /></ul>);
    expect(screen.getByText(/500 STX/)).toBeDefined();
  });

  it('renders the block height', () => {
    render(<ul><VaultHistoryItem event={baseEvent} /></ul>);
    expect(screen.getByText(/Block #12,345/)).toBeDefined();
  });

  it('renders the event label', () => {
    render(<ul><VaultHistoryItem event={baseEvent} /></ul>);
    expect(screen.getByText('Vault Created')).toBeDefined();
  });

  it('applies info severity class for vault_created', () => {
    render(<ul><VaultHistoryItem event={baseEvent} /></ul>);
    const item = document.querySelector('.history-item--info');
    expect(item).not.toBeNull();
  });

  it('applies success severity class for withdrawal', () => {
    const event: VaultEvent = {
      ...baseEvent,
      kind: 'withdrawal',
      description: 'Withdrew 500 STX to SP123',
      meta: { amount: 500, recipient: 'SP123' },
    };
    render(<ul><VaultHistoryItem event={event} /></ul>);
    const item = document.querySelector('.history-item--success');
    expect(item).not.toBeNull();
  });

  it('applies danger severity class for emergency_withdrawal', () => {
    const event: VaultEvent = {
      ...baseEvent,
      kind: 'emergency_withdrawal',
      description: 'Emergency withdrew 450 STX',
      meta: { amount: 500, penaltyAmount: 50, netAmount: 450, recipient: 'SP123', penaltyRate: 10 },
    };
    render(<ul><VaultHistoryItem event={event} /></ul>);
    const item = document.querySelector('.history-item--danger');
    expect(item).not.toBeNull();
  });

  it('renders tx hash when provided', () => {
    const event: VaultEvent = {
      ...baseEvent,
      txId: '0xabcdef1234567890abcdef',
    };
    render(<ul><VaultHistoryItem event={event} /></ul>);
    expect(screen.getByText(/Tx:/)).toBeDefined();
  });

  it('does not render tx section when txId is absent', () => {
    render(<ul><VaultHistoryItem event={baseEvent} /></ul>);
    expect(screen.queryByText(/Tx:/)).toBeNull();
  });

  it('renders an accessible time element', () => {
    render(<ul><VaultHistoryItem event={baseEvent} /></ul>);
    const timeEl = document.querySelector('time');
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute('dateTime')).toBeTruthy();
  });
});
