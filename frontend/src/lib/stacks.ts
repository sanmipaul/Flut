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
