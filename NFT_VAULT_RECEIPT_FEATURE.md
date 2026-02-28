# NFT Vault Receipt Feature

## Overview

Flut now mints an NFT receipt for every vault created. These SIP-009 compliant NFTs represent ownership of the vault and provide on-chain proof of the user's savings commitment.

## What Is a Vault NFT Receipt?

A Vault NFT Receipt is:
- **Proof of Ownership**: An on-chain token proving you created/own a Flut vault
- **Transferable**: Can be transferred to another wallet, allowing vault ownership transfer
- **Burnable**: Automatically destroyed when the vault is withdrawn or emergency-withdrawn
- **Composable**: Opens opportunities for DeFi integrations and lending against vault receipts
- **Verifiable**: Includes metadata about the vault (amount, unlock time, creation time)

## Smart Contract Implementation

### SIP-009 Compliance

The NFT contract (`contracts/flut-nft.clar`) fully implements the SIP-009 NFT trait:

```clarity
(impl-trait 'ST1NXBK3K5YYMD6FD41SVHEX0288FY19MP1ECYEA.sip-009-trait.sip-009-trait)
```

### Key Functions

#### Minting
```clarity
mint-vault-receipt(vault-id, owner, amount, unlock-height)
```
- Called automatically when a vault is created
- Mints 1 NFT token to the vault creator
- Stores vault metadata in the NFT

#### Burning
```clarity
burn-vault-receipt(token-id, owner)
```
- Called when vault is withdrawn or emergency-withdrawn
- Removes NFT from owner's balance
- Deletes NFT metadata

#### Transfer
```clarity
transfer(token-id, sender, recipient)
```
- Transfers NFT ownership to another address
- Updates balances for both sender and recipient
- Maintains metadata

#### Metadata Access
```clarity
get-nft-metadata(token-id)
get-token-uri(token-id)
get-metadata-uri(token-id)
```
- Retrieve NFT metadata including vault details
- Token URI points to IPFS-based metadata
- Metadata URI returns base64-encoded JSON

### Integration with Main Contract

The main vault contract (`contracts/flut.clar`) integrates with the NFT contract:

1. **On Vault Creation**:
   ```clarity
   (mint-vault-receipt vault-id caller amount unlock-height)
   ```
   - Mints NFT to caller when vault is created
   - Stores token ID in vault data

2. **On Withdrawal**:
   ```clarity
   (burn-vault-receipt nft-id caller)
   ```
   - Burns NFT when vault is withdrawn normally

3. **On Emergency Withdrawal**:
   ```clarity
   (burn-vault-receipt nft-id caller)
   ```
   - Burns NFT when vault is emergency-withdrawn with penalty

## Frontend Components

### NFTBadge Component

Displays the NFT receipt information to users:

```typescript
<NFTBadge 
  tokenId={vault.nftTokenId} 
  vaultId={vault.vaultId}
  currentOwner={userAddress}
  onTransfer={handleTransfer}
/>
```

**Features:**
- Shows token ID, vault ID, and contract reference
- Links to Hiro Explorer for on-chain verification
- Twitter sharing button
- Educational information about NFT benefits
- Transfer button to move NFT to another wallet

### NFTTransferModal Component

Modal for transferring NFT receipts:

```typescript
<NFTTransferModal
  isOpen={showTransferModal}
  tokenId={tokenId}
  currentOwner={currentOwner}
  onTransfer={handleTransfer}
  onCancel={handleCancel}
/>
```

**Features:**
- Input field for recipient address validation
- Shows current owner and token ID
- Warning about transfer implications
- Error handling for invalid addresses

### Integration in VaultDetail

The `VaultDetail` component displays the NFT badge when an NFT exists:

```tsx
{vault.nftTokenId !== undefined && (
  <section className="nft-receipt-section">
    <NFTBadge tokenId={vault.nftTokenId} vaultId={vault.vaultId} />
  </section>
)}
```

## API Methods

### VaultContractAPI Extensions

New NFT-related methods added to `VaultContractAPI`:

```typescript
// NFT ownership and metadata
getVaultNFTTokenId(vaultId: number)
getNFTMetadata(tokenId: number)
getNFTOwner(tokenId: number)
getNFTBalance(owner: string)

// Transferring
transferNFT(tokenId: number, recipient: string)

// Metadata access
getTokenURI(tokenId: number)
getMetadataURI(tokenId: number)

// Utilities
tokenExists(tokenId: number)
getLastTokenId()
getTokenCount()
```

## User Experience Flow

### 1. Creating a Vault

