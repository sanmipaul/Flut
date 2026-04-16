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
