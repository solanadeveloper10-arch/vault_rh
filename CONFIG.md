# Swapping the token contract

Everything on-chain is driven by one block at the top of [`chain.js`](chain.js).
Change those four lines and the whole site follows: the holder check, the treasury
card, the payout calculator and the holder scan.

```js
const CONFIG = {
  RPC:         'https://rpc.mainnet.chain.robinhood.com',     // Robinhood Chain mainnet, chain id 4663
  TOKEN:       '0x39dbed3a2bd333467115de45665cc57f813c4571',  // ← the ERC-20 contract
  FEE_WALLET:  '0x70443320640bC8A2450F5c70dEea9d707dB1AedE',  // ← wallet that collects the fee
  SCAN_BLOCKS: 60000,                                         // holder-scan window
  FROM_BLOCK:  null,                                          // deploy block for a full scan
};
```

## To point the site at $VAULT after deploy

1. Put the new contract address in `TOKEN`.
2. Put the deploy block number in `FROM_BLOCK` so the holder scan covers the full
   history instead of the last `SCAN_BLOCKS` blocks.
3. Put the real fee wallet in `FEE_WALLET`.
4. Drop `TREASURY_FLOOR` to `0` once fees actually accrue — until then it keeps the
   calculator from showing zeros on an empty wallet.

Nothing else needs editing. No build step, no dependencies.

## What each field drives

| Field | Where it shows up | RPC call |
|---|---|---|
| `TOKEN` | Holder score check → **Eligible / Sybil** | `eth_call` → `balanceOf(address)` |
| `TOKEN` | "= X% of total supply" under the balance input | `eth_call` → `totalSupply()`, `decimals()` |
| `TOKEN` | Cluster detection → wallets scanned / verified / excluded | `eth_getLogs` → `Transfer` events |
| `FEE_WALLET` | TREASURY card in the hero, principal in the calculator | `eth_getBalance` |
| `RPC` | all of the above | — |

## How the numbers are derived

**Holder check.** `balanceOf(wallet)` at `TOKEN`. Any non-zero balance → Eligible.
Zero → Sybil. The cluster and activity rows are cosmetic in v0.1 and always pass.
With `TOKEN` empty the check falls back to the wallet's native balance, so the page
still works before the token exists.

**Holder scan.** Reads `Transfer` logs and replays them into a balance map.
*Scanned* = every address that ever received the token. *Verified* = the subset with
a balance greater than zero right now. *Excluded* = the difference. Block ranges are
fetched in chunks and the chunk shrinks automatically when the RPC refuses a range.

**Treasury.** Native balance of `FEE_WALLET`, converted with a live ETH price from
Coinbase (falls back to `ETH_PRICE_FALLBACK`). Refreshes every 30 seconds.

**Payout.** `treasury × vault APR ÷ 52 × 99% × (your % of supply × multiplier ÷ 42% × 2)`.
The 1% is the team share, 42% is the eligible share of supply after the holder check,
and the multiplier runs from ×0 at day 0 to ×2 at day 7, capped there.

## Currently wired (live, verified)

| | |
|---|---|
| Chain | Robinhood Chain mainnet, chain id 4663 |
| Contract | `0x39dbed3a2bd333467115de45665cc57f813c4571` |
| Token | Pons (PONS), 18 decimals, 1,000,000,000 supply |
| Example holder | `0x907d1d174569b11624bdcefd20dcef27600237f8` → 66,602 PONS → **Eligible** |
| Example sold out | `0x6e2a35a7ad683cf634d91492d73bb7ff774c6919` → 0 PONS → **Sybil** |

This is a placeholder contract used to prove the on-chain wiring works end to end.
Replace it with the $VAULT contract at launch.

## Known limitation of the public RPC

`rpc.mainnet.chain.robinhood.com` intermittently answers with a duplicated
`Access-Control-Allow-Origin: *,*` header, which browsers reject. It is per-request,
so `chain.js` retries every call up to three times and the data loads anyway — the
failed attempts still show up in the browser console as CORS errors.

A dedicated endpoint (QuickNode, Dwellir, ArrowRPC all publish Robinhood Chain nodes)
removes the noise and the rate limits. Swap it into `CONFIG.RPC` when you have one.
