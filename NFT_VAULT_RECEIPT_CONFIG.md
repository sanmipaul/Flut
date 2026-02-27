# NFT Vault Receipt Configuration Guide

## Overview

This guide covers configuration and integration of the NFT vault receipt feature in the Flut application.

## Smart Contract Configuration

### Contract Addresses

Update the following addresses based on your deployment:

**Mainnet**
```
NFT Contract: (your-mainnet-address).flut-nft
Main Contract: (your-mainnet-address).flut
```

**Testnet**
```
NFT Contract: ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut-nft
Main Contract: ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut
```

### Contract Trait Implementation

The NFT contract implements the SIP-009 trait:
```clarity
(impl-trait 'ST1NXBK3K5YYMD6FD41SVHEX0288FY19MP1ECYEA.sip-009-trait.nft-trait)
```

Ensure the trait address is correct for your network:
- **Mainnet**: Verify trait address with official SIP-009 documentation
- **Testnet**: `ST1NXBK3K5YYMD6FD41SVHEX0288FY19MP1ECYEA.sip-009-trait`

## Frontend Configuration

### Environment Variables

Create a `.env` file in the `web/` directory:

```env
REACT_APP_NFT_CONTRACT_ADDRESS=ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut-nft
REACT_APP_VAULT_CONTRACT_ADDRESS=ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut
REACT_APP_EXPLORER_URL=https://explorer.hiro.so
REACT_APP_NFT_METADATA_BASE=https://ipfs.io/ipfs/flut-vault-nft/
```

### Component Integration

The NFT components are integrated into the main application flow:

1. **NFTBadge** - Display in `VaultDetail`
   ```tsx
   import NFTBadge from './components/NFTBadge';
   ```

2. **NFTTransferModal** - Modal dialog for NFT transfers
   ```tsx
   import NFTTransferModal from './components/NFTTransferModal';
   ```

3. **VaultDetail** - Updated to show NFT receipt section
   ```tsx
   {vault.nftTokenId !== undefined && (
     <section className="nft-receipt-section">
       <NFTBadge tokenId={vault.nftTokenId} vaultId={vault.vaultId} />
     </section>
   )}
   ```

### VaultContractAPI Integration

All NFT methods are available through the `VaultContractAPI` class:

```typescript
import VaultContractAPI from './utils/VaultContractAPI';

const api = new VaultContractAPI('ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut');

// Get NFT token ID for a vault
const tokenId = await api.getVaultNFTTokenId(vaultId);

// Get NFT metadata
const metadata = await api.getNFTMetadata(tokenId);

// Transfer NFT
await api.transferNFT(tokenId, recipientAddress);
```

## Metadata Service Integration

### NFT Metadata Generator

The `NFTMetadataGenerator` utility creates metadata JSON with embedded SVG images:

```typescript
import { generateNFTMetadata, metadataToBase64URI } from './utils/NFTMetadataGenerator';

const metadata = generateNFTMetadata(tokenId, vaultId, vaultData);
const metadataURI = metadataToBase64URI(metadata);
```

### IPFS Integration (Future)

For production deployments, upload metadata to IPFS:

```bash
# Using node-ipfs
const IPFS = require('ipfs-http-client');
const ipfs = IPFS.create();

const result = await ipfs.add(metadataJSON);
const ipfsHash = result.cid.toString();
```

## Testing Configuration

### Clarinet Testing

Run contract tests:
```bash
clarinet check
clarinet test
```

Test suite includes:
- NFT minting on vault creation
- NFT burning on vault withdrawal
- Metadata storage and retrieval
- NFT transfer functionality
- Token URI generation

### Frontend Testing

Test NFT components integration:

```bash
npm test
```

Key test scenarios:
- NFTBadge renders with correct token ID
- NFTTransferModal handles address validation
- VaultDetail displays NFT section when token ID exists
- Transfer functionality calls correct API methods

## Security Considerations

### Authorization Checks

The NFT contract includes authorization checks:

