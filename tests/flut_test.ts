import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "create-vault: rejects zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(0), types.uint(100)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u6)');
  }
});

Clarinet.test({
  name: "deposit: rejects zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const setup = chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u6)');
  }
});

Clarinet.test({
  name: "create-vault: rejects unlock-height beyond MAX-LOCK-BLOCKS",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(99999)], wallet.address)
]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Partial Withdrawal Tests
// ============================================

Clarinet.test({
  name: "withdraw-amount: fails with zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-amount', [types.uint(0), types.uint(0)], wallet.address)
]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Multi-Beneficiary Tests
// ============================================

Clarinet.test({
  name: "add-beneficiary: fails with shares exceeding 10000",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(15000)], owner.address)
]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Update Beneficiary Shares Tests
// ============================================

Clarinet.test({
  name: "update-beneficiary-shares: fails when shares exceed 10000",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'update-beneficiary-shares', [types.uint(0), types.principal(beneficiary.address), types.uint(15000)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u18)');
  }
});

Clarinet.test({
  name: "update-beneficiary-shares: succeeds with valid new shares",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'update-beneficiary-shares', [types.uint(0), types.principal(beneficiary.address), types.uint(7000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-beneficiary-shares', [types.uint(0), types.principal(beneficiary.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u7000)');
  }
});

// ============================================
// Penalty Rate Validation Tests
// ============================================

Clarinet.test({
  name: "set-emergency-withdrawal-penalty: fails when penalty exceeds max",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'set-emergency-withdrawal-penalty', [types.uint(0), types.uint(1001)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u23)');
  }
});

Clarinet.test({
  name: "set-emergency-withdrawal-penalty: succeeds with valid penalty",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'set-emergency-withdrawal-penalty', [types.uint(0), types.uint(500)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-emergency-withdrawal-penalty-bps', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u500)');
  }
});

// ============================================
// Cooldown Reset After Deposit Tests
// ============================================

Clarinet.test({
  name: "deposit: resets last-deposit-height after successful deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    // Try immediate second deposit - should fail due to cooldown
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u12)');
  }
});

Clarinet.test({
  name: "get-remaining-cooldown: returns zero when cooldown expired",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(350);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-remaining-cooldown', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "add-beneficiary: fails when beneficiary is same as owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(owner.address), types.uint(5000)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u19)');
  }
});

Clarinet.test({
  name: "add-beneficiary: fails when beneficiary already exists",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(3000)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u20)');
  }
});

Clarinet.test({
  name: "withdraw-amount: fails when amount exceeds vault balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(500), types.uint(2)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-amount', [types.uint(0), types.uint(1000)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u16)');
  }
});

Clarinet.test({
  name: "withdraw-amount: succeeds with valid partial amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-amount', [types.uint(0), types.uint(300)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "initiate-ownership-transfer: succeeds for vault owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "initiate-ownership-transfer: fails for non-existent vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(99), types.principal(newOwner.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});

Clarinet.test({
  name: "initiate-ownership-transfer: fails if caller is not vault owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const attacker = accounts.get('wallet_2')!;
    const newOwner = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], attacker.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "initiate-ownership-transfer: rejects new-owner equal to current owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(owner.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u10)');
  }
});

Clarinet.test({
  name: "initiate-ownership-transfer: fails on a withdrawn vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], owner.address)
    ]);
    chain.mineEmptyBlockUntil(3);
    chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u4)');
  }
});

Clarinet.test({
  name: "get-pending-owner: returns none when no transfer has been initiated",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-pending-owner', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, 'none');
  }
});

Clarinet.test({
  name: "get-pending-owner: returns some(new-owner) after initiate-ownership-transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-pending-owner', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result.includes(newOwner.address), true);
  }
});

Clarinet.test({
  name: "has-pending-transfer: returns false before any transfer is initiated",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'has-pending-transfer', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

Clarinet.test({
  name: "has-pending-transfer: returns true after initiate-ownership-transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'has-pending-transfer', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, 'true');
  }
});

Clarinet.test({
  name: "accept-ownership-transfer: succeeds for the pending new owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "accept-ownership-transfer: returns ERR-NOT-FOUND for non-existent vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(99)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});

Clarinet.test({
  name: "accept-ownership-transfer: returns ERR-NO-PENDING-TRANSFER when no transfer initiated",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u11)');
  }
});

Clarinet.test({
  name: "accept-ownership-transfer: returns ERR-UNAUTHORIZED if caller is not the pending new owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    const impersonator = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], impersonator.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "accept-ownership-transfer: updates vault owner to the accepting principal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-owner', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result.includes(newOwner.address), true);
  }
});

