import { useState, useCallback, useEffect } from 'react';
import {
  EmergencyWithdrawalState,
  EmergencyWithdrawalRequest,
  EmergencyWithdrawalConfig,
  EmergencyWithdrawalValidation,
  EmergencyWithdrawalStatus,
} from '../types/EmergencyWithdrawal';
import {
  calculatePenaltyAmount,
  calculateNetAmount,
  validateEmergencyWithdrawal,
  isEmergencyWithdrawalAvailable,
} from '../utils/EmergencyWithdrawalUtils';
import { emergencyWithdrawalAPI } from '../utils/EmergencyWithdrawalAPI';

interface UseEmergencyWithdrawalProps {
  vaultId: number;
  vaultAmount: number;
  isVaultOwner: boolean;
  isAlreadyWithdrawn: boolean;
}

export const useEmergencyWithdrawal = ({
  vaultId,
  vaultAmount,
  isVaultOwner,
  isAlreadyWithdrawn,
}: UseEmergencyWithdrawalProps) => {
  const [state, setState] = useState<EmergencyWithdrawalState>({
    status: 'idle',
    config: {
      penaltyRate: 0.1,
      penaltyDestination: '',
      enabled: true,
      minPenaltyAmount: 1,
      maxPenaltyAmount: 1000,
    },
  });

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await emergencyWithdrawalAPI.getEmergencyConfig();
        setState((prev) => ({ ...prev, config }));
      } catch (error) {
        console.error('Failed to load emergency withdrawal config:', error);
      }
    };

    loadConfig();
  }, []);

  // Validate withdrawal request
  const validateRequest = useCallback(
    (amount: number): EmergencyWithdrawalValidation => {
      return validateEmergencyWithdrawal(
        vaultAmount,
        amount,
        state.config,
        isVaultOwner,
        isAlreadyWithdrawn
      );
    },
    [vaultAmount, state.config, isVaultOwner, isAlreadyWithdrawn]
  );

  // Check if emergency withdrawal is available
  const isAvailable = useCallback((): boolean => {
    return isEmergencyWithdrawalAvailable(
      vaultAmount,
      isVaultOwner,
      isAlreadyWithdrawn,
      state.config
    );
  }, [vaultAmount, isVaultOwner, isAlreadyWithdrawn, state.config]);

  // Initiate emergency withdrawal
  const initiateWithdrawal = useCallback(
    async (amount: number) => {
      setState((prev) => ({ ...prev, status: 'validating' }));

      const validation = validateRequest(amount);
      setState((prev) => ({ ...prev, validation }));

      if (!validation.isValid) {
        setState((prev) => ({ ...prev, status: 'failed', error: validation.errors.join(', ') }));
        return;
      }

      setState((prev) => ({ ...prev, status: 'confirming' }));
    },
    [validateRequest]
  );

  // Confirm and execute emergency withdrawal
  const confirmWithdrawal = useCallback(
    async (amount: number) => {
      setState((prev) => ({ ...prev, status: 'processing' }));

      try {
        const request = await emergencyWithdrawalAPI.executeEmergencyWithdrawal(vaultId, amount);
        setState((prev) => ({
          ...prev,
          status: 'completed',
          currentRequest: request,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    },
    [vaultId]
  );

  // Reset state
  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'idle',
      currentRequest: undefined,
      validation: undefined,
      error: undefined,
    }));
  }, []);

  // Calculate amounts for display
  const getCalculatedAmounts = useCallback(
    (amount: number) => {
      const penaltyAmount = calculatePenaltyAmount(amount, state.config);
      const netAmount = calculateNetAmount(amount, state.config);

      return {
        requestedAmount: amount,
        penaltyAmount,
        netAmount,
        penaltyRate: state.config.penaltyRate,
      };
    },
    [state.config]
  );

  return {
    state,
    isAvailable: isAvailable(),
    validateRequest,
    initiateWithdrawal,
    confirmWithdrawal,
    reset,
    getCalculatedAmounts,
  };
};