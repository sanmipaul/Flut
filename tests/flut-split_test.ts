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
