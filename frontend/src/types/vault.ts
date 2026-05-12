export interface Vault {
  vaultId: number;
  creator: string;
  amount: number;           // micro-STX
  unlockHeight: number;
  createdAt: number;
  isWithdrawn: boolean;
  beneficiaries: string[];
  stackingEnabled: boolean;
  stackingPool: string | null;
  /** Optional local label stored in localStorage */
  label?: string;
  /** Enhanced vault management fields */
  isEmergencyWithdrawalEnabled?: boolean;
  emergencyWithdrawalPenaltyBps?: number;
  lastDepositHeight?: number;
  totalDeposited?: number;
  depositCooldownBlocks?: number;
}

export type VaultStatus = 'locked' | 'unlocked' | 'withdrawn';

export function getVaultStatus(vault: Vault, currentBlock: number): VaultStatus {
  if (vault.isWithdrawn) return 'withdrawn';
  if (currentBlock >= vault.unlockHeight) return 'unlocked';
  return 'locked';
}

export function blocksRemaining(vault: Vault, currentBlock: number): number {
  return Math.max(0, vault.unlockHeight - currentBlock);
}

/** Rough estimate: 1 Stacks block ~ 10 minutes (anchored to Bitcoin) */
export function blocksToMs(blocks: number): number {
  return blocks * 10 * 60 * 1000;
}
