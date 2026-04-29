export interface EmergencyWithdrawalRequest {
  vaultId: number;
  requestedAmount: number;
  penaltyAmount: number;
  netAmount: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  txId?: string;
  blockHeight?: number;
  gasUsed?: number;
  fee?: number;
}

export interface EmergencyWithdrawalConfig {
  penaltyRate: number; // 0.1 for 10%
  penaltyDestination: string; // STX address
  enabled: boolean;
  minPenaltyAmount: number;
  maxPenaltyAmount: number;
}

export interface EmergencyWithdrawalValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedPenalty: number;
  estimatedNetAmount: number;
}

export type EmergencyWithdrawalStatus = 'idle' | 'validating' | 'confirming' | 'processing' | 'completed' | 'failed';

export interface EmergencyWithdrawalState {
  status: EmergencyWithdrawalStatus;
  currentRequest?: EmergencyWithdrawalRequest;
  config: EmergencyWithdrawalConfig;
  validation?: EmergencyWithdrawalValidation;
  error?: string;
}