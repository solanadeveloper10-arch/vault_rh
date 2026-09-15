# $VAULT — posting plan + content pack

Voice: terminal-precise, short lines, one number per line, a little wit. English, X/Twitter.
Images live in `charts/` (1600×900). `[chart: NN]` = attach that PNG. `[img: …]` = screenshot of the site section.
All numbers are from the site calculator at a conservative 100% vault APR; the active vault (BredoStrategy) prints far more on paper — never promise it.

Facts to keep straight
- 1.5% fee on every trade, 100% → treasury → Hyperliquid vault (auto-picked, top APR, TVL ≥ $1M, age ≥ 120d). Currently BredoStrategy.
- Epoch = 7 days. Snapshot every Monday 00:00 UTC, USDC paid to wallets, no claim. Launched Sep 15 · epoch #01 snapshot Sep 22.
- Multiplier by days held: day 0 ×0, growing every day to ×2 at day 7. Seven days is the cap. Selling restarts the counter for what you sold.
- Eligible = wallet holds $VAULT on Robinhood Chain. Empty wallet = sybil. Team: 0% fee, 0% supply, 1% of weekly yield after the epoch.

---

## 14-day posting plan

| Day | Date | Post | Image |
|-----|------|------|-------|
| 0 | 2–3 days before | Thread 0 · tease + teasers T1–T6 | banner-creative |
| 1 | Tue Sep 15 (launch) | Thread 1 · How it works | 01, 02 |
| 1 | evening | Post A · launch line | banner-classic |
| 2 | Sep 16 | Post C · live numbers (treasury, holders) | [img: hero terminal] |
| 3 | Sep 17 | Thread 3 · Eligible or sybil | 06, 07 |
| 4 | Sep 18 | Post D · "sold some, am I out?" | 09 |
| 5 | Sep 19 | Thread 2 · What the numbers look like | 03, 04, 05 |
| 6 | Sep 20 | Post B · one-liner | — |
| 7 | Sep 21 | Post F · "snapshot in 24h" countdown | [img: next epoch panel] |
| 8 | Mon Sep 22 | Post G · epoch #01 paid (real pool, real holder count) | [img: epoch timeline] |
| 9 | Sep 23 | Thread 4 · Days held = multiplier | 08, 09, 10 |
| 10 | Sep 24 | Post C · live numbers | [img: hero terminal] |
| 11 | Sep 25 | Post E · team share | 01 |
| 12 | Sep 26 | Post H · "day 11 of holding = ×2.4" reminder | 08 |
| 13 | Sep 27 | Post B variant · vault rotation status | [img: vault table] |
| 14 | Sep 28 | Post F · snapshot #02 in 24h | [img: next epoch panel] |

After week 2: every Monday = payout post with real numbers; every Thursday = one educational thread rerun or a chart; daily = live-numbers post C.

---

## Thread 0 — Pre-launch tease (post before Thread 1, no details)

Style: short lines, ticker as a verb, one idea per post, end on a hook. No numbers, no vault names, no dates except "soon".

