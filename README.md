# Flut — STX Savings Vault

> A non-custodial, time-locked savings protocol built on the Stacks Bitcoin Layer 2. Lock your STX, set your unlock date, and withdraw only when you're ready — trustlessly enforced by Clarity smart contracts.

[![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-5546FF?style=flat-square)](https://stacks.co)
[![Clarity](https://img.shields.io/badge/Smart%20Contract-Clarity-orange?style=flat-square)](https://clarity-lang.org)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Smart Contract Reference](#smart-contract-reference)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Deployment Guide](#deployment-guide)
- [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Flut** is an open-source, on-chain savings protocol on the [Stacks](https://stacks.co) Bitcoin L2. It lets anyone lock STX into a personal vault with a time-lock, preventing early withdrawals until a specified Bitcoin block height is reached.

Unlike traditional savings accounts, Flut is:

- **Non-custodial** — you control your keys and your vault at all times
- **Trustless** — the Clarity contract enforces unlock rules with no middleman
- **Transparent** — all vault activity is verifiable on-chain
- **Bitcoin-secured** — settlement anchored to Bitcoin via Stacks

This project was built as part of the [Stacks Builder Rewards](https://app.talentprotocol.com) program.

---

## Features

- ✅ **Create a personal vault** with a custom lock duration
- ✅ **Deposit STX** into your vault at any time before unlock
- ✅ **Time-lock enforcement** via Bitcoin block height
- ✅ **Single-click withdrawal** once the lock period expires
- 🛡️ **Partial withdrawals supported** (specify amount or withdraw full balance)
- 🛑 **Withdrawal safety checks** with authorization, amount validation, and audit logs
- ⚠️ **Emergency withdrawal toggle** controlled by owner with penalty and tracking
- ✅ **Multiple vaults per wallet** — save for different goals
- ✅ **Vault labeling** — name your vaults (e.g. "House Fund", "Emergency STX")
- ✅ **Public leaderboard** — see top savers in the ecosystem
- ✅ **Hiro Wallet & Leather Wallet** support via Stacks.js
- ✅ **Fully open source** — fork and deploy your own instance

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                        │
│                                                          │
│   ┌──────────────┐         ┌───────────────────────┐    │
│   │  Next.js UI  │◄───────►│   Stacks.js / Connect │    │
│   │  (Frontend)  │         │   (Wallet Adapter)    │    │
│   └──────┬───────┘         └──────────┬────────────┘    │
│          │                            │                  │
└──────────┼────────────────────────────┼──────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Stacks Network                       │
│                                                          │
│   ┌──────────────────────────────────────────────────┐  │
│   │           flut.clar (Clarity)           │  │
│   │                                                  │  │
│   │  create-vault  │  deposit  │  withdraw  │  read  │  │
│   └──────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│              Stacks State (on-chain maps)                │
│                   vaults, balances                       │
│                          │                               │
│                          ▼                               │
│                  Bitcoin Blockchain                      │
│              (block height = time source)                │
└─────────────────────────────────────────────────────────┘
```

**Data flow:**
1. User connects their Stacks wallet via the frontend
2. Frontend reads vault data directly from the Clarity contract using read-only calls
3. User actions (create, deposit, withdraw) trigger signed transactions sent to the Stacks network
4. The Clarity contract enforces lock rules using `burn-block-height` (Bitcoin block height)
5. All state lives entirely on-chain — no database, no backend

---

## Smart Contract Reference

**Contract:** `flut.clar`  
**Testnet:** `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.flut`  
**Mainnet:** `SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.flut` *(deploy your own)*

---

### Data Structures

```clarity
;; Vault entry stored per user per vault-id
(define-map vaults
  { owner: principal, vault-id: uint }
  {
    balance: uint,          ;; STX balance in micro-STX
    unlock-height: uint,    ;; Bitcoin block height to unlock
    label: (string-ascii 64) ;; Human-readable vault name
  }
)

;; Track number of vaults per user
(define-map vault-count principal uint)
```

---

### Public Functions

#### `create-vault`
Creates a new time-locked vault for the caller.

```clarity
(define-public (create-vault
  (lock-duration uint)        ;; Number of Bitcoin blocks to lock for
  (initial-deposit uint)      ;; Initial STX deposit in micro-STX
  (label (string-ascii 64))   ;; Vault label
) (response uint uint))
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `lock-duration` | `uint` | Number of Bitcoin blocks until unlock (~10 min/block) |
| `initial-deposit` | `uint` | Amount in micro-STX (1 STX = 1,000,000 micro-STX) |
| `label` | `string-ascii 64` | Name for this vault, e.g. `"House Fund"` |

**Returns:** `(ok vault-id)` on success, `(err code)` on failure.

---

#### `deposit`
Adds STX to an existing vault. Can be called anytime before or after unlock.

```clarity
(define-public (deposit
  (vault-id uint)   ;; ID of the vault to deposit into
  (amount uint)     ;; Amount in micro-STX
) (response bool uint))
```

---

#### `withdraw`
Withdraws the full vault balance. Only callable after `unlock-height` is reached.

```clarity
(define-public (withdraw
  (vault-id uint)   ;; ID of the vault to withdraw from
) (response bool uint))
```

**Errors:**
- `u100` — Vault not found
- `u101` — Vault is still locked (current block < unlock-height)
- `u102` — Nothing to withdraw (balance is zero)
- `u103` — Unauthorized (caller is not vault owner)

---

### Read-Only Functions

#### `get-vault`
Returns vault details for a given owner and vault ID.

```clarity
(define-read-only (get-vault
  (owner principal)
  (vault-id uint)
) (optional { balance: uint, unlock-height: uint, label: string-ascii }))
```

#### `get-vault-count`
Returns the total number of vaults created by a principal.

```clarity
(define-read-only (get-vault-count (owner principal)) uint)
```

#### `is-unlocked`
Returns `true` if the vault has passed its lock period.

```clarity
(define-read-only (is-unlocked (owner principal) (vault-id uint)) bool)
```

---

### Error Codes

This table mirrors the constants defined in `contracts/flut.clar` so that frontends and integrators
can display meaningful messages when a transaction fails. When the contract returns `(err uXXX)`
these codes correspond to the rows below.

> **Tip:** the contract exposes a read-only function `get-error-description` which returns a human
> readable string for a given numeric code. You can call this helper directly from your frontend or
> mirror the mapping in your UI (see `web/src/utils/VaultContractAPI.ts` for an example).
>
> **Example (frontend)**:
> ```ts
> import { formatError, VaultContractAPI } from './web/src/utils/VaultContractAPI';
>
> try {
>   const result = await contract.createVault(100, 1000000);
>   VaultContractAPI.checkResult(result);
> } catch (err) {
>   console.error('Vault creation failed:', err.message);
>   alert('Error: ' + err.message);
> }
> ```

| Code | Constant | Meaning |
|------|----------|---------|
| `u1`   | `ERR-VAULT-NOT-FOUND`        | Vault does not exist |
| `u2`   | `ERR-UNAUTHORIZED`           | Caller is not vault owner |
| `u3`   | `ERR-NOT-UNLOCKED`           | Vault is still locked |
| `u4`   | `ERR-ALREADY-WITHDRAWN`      | Vault balance already withdrawn |
| `u5`   | `ERR-INVALID-AMOUNT`         | Amount must be > 0 and <= balance |
| `u6`   | `ERR-INVALID-HEIGHT`         | Unlock height must be > current height |
| `u7`   | `ERR-INVALID-PENALTY-RATE`   | Penalty rate out of bounds |
| `u8`   | `ERR-NOT-PENALTY-OWNER`      | Only penalty owner may update destination |
| `u9`   | `ERR-STACKING-NO-POOL`       | Stacking enabled but no pool provided |
| `u10`  | `ERR-STACKING-NOT-ENABLED`   | Attempted stacking operation on non-stacking vault |
| `u11`  | `ERR-INVALID-SHARES`         | Beneficiary shares must sum to 10000 |
| `u12`  | `ERR-TOO-MANY-BENEFICIARIES` | Exceeded maximum allowed beneficiaries |
| `u13`  | `ERR-BENEFICIARY-EXISTS`     | Beneficiary already set for vault |
| `u14`  | `ERR-INVALID-BENEFICIARY`    | Provided beneficiary address is invalid |
| `u15`  | `ERR-BENEFICIARY-SAME-AS-CREATOR` | Creator cannot be a beneficiary |
| `u16`  | `ERR-TOO-MANY-VAULTS`        | User reached vault creation limit |
| `u17`  | `ERR-DEPOSIT-COOLDOWN-ACTIVE`| Must wait between deposits |
| `u18`  | `ERR-DEPOSIT-AMOUNT-EXCEEDED`| Single deposit exceeds maximum |
| `u19`  | `ERR-VAULT-AMOUNT-EXCEEDED`  | Vault total balance exceeds cap |
| `u20`  | `ERR-INSUFFICIENT-BALANCE`   | Withdrawal amount exceeds balance |
| `u21`  | `ERR-INVALID-WITHDRAWAL-AMOUNT` | Withdrawal amount zero/invalid |
| `u22`  | `ERR-RECIPIENT-CANNOT-WITHDRAW` | Recipient not allowed to withdraw yet |
| `u23`  | `ERR-WITHDRAWAL-NOT-ALLOWED` | Withdrawals disabled for vault |
| `u24`  | `ERR-EMERGENCY-WITHDRAWAL-DISABLED` | Emergency withdrawals globally disabled |

> **Note:** new error codes may be added as the contract evolves; keep this table in sync with
> `contracts/flut.clar`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | [Clarity](https://clarity-lang.org) |
| Blockchain | [Stacks L2](https://stacks.co) |
| Frontend | [React 18](https://react.dev) + [Vite](https://vitejs.dev) |
| Wallet Integration | [@stacks/connect](https://github.com/hirosystems/connect) |
| Chain Reads | [@stacks/blockchain-api-client](https://github.com/hirosystems/stacks-blockchain-api) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Contract Dev & Testing | [Clarinet](https://github.com/hirosystems/clarinet) |
| Deployment | [Hiro Platform](https://platform.hiro.so) / Clarinet CLI |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org) v18+
- [npm](https://npmjs.com) or [pnpm](https://pnpm.io)
- [Clarinet](https://github.com/hirosystems/clarinet) (for contract development)
- A Stacks-compatible wallet: [Leather](https://leather.io) or [Xverse](https://xverse.app)

### Clone the Repository

```bash
git clone https://github.com/yourusername/flut.git
cd flut
```

### Project Structure

```
flut/
├── contracts/
│   └── flut.clar       # Main Clarity smart contract
├── tests/
│   └── flut_test.ts    # Clarinet unit tests
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root app + routing
│   │   ├── main.tsx             # Entry point
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # Home / vault list
│   │   │   └── VaultDetail.tsx  # Individual vault view
│   │   ├── components/
│   │   │   ├── CreateVaultModal.tsx
│   │   │   ├── VaultCard.tsx
│   │   │   ├── WalletConnect.tsx
│   │   │   └── Countdown.tsx
│   │   └── lib/
│   │       ├── contract.ts      # Contract call helpers
│   │       └── stacks.ts        # Stacks network config
│   ├── index.html
│   └── vite.config.ts
├── Clarinet.toml
├── settings/
│   ├── Devnet.toml
│   └── Mainnet.toml
├── README.md
└── package.json
```

---

## Deployment Guide

### Step 1 — Install Clarinet

```bash
# macOS
brew install clarinet

# Or via cargo
cargo install clarinet
```

### Step 2 — Run Contract Tests

```bash
cd flut
clarinet test
```

All tests should pass before deploying. The test suite covers:
- Vault creation with valid and invalid parameters
- Deposit into existing vaults
- Withdrawal before and after unlock height
- Unauthorized withdrawal attempts
- Edge cases (zero deposit, zero duration)

### Step 3 — Deploy to Testnet

```bash
clarinet deployments apply --testnet
```

You'll be prompted to sign the deployment transaction with your Stacks wallet. Grab testnet STX from the [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet).

### Step 4 — Deploy to Mainnet

```bash
clarinet deployments apply --mainnet
```

> ⚠️ Mainnet deployment requires real STX for transaction fees. Verify all contract logic on testnet first.

### Step 5 — Verify on Explorer

After deployment, visit the [Hiro Explorer](https://explorer.hiro.so) and search for your contract address to confirm it's live and callable.

---

## Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_NETWORK=testnet           # or mainnet
VITE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
VITE_CONTRACT_NAME=flut
VITE_STACKS_API=https://api.testnet.hiro.so
```

> Vite exposes env variables prefixed with `VITE_` to the client via `import.meta.env`.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Usage

### Creating a Vault

1. Connect your Leather or Xverse wallet using the **Connect Wallet** button
2. Click **Create New Vault**
3. Enter a vault label (e.g. "Emergency Fund")
4. Set your lock duration — the UI converts days into Bitcoin block count automatically (~144 blocks/day)
5. Enter your initial deposit amount in STX
6. Confirm the transaction in your wallet
7. Your vault appears on the dashboard with a live countdown

### Depositing to an Existing Vault

1. Navigate to your vault from the dashboard
2. Click **Deposit**
3. Enter the amount and confirm the transaction
4. Balance updates after the transaction confirms (~10 minutes)

### Withdrawing

1. Once your vault's countdown reaches zero, the **Withdraw** button becomes active
2. Click **Withdraw** and confirm the transaction
3. Your full vault balance is returned to your wallet

> **Note:** Bitcoin block times average ~10 minutes but can vary. The app shows an estimated calendar date alongside the block countdown.

---

## Security Considerations

- **No admin keys** — the contract has no owner, admin functions, or upgrade mechanism. Once deployed, it runs exactly as written.
- **Principal-based access control** — only the vault creator can withdraw from their own vault. This is enforced at the contract level, not the frontend.
- **No reentrancy risk** — Clarity is not Turing-complete and does not support reentrancy by design.
- **Block height as time** — the contract uses `burn-block-height` (Bitcoin block height) as its clock, which is more tamper-resistant than Stacks block height.
- **Audit status** — this contract has not been formally audited. Use at your own risk and start with small amounts.

---

## Roadmap

- [x] Core vault contract (create, deposit, withdraw)
- [x] Next.js frontend with wallet connect
- [ ] Multi-beneficiary vaults (send to another address on unlock)
- [ ] Emergency unlock with time penalty (e.g. 10% fee for early withdrawal)
- [ ] Vault NFT receipt — mint an NFT representing your locked vault
- [ ] Yield integration — route locked STX into Stacking while vaulted
- [ ] Mobile-responsive PWA
- [ ] Contract audit

---

## Contributing

Contributions are welcome! Here's how to get involved:

### Reporting Issues

Open an issue on GitHub with a clear description of the bug or feature request. For bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Wallet and browser version
- Relevant transaction IDs if applicable

### Submitting a Pull Request

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and write or update tests
4. Run the test suite: `clarinet test`
5. Commit with a clear message: `git commit -m "feat: add emergency unlock with penalty"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request against `main` with a description of your changes

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
test:     Adding or updating tests
refactor: Code change that neither fixes a bug nor adds a feature
chore:    Tooling, config, dependency updates
```

### Code Style

- Clarity contracts: follow the [Clarity Best Practices Guide](https://docs.stacks.co/clarity/overview)
- TypeScript: ESLint + Prettier (run `npm run lint` before committing)

---

## Resources

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language Reference](https://clarity-lang.org)
- [Clarinet Docs](https://docs.hiro.so/clarinet)
- [Stacks.js Docs](https://stacks.js.org)
- [Hiro Explorer](https://explorer.hiro.so)
- [Stacks Discord](https://discord.gg/stacks)
- [Talent Protocol — Stacks Builder Rewards](https://app.talentprotocol.com)

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ on Bitcoin L2 &nbsp;·&nbsp; <a href="https://stacks.co">Stacks</a>
</p>