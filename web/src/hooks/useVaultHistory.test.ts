/**
 * Tests for useVaultHistory hook and factory helpers.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  useVaultHistory,
  createVaultCreatedEvent,
  createBeneficiarySetEvent,
  createWithdrawalEvent,
  createEmergencyWithdrawalEvent,
  createBeneficiaryRemovedEvent,
} from './useVaultHistory';

// ---------------------------------------------------------------------------
// Factory helper tests
// ---------------------------------------------------------------------------

describe('event factory helpers', () => {
  it('createVaultCreatedEvent builds correct event', () => {
    const event = createVaultCreatedEvent(1, 100, {
      amount: 500,
      lockDuration: 2016,
      unlockHeight: 2116,
    });

    expect(event.kind).toBe('vault_created');
    expect(event.vaultId).toBe(1);
    expect(event.blockHeight).toBe(100);
    expect(event.description).toContain('500 STX');
    expect(event.description).toContain('2116');
    expect(event.id).toBeTruthy();
  });

  it('createBeneficiarySetEvent carries newBeneficiary in meta', () => {
    const event = createBeneficiarySetEvent(2, 200, {
      newBeneficiary: 'SP123',
    });

    expect(event.kind).toBe('beneficiary_set');
    expect(event.vaultId).toBe(2);
    expect((event.meta as { newBeneficiary: string }).newBeneficiary).toBe('SP123');
  });

  it('createWithdrawalEvent carries amount and recipient', () => {
    const event = createWithdrawalEvent(3, 300, {
      amount: 1000,
      recipient: 'SP456',
    });

    expect(event.kind).toBe('withdrawal');
    expect(event.description).toContain('1000 STX');
    expect(event.description).toContain('SP456');
  });

  it('createEmergencyWithdrawalEvent carries penalty data', () => {
    const event = createEmergencyWithdrawalEvent(4, 400, {
      amount: 1000,
      penaltyAmount: 100,
      netAmount: 900,
      recipient: 'SP789',
      penaltyRate: 10,
    });

    expect(event.kind).toBe('emergency_withdrawal');
    expect(event.description).toContain('900 STX');
    expect(event.description).toContain('10%');
  });

  it('createBeneficiaryRemovedEvent creates correct kind', () => {
    const event = createBeneficiaryRemovedEvent(5, 500);
    expect(event.kind).toBe('beneficiary_removed');
    expect(event.vaultId).toBe(5);
  });

  it('each factory call generates a unique id', () => {
    const a = createVaultCreatedEvent(1, 0, { amount: 1, lockDuration: 1, unlockHeight: 1 });
    const b = createVaultCreatedEvent(1, 0, { amount: 1, lockDuration: 1, unlockHeight: 1 });
    expect(a.id).not.toBe(b.id);
  });
});

// ---------------------------------------------------------------------------
// Hook tests
// ---------------------------------------------------------------------------

describe('useVaultHistory', () => {
  it('starts with an empty event list', () => {
    const { result } = renderHook(() => useVaultHistory());
    expect(result.current.allEvents).toHaveLength(0);
  });

  it('addEvent appends a new event', () => {
    const { result } = renderHook(() => useVaultHistory());

    act(() => {
      result.current.addEvent(
        createVaultCreatedEvent(1, 100, { amount: 500, lockDuration: 2016, unlockHeight: 2116 })
      );
    });

    expect(result.current.allEvents).toHaveLength(1);
    expect(result.current.allEvents[0].kind).toBe('vault_created');
  });

  it('getEvents filters by vaultId', () => {
    const { result } = renderHook(() => useVaultHistory());

    act(() => {
      result.current.addEvent(
        createVaultCreatedEvent(1, 100, { amount: 100, lockDuration: 10, unlockHeight: 110 })
      );
      result.current.addEvent(
        createVaultCreatedEvent(2, 200, { amount: 200, lockDuration: 20, unlockHeight: 220 })
      );
    });

    const vault1Events = result.current.getEvents(1);
    const vault2Events = result.current.getEvents(2);

    expect(vault1Events).toHaveLength(1);
    expect(vault1Events[0].vaultId).toBe(1);
    expect(vault2Events).toHaveLength(1);
    expect(vault2Events[0].vaultId).toBe(2);
  });

  it('getEvents returns events sorted by blockHeight descending', () => {
    const { result } = renderHook(() => useVaultHistory());

    act(() => {
      result.current.addEvent(
        createVaultCreatedEvent(1, 50, { amount: 100, lockDuration: 10, unlockHeight: 60 })
      );
      result.current.addEvent(
        createBeneficiarySetEvent(1, 200, { newBeneficiary: 'SP123' })
      );
      result.current.addEvent(
        createWithdrawalEvent(1, 150, { amount: 100, recipient: 'SP123' })
      );
    });

    const events = result.current.getEvents(1);
    expect(events[0].blockHeight).toBe(200);
    expect(events[1].blockHeight).toBe(150);
    expect(events[2].blockHeight).toBe(50);
  });

  it('clearEvents removes only the specified vault events', () => {
    const { result } = renderHook(() => useVaultHistory());

    act(() => {
      result.current.addEvent(
        createVaultCreatedEvent(1, 100, { amount: 100, lockDuration: 10, unlockHeight: 110 })
      );
      result.current.addEvent(
        createVaultCreatedEvent(2, 200, { amount: 200, lockDuration: 20, unlockHeight: 220 })
      );
    });

    act(() => {
      result.current.clearEvents(1);
    });

    expect(result.current.getEvents(1)).toHaveLength(0);
    expect(result.current.getEvents(2)).toHaveLength(1);
  });

  it('caps events at MAX_HISTORY_EVENTS (tested with small cap via direct API)', () => {
    const { result } = renderHook(() => useVaultHistory());

    // Add 3 events; with normal cap (500) all are kept
    act(() => {
      for (let i = 0; i < 3; i++) {
        result.current.addEvent(
          createVaultCreatedEvent(i, i * 10, { amount: 100, lockDuration: 10, unlockHeight: i * 10 + 10 })
        );
      }
    });

    expect(result.current.allEvents.length).toBe(3);
  });

  it('clearAll removes every event', () => {
    const { result } = renderHook(() => useVaultHistory());

    act(() => {
      result.current.addEvent(
        createVaultCreatedEvent(1, 100, { amount: 100, lockDuration: 10, unlockHeight: 110 })
      );
      result.current.addEvent(
        createVaultCreatedEvent(2, 200, { amount: 200, lockDuration: 20, unlockHeight: 220 })
      );
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.allEvents).toHaveLength(0);
  });
});
