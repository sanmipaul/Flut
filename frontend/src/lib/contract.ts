import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  boolCV,
  someCV,
  noneCV,
  principalCV,
  makeContractCall,
  broadcastTransaction,
  type StacksTransaction,
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

/** Fetch all vaults for a given principal by scanning vault IDs */
export async function fetchVaultsForUser(address: string): Promise<Vault[]> {
  const count = await fetchVaultCount();
  const results = await Promise.all(
    Array.from({ length: count }, (_, i) => fetchVault(i)),
  );
  return results.filter((v): v is Vault => v !== null && v.creator === address);
}

/** Parameters for creating a new vault */
export interface CreateVaultParams {
  lockDurationBlocks: number;
  initialAmountMicroStx: number;
  enableStacking: boolean;
  stackingPool: string | null;
  senderAddress: string;
}

/**
 * Build an unsigned create-vault transaction.
 * The caller must sign and broadcast via Stacks.js / wallet.
 */
export async function buildCreateVaultTx(params: CreateVaultParams): Promise<StacksTransaction> {
  const {
    lockDurationBlocks,
    initialAmountMicroStx,
    enableStacking,
    stackingPool,
    senderAddress,
  } = params;

  const poolArg = enableStacking && stackingPool
    ? someCV(principalCV(stackingPool))
    : noneCV();

  return makeContractCall({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-vault',
    functionArgs: [
      uintCV(lockDurationBlocks),
      uintCV(initialAmountMicroStx),
      boolCV(enableStacking),
      poolArg,
    ],
    senderKey: '', // populated by wallet
    validateWithAbi: false,
  });
}

/** Broadcast a signed transaction and return the txid */
export async function broadcastTx(tx: StacksTransaction): Promise<string> {
  const result = await broadcastTransaction({ transaction: tx, network: NETWORK });
  if ('error' in result) throw new Error(result.error);
  return result.txid;
}
