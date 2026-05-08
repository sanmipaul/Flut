import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "claim-share: each member receives their own contribution back",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const member2 = accounts.get('wallet_2')!;
    const members = [types.principal(creator.address), types.principal(member2.address)];
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list(members)], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(600)], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(400)], member2.address),
    ]);
    const claim1 = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], creator.address),
    ]);
    assertEquals(claim1.receipts[0].result, '(ok u600)');

    const claim2 = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], member2.address),
    ]);
    assertEquals(claim2.receipts[0].result, '(ok u400)');
  }
});

Clarinet.test({
  name: "claim-share: cannot claim twice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const members = [types.principal(creator.address)];
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list(members)], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], creator.address),
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], creator.address),
    ]);
    const second = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], creator.address),
    ]);
    assertEquals(second.receipts[0].result, '(err u8)');
  }
});

Clarinet.test({
  name: "claim-share: fails before target is met",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const members = [types.principal(creator.address)];
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list(members)], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(400)], creator.address),
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], creator.address),
    ]);
    assertEquals(block.receipts[0].result, '(err u4)');
  }
});

Clarinet.test({
  name: "contribute: non-member cannot contribute to a 1-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([types.principal(creator.address)])], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "contribute: non-member cannot contribute to a 2-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const member2 = accounts.get('wallet_2')!;
    const stranger = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(creator.address), types.principal(member2.address)
      ])], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "contribute: non-member cannot contribute to a 3-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    const stranger = accounts.get('wallet_4')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address), types.principal(w3.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "contribute: non-member cannot contribute to a 4-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    const w4 = accounts.get('wallet_4')!;
    const stranger = accounts.get('wallet_5')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address),
        types.principal(w3.address), types.principal(w4.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "claim-share: non-member cannot claim on a 1-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "claim-share: non-member cannot claim on a 2-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const stranger = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(600)], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(400)], w2.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "claim-share: non-member cannot claim on a 3-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    const stranger = accounts.get('wallet_4')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(900), types.list([
        types.principal(w1.address), types.principal(w2.address), types.principal(w3.address)
      ])], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], w2.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], w3.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "claim-share: non-member cannot claim on a 4-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    const w4 = accounts.get('wallet_4')!;
    const stranger = accounts.get('wallet_5')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(800), types.list([
        types.principal(w1.address), types.principal(w2.address),
        types.principal(w3.address), types.principal(w4.address)
      ])], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w2.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w3.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w4.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u2)');
  }
});

Clarinet.test({
  name: "contribute: member at index 0 can contribute",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], w1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "contribute: member at index 1 can contribute",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], w2.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "contribute: member at index 2 can contribute",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address), types.principal(w3.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], w3.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "contribute: member at index 3 can contribute",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    const w4 = accounts.get('wallet_4')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address),
        types.principal(w3.address), types.principal(w4.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(250)], w4.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "contribute: member at index 4 can contribute",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    const w4 = accounts.get('wallet_4')!;
    const w5 = accounts.get('wallet_5')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address), types.principal(w3.address),
        types.principal(w4.address), types.principal(w5.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w5.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "is-split-member: returns false for stranger on a 1-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'is-split-member', [types.uint(0), types.principal(stranger.address)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "is-split-member: returns false for stranger on a 2-member split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const stranger = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'is-split-member', [types.uint(0), types.principal(stranger.address)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "is-split-member: returns true for actual member in the list",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'is-split-member', [types.uint(0), types.principal(w2.address)], w2.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "can-claim-share: returns false for non-member even when target is met",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const stranger = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'can-claim-share', [types.uint(0), types.principal(stranger.address)], stranger.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "create-split: fails with empty members list",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([])], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u11)');
  }
});

Clarinet.test({
  name: "full lifecycle: 2-member split contribute and claim",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(600)], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(400)], w2.address)
    ]);
    const claim1 = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], w1.address)
    ]);
    const claim2 = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], w2.address)
    ]);
    assertEquals(claim1.receipts[0].result, '(ok u600)');
    assertEquals(claim2.receipts[0].result, '(ok u400)');
  }
});

Clarinet.test({
  name: "full lifecycle: 5-member split all contribute and claim",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    const w4 = accounts.get('wallet_4')!;
    const w5 = accounts.get('wallet_5')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address), types.principal(w3.address),
        types.principal(w4.address), types.principal(w5.address)
      ])], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w2.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w3.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w4.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(200)], w5.address)
    ]);
    const c1 = chain.mineBlock([Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], w1.address)]);
    const c2 = chain.mineBlock([Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], w2.address)]);
    const c3 = chain.mineBlock([Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], w3.address)]);
    assertEquals(c1.receipts[0].result, '(ok u200)');
    assertEquals(c2.receipts[0].result, '(ok u200)');
    assertEquals(c3.receipts[0].result, '(ok u200)');
  }
});

Clarinet.test({
  name: "contribute: returns ERR-NOT-FOUND for non-existent split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(99), types.uint(500)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});

Clarinet.test({
  name: "contribute: returns ERR-ZERO-AMOUNT for zero contribution",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(0)], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u6)');
  }
});

