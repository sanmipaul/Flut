import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "withdraw-goal: returns ERR-NOT-REACHED when goal not yet met",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const setup = chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('My Goal'), types.uint(1000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'withdraw-goal', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u4)');
  }
});

Clarinet.test({
  name: "withdraw-goal: cannot withdraw twice (finalized check)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Test'), types.uint(500)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(500)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'withdraw-goal', [types.uint(0)], owner.address)
    ]);
    const second = chain.mineBlock([
      Tx.contractCall('flut-goals', 'withdraw-goal', [types.uint(0)], owner.address)
    ]);
    assertEquals(second.receipts[0].result, '(err u7)');
  }
});

Clarinet.test({
  name: "contribute: rejects zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Test'), types.uint(500)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u5)');
  }
});

Clarinet.test({
  name: "cancel-goal: succeeds for goal owner on an unreached goal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Savings'), types.uint(1000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});
