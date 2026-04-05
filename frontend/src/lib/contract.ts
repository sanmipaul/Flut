import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, STACKS_API } from './stacks';
import type { Vault } from '@/types/vault';

/** Read a single vault by ID */
export async function fetchVault(vaultId: number): Promise<Vault | null> {
  try {
    const result = await callReadOnlyFunction({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vault',
      functionArgs: [uintCV(vaultId)],
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(result);
    if (!json.value) return null;
    const v = json.value;

    return {
      vaultId,
      creator: v.creator?.value ?? '',
      amount: Number(v.amount?.value ?? 0),
      unlockHeight: Number(v['unlock-height']?.value ?? 0),
      createdAt: Number(v['created-at']?.value ?? 0),
      isWithdrawn: v['is-withdrawn']?.value === true,
      beneficiaries: [],
      stackingEnabled: v['stacking-enabled']?.value === true,
      stackingPool: v['stacking-pool']?.value ?? null,
    };
  } catch {
    return null;
  }
}

/** Get total vault count from contract */
export async function fetchVaultCount(): Promise<number> {
  try {
    const result = await callReadOnlyFunction({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vault-count',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
    });
    const json = cvToJSON(result);
    return Number(json.value ?? 0);
  } catch {
    return 0;
  }
}

/** Fetch current Stacks block height */
export async function fetchBlockHeight(): Promise<number> {
  try {
    const res = await fetch(`${STACKS_API}/v2/info`);
    const data = await res.json();
    return Number(data.burn_block_height ?? data.stacks_tip_height ?? 0);
  } catch {
    return 0;
  }
}

const STACKS_PRINCIPAL_REGEX = /^S[PT][A-Z0-9]{39}$/;

/** Returns true if the given string is a valid Stacks principal address */
export function isValidStacksPrincipal(address: string): boolean {
  return STACKS_PRINCIPAL_REGEX.test(address.trim());
}

/** Maximum number of vault IDs to scan in a single fetchVaultsForUser call */
const MAX_VAULT_SCAN = 500;

/** Fetch all vaults for a given principal by scanning vault IDs */
export async function fetchVaultsForUser(address: string): Promise<Vault[]> {
  const count = await fetchVaultCount();
  const safeCount = Math.min(count, MAX_VAULT_SCAN);
  if (count > MAX_VAULT_SCAN) {
    console.warn(
      `[contract] fetchVaultsForUser: vault count (${count}) exceeds MAX_VAULT_SCAN (${MAX_VAULT_SCAN}). Only scanning first ${MAX_VAULT_SCAN} vaults.`,
    );
  }
  const results = await Promise.all(
    Array.from({ length: safeCount }, (_, i) => fetchVault(i)),
  );
  return results.filter((v): v is Vault => v !== null && v.creator === address);
}
