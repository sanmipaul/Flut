import { StacksMainnet, StacksTestnet } from '@stacks/network';

export type NetworkName = 'mainnet' | 'testnet';

export const NETWORK_NAME: NetworkName =
  (process.env.NEXT_PUBLIC_NETWORK as NetworkName) ?? 'mainnet';

export const NETWORK =
  NETWORK_NAME === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';

export const CONTRACT_NAME =
  process.env.NEXT_PUBLIC_CONTRACT_NAME ?? 'flut';

export const NFT_CONTRACT_NAME =
  process.env.NEXT_PUBLIC_NFT_CONTRACT_NAME ?? 'flut-nft';

export const STACKS_API =
  process.env.NEXT_PUBLIC_STACKS_API ??
  (NETWORK_NAME === 'mainnet'
    ? 'https://api.hiro.so'
    : 'https://api.testnet.hiro.so');

/** Full contract identifier, e.g. SP123...flut */
export const CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

/** Convert micro-STX to STX */
export function microToStx(micro: number | bigint): number {
  return Number(micro) / 1_000_000;
}

/** Convert STX to micro-STX */
export function stxToMicro(stx: number): bigint {
  return BigInt(Math.round(stx * 1_000_000));
}

/** Truncate a principal address for display */
export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

/** Convert a block count to a human-readable duration string */
export function formatBlockDuration(blocks: number): string {
  if (blocks <= 0) return '0 blocks';
  const minutes = blocks * 10;
  if (minutes < 60) return `~${minutes}m`;
  const hours = minutes / 60;
  if (hours < 24) return `~${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 7) return `~${Math.round(days)}d`;
  const weeks = days / 7;
  if (weeks < 4) return `~${Math.round(weeks)}w`;
  const months = days / 30;
  return `~${Math.round(months)}mo`;
}

/** Build a Stacks Explorer URL for a given entity */
export function explorerUrl(
  type: 'txid' | 'address' | 'contract',
  value: string,
  network: NetworkName = NETWORK_NAME,
): string {
  const base = 'https://explorer.hiro.so';
  const suffix = network === 'testnet' ? '?chain=testnet' : '';
  const path = type === 'txid' ? `/txid/${value}` : `/address/${value}`;
  return `${base}${path}${suffix}`;
}
