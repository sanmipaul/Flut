export type NetworkName = 'mainnet' | 'testnet';

export const NETWORK_NAME: NetworkName =
  (process.env.NEXT_PUBLIC_NETWORK as NetworkName) ?? 'mainnet';

/** Pass this string directly to @stacks/transactions callReadOnlyFunction */
export const NETWORK = NETWORK_NAME;

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

/**
 * Convert a block count (at ~10 min/block) to a human-readable duration string.
 * e.g. 144 → "~1 day", 1008 → "~7 days", 4320 → "~30 days"
 */
export function formatBlockDuration(blocks: number): string {
  if (blocks <= 0) return 'now';
  const minutes = blocks * 10;
  if (minutes < 60) return `~${minutes} min`;
  const hours = minutes / 60;
  if (hours < 24) return `~${Math.round(hours)} hr`;
  const days = hours / 24;
  if (days < 30) return `~${Math.round(days)} day${Math.round(days) !== 1 ? 's' : ''}`;
  const months = days / 30;
  if (months < 12) return `~${Math.round(months)} month${Math.round(months) !== 1 ? 's' : ''}`;
  const years = months / 12;
  return `~${years.toFixed(1)} yr`;
}

/**
 * Returns a Stacks Explorer URL for an address or transaction.
 * Works for both mainnet and testnet.
 */
export function explorerUrl(
  type: 'address' | 'txid' | 'contract',
  value: string,
  network: NetworkName = NETWORK_NAME,
): string {
  const base = 'https://explorer.hiro.so';
  const chain = network === 'mainnet' ? '' : '?chain=testnet';
  switch (type) {
    case 'address':  return `${base}/address/${value}${chain}`;
    case 'txid':     return `${base}/txid/${value}${chain}`;
    case 'contract': return `${base}/contract/${value}${chain}`;
  }
}