**1/**
Every token promises you the moon.

We built a vault instead.

$VAULT · Robinhood Chain · soon.

**2/**
Here's the whole idea in one line:

your trades pay the vault. the vault pays you.

That's it. That's the post.

**3/**
No staking. No claiming. No "connect wallet to unlock rewards".

You hold. Money shows up. Different money than the one you hold.
`[chart: 11_no_staking]`

**4/**
The only thing you'll ever need to do:

don't sell.

The longer you don't, the more it pays. We made patience a multiplier.

**5/**
Farms, bots, 400-wallet guys: this one's not for you.

If your wallet is empty, it stays empty.

**6/**
Fee for vault.
Vault for you.

Contract, date, first snapshot — next post.
Until then: vault it. 🔒

---

## Standalone teasers (pre-launch, drip 1–2 per day)

**T1**
what if fees didn't disappear

**T2**
"wen utility"
the utility is a bank transfer.
soon.

**T3**
you don't farm $VAULT.
$VAULT farms for you.

**T4**
holding is the strategy.
not selling is the alpha.
vault it.

**T5**
some tokens have a roadmap.
ours has a vault door.
🔒 soon.

**T6**
Snapchat had "send nudes."
Robinhood Chain gets "vault it."

---

## Thread 1 — How it works (launch day)

**1/**
$VAULT is live on Robinhood Chain.

Every trade pays a fee. The fee earns yield on Hyperliquid. The yield is paid to holders in USDC every 7 days.

Here’s the whole machine 🧵

**2/**
Step 1 — Fee.
1.5% on every buy and sell.
100% of it goes to the treasury. Not 95, not 80. All of it.

Team takes 0% of the fee and 0% of supply.
`[chart: 01_fee_split]`

**3/**
Step 2 — Vault.
The treasury is bridged to HyperEVM and deposited into the top-APR Hyperliquid vault that passes policy (TVL ≥ $1M, age ≥ 120 days).

Right now that’s BredoStrategy. Nobody picks it. It picks itself, every week.

**4/**
Step 3 — Epoch.
Every Monday 00:00 UTC: snapshot.
Vault yield since last Monday = the pool.
99% to holders, 1% to the team.
USDC lands in your wallet. No claim button.

**5/**
Step 4 — Days held.
Your share = your balance × a multiplier that only depends on how many days you’ve held.
Day 7 = ×2, and that is the cap. Day 0 = nothing.

Principal never leaves the vault. Only the yield is paid.
`[chart: 02_flow]`

**6/**
Launched Sep 15. First snapshot Sep 22.
Hold through the week, check your status on the site, get paid Monday.

Trade fees → Hyperliquid vault → USDC for loyal holders.
[site link]

---

## Thread 2 — What the numbers look like

**1/**
"Wen numbers?"

Three volume scenarios, one conservative assumption (100% vault APR), all from the calculator on the site. 🧵

**2/**
Every $100 traded → $1.50 into the vault. Per 7-day epoch:

quiet   $500K/day → $52K
good    $2M/day   → $210K
degen   $5M/day   → $525K

That’s the treasury growing every week before any yield.
`[chart: 03_fees_by_scenario]`

**3/**
The pool. Good scenario, 100% APR, 99% to holders:

week 1 ≈ $4K
week 4 ≈ $16K
week 8 ≈ $32K

It grows because nothing is ever withdrawn from the vault.
`[chart: 04_pool_growth]`

**4/**
Per holder, week 8, held 7 days (×2):

100K $VAULT → ≈ $8
1M → ≈ $76
5M → ≈ $380
20M → ≈ $1,520

Held less than a week? The multiplier scales down with you.
`[chart: 05_per_holder]`

**5/**
The active vault shows an APR ten times higher than what we model here. We don’t promise that. We model 100% and let Mondays speak.

---

## Thread 3 — Eligible or sybil

**1/**
Every "rewards for holders" token dies the same way: one guy, 400 wallets.

$VAULT has one check. It runs on-chain, live, and you can run it yourself on the site. 🧵

**2/**
The check: does the wallet hold $VAULT on Robinhood Chain right now?

Yes → ELIGIBLE. Paid Monday.
No → SYBIL. Gets nothing.

That’s it. Paste any address on the site, see the answer from the RPC.
`[chart: 06_holder_score]`

**3/**
Bought once, sold everything, waiting for the airdrop? You’re in "scanned", not in "verified".

Scanned = everyone who ever received the token.
Verified = wallets holding right now.
Excluded = the difference. Their share goes to verified.
`[chart: 07_verified_vs_excluded]`

**4/**
Splitting a bag into 200 wallets doesn’t help either: 200 wallets × 0 days held = 200 × ×0.

One wallet, one full week, ×2. That’s the only strategy that pays.

---

## Thread 4 — Days held = multiplier

**1/**
No lock-ups. No claim. And still, the longer you hold the more you get. Here’s how. 🧵

**2/**
Your payout = balance × multiplier.
The multiplier grows every single day you hold without selling:

day 1 → ×0.29
day 2 → ×0.57
day 4 → ×1.14
day 6 → ×1.71
day 7 → ×2 (cap)
`[chart: 08_multiplier_curve]`

**3/**
Same bag, different patience. 1M $VAULT, week 8:

1 day → $11
4 days → $43
7 days → $76

Nothing to lock. Just don’t sell.
`[chart: 09_days_held_payout]`

**4/**
Sold some? The counter restarts only for the part you sold. The part you keep holds its days.
Bought more? New coins start at day 0, old coins keep counting.

**5/**
And the vault itself never shrinks: fees go in every week, only yield comes out.
`[chart: 10_treasury_vs_pool]`

---

## Standalone posts

**A · launch**
$VAULT is live.
1.5% fee → Hyperliquid vault → USDC every Monday.
Day 0. Counter starts now.

**B · one-liner**
Trade fees → Hyperliquid vault → USDC for loyal holders.
That’s the whole pitch.

**C · live numbers (post daily, fill from the site)**
day N since launch
treasury in vault: $___
verified holders: ___ / ___ scanned
next snapshot: Monday 00:00 UTC
`[img: hero terminal]`

**D · "I sold some, am I out?"**
No.
The part you kept keeps its days.
The part you sold starts over.
Hold a full week → ×2. That’s the max.

**E · team share**
"how does the team make money"
1% of the weekly yield. After the snapshot. After you.
0% of the fee. 0% of supply.
If holders don’t get paid, we don’t get paid.

**F · countdown (Sunday)**
Snapshot in 24h.
Wallet holding $VAULT → eligible.
Empty wallet → sybil.
Check yours: [site link]

**G · payout day (Monday, real numbers)**
Epoch #N paid.
pool: $___ USDC
verified holders: ___
top multiplier this week: ×___
Next snapshot: next Monday. Counter keeps running.

**H · day reminder**
Day 4 of holding = ×1.14.
Day 7 = ×2, the cap.
Nothing to do. Just don’t sell.

---

## Bio / listing descriptions

**Bio**
Trade fees → Hyperliquid vault → USDC for loyal holders. Paid every Monday. Hold longer, earn more.

**Listing**
$VAULT on Robinhood Chain. 100% of the 1.5% trade fee is deposited into the top-APR Hyperliquid vault, auto-rotated weekly. Yield is paid in USDC every 7 days to wallets holding the token, weighted by days held (×2 at day 7, capped there). Team: 0% supply, 1% of yield.

---

## Chart index (`charts/`)

| File | Used in | Meaning |
|------|---------|---------|
| 01_fee_split | T1/2, E | $1.50 of every $100 traded → vault, 100% |
| 02_flow | T1/5 | Trade → fee → vault → yield → USDC |
| 03_fees_by_scenario | T2/2 | Weekly inflow at $500K / $2M / $5M per day |
| 04_pool_growth | T2/3 | Weekly holder pool, weeks 1–8 |
| 05_per_holder | T2/4 | Week-8 payout by bag size, 7 days held |
| 06_holder_score | T3/2 | Eligible vs Sybil, one on-chain check |
| 07_verified_vs_excluded | T3/3 | Still holding vs sold out |
| 08_multiplier_curve | T4/2, H | Multiplier by days held, ×2 at day 7 (cap) |
| 09_days_held_payout | T4/3, D | 1M tokens, payout by days held |
| 10_treasury_vs_pool | T4/5 | Principal stays, yield paid weekly |
| 11_no_staking | T0/3 | No staking / claiming, you hold, USDC shows up |

Regenerate after changing numbers: `python3 charts/gen_charts.py`