```
User clicks "Create Vault"
  ↓
Vault is created on-chain
  ↓
NFT is automatically minted to user
  ↓
User sees NFT receipt badge in vault details
```

### 2. Viewing NFT Receipt

```
User opens vault details
  ↓
NFTBadge component displays:
  - Token ID
  - Vault ID
  - "View on Explorer" link
  - "Share on Twitter" button
  - "Transfer NFT" button
```

### 3. Transferring NFT Receipt

```
User clicks "Transfer NFT"
  ↓
NFTTransferModal opens
  ↓
User enters recipient address
  ↓
Transfer transaction is signed and sent
  ↓
NFT ownership moves to recipient
  ↓
Recipient can now withdraw from vault
```

### 4. Withdrawing Vault (Normal)

```
User clicks "Withdraw"
  ↓
Vault is withdrawn
  ↓
NFT is automatically burned
  ↓
Funds transferred to beneficiary (if set) or creator
  ↓
NFT badge no longer visible in vault details
```

### 5. Emergency Withdrawal

```
User clicks "Emergency Withdraw"
  ↓
10% penalty calculated and deducted
  ↓
Remaining funds transferred to user
  ↓
NFT is automatically burned
  ↓
Penalty fee goes to treasury
```

## Metadata Structure

### On-Chain Metadata Map

Each NFT stores the following metadata:

```clarity
{
  vault-id: uint,          ;; Associated vault ID
  owner: principal,        ;; Current NFT owner
  created-at: uint,        ;; Block height when NFT was minted
  vault-amount: uint,      ;; Amount locked in vault (in microSTX)
  unlock-height: uint      ;; Block height when vault unlocks
}
```

### Token URI Format

```
https://ipfs.io/ipfs/flut-vault-nft/{token-id}
```

Points to IPFS-hosted metadata JSON.

### Metadata URI Format (Data URI)

```
data:application/json;base64,{base64-encoded-json}
```

Contains JSON metadata with:
- `name`: "Flut Vault Receipt #{token-id}"
- `description`: Description of the NFT
- `image`: IPFS link to NFT image
- `vault_id`: Associated vault ID
- `vault_amount`: Locked STX amount
- `unlock_height`: Unlock block height

## Testing

### Test Coverage

Comprehensive tests in `tests/flut-test.clar`:

- **Minting**: NFT mints on vault creation, token ID assigned
- **Metadata**: Metadata stored correctly with vault details
- **Balance**: User balance updated when NFT minted
- **Transfer**: NFT can be transferred between addresses
- **Burning**: NFT burned on vault withdrawal
- **URI Access**: Token URI and metadata URI retrievable
- **Existence**: Token existence verifiable
- **Ownership**: Owner verification works correctly

### Test Scenarios

1. **Basic Minting**: Create vault → verify NFT minted
2. **Metadata Storage**: Create vault → check metadata stored
3. **Balance Tracking**: Create multiple vaults → verify NFT count
4. **Transfer**: Transfer NFT → verify ownership changed
5. **Burning on Withdrawal**: Withdraw vault → verify NFT burned
6. **Metadata Access**: Retrieve metadata → verify all fields
7. **URI Generation**: Get token URI → verify format correct

## Benefits

### For Users
- **Proof**: On-chain proof of savings commitment
- **Transferability**: Share vault ownership with other addresses
- **Social Signal**: Share on Twitter to signal financial discipline
- **Marketability**: Potential future use in DeFi protocols

### For DeFi Ecosystem
- **Collateral**: Loan protocols can use NFTs as collateral
- **Derivatives**: Options protocols can trade vault positions
- **Aggregators**: Portfolio trackers can identify Flut users
- **Analytics**: Trackers can analyze savings patterns

## Future Enhancements

Potential future improvements:

1. **SVG Rendering**: Generate vault card SVGs on-chain
2. **Customization**: Allow users to customize NFT appearance
3. **Achievements**: Mint additional NFTs for milestones
4. **Governance**: NFT holders can vote on protocol upgrades
5. **Staking**: Stake NFTs in secondary pools for APY
6. **Fractional Ownership**: Fractionalize NFTs for shared vault ownership

## Configuration

### NFT Contract Address

Current contract address: `ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut-nft`

### Explorer Links

View NFTs on Hiro Explorer:
```
https://explorer.hiro.so/nft?address=ST1PQHQV0RAJ761DL3LJREQ553BQVK6QEE54MMCZP.flut-nft&token=vault-receipt&id={token-id}
```

## References

- [SIP-009 NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md)
- [Stacks Smart Contracts](https://docs.stacks.co/smart-contracts)
- [Clarity Language Reference](https://docs.stacks.co/references/clarity-language)
