# Issue: Comprehensive Vault Management System

## Overview
Enhance the Flut vault protocol with advanced management features including deposit limits, cooldowns, partial withdrawals, emergency withdrawal with penalty, and multi-beneficiary support.

## Problem Statement
The current vault implementation lacks several important features needed for a robust savings protocol:

1. **No deposit limits** - Users can deposit unlimited amounts without any caps
2. **No deposit cooldown** - Allows rapid successive deposits without restrictions
3. **No partial withdrawals** - Users must withdraw entire balance at once
4. **No emergency withdrawal** - No way to access funds early with a penalty
5. **No multi-beneficiary** - Single owner only; cannot designate multiple recipients
6. **Missing error constants** - Several error codes documented but not implemented
7. **No vault caps** - Individual and total vault balance limits not enforced

## Proposed Changes

### Smart Contract (`contracts/flut.clar`)
- Add missing error constants (ERR-SAME-OWNER, ERR-DEPOSIT-COOLDOWN-ACTIVE, ERR-DEPOSIT-AMOUNT-EXCEEDED, ERR-VAULT-AMOUNT-EXCEEDED, ERR-INSUFFICIENT-BALANCE, ERR-INVALID-WITHDRAWAL-AMOUNT, ERR-RECIPIENT-CANNOT-WITHDRAW, ERR-WITHDRAWAL-NOT-ALLOWED, ERR-EMERGENCY-WITHDRAWAL-DISABLED)
- Add vault-caps: max-lock-blocks, max-vault-balance, max-single-deposit
- Add deposit-cooldown-blocks (minimum time between deposits)
- Implement deposit cooldown tracking per vault
- Implement partial withdrawal with amount parameter
- Add emergency withdrawal flag and penalty rate (owner-configurable)
- Add multi-beneficiary support with share-based distribution (beneficiaries map, shares sum validation)
- Track last-deposit-height for cooldown enforcement
- Track total-deposited for vault caps
- Add can-deposit and can-withdraw read-only helpers for frontend validation

### Frontend (`frontend/`)
- Update CreateVaultModal with new options (deposit limits UI toggle, emergency withdrawal toggle, beneficiary management)
- Add partial withdrawal input in VaultDetail component
- Display deposit cooldown countdown
- Show vault balance progress bar against caps
- Add multi-beneficiary form UI (add/remove beneficiaries, share allocation)
- Update vault summary cards with new status indicators
- Enhance error handling to show new error messages
- Update VaultContractAPI utility with new contract functions

### Tests (`tests/`)
- Comprehensive test suite for deposit cooldown
- Tests for vault balance caps (per-vault and global)
- Tests for partial withdrawals (valid amounts, edge cases)
- Tests for emergency withdrawal activation and penalty calculation
- Tests for multi-beneficiary setup and share validation
- Tests for beneficiary withdrawal distribution
- Integration tests covering all new features

### Documentation
- Update README with new contract functions and parameters
- Add configuration guide for vault caps and cooldown settings
- Document emergency withdrawal workflow and penalty mechanics
- Document multi-beneficiary setup and withdrawal process
- Update error code table with new error constants

## Acceptance Criteria
- [ ] All new error constants properly defined and used
- [ ] Deposit cooldown enforced (cannot deposit before cooldown expires)
- [ ] Vault balance caps enforced (both per-vault and global if applicable)
- [ ] Partial withdrawals work correctly (amount > 0 and <= balance)
- [ ] Emergency withdrawal allows early access with configurable penalty
- [ ] Multi-beneficiary vaults can be created with share distribution
- [ ] Beneficiary withdrawals work after unlock (any beneficiary can withdraw their share)
- [ ] Frontend properly reflects all new states and restrictions
- [ ] All tests passing (contract + frontend)
- [ ] Documentation updated to reflect all changes

## Technical Notes
- Cooldown uses block height for time measurement (consistent with unlock-height)
- Penalty rate is basis points (e.g., 1000 = 10%)
- Beneficiary shares must sum exactly to 10000 (100.00%)
- Emergency withdrawal flag can be toggled by owner; when disabled, no early withdrawal allowed
- Vault caps apply to total balance (deposits - withdrawals)
- All changes backward compatible - existing vaults continue to function

## Impact
- **Breaking changes:** None - existing vaults unaffected
- **New dependencies:** None (pure Clarity/TS)
- **Migration needed:** No - opt-in features for new vaults only
- **Risk level:** Medium - extensive testing required for new state transitions

## Estimated Scope
- Lines of contract code: +200
- Frontend components modified: 6-8
- Test cases added: 40+
- Documentation pages updated: 2

---

**Status:** Completed  
**Priority:** High  
**Assignee:** TBD  
**Labels:** enhancement, vault-management, multi-beneficiary, emergency-withdrawal
