/**
 * NFT Metadata Generator for Flut Vault Receipts
 * Generates JSON metadata for vault NFTs
 */

export interface VaultMetadata {
  vaultId: number;
  owner: string;
  createdAt: number;
  vaultAmount: bigint;
  unlockHeight: number;
}

/**
 * Generate metadata JSON for a vault NFT
 * @param tokenId - The NFT token ID
 * @param vaultId - The vault ID
 * @param metadata - Vault metadata
 * @returns JSON metadata object
 */
export function generateNFTMetadata(
  tokenId: number,
  vaultId: number,
  metadata: VaultMetadata
): Record<string, any> {
  const vaultAmountSTX = Number(metadata.vaultAmount) / 1_000_000;
  const createdDate = new Date(metadata.createdAt * 1000).toLocaleDateString();
  
  return {
    name: `Flut Vault Receipt #${tokenId}`,
    description: `NFT receipt representing vault ownership for Flut Savings Vault #${vaultId}. This NFT proves your commitment to saving STX with disciplined lock-in periods.`,
    image: generateSVGImage(tokenId, vaultId, vaultAmountSTX),
    attributes: [
      {
        trait_type: "Vault ID",
        value: vaultId.toString(),
      },
      {
        trait_type: "Token ID",
        value: tokenId.toString(),
      },
      {
        trait_type: "Vault Amount (STX)",
        value: vaultAmountSTX.toFixed(6),
        display_type: "number",
      },
      {
        trait_type: "Created Date",
        value: createdDate,
      },
      {
        trait_type: "Unlock Block Height",
        value: metadata.unlockHeight.toString(),
        display_type: "number",
      },
      {
        trait_type: "Owner",
        value: metadata.owner,
      },
      {
        trait_type: "Type",
        value: "Vault Receipt",
      },
      {
        trait_type: "Standard",
        value: "SIP-009",
      },
    ],
    external_url: `https://flut.app/vault/${vaultId}`,
    collection: {
      name: "Flut Vault Receipts",
      description: "NFT receipts representing savings commitments on the Stacks blockchain",
      image: "ipfs://QmFlutCollectionImage",
    },
  };
}

/**
 * Generate SVG image for NFT metadata
 * Creates a visual representation of the vault
 */
function generateSVGImage(
  tokenId: number,
  vaultId: number,
  stxAmount: number
): string {
  const svgContent = `
    <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
      <!-- Background gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#5546ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6b5bff;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffa500;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="500" fill="url(#bgGradient)"/>
      
      <!-- Top decoration -->
      <circle cx="200" cy="50" r="40" fill="url(#accentGradient)" opacity="0.2"/>
      <circle cx="200" cy="50" r="30" fill="none" stroke="url(#accentGradient)" stroke-width="2"/>
      
      <!-- Icon -->
      <text x="200" y="65" font-size="40" text-anchor="middle" fill="white">🎖️</text>
      
      <!-- Title -->
      <text x="200" y="130" font-size="28" font-weight="bold" text-anchor="middle" fill="white">
        Flut Vault
      </text>
      <text x="200" y="160" font-size="16" text-anchor="middle" fill="#e0d5ff">
        Receipt NFT
      </text>
      
      <!-- Vault details box -->
      <rect x="20" y="180" width="360" height="200" rx="10" fill="rgba(255,255,255,0.1)" stroke="white" stroke-width="2"/>
      
      <!-- Vault ID -->
      <text x="40" y="210" font-size="12" fill="#e0d5ff">Vault ID</text>
      <text x="40" y="230" font-size="20" font-weight="bold" fill="white">#${vaultId}</text>
      
      <!-- Token ID -->
      <text x="220" y="210" font-size="12" fill="#e0d5ff">Token ID</text>
      <text x="220" y="230" font-size="20" font-weight="bold" fill="white">#${tokenId}</text>
      
      <!-- Amount -->
      <text x="40" y="280" font-size="12" fill="#e0d5ff">Amount</text>
      <text x="40" y="300" font-size="20" font-weight="bold" fill="white">${stxAmount.toFixed(2)} STX</text>
      
      <!-- Status -->
      <text x="220" y="280" font-size="12" fill="#e0d5ff">Status</text>
      <text x="220" y="300" font-size="18" font-weight="bold" fill="#1cb845">Active</text>
      
      <!-- Footer -->
      <text x="200" y="420" font-size="11" text-anchor="middle" fill="#b0a0ff">
        Proof of Savings Commitment
      </text>
      <text x="200" y="440" font-size="10" text-anchor="middle" fill="#9080ff">
        SIP-009 Standard Compliant
      </text>
      
      <!-- Bottom decoration -->
      <line x1="50" y1="460" x2="350" y2="460" stroke="white" stroke-width="1" opacity="0.3"/>
      <text x="200" y="485" font-size="9" text-anchor="middle" fill="#8070ff" opacity="0.7">
        flut.app | Stacks Blockchain
      </text>
    </svg>
  `;

  // Encode as data URI
  const encoded = btoa(svgContent);
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Convert metadata object to JSON string
 */
export function metadataToJSON(metadata: Record<string, any>): string {
  return JSON.stringify(metadata, null, 2);
}

/**
 * Convert metadata to base64-encoded JSON (for data URI)
 */
export function metadataToBase64URI(metadata: Record<string, any>): string {
  const jsonString = metadataToJSON(metadata);
  const encoded = btoa(jsonString);
  return `data:application/json;base64,${encoded}`;
}

/**
 * Parse metadata from base64 data URI
 */
export function parseMetadataFromURI(dataURI: string): Record<string, any> | null {
  try {
    if (!dataURI.startsWith('data:application/json;base64,')) {
      return null;
    }
    const base64Part = dataURI.replace('data:application/json;base64,', '');
    const jsonString = atob(base64Part);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse metadata URI:', error);
    return null;
  }
}

export default {
  generateNFTMetadata,
  generateSVGImage,
  metadataToJSON,
  metadataToBase64URI,
  parseMetadataFromURI,
};