Clarinet.test({
  name: "accept-ownership-transfer: clears pending-owner entry after successful accept",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-pending-owner', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, 'none');
  }
});

Clarinet.test({
  name: "has-pending-transfer: returns false after transfer is accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'has-pending-transfer', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

Clarinet.test({
  name: "cancel-ownership-transfer: succeeds for current vault owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'cancel-ownership-transfer', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "cancel-ownership-transfer: returns ERR-UNAUTHORIZED for non-owner caller",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    const attacker = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'cancel-ownership-transfer', [types.uint(0)], attacker.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "cancel-ownership-transfer: returns ERR-NOT-FOUND for non-existent vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'cancel-ownership-transfer', [types.uint(99)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});

Clarinet.test({
  name: "cancel-ownership-transfer: returns ERR-NO-PENDING-TRANSFER when no transfer is pending",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'cancel-ownership-transfer', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u11)');
  }
});

Clarinet.test({
  name: "cancel-ownership-transfer: clears pending-owner entry after cancellation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'cancel-ownership-transfer', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-pending-owner', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, 'none');
  }
});

Clarinet.test({
  name: "has-pending-transfer: returns false after transfer is cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'cancel-ownership-transfer', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'has-pending-transfer', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

Clarinet.test({
  name: "withdraw: new owner can withdraw vault after ownership transfer accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "withdraw: original owner cannot withdraw after ownership transfer is accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "deposit: new owner can deposit into vault after ownership transfer accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "deposit: original owner cannot deposit after ownership transfer is accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "initiate-ownership-transfer: second initiation overwrites first pending transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const firstPending = accounts.get('wallet_2')!;
    const secondPending = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(firstPending.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(secondPending.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-pending-owner', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result.includes(secondPending.address), true);
  }
});

Clarinet.test({
  name: "accept-ownership-transfer: fails after pending transfer was cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'cancel-ownership-transfer', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u11)');
  }
});

Clarinet.test({
  name: "cancel-ownership-transfer: fails after accept has already completed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'cancel-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u11)');
  }
});

Clarinet.test({
  name: "get-vault-owner: returns new owner address after accept-ownership-transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-owner', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result.includes(newOwner.address), true);
    assertEquals(block.receipts[0].result.includes(owner.address), false);
  }
});

Clarinet.test({
  name: "can-deposit: returns true for new owner after ownership transfer accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'can-deposit', [types.uint(0), types.principal(newOwner.address)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "can-deposit: returns false for original owner after ownership transfer accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'can-deposit', [types.uint(0), types.principal(owner.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "get-vault-balance: vault amount is preserved through ownership transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(5000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-balance', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u5000)');
  }
});

Clarinet.test({
  name: "get-vault: unlock-height is preserved through ownership transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(300)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result.includes('unlock-height: u300'), true);
  }
});

Clarinet.test({
  name: "initiate-ownership-transfer: new owner can chain another transfer after accepting",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const secondOwner = accounts.get('wallet_2')!;
    const thirdOwner = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(secondOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], secondOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(thirdOwner.address)], secondOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "get-vault-summary: shows updated owner after accept-ownership-transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-summary', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result.includes(newOwner.address), true);
  }
});

Clarinet.test({
  name: "deposit: owner can still deposit while ownership transfer is pending",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "has-pending-transfer: multiple vaults track pending transfers independently",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'create-vault', [types.uint(2000), types.uint(300)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    const vault0 = chain.mineBlock([
      Tx.contractCall('flut', 'has-pending-transfer', [types.uint(0)], owner.address)
    ]);
    const vault1 = chain.mineBlock([
      Tx.contractCall('flut', 'has-pending-transfer', [types.uint(1)], owner.address)
    ]);
    assertEquals(vault0.receipts[0].result, 'true');
    assertEquals(vault1.receipts[0].result, 'false');
  }
});

Clarinet.test({
  name: "vault-exists: remains true after ownership transfer is accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'vault-exists', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, 'true');
  }
});

Clarinet.test({
  name: "get-vault-count: unchanged by ownership transfer operations",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const before = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-count', [], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const after = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-count', [], newOwner.address)
    ]);
    assertEquals(before.receipts[0].result, after.receipts[0].result);
  }
});

