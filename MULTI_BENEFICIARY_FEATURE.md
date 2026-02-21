# Multi-Beneficiary Vaults Feature

## Overview

The Multi-Beneficiary Vaults feature allows vault creators to designate recipient addresses that will receive vault funds upon unlock, instead of only the creator being able to withdraw.

## Feature Highlights

### 1. **Optional Beneficiary Support**
   - When creating a vault, you can specify an optional beneficiary principal
   - If a beneficiary is set, funds are transferred to that address on withdrawal
   - If no beneficiary is set, funds are transferred to the vault creator (default behavior)

### 2. **Update Beneficiary Before Unlock**
   - Vault creators can call `set-beneficiary` at any time before the vault is unlocked
   - Only the vault creator can modify the beneficiary
   - Beneficiary cannot be changed after withdrawal

### 3. **Use Cases**
   - **Parents locking STX for children**: Set the child's wallet as beneficiary
   - **DAO token vesting**: Designate team member wallets as beneficiaries
   - **Scheduled grants**: Fund multiple recipients with time-locked deployments
   - **Milestone-based payouts**: Create vaults with specific recipient addresses

## Smart Contract Functions

### `create-vault` (public)
Creates a new vault with an optional beneficiary.

**Parameters:**
- `lock-duration` (uint): Duration in blocks until unlock
- `initial-amount` (uint): Initial deposit in microSTX
- (Optional) Beneficiary principal can be set via `set-beneficiary` after creation

**Returns:** vault-id (uint)

```clarity
(contract-call? 'ST1.flut create-vault u100 u1000000)
```

### `set-beneficiary` (public)
Sets or updates the beneficiary for a vault.

**Parameters:**
- `vault-id` (uint): ID of the vault
- `beneficiary` (principal): Address to receive funds on unlock

**Returns:** (ok true) or error code

```clarity
(contract-call? 'ST1.flut set-beneficiary u0 'SP1BENEFICIARY)
```

### `withdraw` (public)
Withdraws vault funds to the beneficiary (if set) or creator.

**Parameters:**
- `vault-id` (uint): ID of the vault to withdraw from

**Returns:** (ok true) or error code

```clarity
(contract-call? 'ST1.flut withdraw u0)
```

### `deposit` (public)
Adds additional funds to an existing vault.

**Parameters:**
- `vault-id` (uint): ID of the vault
- `amount` (uint): Additional amount in microSTX

**Returns:** (ok true) or error code

```clarity
(contract-call? 'ST1.flut deposit u0 u500000)
```

### Read-Only Functions

- `get-vault` (vault-id) → vault details
- `get-vault-count` () → total number of vaults
- `is-vault-unlocked` (vault-id) → boolean
- `get-vault-beneficiary` (vault-id) → optional principal

## Frontend Features

### CreateVaultModal Component
- Input for vault amount (STX)
- Input for lock duration (blocks)
- Checkbox to enable beneficiary
- Input field for beneficiary address (when enabled)
- Form validation and error handling
- Loading state during transaction

### VaultDetail Component
- Display all vault information
  - Creator address
  - Vault amount
  - Creation block and unlock block
  - Current lock status
  - Time until unlock (estimated days)
  
- Beneficiary information display
  - Shows beneficiary address if set
  - Explains that funds will go to beneficiary
  
- Set beneficiary interface
  - Allows creator to set beneficiary at any time before unlock
  - Only visible if no beneficiary is set and vault not withdrawn
  
- Withdrawal button
  - Only enabled after unlock
  - Shows beneficiary in confirmation message
  - Disabled after withdrawal

### App Component
- Vault list with sidebar navigation
- Create new vault modal
- Vault detail view
- Integration with all components
- Overall wallet connection management

## Acceptance Criteria ✓

- ✅ `create-vault` accepts an optional beneficiary principal
- ✅ `withdraw` transfers to beneficiary when set
- ✅ Beneficiary address is displayed in the vault detail view
- ✅ Clarinet tests cover beneficiary withdrawal flow
- ✅ Frontend components support full beneficiary workflow
- ✅ Comprehensive documentation provided

## Testing

All contract functions are tested with:
- Vault creation with and without beneficiary
- Beneficiary updates
- Withdrawal with beneficiary routing
- Authorization checks
- Unlock time validation
- Error handling

Test file: `tests/flut-test.clar`

## Security Considerations

1. **Authorization**: Only vault creators can set beneficiary or withdraw
2. **Immutability**: Beneficiary cannot be changed after withdrawal
3. **Time-lock**: Strict block height enforcement prevents early withdrawal
4. **Non-custodial**: Smart contract enforces rules with no middleman
5. **On-chain**: All vaul activity is verifiable on the Stacks blockchain

## Future Enhancements

- Multiple beneficiaries with percentage splits
- Conditional withdrawals based on oracle data
- Vault delegation/transfer ownership
- Integration with DeFi protocols for yield
- Advanced scheduling (vesting schedules)
