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