Clarinet.test({
  name: "full lifecycle: create, initiate, accept, deposit, withdraw as new owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], newOwner.address)
    ]);
    chain.mineEmptyBlockUntil(10);
    const withdraw = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(withdraw.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "initiate-ownership-transfer: fails on vault that was already withdrawn",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], owner.address)
    ]);
    chain.mineEmptyBlockUntil(4);
    chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u4)');
  }
});

Clarinet.test({
  name: "can-withdraw: returns true for new owner once vault is unlocked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'can-withdraw', [types.uint(0), types.principal(newOwner.address)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "is-vault-unlocked: reflects correct unlock state for new owner after transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const locked = chain.mineBlock([
      Tx.contractCall('flut', 'is-vault-unlocked', [types.uint(0)], newOwner.address)
    ]);
    chain.mineEmptyBlockUntil(6);
    const unlocked = chain.mineBlock([
      Tx.contractCall('flut', 'is-vault-unlocked', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(unlocked.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "is-vault-withdrawn: returns false after ownership transfer, not confused with withdrawn state",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'is-vault-withdrawn', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "get-blocks-until-unlock: returns non-zero for new owner before unlock block",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(500)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-blocks-until-unlock', [types.uint(0)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result.includes('u0'), false);
  }
});

// ============================================
// Deposit Cooldown Tests
// ============================================

Clarinet.test({
  name: "deposit: fails when deposit cooldown is active",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u12)');
  }
});

Clarinet.test({
  name: "deposit: succeeds after cooldown period has passed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Max Single Deposit Tests
// ============================================

Clarinet.test({
  name: "deposit: fails when amount exceeds MAX-SINGLE-DEPOSIT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(1000000000001)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u13)');
  }
});

Clarinet.test({
  name: "deposit: succeeds when amount equals MAX-SINGLE-DEPOSIT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(1000000000000)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Vault Balance Cap Tests
// ============================================

Clarinet.test({
  name: "deposit: fails when vault balance would exceed MAX-VAULT-BALANCE",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(4900000000000), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(100000000001)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u14)');
  }
});

Clarinet.test({
  name: "deposit: succeeds when vault balance equals MAX-VAULT-BALANCE exactly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(4900000000000), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(100000000000)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Emergency Withdrawal Tests
// ============================================

Clarinet.test({
  name: "emergency-withdraw: fails when emergency withdrawal is disabled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'emergency-withdraw', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u17)');
  }
});

Clarinet.test({
  name: "emergency-withdraw: succeeds after enabling",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address),
      Tx.contractCall('flut', 'set-emergency-withdrawal-enabled', [types.uint(0), types.bool(true)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'emergency-withdraw', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "emergency-withdraw: sets withdrawn flag after execution",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address),
      Tx.contractCall('flut', 'set-emergency-withdrawal-enabled', [types.uint(0), types.bool(true)], wallet.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'emergency-withdraw', [types.uint(0)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'is-vault-withdrawn', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Successful Beneficiary Adding Tests
// ============================================

Clarinet.test({
  name: "add-beneficiary: succeeds with valid parameters",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-beneficiary-shares', [types.uint(0), types.principal(beneficiary.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u5000)');
  }
});

Clarinet.test({
  name: "add-beneficiary: increments total shares correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    const beneficiary2 = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(3000)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary2.address), types.uint(2000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-total-shares', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u5000)');
  }
});

Clarinet.test({
  name: "get-beneficiary-count: returns correct count after adding beneficiaries",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    const beneficiary2 = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(3000)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary2.address), types.uint(2000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-beneficiary-count', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u2)');
  }
});

// ============================================
// Remove Beneficiary Tests
// ============================================

Clarinet.test({
  name: "remove-beneficiary: fails when vault already withdrawn",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'remove-beneficiary', [types.uint(0), types.principal(beneficiary.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u4)');
  }
});

Clarinet.test({
  name: "remove-beneficiary: fails when beneficiary not found",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'remove-beneficiary', [types.uint(0), types.principal(beneficiary.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u22)');
  }
});

Clarinet.test({
  name: "remove-beneficiary: succeeds and decrements shares",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'remove-beneficiary', [types.uint(0), types.principal(beneficiary.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Beneficiary Withdrawn Amount Tests
// ============================================

Clarinet.test({
  name: "get-beneficiary-withdrawn-amount: returns zero for new beneficiary",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-beneficiary-withdrawn-amount', [types.uint(0), types.principal(beneficiary.address)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

// ============================================
// Total Deposited Tracking Tests
// ============================================

Clarinet.test({
  name: "get-total-deposited: returns initial amount after vault creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(5000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-total-deposited', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u5000)');
  }
});

Clarinet.test({
  name: "get-total-deposited: includes subsequent deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(5000), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(2000)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-total-deposited', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u7000)');
  }
});

// ============================================
// Edge Case Tests - Amount Boundaries
// ============================================

Clarinet.test({
  name: "deposit: fails when deposit would exceed vault cap by 1 micro-STX",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(4999999999999), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(2)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u14)');
  }
});

Clarinet.test({
  name: "withdraw-amount: fails when amount equals balance plus one",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-amount', [types.uint(0), types.uint(1001)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u16)');
  }
});

// ============================================
// Multi-Vault Tests
// ============================================

Clarinet.test({
  name: "deposit: each vault tracks cooldown independently",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address),
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    // Both vaults should be in cooldown
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address),
      Tx.contractCall('flut', 'deposit', [types.uint(1), types.uint(500)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u12)');
    assertEquals(block.receipts[1].result, '(err u12)');
  }
});

