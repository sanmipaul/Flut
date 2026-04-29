import { EmergencyWithdrawalConfig, EmergencyWithdrawalValidation } from '../types/EmergencyWithdrawal';

/**
 * Calculate penalty amount for emergency withdrawal
 */
export const calculatePenaltyAmount = (amount: number, config: EmergencyWithdrawalConfig): number => {
  const penalty = amount * config.penaltyRate;
  return Math.max(config.minPenaltyAmount, Math.min(config.maxPenaltyAmount, penalty));
};

/**
 * Calculate net amount after penalty deduction
 */
export const calculateNetAmount = (amount: number, config: EmergencyWithdrawalConfig): number => {
  return amount - calculatePenaltyAmount(amount, config);
};

/**
 * Validate emergency withdrawal request
 */
export const validateEmergencyWithdrawal = (
  vaultAmount: number,
  requestedAmount: number,
  config: EmergencyWithdrawalConfig,
  isVaultOwner: boolean,
  isAlreadyWithdrawn: boolean
): EmergencyWithdrawalValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validations
  if (!config.enabled) {
    errors.push('Emergency withdrawals are currently disabled');
  }

  if (!isVaultOwner) {
    errors.push('Only the vault owner can initiate emergency withdrawal');
  }

  if (isAlreadyWithdrawn) {
    errors.push('This vault has already been withdrawn');
  }

  if (requestedAmount <= 0) {
    errors.push('Withdrawal amount must be greater than zero');
  }

  if (requestedAmount > vaultAmount) {
    errors.push('Requested amount exceeds vault balance');
  }

  // Amount validations
  const penaltyAmount = calculatePenaltyAmount(requestedAmount, config);
  const netAmount = requestedAmount - penaltyAmount;

  if (penaltyAmount < config.minPenaltyAmount) {
    warnings.push(`Penalty amount (${penaltyAmount} STX) is below minimum (${config.minPenaltyAmount} STX)`);
  }

  if (penaltyAmount > config.maxPenaltyAmount) {
    warnings.push(`Penalty amount (${penaltyAmount} STX) exceeds maximum (${config.maxPenaltyAmount} STX)`);
  }

  if (netAmount <= 0) {
    errors.push('Net amount after penalty would be zero or negative');
  }

  // Warnings for high penalties
  const penaltyPercentage = (penaltyAmount / requestedAmount) * 100;
  if (penaltyPercentage > 20) {
    warnings.push(`High penalty rate: ${penaltyPercentage.toFixed(1)}% of withdrawal amount`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    estimatedPenalty: penaltyAmount,
    estimatedNetAmount: netAmount,
  };
};

/**
 * Format penalty rate as percentage string
 */
export const formatPenaltyRate = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`;
};

/**
 * Get penalty destination address (with truncation for display)
 */
export const formatPenaltyDestination = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Check if emergency withdrawal is available for a vault
 */
export const isEmergencyWithdrawalAvailable = (
  vaultAmount: number,
  isVaultOwner: boolean,
  isAlreadyWithdrawn: boolean,
  config: EmergencyWithdrawalConfig
): boolean => {
  return (
    config.enabled &&
    vaultAmount > 0 &&
    isVaultOwner &&
    !isAlreadyWithdrawn
  );
};