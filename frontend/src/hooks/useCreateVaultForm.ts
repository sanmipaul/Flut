'use client';

import { useCallback, useState } from 'react';
import {
  CREATE_VAULT_STEPS,
  INITIAL_FORM_STATE,
  MIN_AMOUNT_STX,
  MAX_AMOUNT_STX,
  MIN_LOCK_BLOCKS,
  MAX_LOCK_BLOCKS,
  type CreateVaultStep,
  type CreateVaultFormState,
} from '@/types/createVault';

interface UseCreateVaultFormResult {
  step: CreateVaultStep;
  stepIndex: number;
  totalSteps: number;
  form: CreateVaultFormState;
  updateForm: (patch: Partial<CreateVaultFormState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  canProceed: boolean;
  resolvedBlocks: number;
}

function validateStep(step: CreateVaultStep, form: CreateVaultFormState): boolean {
  switch (step) {
    case 'amount': {
      const n = parseFloat(form.amountStx);
      return !isNaN(n) && n >= MIN_AMOUNT_STX && n <= MAX_AMOUNT_STX;
    }
    case 'duration': {
      const blocks = form.lockBlocks ?? parseInt(form.customBlocks, 10);
      return !isNaN(blocks) && blocks >= MIN_LOCK_BLOCKS && blocks <= MAX_LOCK_BLOCKS;
    }
    case 'stacking': {
      if (!form.enableStacking) return true;
      return /^S[PT][A-Z0-9]{39}$/.test(form.stackingPool.trim());
    }
    case 'review':
      return true;
  }
}

function resolveBlocks(form: CreateVaultFormState): number {
  if (form.lockBlocks !== null) return form.lockBlocks;
  const custom = parseInt(form.customBlocks, 10);
  return isNaN(custom) ? 0 : custom;
}

export function useCreateVaultForm(): UseCreateVaultFormResult {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<CreateVaultFormState>(INITIAL_FORM_STATE);

  const step = CREATE_VAULT_STEPS[stepIndex];

  const updateForm = useCallback((patch: Partial<CreateVaultFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, CREATE_VAULT_STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const resetForm = useCallback(() => {
    setStepIndex(0);
    setForm(INITIAL_FORM_STATE);
  }, []);

  const canProceed = validateStep(step, form);
  const resolvedBlocks = resolveBlocks(form);

  return {
    step,
    stepIndex,
    totalSteps: CREATE_VAULT_STEPS.length,
    form,
    updateForm,
    nextStep,
    prevStep,
    resetForm,
    canProceed,
    resolvedBlocks,
  };
}
