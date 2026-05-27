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
  name: "integration: streak can be restarted after withdraw and break-count resets",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(300), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(20);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(100)], wallet.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'withdraw-streak', [], wallet.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-break-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "integration: full lifecycle start deposit break deposit withdraw",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(400), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(7);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(30);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(100)], wallet.address)
    ]);
    const withdraw = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'withdraw-streak', [], wallet.address)
    ]);
    assertEquals(withdraw.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "integration: total accumulates correctly across mixed on-time and late deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(200), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(7);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(300)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(25);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(150)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-total', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u650)');
  }
});

Clarinet.test({
  name: "integration: streak count grows to 5 with five consecutive on-time deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(100), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    chain.mineBlock([Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(50)], wallet.address)]);
    chain.mineEmptyBlockUntil(24);
    chain.mineBlock([Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(50)], wallet.address)]);
    chain.mineEmptyBlockUntil(36);
    chain.mineBlock([Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(50)], wallet.address)]);
    chain.mineEmptyBlockUntil(48);
    chain.mineBlock([Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(50)], wallet.address)]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u5)');
  }
});

Clarinet.test({
  name: "get-streak-next-deposit-block: returns ERR-NO-STREAK for user without streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-next-deposit-block', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "get-streak-next-deposit-block: returns last-deposit plus interval",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const startBlock = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-next-deposit-block', [types.principal(wallet.address)], wallet.address)
    ]);
    const expectedNext = startBlock.height + 10;
    assertEquals(block.receipts[0].result, `(ok u${expectedNext})`);
  }
});

Clarinet.test({
  name: "get-streak-summary: reflects can-deposit true after interval elapses",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-summary', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result.includes('can-deposit: true'), true);
  }
});

Clarinet.test({
  name: "get-streak-summary: returns correct fields including count total and interval",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(15)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-summary', [types.principal(wallet.address)], wallet.address)
    ]);
    const result = block.receipts[0].result;
    assertEquals(result.includes('count: u1'), true);
    assertEquals(result.includes('total: u500'), true);
    assertEquals(result.includes('interval: u15'), true);
  }
});

Clarinet.test({
  name: "get-streak-last-deposit: returns ERR-NO-STREAK for user without streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-last-deposit', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "get-streak-last-deposit: returns creation block height immediately after start-streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const startBlock = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-last-deposit', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, `(ok u${startBlock.height})`);
  }
});

Clarinet.test({
  name: "get-streak-interval: returns ERR-NO-STREAK for user without streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-interval', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "can-deposit-streak: returns ERR-NO-STREAK for user without streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'can-deposit-streak', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "can-deposit-streak: returns true once interval has elapsed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'can-deposit-streak', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "can-deposit-streak: returns false before interval has elapsed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(50)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'can-deposit-streak', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "has-streak: returns true after start-streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'has-streak', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, 'true');
  }
});

Clarinet.test({
  name: "has-streak: returns false for user with no active streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'has-streak', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

Clarinet.test({
  name: "get-blocks-until-streak-expires: returns zero after 2x interval has passed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(20);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-blocks-until-streak-expires', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "get-blocks-until-streak-expires: returns non-zero before expiry window",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(50)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-blocks-until-streak-expires', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result.includes('u0'), false);
  }
});

Clarinet.test({
  name: "get-blocks-until-next-deposit: returns ERR-NO-STREAK for user without streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-blocks-until-next-deposit', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "get-blocks-until-next-deposit: returns zero once interval has passed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-blocks-until-next-deposit', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "get-blocks-until-next-deposit: returns non-zero when interval has not elapsed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(50)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-blocks-until-next-deposit', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result.includes('u0'), false);
  }
});

Clarinet.test({
  name: "get-streak-total: returns ERR-NO-STREAK for user without streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-total', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "get-streak-count: increments with three consecutive on-time deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(200), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(100)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(24);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(100)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u3)');
  }
});

Clarinet.test({
  name: "get-streak-count: returns ERR-NO-STREAK for user without streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "get-streak-break-count: returns ERR-NO-STREAK for user without streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-break-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "get-streak-break-count: accumulates across multiple streak breaks",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(200), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(25);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(100)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(60);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(100)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-break-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u2)');
  }
});

Clarinet.test({
  name: "is-streak-broken: returns ERR-NO-STREAK for non-existent user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'is-streak-broken', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "is-streak-broken: returns true after a streak-breaking late deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(25);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'is-streak-broken', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "is-streak-broken: remains false after an on-time deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'is-streak-broken', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "is-streak-broken: returns false immediately after start-streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'is-streak-broken', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "get-streak: returns some with full streak data after start-streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak', [types.principal(wallet.address)], wallet.address)
    ]);
    const result = block.receipts[0].result;
    assertEquals(result.includes('interval: u10'), true);
    assertEquals(result.includes('count: u1'), true);
    assertEquals(result.includes('total: u500'), true);
  }
});

Clarinet.test({
  name: "get-streak: returns none for user with no active streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, 'none');
  }
});

Clarinet.test({
  name: "deposit-streak: accumulates total balance across multiple deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(300)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-total', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u800)');
  }
});

Clarinet.test({
  name: "deposit-streak: updates last-deposit-height after successful deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    const depositBlock = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-last-deposit', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, `(ok u${depositBlock.height})`);
  }
});

Clarinet.test({
  name: "deposit-streak: increments break-count after late deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(25);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-break-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
  }
});

Clarinet.test({
  name: "deposit-streak: resets streak count to 1 when depositing after 2x interval",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(5)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(25);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
  }
});

Clarinet.test({
  name: "deposit-streak: does not increment break-count for on-time deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-break-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "deposit-streak: increments streak count for on-time deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u2)');
  }
});

Clarinet.test({
  name: "deposit-streak: succeeds exactly when interval boundary is reached",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok {count: u2, was-broken: false})');
  }
});

Clarinet.test({
  name: "deposit-streak: returns ERR-TOO-EARLY before interval has elapsed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});

Clarinet.test({
  name: "deposit-streak: returns ERR-ZERO-AMOUNT for zero deposit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineEmptyBlockUntil(12);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(0)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u3)');
  }
});

Clarinet.test({
  name: "deposit-streak: returns ERR-NO-STREAK for user without an active streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'deposit-streak', [types.uint(200)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "withdraw-streak: second call after withdrawal returns ERR-NO-STREAK",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'withdraw-streak', [], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'withdraw-streak', [], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "withdraw-streak: deletes streak record so has-streak returns false",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'withdraw-streak', [], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'has-streak', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

Clarinet.test({
  name: "withdraw-streak: returns ok true for active streak",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'withdraw-streak', [], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "withdraw-streak: returns ERR-NO-STREAK when no streak exists",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'withdraw-streak', [], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "start-streak: initializes break-count to zero",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-break-count', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "start-streak: sets broken flag to false on creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'is-streak-broken', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "start-streak: sets initial total to the deposited amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(750), types.uint(10)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-total', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u750)');
  }
});

Clarinet.test({
  name: "start-streak: stores the correct interval in streak data",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-streaks', 'start-streak', [types.uint(500), types.uint(20)], wallet.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-streaks', 'get-streak-interval', [types.principal(wallet.address)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u20)');
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