Clarinet.test({
  name: "create-split: returns ERR-ZERO-TARGET for zero target amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(0), types.list([types.principal(creator.address)])], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u7)');
  }
});

Clarinet.test({
  name: "split-exists: returns true after create-split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'split-exists', [types.uint(0)], creator.address)
    ]);
    assertEquals(block.receipts[0].result, 'true');
  }
});

Clarinet.test({
  name: "split-exists: returns false for unknown split id",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'split-exists', [types.uint(99)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, 'false');
  }
});

Clarinet.test({
  name: "get-split-count: increments after each create-split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'create-split', [types.uint(800), types.list([types.principal(creator.address)])], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-split-count', [], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u2)');
  }
});

Clarinet.test({
  name: "is-target-met: returns false before target is reached",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(400)], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'is-target-met', [types.uint(0)], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok false)');
  }
});

Clarinet.test({
  name: "is-target-met: returns true after target is reached",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'is-target-met', [types.uint(0)], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  }
});

Clarinet.test({
  name: "get-split-remaining: returns correct amount before target is met",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-split-remaining', [types.uint(0)], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u700)');
  }
});

Clarinet.test({
  name: "get-split-remaining: returns zero after target is fully met",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-split-remaining', [types.uint(0)], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
  }
});

Clarinet.test({
  name: "get-split-saved: accurately tracks total contributions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(2000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(700)], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], w2.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-split-saved', [types.uint(0)], w1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1000)');
  }
});

Clarinet.test({
  name: "contribute: accumulates correctly for repeated contributions from same member",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(300)], creator.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(400)], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-member-share-amount', [types.uint(0), types.principal(creator.address)], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u700)');
  }
});

Clarinet.test({
  name: "get-split-creator: returns the address of the split creator",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    const member2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(creator.address), types.principal(member2.address)
      ])], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-split-creator', [types.uint(0)], creator.address)
    ]);
    assertEquals(block.receipts[0].result.includes(creator.address), true);
  }
});

Clarinet.test({
  name: "get-member-share-amount: returns exact contribution for each member",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(650)], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(350)], w2.address)
    ]);
    const s1 = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-member-share-amount', [types.uint(0), types.principal(w1.address)], w1.address)
    ]);
    const s2 = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-member-share-amount', [types.uint(0), types.principal(w2.address)], w2.address)
    ]);
    assertEquals(s1.receipts[0].result, '(ok u650)');
    assertEquals(s2.receipts[0].result, '(ok u350)');
  }
});

Clarinet.test({
  name: "has-claimed: returns false before claim and true after claim",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(500)], creator.address)
    ]);
    const before = chain.mineBlock([
      Tx.contractCall('flut-split', 'has-claimed', [types.uint(0), types.principal(creator.address)], creator.address)
    ]);
    chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], creator.address)
    ]);
    const after = chain.mineBlock([
      Tx.contractCall('flut-split', 'has-claimed', [types.uint(0), types.principal(creator.address)], creator.address)
    ]);
    assertEquals(before.receipts[0].result, 'false');
    assertEquals(after.receipts[0].result, 'true');
  }
});

Clarinet.test({
  name: "get-split-member-count: returns correct number of members",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    const w3 = accounts.get('wallet_3')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address), types.principal(w3.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-split-member-count', [types.uint(0)], w1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u3)');
  }
});

Clarinet.test({
  name: "get-member-at-index: returns correct member at given index",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-member-at-index', [types.uint(0), types.uint(1)], w1.address)
    ]);
    assertEquals(block.receipts[0].result.includes(w2.address), true);
  }
});

Clarinet.test({
  name: "get-member-at-index: returns none for out-of-range index",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(500), types.list([types.principal(creator.address)])], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-member-at-index', [types.uint(0), types.uint(3)], creator.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok none)');
  }
});

Clarinet.test({
  name: "get-split-summary: returns accurate summary after contributions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const creator = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([types.principal(creator.address)])], creator.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(400)], creator.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-split-summary', [types.uint(0)], creator.address)
    ]);
    const result = block.receipts[0].result;
    assertEquals(result.includes('target: u1000'), true);
    assertEquals(result.includes('saved: u400'), true);
    assertEquals(result.includes('target-met: false'), true);
  }
});

Clarinet.test({
  name: "claim-share: returns ERR-NOT-FOUND for non-existent split",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(99)], wallet.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});

Clarinet.test({
  name: "claim-share: returns ERR-NOTHING-TO-CLAIM for member who never contributed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address),
      Tx.contractCall('flut-split', 'contribute', [types.uint(0), types.uint(1000)], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'claim-share', [types.uint(0)], w2.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u9)');
  }
});

Clarinet.test({
  name: "get-split-members: returns correct members list",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const w1 = accounts.get('wallet_1')!;
    const w2 = accounts.get('wallet_2')!;
    chain.mineBlock([
      Tx.contractCall('flut-split', 'create-split', [types.uint(1000), types.list([
        types.principal(w1.address), types.principal(w2.address)
      ])], w1.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-split', 'get-split-members', [types.uint(0)], w1.address)
    ]);
    const result = block.receipts[0].result;
    assertEquals(result.includes(w1.address), true);
    assertEquals(result.includes(w2.address), true);
  }
});
