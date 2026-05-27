import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "deposit-streak: returns was-broken=false for on-time deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(11);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok {count: u2, was-broken: false})');
  }
});

Clarinet.test({
  name: "deposit-streak: returns was-broken=true when depositing after expiry window",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(20);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok {count: u1, was-broken: true})');
  }
});

Clarinet.test({
  name: "start-streak: rejects if streak already exists",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(200), types.uint(5)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u5)');
  }
});

Clarinet.test({
  name: "start-streak: rejects zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(0), types.uint(10)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u3)');
  }
});

Clarinet.test({
  name: "start-streak: rejects zero interval",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u4)');
  }
});

Clarinet.test({
  name: "start-streak: returns true on successful creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "start-streak: initializes streak count to 1",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
  }
});
