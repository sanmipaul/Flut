# Emergency Withdrawal with Penalty Fee Feature

## Overview

The Emergency Withdrawal feature provides vault owners with a configurable escape hatch to withdraw their STX before the lock period expires. A penalty fee (default 10%) is deducted from the withdrawal amount to preserve the savings discipline incentive.

## Motivation

While time-locking is a powerful savings tool, real-life emergencies happen. The penalty-based early withdrawal mechanism allows flexibility without completely undermining the security/savings aspects of the protocol.

## Feature Details

### Smart Contract Implementation

#### Constants
- **PENALTY_RATE**: Fixed at 10% (u10)
- **penalty-destination**: Configurable principal that receives penalty funds

#### New Functions

**emergency-withdraw (public)**
Allows early withdrawal before unlock with penalty deduction.

```clarity
(emergency-withdraw vault-id)
```

Parameters:
- `vault-id` (uint): ID of the vault to withdraw from

Returns:
- `(ok { user-amount: uint, penalty: uint })` - Withdrawal amounts
- Error: Unauthorized, already withdrawn, or contract errors (returns numeric error codes defined
  in the main error table; see `README.md`).
  Common codes include:
  - `u2` (`ERR-UNAUTHORIZED`): Caller not vault owner
  - `u4` (`ERR-ALREADY-WITHDRAWN`): Vault already emptied
  - `u24` (`ERR-EMERGENCY-WITHDRAWAL-DISABLED`): Global emergency toggle turned off


Behavior:
1. Verifies caller is vault creator
2. Calculates 10% penalty from vault amount
3. Transfers (amount - penalty) to beneficiary or creator
4. Transfers penalty to configured destination
5. Marks vault as withdrawn
6. Emits print event for indexing

**set-penalty-destination (public)**
Updates the address that receives penalty fees.

```clarity
(set-penalty-destination new-destination)
```

Parameters:
- `new-destination` (principal): New address for penalty collection

Returns:
- `(ok true)` on success
- Error: Only current destination can change address

**Penalty Calculation (private)**
```clarity
(define-private (calculate-penalty (amount uint))
  (/ (* amount PENALTY_RATE) u100)
)
```

For example:
- Vault amount: 1,000,000 STX
- Penalty (10%): 100,000 STX
- User receives: 900,000 STX

#### Read-Only Functions

- `get-penalty-rate ()` → Returns 10
- `get-penalty-destination ()` → Returns penalty address
- `get-penalty-amount (vault-id)` → Calculates penalty for vault
- `get-emergency-withdrawal-amount (vault-id)` → Amount user receives after penalty

### Frontend Implementation

#### PenaltyWarningModal Component
Displays a warning before emergency withdrawal with:
- Vault amount breakdown
- Penalty rate and amount calculation
- Amount user will receive
- Important warnings about non-refundable penalties
- Confirmation checkbox
- Cancel/Confirm buttons

#### VaultDetail Updates
- Shows "Emergency Withdraw" button on locked vaults
- Disabled after unlock (to incentivize normal withdrawal)
- Opens penalty warning modal on click
- Displays calculated penalty amounts

#### Styling
- Red/danger color scheme for emergency actions
- Clear penalty calculation breakdown
- Warning styling to emphasize consequences
- Responsive modal layout

## Penalty Calculation Examples

### Example 1: Normal Vault
- Vault amount: 1,000,000 STX
- Penalty rate: 10%
- Penalty: 100,000 STX
- User receives: 900,000 STX

### Example 2: Small Balance
- Vault amount: 100,000 STX
- Penalty: 10,000 STX
- User receives: 90,000 STX

### Example 3: Large Vault
- Vault amount: 10,000,000 STX
- Penalty: 1,000,000 STX
- User receives: 9,000,000 STX

## Edge Cases Covered

✓ Small balance penalties (correct rounding)
✓ Zero remainder calculations (exact 10% divisions)
✓ Multiple vaults with different penalties
✓ Penalty destination updates
✓ Withdrawal after penalty deduction

## Security Considerations

1. **Authorization**: Only vault creator can emergency withdraw
2. **Penalty Enforcement**: Cannot be bypassed or reduced
3. **Non-refundable**: No mechanism to recover penalty
4. **Immutability**: Once withdrawn, vault cannot be undone
5. **Beneficiary Routing**: Penalty and user amounts both transferred correctly

## Test Coverage

All penalty calculation scenarios tested:
- `test-get-penalty-rate` - Verify 10% rate
- `test-get-penalty-amount` - Penalty calculation accuracy
- `test-get-emergency-withdrawal-amount` - Net withdrawal amount
- `test-emergency-withdraw` - Full withdrawal flow
- `test-set-penalty-destination` - Destination updates
- `test-small-balance-penalty` - Edge case with small amounts
- `test-penalty-boundary` - Exact penalty boundaries
- `test-zero-remainder-penalty` - No rounding errors
- `test-multiple-vault-penalties` - Different balance scenarios

## Acceptance Criteria ✓

- ✅ emergency-withdraw deducts correct penalty amount
- ✅ Normal withdraw is unaffected by penalty feature
- ✅ Penalty destination is configurable at deploy time
- ✅ Frontend warns user before signing
- ✅ Tests cover penalty calculation edge cases
- ✅ All penalty calculations verified with examples

## Usage Flow

### For Users

1. **Locked Vault**: User sees "Emergency Withdraw" button
2. **Click Button**: Modal opens with penalty breakdown
3. **Review**: User sees exact amounts (penalty + net withdrawal)
4. **Confirm**: User checks confirmation checkbox
5. **Sign**: Transaction is sent to blockchain
6. **Complete**: Vault marked as withdrawn, penalty transferred

### For Protocol Developers

1. **Deploy**: Set initial penalty destination (contract owner)
2. **Monitor**: Collect penalties from emergency withdrawals
3. **Update**: Change destination if needed via `set-penalty-destination`
4. **Analytics**: Track emergency vs. normal withdrawals via print events

## Configuration

At deployment time, configure:
- **PENALTY_RATE**: Currently fixed at 10%, modifiable in contract
- **penalty-destination**: Set to treasury/dao address

Future enhancements could support:
- Variable penalty rates (governance controlled)
- Graduated penalties (higher early = higher penalty)
- Penalty distribution (partial to DAO, partial to protocol)
- Grace periods before penalty applies

## Example Panic Scenario

**Bob's Situation:**
- Locked 10,000 STX for 100 blocks
- At block 50, medical emergency occurs
- Normal withdrawal blocked (50 more blocks = ~3 days)
- Chooses emergency withdrawal:
  - Penalty: 1,000 STX (10%)
  - Receives: 9,000 STX immediately
  - 1,000 STX goes to treasury

**Trade-off**: Lost 1,000 STX but solved immediate problem

## Future Enhancements

Potential improvements for future versions:
1. **Governance-controlled penalties** - DAO votes on penalty rates
2. **Time-based gradients** - Lower penalty as unlock approaches
3. **Emergency fund** - Penalties fund protocol emergency reserve
4. **Whitelist escapes** - Authorized emergency withdrawals (no penalty)
5. **Insurance coverage** - Optional insurance against penalties
