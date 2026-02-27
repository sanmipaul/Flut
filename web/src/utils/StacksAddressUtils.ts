/**
 * StacksAddressUtils
 * Utilities for validating and formatting Stacks (STX) addresses.
 *
 * Stacks addresses use c32check encoding — a base-32 variant with a
 * custom alphabet and a 4-byte checksum.
 *
 * Valid address prefixes:
 *   SP — Stacks mainnet standard (version 22)
 *   SM — Stacks mainnet multi-sig (version 21)
 *   ST — Stacks testnet standard (version 26)
 *   SN — Stacks testnet multi-sig (version 25)
 */

// The c32 alphabet used by Stacks (excludes I, L, O, U to avoid visual ambiguity)
export const C32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// Known version bytes and their address-prefix equivalents
export const ADDRESS_VERSIONS: Record<string, number> = {
  SP: 22,
  SM: 21,
  ST: 26,
  SN: 25,
};

// Minimum and maximum lengths for a well-formed Stacks address
export const MIN_ADDRESS_LENGTH = 39;
export const MAX_ADDRESS_LENGTH = 43;

/** Networks that a Stacks address may belong to */
export type StacksNetwork = 'mainnet' | 'testnet';

/** Prefixes that identify each network */
export const MAINNET_PREFIXES: ReadonlyArray<string> = ['SP', 'SM'];
export const TESTNET_PREFIXES: ReadonlyArray<string> = ['ST', 'SN'];
export const ALL_VALID_PREFIXES: ReadonlyArray<string> = [
  ...MAINNET_PREFIXES,
  ...TESTNET_PREFIXES,
];
