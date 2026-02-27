/**
 * useVaultHistory
 *
 * Manages an in-memory log of VaultEvent records for every vault in the app.
 * On the real blockchain integration this would be replaced by fetching
 * transaction history from a Stacks API node, but for the prototype the hook
 * provides a fully-functional local event store with factory helpers.
 *
 * Usage:
 *   const { getEvents, addEvent, clearEvents } = useVaultHistory();
 *   addEvent(createVaultCreatedEvent(vault));
 *   const events = getEvents(vault.vaultId);
 */
import { useState, useCallback } from 'react';
import type {
  VaultEvent,
  VaultEventKind,
  VaultEventMeta,
  VaultCreatedMeta,
  BeneficiarySetMeta,
  WithdrawalMeta,
  EmergencyWithdrawalMeta,
} from '../types/VaultEvent';
import { EVENT_LABEL } from '../types/VaultEvent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseVaultHistoryReturn {
  /** All events, newest first */
  allEvents: VaultEvent[];
  /** Events for a specific vault, newest first */
  getEvents: (vaultId: number) => VaultEvent[];
  /** Append a new event to the log */
  addEvent: (event: VaultEvent) => void;
  /** Remove all events for a specific vault */
  clearEvents: (vaultId: number) => void;
  /** Remove every event in the log */
  clearAll: () => void;
}

// ---------------------------------------------------------------------------
// Unique ID helper
// ---------------------------------------------------------------------------

let _seq = 0;
function nextId(): string {
  _seq += 1;
  return `evt_${Date.now()}_${_seq}`;
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Build a base event shell; callers fill in kind-specific fields.
 */
function makeEvent(
  vaultId: number,
  kind: VaultEventKind,
  blockHeight: number,
  meta: VaultEventMeta,
  description?: string
): VaultEvent {
  return {
    id: nextId(),
    vaultId,
    kind,
    blockHeight,
    timestamp: Date.now(),
    description: description ?? EVENT_LABEL[kind],
    meta,
  };
}

export function createVaultCreatedEvent(
  vaultId: number,
  blockHeight: number,
  meta: VaultCreatedMeta
): VaultEvent {
  return makeEvent(
    vaultId,
    'vault_created',
    blockHeight,
    meta,
    `Vault created with ${meta.amount} STX, unlocks at block ${meta.unlockHeight}`
  );
}

export function createBeneficiarySetEvent(
  vaultId: number,
  blockHeight: number,
  meta: BeneficiarySetMeta
): VaultEvent {
  return makeEvent(
    vaultId,
    'beneficiary_set',
    blockHeight,
    meta,
    `Beneficiary set to ${meta.newBeneficiary}`
  );
}

export function createBeneficiaryRemovedEvent(
  vaultId: number,
  blockHeight: number
): VaultEvent {
  return makeEvent(vaultId, 'beneficiary_removed', blockHeight, {});
}

export function createWithdrawalEvent(
  vaultId: number,
  blockHeight: number,
  meta: WithdrawalMeta
): VaultEvent {
  return makeEvent(
    vaultId,
    'withdrawal',
    blockHeight,
    meta,
    `Withdrew ${meta.amount} STX to ${meta.recipient}`
  );
}

export function createEmergencyWithdrawalEvent(
  vaultId: number,
  blockHeight: number,
  meta: EmergencyWithdrawalMeta
): VaultEvent {
  return makeEvent(
    vaultId,
    'emergency_withdrawal',
    blockHeight,
    meta,
    `Emergency withdrew ${meta.netAmount} STX (${meta.penaltyRate}% penalty of ${meta.penaltyAmount} STX)`
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVaultHistory(): UseVaultHistoryReturn {
  const [events, setEvents] = useState<VaultEvent[]>([]);

  const getEvents = useCallback(
    (vaultId: number): VaultEvent[] =>
      events
        .filter((e) => e.vaultId === vaultId)
        .sort((a, b) => b.blockHeight - a.blockHeight),
    [events]
  );

  const addEvent = useCallback((event: VaultEvent) => {
    setEvents((prev) => [event, ...prev]);
  }, []);

  const clearEvents = useCallback((vaultId: number) => {
    setEvents((prev) => prev.filter((e) => e.vaultId !== vaultId));
  }, []);

  const clearAll = useCallback(() => setEvents([]), []);

  return {
    allEvents: [...events].sort((a, b) => b.blockHeight - a.blockHeight),
    getEvents,
    addEvent,
    clearEvents,
    clearAll,
  };
}
