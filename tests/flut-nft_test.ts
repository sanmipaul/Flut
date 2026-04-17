import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.0/index.ts';
import { assertEquals, assertNotEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
  name: "get-token-uri: returns uri with actual token id, not literal {id}",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet = accounts.get('wallet_1')!;
    chain.mineBlock([
      Tx.contractCall('flut-nft', 'mint', [
        types.principal(wallet.address),
        types.uint(0),
        types.uint(1000),
        types.uint(200)
      ], deployer.address)
    ]);
    const block = chain.mineBlock([
      Tx.contractCall('flut-nft', 'get-token-uri', [types.uint(0)], wallet.address)
    ]);
    const result = block.receipts[0].result;
    // Must NOT contain literal {id}
    assertEquals(result.includes('{id}'), false);
  }
});

Clarinet.test({
  name: "mint: rejects zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet = accounts.get('wallet_1')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-nft', 'mint', [
        types.principal(wallet.address),
        types.uint(0),
        types.uint(0),
        types.uint(200)
      ], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u3)');
  }
});

Clarinet.test({
  name: "set-base-uri: only owner can update",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const attacker = accounts.get('wallet_2')!;
    const block = chain.mineBlock([
      Tx.contractCall('flut-nft', 'set-base-uri', [types.ascii('https://evil.com/')], attacker.address)
    ]);
    assertEquals(block.receipts[0].result, '(err u1)');
  }
});
