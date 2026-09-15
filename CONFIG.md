# Swapping the token contract

Everything on-chain is driven by one block at the top of [`chain.js`](chain.js).
Change those four lines and the whole site follows: the holder check, the treasury
card, the payout calculator and the holder scan.

```js
const CONFIG = {
  RPC:         'https://rpc.mainnet.chain.robinhood.com',     // Robinhood Chain mainnet, chain id 4663
  TOKEN:       '0x39dbed3a2bd333467115de45665cc57f813c4571',  // ← the ERC-20 contract
  FEE_WALLET:  '0xe9a0f656D0aABF40f47a54CD3F3147373a336dFB',  // ← wallet that collects the fee
  VAULT:       '0xdfc24b077bc1425ad1dea75bcb6f8158e10df303',  // ← Hyperliquid vault holding the treasury
  SCAN_DAYS:   7,                                             // history the holder scan aims for
  MAX_RANGES:  12,                                            // cap on eth_getLogs requests
  FROM_BLOCK:  null,                                          // deploy block for a full scan
};
```

## To point the site at $VAULT after deploy

1. Put the new contract address in `TOKEN`.
2. Put the deploy block number in `FROM_BLOCK` so the holder scan covers the full
   history instead of the last `SCAN_BLOCKS` blocks.
3. Put the real fee wallet in `FEE_WALLET`.
4. `TREASURY_FLOOR` stays `0` so the treasury is never padded with a placeholder.

Nothing else needs editing. No build step, no dependencies.

## What each field drives

| Field | Where it shows up | RPC call |
|---|---|---|
| `TOKEN` | Holder score check → **Eligible / Sybil** | `eth_call` → `balanceOf(address)` |
| `TOKEN` | "= X% of total supply" under the balance input | `eth_call` → `totalSupply()`, `decimals()` |
| `TOKEN` | Cluster detection → wallets scanned / verified / excluded | `eth_getLogs` → `Transfer` events |
| `FEE_WALLET` | TREASURY card in the hero, principal in the calculator | `eth_getBalance` |
| `VAULT` | active vault name, APR and TVL in the terminal, table and calculator | Hyperliquid `vaultDetails` |
| `RPC` | all of the above | – |

## How the numbers are derived

**Holder check.** `balanceOf(wallet)` at `TOKEN`, valued with the DexScreener price.
At least `MIN_USD` worth → Eligible. Less → Sybil, same rule the scan uses. The cluster and activity rows are cosmetic in v0.1 and always pass.
With `TOKEN` empty the check falls back to the wallet's native balance, so the page
still works before the token exists.

**Holder scan.** Two passes over real chain data:

1. `eth_getLogs` collects every address that ever received the token → **scanned**.
   Ranges are fetched four at a time and a range that keeps failing is split in half.
2. The current `balanceOf` of each of those addresses is read through **Multicall3**
   (`0xcA11bde05977b3631167028862bE2a173976CA11`, deployed on Robinhood Chain) in
   groups of 250, so ~2,700 wallets cost about a dozen `eth_call`s instead of 2,700.
   A wallet still worth at least `MIN_USD` is **verified**; everyone else sold out or
   is left with dust and counts as **excluded**.

Log replay alone is not used as a balance: it only knows the transfers inside the
scanned window. The result is cached in `localStorage`, so a repeat visit paints the
last numbers instantly and refreshes them in the background.

**Treasury.** Native ETH balance of `FEE_WALLET`, valued at the live ETH price from
Coinbase and shown as its USDC equivalent (falls back to `ETH_PRICE_FALLBACK`).
Refreshes every 30 seconds, is cached in `localStorage` so a reload paints instantly,
and keeps retrying on the next tick when a read fails. `TREASURY_FLOOR` is 0, so the
figure on the page is whatever the wallet actually holds – nothing is padded.

**Payout.** The vault's gross yield for one epoch is `treasury × APR ÷ 52`. The vault
operator's cut comes off first, then the 1% team share, and the rest is split by
`balance × multiplier` across verified wallets. The eligible share of supply comes from
the holder scan, not from an assumption. The multiplier runs from ×0 at day 0 to ×2 at
day 7 and is capped there, restarting every epoch.

## Currently wired (live, verified)

| | |
|---|---|
| Chain | Robinhood Chain mainnet, chain id 4663 |
| Contract | `0x39dbed3a2bd333467115de45665cc57f813c4571` |
| Token | Pons (PONS), 18 decimals, 1,000,000,000 supply |
| Price feed | DexScreener, PONS/WETH on Uniswap v3 |
| Treasury wallet | `0xe9a0f656D0aABF40f47a54CD3F3147373a336dFB` → 0.008866 ETH ≈ $21 |
| Example holder | `0x907d1d174569b11624bdcefd20dcef27600237f8` → ~54,000 PONS → **Eligible** |
| Example sold out | `0x6e2a35a7ad683cf634d91492d73bb7ff774c6919` → 0 PONS → **Sybil** |
| Last scan | 2,658 wallets ever received · 1,695 still hold ≥ $1 · 963 excluded (36.2%) |

This is a placeholder contract used to prove the on-chain wiring works end to end.
Replace it with the $VAULT contract at launch.

## Known limitation of the public RPC

`rpc.mainnet.chain.robinhood.com` intermittently answers with a duplicated
`Access-Control-Allow-Origin: *,*` header, which browsers reject. It is per-request,
so `chain.js` retries every call up to three times and the data loads anyway – the
failed attempts still show up in the browser console as CORS errors.

A dedicated endpoint (QuickNode, Dwellir, ArrowRPC all publish Robinhood Chain nodes)
removes the noise and the rate limits. Swap it into `CONFIG.RPC` when you have one.
