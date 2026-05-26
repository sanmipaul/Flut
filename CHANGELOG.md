# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Added missing error constants for vault management features (ERR-DEPOSIT-COOLDOWN-ACTIVE, ERR-DEPOSIT-AMOUNT-EXCEEDED, ERR-VAULT-AMOUNT-EXCEEDED, ERR-INVALID-WITHDRAWAL-AMOUNT, ERR-INSUFFICIENT-BALANCE, ERR-EMERGENY-WITHDRAWAL-DISABLED, ERR-INVALID-SHARES, ERR-BENEFICIARY-SAME-AS-CREATOR, ERR-BENEFICIARY-EXISTS, ERR-BENEFICIARY-HAS-WITHDRAWN, ERR-BENEFICIARY-NOT-FOUND, ERR-INVALID-PENALTY-RATE)

### Added
- Deposit cooldown enforcement (144 blocks between deposits)
- Vault balance caps (max single deposit: 1M STX, max balance: 5M STX)
- Partial withdrawal support
- Emergency withdrawal with configurable penalty
- Multi-beneficiary support with share-based distribution
- Read-only helpers for frontend validation