import { EmergencyWithdrawalValidation } from '../types/EmergencyWithdrawal';

/**
 * Emergency Withdrawal Validation Utilities
 * Additional validation helpers for the emergency withdrawal system
 */

export const validateStxAddress = (address: string): boolean => {
  // Basic STX address validation (simplified)
  return address.startsWith('ST') && address.length >= 30 && address.length <= 50;
};

export const validatePenaltyDestination = (address: string): { isValid: boolean; error?: string } => {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Penalty destination address is required' };
  }

  if (!validateStxAddress(address)) {
    return { isValid: false, error: 'Invalid STX address format' };
  }

  return { isValid: true };
};

export const validatePenaltyRate = (rate: number): { isValid: boolean; error?: string } => {
  if (typeof rate !== 'number' || isNaN(rate)) {
    return { isValid: false, error: 'Penalty rate must be a valid number' };
  }

  if (rate < 0) {
    return { isValid: false, error: 'Penalty rate cannot be negative' };
  }

  if (rate > 1) {
    return { isValid: false, error: 'Penalty rate cannot exceed 100%' };
  }

  if (rate < 0.01) {
    return { isValid: false, error: 'Penalty rate must be at least 1%' };
  }

  return { isValid: true };
};

export const validatePenaltyLimits = (
  minAmount: number,
  maxAmount: number
): { isValid: boolean; error?: string } => {
  if (minAmount < 0) {
    return { isValid: false, error: 'Minimum penalty amount cannot be negative' };
  }

  if (maxAmount < 0) {
    return { isValid: false, error: 'Maximum penalty amount cannot be negative' };
  }

  if (minAmount > maxAmount) {
    return { isValid: false, error: 'Minimum penalty amount cannot exceed maximum' };
  }

  return { isValid: true };
};

export const validateWithdrawalAmount = (
  amount: number,
  vaultBalance: number
): { isValid: boolean; error?: string } => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Withdrawal amount must be a valid number' };
  }

  if (amount <= 0) {
    return { isValid: false, error: 'Withdrawal amount must be greater than zero' };
  }

  if (amount > vaultBalance) {
    return { isValid: false, error: 'Withdrawal amount cannot exceed vault balance' };
  }

  return { isValid: true };
};

export const validateEmergencyConfig = (config: any): EmergencyWithdrawalValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate penalty rate
  const rateValidation = validatePenaltyRate(config.penaltyRate);
  if (!rateValidation.isValid) {
    errors.push(rateValidation.error!);
  }

  // Validate penalty destination
  const destinationValidation = validatePenaltyDestination(config.penaltyDestination);
  if (!destinationValidation.isValid) {
    errors.push(destinationValidation.error!);
  }

  // Validate penalty limits
  const limitsValidation = validatePenaltyLimits(config.minPenaltyAmount, config.maxPenaltyAmount);
  if (!limitsValidation.isValid) {
    errors.push(limitsValidation.error!);
  }

  // Warnings for extreme values
  if (config.penaltyRate > 0.3) {
    warnings.push('Penalty rate is very high (>30%). This may discourage legitimate emergency withdrawals.');
  }

  if (config.minPenaltyAmount > 10) {
    warnings.push('Minimum penalty amount is high. Small withdrawals may be impractical.');
  }

  if (config.maxPenaltyAmount < 50) {
    warnings.push('Maximum penalty amount is low. Large withdrawals may not be sufficiently penalized.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    estimatedPenalty: 0, // Not applicable for config validation
    estimatedNetAmount: 0,
  };
};

export const getRecommendedPenaltySettings = (vaultSize: number) => {
  // Provide recommended penalty settings based on vault size
  if (vaultSize < 100) {
    return {
      penaltyRate: 0.05, // 5%
      minPenaltyAmount: 0.5,
      maxPenaltyAmount: 5,
    };
  } else if (vaultSize < 1000) {
    return {
      penaltyRate: 0.08, // 8%
      minPenaltyAmount: 1,
      maxPenaltyAmount: 20,
    };
  } else {
    return {
      penaltyRate: 0.1, // 10%
      minPenaltyAmount: 5,
      maxPenaltyAmount: 100,
    };
  }
};

export const calculateRiskScore = (
  penaltyRate: number,
  usageRate: number,
  successRate: number
): { score: number; level: 'low' | 'medium' | 'high'; message: string } => {
  // Calculate risk score based on penalty effectiveness
  let score = 0;

  // High penalty rate reduces risk
  if (penaltyRate >= 0.1) score += 30;
  else if (penaltyRate >= 0.05) score += 20;
  else score += 10;

  // Low usage rate indicates good deterrence
  if (usageRate <= 0.05) score += 30; // 5% or less usage
  else if (usageRate <= 0.1) score += 20; // 10% or less usage
  else score += 10;

  // High success rate indicates system reliability
  if (successRate >= 0.95) score += 40;
  else if (successRate >= 0.90) score += 30;
  else if (successRate >= 0.80) score += 20;
  else score += 10;

  let level: 'low' | 'medium' | 'high';
  let message: string;

  if (score >= 80) {
    level = 'low';
    message = 'Emergency withdrawal system is well-balanced and effective.';
  } else if (score >= 50) {
    level = 'medium';
    message = 'Emergency withdrawal system is moderately effective. Consider adjusting penalty rates.';
  } else {
    level = 'high';
    message = 'Emergency withdrawal system may need adjustment. Penalties may be too low or system unreliable.';
  }

  return { score, level, message };
};