// ============================================
// Beneficiary Withdraw-As-Beneficiary Tests
// ============================================

Clarinet.test({
  name: "withdraw-as-beneficiary: fails when vault is locked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000000), types.uint(100)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-as-beneficiary', [types.uint(0), types.uint(100000)], beneficiary.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u3)');
  }
});

Clarinet.test({
  name: "withdraw-as-beneficiary: fails when caller is not a beneficiary",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000000), types.uint(2)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'), types.uint(5000)], owner.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-as-beneficiary', [types.uint(0), types.uint(100000)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u22)');
  }
});

Clarinet.test({
  name: "withdraw-as-beneficiary: fails with zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000000), types.uint(2)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-as-beneficiary', [types.uint(0), types.uint(0)], beneficiary.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u15)');
  }
});

// ============================================
// Has-Beneficiaries Tests
// ============================================

Clarinet.test({
  name: "has-beneficiaries: returns false for vault without beneficiaries",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'has-beneficiaries', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

Clarinet.test({
  name: "has-beneficiaries: returns true after adding beneficiary",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'has-beneficiaries', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, 'true');
  }
});

Clarinet.test({
  name: "has-beneficiaries: returns false after removing all beneficiaries",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(5000)], owner.address),
      Tx.contractCall('flut', 'remove-beneficiary', [types.uint(0), types.principal(beneficiary.address)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'has-beneficiaries', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

// ============================================
// Vault Summary Tests
// ============================================

Clarinet.test({
  name: "get-vault-summary: returns correct unlocked status when locked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-summary', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result.includes('unlocked: false'), true);
  }
});

Clarinet.test({
  name: "get-vault-summary: returns correct unlocked status when unlocked",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-summary', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result.includes('unlocked: true'), true);
  }
});

// ============================================
// Max Constants Tests
// ============================================

Clarinet.test({
  name: "get-max-single-deposit: returns correct value",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-max-single-deposit', [], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1000000000000)');
  }
});

Clarinet.test({
  name: "get-max-vault-balance: returns correct value",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-max-vault-balance', [], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u5000000000000)');
  }
});

Clarinet.test({
  name: "get-max-lock-blocks: returns correct value",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-max-lock-blocks', [], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u52560)');
  }
});

// ============================================
// Emergency Withdrawal Toggle Persistence Tests
// ============================================

Clarinet.test({
  name: "is-emergency-withdrawal-enabled: returns false after creating new vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'is-emergency-withdrawal-enabled', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "set-emergency-withdrawal-enabled: can toggle multiple times",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address),
      Tx.contractCall('flut', 'set-emergency-withdrawal-enabled', [types.uint(0), types.bool(true)], wallet.address),
      Tx.contractCall('flut', 'set-emergency-withdrawal-enabled', [types.uint(0), types.bool(false)], wallet.address),
      Tx.contractCall('flut', 'set-emergency-withdrawal-enabled', [types.uint(0), types.bool(true)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'is-emergency-withdrawal-enabled', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Integration Tests - Full Lifecycle
// ============================================

Clarinet.test({
  name: "full lifecycle: create vault, enable emergency, withdraw early, verify penalty",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(10000), types.uint(200)], wallet.address),
      Tx.contractCall('flut', 'set-emergency-withdrawal-penalty', [types.uint(0), types.uint(1000)], wallet.address),
      Tx.contractCall('flut', 'set-emergency-withdrawal-enabled', [types.uint(0), types.bool(true)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'emergency-withdraw', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Vault Counter Tests
// ============================================

Clarinet.test({
  name: "get-vault-count: increments after each vault creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const before = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-count', [], wallet.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(300)], wallet.address)
    ]);
    const after = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-count', [], wallet.address)
    ]);
    assertEquals(after.receipts[0].result, '(ok u2)');
  }
});

// ============================================
// Vault Exists Tests
// ============================================

Clarinet.test({
  name: "vault-exists: returns true for created vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'vault-exists', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, 'true');
  }
});

