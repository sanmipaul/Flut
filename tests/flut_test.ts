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
    assertEquals(block.receipts[0].result, '(err u8)');
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
