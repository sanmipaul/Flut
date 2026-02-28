/**
 * VaultEvent — represents a single auditable action on a vault.
 *
 * Events are displayed chronologically in the vault history panel,
 * giving users a full audit trail of everything that has happened
 * to their vault since creation.
 */

/** Discriminated union of all possible vault event kinds */
export type VaultEventKind =
  | 'vault_created'
  | 'beneficiary_set'
  | 'beneficiary_removed'
  | 'withdrawal'
  | 'emergency_withdrawal'
  | 'lock_extended';

/** Severity determines the colour treatment in the history timeline */
export type VaultEventSeverity = 'info' | 'success' | 'warning' | 'danger';

/** Metadata carried by specific event kinds */
export interface VaultCreatedMeta {
  amount: number;
  lockDuration: number;
  unlockHeight: number;
  beneficiary?: string;
}

export interface BeneficiarySetMeta {
  newBeneficiary: string;
  previousBeneficiary?: string;
}

export interface WithdrawalMeta {
  amount: number;
  recipient: string;
}

export interface EmergencyWithdrawalMeta {
  amount: number;
  penaltyAmount: number;
  netAmount: number;
  recipient: string;
  penaltyRate: number;
}

export interface LockExtendedMeta {
  previousUnlockHeight: number;
  newUnlockHeight: number;
  extensionBlocks: number;
}

export type VaultEventMeta =
  | VaultCreatedMeta
  | BeneficiarySetMeta
  | WithdrawalMeta
  | EmergencyWithdrawalMeta
  | LockExtendedMeta
  | Record<string, never>;

/** A single vault event record */
export interface VaultEvent {
  /** Unique identifier for the event (e.g. tx hash or synthetic UUID) */
  id: string;
  /** Which vault this event belongs to */
  vaultId: number;
  /** Category of event */
  kind: VaultEventKind;
  /** Block height at which the event occurred */
  blockHeight: number;
  /** Unix timestamp (ms) for display purposes */
  timestamp: number;
  /** Human-readable summary */
  description: string;
  /** Optional transaction hash on the Stacks blockchain */
  txId?: string;
  /** Additional kind-specific data */
  meta: VaultEventMeta;
}

/** Severity mapping for each event kind */
export const EVENT_SEVERITY: Record<VaultEventKind, VaultEventSeverity> = {
  vault_created: 'info',
  beneficiary_set: 'info',
  beneficiary_removed: 'warning',
  withdrawal: 'success',
  emergency_withdrawal: 'danger',
  lock_extended: 'info',
};

/** Icon mapping for each event kind */
export const EVENT_ICON: Record<VaultEventKind, string> = {
  vault_created: '🔐',
  beneficiary_set: '👤',
  beneficiary_removed: '🗑',
  withdrawal: '✅',
  emergency_withdrawal: '⚠️',
  lock_extended: '⏳',
};

/** Human-readable label for each event kind */
export const EVENT_LABEL: Record<VaultEventKind, string> = {
  vault_created: 'Vault Created',
  beneficiary_set: 'Beneficiary Set',
  beneficiary_removed: 'Beneficiary Removed',
  withdrawal: 'Withdrawal',
  emergency_withdrawal: 'Emergency Withdrawal',
  lock_extended: 'Lock Extended',
};
