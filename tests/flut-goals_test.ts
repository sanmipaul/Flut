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

Clarinet.test({
  name: "cancel-goal: returns ERR-UNAUTHORIZED for non-owner caller",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const attacker = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Fund'), types.uint(1000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], attacker.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "cancel-goal: returns ERR-NOT-FOUND for non-existent goal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(99)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});

Clarinet.test({
  name: "cancel-goal: returns ERR-ALREADY-REACHED when goal target is already met",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Trip'), types.uint(500)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(500)], contributor.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u3)');
  }
});

Clarinet.test({
  name: "cancel-goal: returns ERR-GOAL-CLOSED when goal is already finalized",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Car'), types.uint(500)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(500)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'withdraw-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u7)');
  }
});

Clarinet.test({
  name: "cancel-goal: returns ERR-GOAL-CANCELLED when already cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Test'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u8)');
  }
});

Clarinet.test({
  name: "is-goal-cancelled: returns false before cancel-goal is called",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Holiday'), types.uint(500)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'is-goal-cancelled', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "is-goal-cancelled: returns true after cancel-goal succeeds",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Holiday'), types.uint(500)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'is-goal-cancelled', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "contribute: returns ERR-GOAL-CANCELLED when goal has been cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Pool'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(200)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u8)');
  }
});

Clarinet.test({
  name: "withdraw-goal: returns ERR-NOT-REACHED on a cancelled goal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Pool'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'withdraw-goal', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u4)');
  }
});

Clarinet.test({
  name: "refund-contribution: succeeds for contributor after goal is cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Boat'), types.uint(2000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(600)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u600)');
  }
});

Clarinet.test({
  name: "refund-contribution: returns ERR-NOT-CANCELLED if goal is not cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Boat'), types.uint(2000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(600)], contributor.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u9)');
  }
});

Clarinet.test({
  name: "refund-contribution: returns ERR-NOTHING-TO-REFUND for non-contributor",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Boat'), types.uint(2000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u10)');
  }
});

Clarinet.test({
  name: "refund-contribution: returns ERR-NOT-FOUND for non-existent goal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(99)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});

Clarinet.test({
  name: "refund-contribution: returns ERR-NOTHING-TO-REFUND on second refund attempt",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Trip'), types.uint(2000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(400)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], contributor.address)
    ]);
    const second = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], contributor.address)
    ]);
    assertEquals(second.receipts[0].result, '(err u10)');
  }
});

Clarinet.test({
  name: "can-refund: returns true for contributor after goal is cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Fund'), types.uint(1000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(300)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'can-refund', [types.uint(0), types.principal(contributor.address)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "can-refund: returns false for non-contributor even on cancelled goal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Fund'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'can-refund', [types.uint(0), types.principal(stranger.address)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "can-refund: returns false for contributor if goal is not cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Fund'), types.uint(1000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(300)], contributor.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'can-refund', [types.uint(0), types.principal(contributor.address)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "get-contribution-amount: returns the correct amount contributed by a user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Pool'), types.uint(2000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(750)], contributor.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-contribution-amount', [types.uint(0), types.principal(contributor.address)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u750)');
  }
});

Clarinet.test({
  name: "get-contribution-amount: returns zero for address that never contributed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Pool'), types.uint(1000)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-contribution-amount', [types.uint(0), types.principal(stranger.address)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "get-contribution-amount: accumulates correctly across multiple contribute calls",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Pool'), types.uint(3000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(300)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(500)], contributor.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-contribution-amount', [types.uint(0), types.principal(contributor.address)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u800)');
  }
});

Clarinet.test({
  name: "refund-contribution: returns exact contribution amount as ok value",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Pool'), types.uint(5000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(1234)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1234)');
  }
});

Clarinet.test({
  name: "refund-contribution: multiple contributors can each refund independently after cancel",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const c1 = accounts.get('wallet_2')!;
    const c2 = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Fund'), types.uint(5000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(800)], c1.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(600)], c2.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const r1 = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], c1.address)
    ]);
    const r2 = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], c2.address)
    ]);
    assertEquals(r1.receipts[0].result, '(ok u800)');
    assertEquals(r2.receipts[0].result, '(ok u600)');
  }
});

Clarinet.test({
  name: "refund-contribution: goal owner can refund if they also contributed before cancelling",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Self'), types.uint(2000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(500)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u500)');
  }
});

Clarinet.test({
  name: "cancel-goal: cancellation of one goal does not affect other goals",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Goal A'), types.uint(1000)], owner.address),
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Goal B'), types.uint(2000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'is-goal-cancelled', [types.uint(1)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "can-contribute: returns false after goal is cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Drive'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'can-contribute', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "is-goal-finalized: remains false after cancellation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Drive'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'is-goal-finalized', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "get-goal-count: unchanged after goal is cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('A'), types.uint(500)], owner.address),
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('B'), types.uint(800)], owner.address)
    ]);
    const before = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-goal-count', [], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const after = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-goal-count', [], owner.address)
    ]);
    assertEquals(before.receipts[0].result, after.receipts[0].result);
  }
});

Clarinet.test({
  name: "get-goal-label: goal label is preserved after cancellation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Vacation Fund'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-goal-label', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result.includes('Vacation Fund'), true);
  }
});

Clarinet.test({
  name: "get-goal-saved: saved amount is preserved after cancellation (not auto-zeroed)",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Pool'), types.uint(2000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(400)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-goal-saved', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u400)');
  }
});

Clarinet.test({
  name: "get-contribution-amount: zeroed to u0 after contributor claims refund",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Pool'), types.uint(2000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(500)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], contributor.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-contribution-amount', [types.uint(0), types.principal(contributor.address)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "can-refund: returns false after contributor has already claimed their refund",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Fund'), types.uint(1000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(300)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], contributor.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'can-refund', [types.uint(0), types.principal(contributor.address)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "goal-exists: returns true after goal is cancelled",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Fund'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'goal-exists', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, 'true');
  }
});

Clarinet.test({
  name: "get-goal-owner: returns correct owner after goal cancellation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Fund'), types.uint(1000)], owner.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'get-goal-owner', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result.includes(owner.address), true);
  }
});

Clarinet.test({
  name: "refund-contribution: partial contributions before cancel are fully refundable",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Large Goal'), types.uint(10000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(100)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(200)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(150)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], contributor.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u450)');
  }
});

Clarinet.test({
  name: "is-goal-reached: remains false after goal is cancelled without reaching target",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const contributor = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Goal'), types.uint(1000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(300)], contributor.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-goals', 'is-goal-reached', [types.uint(0)], owner.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "full lifecycle: contribute, cancel, then all contributors refund",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const owner = accounts.get('wallet_1')!;
    const c1 = accounts.get('wallet_2')!;
    const c2 = accounts.get('wallet_3')!;
    const c3 = accounts.get('wallet_4')!;
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'create-goal', [types.ascii('Festival'), types.uint(5000)], owner.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(500)], c1.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(700)], c2.address),
      Tx.contractCall('flut-goals', 'contribute', [types.uint(0), types.uint(300)], c3.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-goals', 'cancel-goal', [types.uint(0)], owner.address)
    ]);
    const r1 = chain.mineBlock([Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], c1.address)]);
    const r2 = chain.mineBlock([Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], c2.address)]);
    const r3 = chain.mineBlock([Tx.contractCall('flut-goals', 'refund-contribution', [types.uint(0)], c3.address)]);
    assertEquals(r1.receipts[0].result, '(ok u500)');
    assertEquals(r2.receipts[0].result, '(ok u700)');
    assertEquals(r3.receipts[0].result, '(ok u300)');
  }
});