Clarinet.test({
  name: "vault-exists: returns false for non-existent vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'vault-exists', [types.uint(999)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

// ============================================
// Withdrawal After Partial Tests
// ============================================

Clarinet.test({
  name: "withdraw: works after partial withdrawal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-amount', [types.uint(0), types.uint(300)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Cooldown Exact Timing Tests
// ============================================

Clarinet.test({
  name: "deposit: succeeds exactly 144 blocks after previous deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2 + 144)], wallet.address)
    ]);
    // Mine exactly 144 blocks to expire cooldown
    chain.mineEmptyBlockUntil(146);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Beneficiary at Vault Limit Tests
// ============================================

Clarinet.test({
  name: "add-beneficiary: fails when total shares would exceed 10000",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    const beneficiary2 = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(8000)], owner.address)
    ]);
    // Try to add beneficiary with 2001 shares (8000 + 2001 = 10001 > 10000)
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary2.address), types.uint(2001)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u14)');
  }
});

Clarinet.test({
  name: "add-beneficiary: succeeds when total shares equals exactly 10000",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const beneficiary = accounts.get('wallet_2')!;
    const beneficiary2 = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary.address), types.uint(8000)], owner.address)
    ]);
    // Add exactly 2000 shares to reach 10000
    chain.mineBlock([
      Tx.contractCall('flut', 'add-beneficiary', [types.uint(0), types.principal(beneficiary2.address), types.uint(2000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-vault-total-shares', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u10000)');
  }
});

// ============================================
// Ownership Transfer with New Features Tests
// ============================================

Clarinet.test({
  name: "deposit: new owner can deposit after ownership transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const newOwner = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], owner.address),
      Tx.contractCall('flut', 'initiate-ownership-transfer', [types.uint(0), types.principal(newOwner.address)], owner.address),
      Tx.contractCall('flut', 'accept-ownership-transfer', [types.uint(0)], newOwner.address)
    ]);
    // Advance past cooldown
    chain.mineEmptyBlockUntil(400);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], newOwner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

// ============================================
// Vault Without Beneficiaries Partial Withdrawal Tests
// ============================================

Clarinet.test({
  name: "withdraw-amount: fails for withdrawn vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'withdraw-amount', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u4)');
  }
});

// ============================================
// Error Message Consistency Tests
// ============================================

Clarinet.test({
  name: "deposit: ERR-VAULT-CLOSED returned for withdrawn vault",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(2)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(5);
    chain.mineBlock([
      Tx.contractCall('flut', 'withdraw', [types.uint(0)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u9)');
  }
});

// ============================================
// Get Last Deposit Height Tests
// ============================================

Clarinet.test({
  name: "get-last-deposit-height: returns current block height after vault creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-last-deposit-height', [types.uint(0)], wallet.address)
    ]);
    // Block height should be 2 (1-based after mineBlock)
    assertEquals(block.receipts[0].result, '(ok u2)');
  }
});

// ============================================
// Blocks Until Unlock Tests
// ============================================

Clarinet.test({
  name: "get-blocks-until-unlock: returns zero for locked vault at unlock height",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(10);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'get-blocks-until-unlock', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

// ============================================
// Max Vault Balance Edge Case Tests
// ============================================

Clarinet.test({
  name: "deposit: exactly fills vault to max balance",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const maxBalance = 5000000000000;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(maxBalance), types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(200);
    const block = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(0)], wallet.address)
    ]);
    // Should fail - zero amount
    assertEquals(block.receipts[0].result, '(err u6)');
  }
});

// ============================================
// Multiple Cooldown Tests
// ============================================

Clarinet.test({
  name: "deposit: successive deposits require cooldown between each",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut', 'create-vault', [types.uint(1000), types.uint(200 + 300)], wallet.address)
    ]);
    // First deposit - should fail (cooldown)
    const first = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    assertEquals(first.receipts[0].result, '(err u12)');
    // Advance past cooldown
    chain.mineEmptyBlockUntil(400);
    // Second deposit - should succeed
    const second = chain.mineBlock([
      Tx.contractCall('flut', 'deposit', [types.uint(0), types.uint(500)], wallet.address)
    ]);
    assertEquals(second.receipts[0].result, '(ok true)');
  }
});