```clarity
;; Only the NFT owner can transfer
(asserts! (is-eq (ok sender) (get-owner token-id)) ERR-UNAUTHORIZED)

;; Only the vault creator can burn
(asserts! (is-eq (ok owner) (get-owner token-id)) ERR-UNAUTHORIZED)
```

### Data Validation

Frontend validates recipient addresses:
```typescript
if (!recipient.startsWith('SP') && !recipient.startsWith('ST')) {
  throw new Error('Invalid recipient address');
}
```

## Performance Optimization

### Metadata Caching

Cache NFT metadata locally to reduce contract calls:

```typescript
const metadataCache = new Map<number, Record<string, any>>();

async function getCachedMetadata(tokenId: number) {
  if (metadataCache.has(tokenId)) {
    return metadataCache.get(tokenId);
  }
  
  const metadata = await api.getNFTMetadata(tokenId);
  metadataCache.set(tokenId, metadata);
  return metadata;
}
```

### SVG Optimization

SVG images are embedded directly in metadata JSON rather than served separately, reducing HTTP requests.

## Monitoring and Analytics

### Track NFT Events

Monitor key NFT events for analytics:

1. **NFT Minted** - Triggered when vault is created
2. **NFT Transferred** - Tracked when ownership changes
3. **NFT Burned** - Logged when vault is withdrawn

### Metrics to Track

- Total NFTs minted per day
- Transfer volume
- Unique NFT holders
- Average vault duration (from NFT metadata)

## Troubleshooting

### Common Issues

**NFT not appearing in vault details:**
- Verify `nftTokenId` field is set in vault data
- Check contract integration is correct
- Ensure metadata retrieval is working

**Transfer fails with unauthorized error:**
- Verify user is NFT owner
- Check sender address matches NFT owner
- Ensure contract has correct authorization checks

**Metadata URI returns empty:**
- Verify metadata storage in contract maps
- Check token exists before accessing metadata
- Validate token ID format

## API Reference

### Smart Contract Functions

```clarity
;; Minting (called by main contract)
(mint-vault-receipt vault-id owner amount unlock-height) -> (ok uint)

;; Transferring
(transfer token-id sender recipient) -> (ok bool)

;; Burning (called by main contract)
(burn-vault-receipt token-id owner) -> (ok bool)

;; Queries
(get-owner token-id) -> (ok principal)
(get-balance owner) -> (ok uint)
(get-nft-metadata token-id) -> (ok metadata)
(get-token-uri token-id) -> (ok string)
(get-metadata-uri token-id) -> (ok string)
(token-exists token-id) -> (ok bool)
(get-token-count) -> (ok uint)
(get-last-token-id) -> (ok uint)
```

### Frontend API

```typescript
// VaultContractAPI NFT methods
getVaultNFTTokenId(vaultId: number)
getNFTMetadata(tokenId: number)
getNFTOwner(tokenId: number)
getNFTBalance(owner: string)
transferNFT(tokenId: number, recipient: string)
getTokenURI(tokenId: number)
getMetadataURI(tokenId: number)
tokenExists(tokenId: number)
getLastTokenId()
getTokenCount()
```

## Deployment Checklist

- [ ] Deploy NFT contract to testnet
- [ ] Update contract addresses in config
- [ ] Deploy NFT contract to mainnet
- [ ] Configure mainnet addresses
- [ ] Test vault creation and NFT minting
- [ ] Test NFT transfer functionality
- [ ] Test NFT burning on withdrawal
- [ ] Verify metadata on block explorer
- [ ] Deploy frontend changes
- [ ] Test end-to-end integration
- [ ] Monitor NFT minting events
- [ ] Announce NFT feature to users

## References

- [SIP-009 NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md)
- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language](https://docs.stacks.co/references/clarity-language)
- [Hiro Explorer Documentation](https://docs.hiro.so/explorer)

---

**Last Updated**: February 2026
**Feature Status**: Complete and Tested
