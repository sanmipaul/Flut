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

/**
 * Returns true when `address` is a syntactically valid Stacks address.
 *
 * Checks performed:
 *  1. Non-empty after trimming.
 *  2. Starts with a known two-character prefix (SP, SM, ST, SN).
 *  3. Total length is within the expected range.
 *  4. Every character after the prefix belongs to the c32 alphabet.
 */
export function isValidStacksAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;

  const trimmed = address.trim().toUpperCase();

  // Must start with 'S'
  if (!trimmed.startsWith('S')) return false;

  // Second character must form a recognised prefix
  const prefix = trimmed.slice(0, 2);
  if (!ALL_VALID_PREFIXES.includes(prefix)) return false;

  // Length guard
  if (trimmed.length < MIN_ADDRESS_LENGTH || trimmed.length > MAX_ADDRESS_LENGTH) {
    return false;
  }

  // All characters after the prefix must be in the c32 alphabet
  const body = trimmed.slice(2);
  for (const ch of body) {
    if (!C32_ALPHABET.includes(ch)) return false;
  }

  return true;
}

/**
 * Returns the network an address belongs to, or `null` if the address is
 * not a recognised Stacks address.
 */
export function getAddressNetwork(address: string): StacksNetwork | null {
  if (!address) return null;
  const prefix = address.trim().toUpperCase().slice(0, 2);
  if (MAINNET_PREFIXES.includes(prefix)) return 'mainnet';
  if (TESTNET_PREFIXES.includes(prefix)) return 'testnet';
  return null;
}

/**
 * Returns the numeric version byte associated with the address prefix,
 * or `null` when the prefix is unrecognised.
 */
export function getAddressVersion(address: string): number | null {
  if (!address) return null;
  const prefix = address.trim().toUpperCase().slice(0, 2);
  return ADDRESS_VERSIONS[prefix] ?? null;
}

/**
 * Returns a shortened display form of a Stacks address, e.g.
 * "SP2J6Z…EZ5V2V5RB9MP66SW86PYKKNRV9EJ" → "SP2J6Z…EJ"
 *
 * @param address - Full Stacks address
 * @param leadChars - Number of leading characters to keep (default 8)
 * @param tailChars - Number of trailing characters to keep (default 4)
 */
export function truncateAddress(
  address: string,
  leadChars: number = 8,
  tailChars: number = 4
): string {
  if (!address) return '';
  const trimmed = address.trim();
  if (trimmed.length <= leadChars + tailChars + 1) return trimmed;
  return `${trimmed.slice(0, leadChars)}…${trimmed.slice(-tailChars)}`;
}

/**
 * Returns a human-readable error description explaining *why* an address
 * failed validation, or an empty string when the address is valid.
 */
export function getAddressErrorMessage(address: string): string {
  if (!address || !address.trim()) return 'Address is required';

  const trimmed = address.trim().toUpperCase();

  if (!trimmed.startsWith('S')) {
    return 'Stacks addresses must start with "S"';
  }

  const prefix = trimmed.slice(0, 2);
  if (!ALL_VALID_PREFIXES.includes(prefix)) {
    return `Unknown prefix "${prefix}". Expected SP, SM, ST, or SN`;
  }

  if (trimmed.length < MIN_ADDRESS_LENGTH) {
    return `Address is too short (${trimmed.length} chars, minimum ${MIN_ADDRESS_LENGTH})`;
  }

  if (trimmed.length > MAX_ADDRESS_LENGTH) {
    return `Address is too long (${trimmed.length} chars, maximum ${MAX_ADDRESS_LENGTH})`;
  }

  const body = trimmed.slice(2);
  for (const ch of body) {
    if (!C32_ALPHABET.includes(ch)) {
      return `Invalid character "${ch}" — Stacks addresses use only 0–9 and A–Z (excluding I, L, O, U)`;
    }
  }

  return '';
}

/** Returns true when the address belongs to Stacks mainnet (SP or SM prefix). */
export function isMainnetAddress(address: string): boolean {
  return getAddressNetwork(address) === 'mainnet';
}

/** Returns true when the address belongs to Stacks testnet (ST or SN prefix). */
export function isTestnetAddress(address: string): boolean {
  return getAddressNetwork(address) === 'testnet';
}

/**
 * Returns true when the address is a multi-signature Stacks address (SM or SN prefix).
 * Multi-sig addresses require multiple signers to authorise transactions.
 */
export function isMultiSigAddress(address: string): boolean {
  if (!address) return false;
  const prefix = address.trim().toUpperCase().slice(0, 2);
  return prefix === 'SM' || prefix === 'SN';
}

/**
 * Returns true when the address is a single-signature Stacks address (SP or ST prefix).
 */
export function isSingleSigAddress(address: string): boolean {
  if (!address) return false;
  const prefix = address.trim().toUpperCase().slice(0, 2);
  return prefix === 'SP' || prefix === 'ST';
}

/**
 * Returns true when both addresses belong to the same Stacks network.
 * Useful for preventing cross-network vault operations (e.g. a mainnet
 * creator setting a testnet beneficiary).
 *
 * Returns false when either address is invalid or unrecognised.
 */
export function areAddressesOnSameNetwork(a: string, b: string): boolean {
  const netA = getAddressNetwork(a);
  const netB = getAddressNetwork(b);
  if (!netA || !netB) return false;
  return netA === netB;
}

/** Result returned by the composite `validateAddress` function */
export interface AddressValidationResult {
  /** Whether the address passes all validation rules */
  isValid: boolean;
  /** Human-readable error message, empty when valid */
  errorMessage: string;
  /** Network the address belongs to, null when prefix is unrecognised */
  network: StacksNetwork | null;
  /** Normalised (trimmed, uppercase) form of the input */
  normalised: string;
}

/**
 * Runs the full validation pipeline and returns a structured result object.
 * This is the recommended entry-point for components that need both
 * validity information and user-facing feedback in a single call.
 */
export function validateAddress(address: string): AddressValidationResult {
  const normalised = normalizeAddress(address);
  const isValid = isValidStacksAddress(normalised);
  const errorMessage = isValid ? '' : getAddressErrorMessage(normalised);
  const network = isValid ? getAddressNetwork(normalised) : null;
  return { isValid, errorMessage, network, normalised };
}

/**
 * Normalises a Stacks address to its canonical form:
 * trims whitespace and converts to uppercase.
 * Returns an empty string when the input is falsy.
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  return address.trim().toUpperCase();
}
