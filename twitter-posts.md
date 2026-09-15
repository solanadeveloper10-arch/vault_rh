# $VAULT — Twitter content pack

Voice: Hyperliquid-terminal precision + Robinhood-clean copy + a little meme. Short lines. Numbers in monospace-feel. One meme per thread max, never in the "rules" tweets.
All numbers below come from the site's simulation defaults. Swap once real on-chain data exists.

Legend: `[img]` = screenshot from the site section named. `[chart: NN]` = image from `charts/NN_*.png` (1600×900, ready to attach).

---

## Thread 1 — Project logic ("trade fees in, USDC out")

**1/**
Most tokens have one utility: hoping the next guy pays more.

$VAULT has a different one: a treasury that earns on Hyperliquid and pays you in USDC every month.

Here's the whole machine in 6 tweets 🧵

**2/**
Step 1 — Fee.
Every buy and sell of $VAULT on Robinhood Chain takes 3%.

→ 100% goes to the treasury
→ 0% anywhere else

Team takes 0% of the fee. 0% of supply. We earn 1% of each month's yield, after the epoch — same boat as you.
`[chart: 01_fee_split]`

**3/**
Step 2 — Bridge.
Fees are bridged from Robinhood Chain to HyperEVM and deposited into a Hyperliquid vault.

Not a random vault. The top-APR vault that passes policy:
• TVL ≥ $1M
• age ≥ 90 days

Currently: Enjoyooor V3.

**4/**
Step 3 — Rotation.
Nobody picks the vault. Not you, not us.

On the 1st of every month the treasury moves to whichever vault ranks #1 under the policy. If the current one drops out, it rotates. Automatically.

The engine picks itself.

**5/**
Step 4 — Payout.
Monthly epoch. Vault yield is snapshotted: 99% split pro-rata among verified holders, 1% to the team. Paid in USDC straight to your wallet. No claim button.

The principal stays in the vault and keeps compounding. Only yield is distributed.
`[chart: 02_flow]`

**6/**
Step 5 — Sybil shield.
Only wallets that pass the holder score get a share. Splitting a bag across 200 fresh wallets gets you nothing.

Fewer eligible wallets = bigger slice for the real ones.

**7/**
So the whole product is a bank transfer.

Launched Sep 08. Epoch #01 snapshot Oct 01.
Simulate your payout → [site link]
`[img: hero terminal]`

---

## Thread 2 — Expected metrics at a good launch

**1/**
"Wen numbers?"

Here's what the $VAULT treasury looks like at three launch scenarios. All simulated, all from the calculator on the site. 🧵

**2/**
The only two inputs that matter:
• daily trading volume
• vault APR

Fees to vault per month = volume × 30 × 3% = 3% of monthly volume. All of it.

Everything else follows.

**3/**
Fees flowing into the vault per month:

quiet   $500K/day → $450K
good    $2M/day   → $1.8M
degen   $5M/day   → $4.5M

That's the treasury growing every single month, before any yield.
`[chart: 03_fees_by_scenario]`

**4/**
Now the yield. To stay honest we model 100% APR (~8.3%/mo), even though the active vault prints far more on paper right now.

Holder pool (99% of yield), month 1 → month 3, "good" scenario:
M1 ≈ $156K
M2 ≈ $304K
M3 ≈ $453K

Pool grows because principal never leaves.
`[chart: 04_pool_growth]`

**5/**
What that means per holder.

Assume 5,000 verified wallets and 42% of supply eligible after the sybil filter.

Average verified holder, month 3: ≈ $91 in USDC.
Holder with 1M $VAULT (0.1% supply): ≈ $1,080.
Holder with 5M: ≈ $5,400.
`[chart: 05_per_holder]`

**6/**
Six days after launch, real numbers:
• treasury in vault: $85.5K
• 24h inflow: +$14.2K
• verified holders: 1,204 / 2,870 wallets

First payout: Oct 01. 16 days.
`[img: terminal]`

**7/**
The number that actually matters isn't APR. It's volume.

Every trade, buy or sell, feeds the vault. Even paper hands pay the diamond hands.

Thank you for your service, sers. 🫡

---

## Thread 3 — Anti-sybil: "money goes to enthusiasts, not farms"

**1/**
Every "rewards for holders" token dies the same way: one guy, 400 wallets, 90% of the airdrop.

$VAULT has a holder score. Here's how it decides who gets paid. 🧵

**2/**
Five checks, weighted, 0–100:

• wallet age ≥ 30 days — 20
• time-weighted balance this epoch — 25
• not funded from a known cluster — 30
• balance ≥ 0.001% of supply — 10
• organic on-chain activity — 15

Score ≥ 60 → verified.
`[chart: 06_holder_score]`

**3/**
Two checks are mandatory no matter the score:

1) cluster check
2) non-zero time-weighted balance

Fresh wallet funded from the same source as 30 others? Flagged as a cluster. Whole cluster excluded. Doesn't matter how old the wallets are.

**4/**
"Time-weighted balance" is the anti-snapshot-farming part.

Your share = your average balance over the epoch, not your balance at the snapshot.

Buy 1M tokens the night before Oct 01? You held for 1 day out of 30. You earn 1/30th. Congrats.

**5/**
Last snapshot from the site:

wallets scanned   2,870
verified          1,204
excluded          1,666
supply excluded   58%

That 58% doesn't vanish. It flows to the 42% that's real.
`[chart: 07_verified_vs_excluded]`

**6/**
The farm math, for anyone still thinking about it:

200 wallets × 0 payout = 0.
1 wallet with a 3-epoch streak = ×1.3 multiplier.

Sybil-ing $VAULT is the only strategy with negative expected value.

**7/**
Paste any address on the site and see its score.
Real holders don't need to trust us. They can check.

[site link] → "Real holders"

---

## Thread 4 — Distribution: "loyal, not locked"

**1/**
Reward tokens usually give you a choice: get paid, or be free.

$VAULT does both. No lock-ups, monthly USDC, and you can still take profit. Here's how the distribution works. 🧵

**2/**
The epoch.
• 1st of every month, 00:00 UTC — snapshot
• vault yield since last epoch = the pool
• 99% split pro-rata by time-weighted balance, 1% to the team
• paid in USDC within 48h, no claim needed

Epoch #01 → Oct 01.

**3/**
Time-weighted share.
Sell 40% of your bag on day 20 of 30?

You still earn 100% for 20 days and 60% for the last 10.
= 87% of a full-hold payout.

You are not a hostage. You're a shareholder who trimmed.
`[chart: 08_sell_mid_epoch]`

**4/**
Loyalty streak.
Every consecutive epoch adds +10% to your payout.
Caps at ×1.5 after five epochs.

Trim up to 25% of your bag in an epoch → streak stays.
Sell more than 25% → streak steps down ONE level. Never to zero.

Only a full exit resets it.
`[chart: 09_loyalty_streak]`

**5/**
Why it's built this way:

Hard lock-ups create exit stampedes on unlock day.
Time-weighting + streak create a slow, boring, profitable reason to stay.

Boring is the point. Boring is what gets paid on the 1st.

**6/**
Where the team's money comes from, since people ask:

• 0% of the trade fee
• 0% of supply
• 1% of each epoch's yield, taken after the snapshot

If holders don't get paid, we don't get paid. That's the whole alignment.

**7/**
Principal never leaves the vault.
Only yield is distributed.

So every month: treasury = last month + fees + retained yield.
The pool you're splitting keeps getting bigger as long as people trade.
`[chart: 10_treasury_vs_pool]`

**8/**
Try the "what if I sell mid-epoch" slider on the site. Move it. Watch the number.

Then decide whether you want to be the guy who sold on day 29.

[site link] → "Distribution"

---

## Standalone posts (meme / short)

**A.**
wen payout
Oct 01.
it's on the site.
it's on the hero.
it's on the countdown.
Oct 01.

**B.**
other tokens: "community"
$VAULT: 1,204 verified wallets splitting vault yield in USDC on the 1st

pick your definition

**C.**
day 6 since launch
treasury: $85.5K
payouts made: 0
holders locked: 0
vault APR: doing things

`[img: terminal]`

**D.**
"I sold some, am I out?"
No. You held 20 days, you get paid for 20 days.
Trim ≤25%, keep your streak.
This is the least hostage-like situation in crypto.
`[chart: 08_sell_mid_epoch]`

**E.**
Sybil farmers looking at the cluster graph
`[img: cluster graph, red clusters circled]`
"it's over"
yes ser. it never started.

**F.**
The vault picks itself.
The fees route themselves.
The payout sends itself.
The only manual step in $VAULT is you deciding to hold.

**G.**
Robinhood Chain for the token.
HyperEVM for the treasury.
Hyperliquid vaults for the yield.
USDC for the payout.
Memes for the vibes.
Everything in its right place.

**H.**
"how does the team make money"
1% of the monthly yield. After you. Not before. Not from the fee. Not from a pre-mine.
We literally cannot get paid unless the vault pays you first.

---

## Posting order (suggested, first 2 weeks)

| Day | Post |
|-----|------|
| 1 | Thread 1 (logic) + post G |
| 2 | Post C (live numbers) |
| 3 | Thread 3 (anti-sybil) |
| 4 | Post E |
| 5 | Thread 2 (metrics) |
| 6 | Post A |
| 7 | Thread 4 (distribution) |
| 8 | Post D |
| 9–13 | daily post C-style with fresh treasury numbers |
| 14 | Countdown post: "Epoch #01 in 48h" + terminal screenshot |

---

## Chart index (`charts/`)

| File | Used in | One-line meaning |
|------|---------|------------------|
| 01_fee_split | T1/2 | Of every $100 traded, $3 goes into the vault |
| 02_flow | T1/5 | Trade → fee → vault → yield → USDC for loyal holders |
| 03_fees_by_scenario | T2/3 | Monthly inflow at $500K / $2M / $5M daily volume |
| 04_pool_growth | T2/4 | Payout pool month 1→6, good scenario |
| 05_per_holder | T2/5 | Month-3 payout for 100K / 1M / 5M / 20M bags |
| 06_holder_score | T3/2 | Five checks, weights, two mandatory |
| 07_verified_vs_excluded | T3/5 | 42% verified vs 58% excluded, excluded share flows to verified |
| 08_sell_mid_epoch | T4/3, post D | Sell 40% on day 20 → still 87% of payout |
| 09_loyalty_streak | T4/4 | ×1.0 → ×1.5 over five epochs |
| 10_treasury_vs_pool | T4/6 | Principal stays and grows, yield paid out |

Regenerate after changing numbers: `python3 charts/gen_charts.py`

---

## Short project descriptions (bio / listing / launchpad)

**Main**
The token with a vault behind it.
3% on every trade goes straight into a Hyperliquid vault. Hold through the month, stack that streak, farm the ×1.5 multiplier.
Get paid in USDC on the 1st. Real holders only, sybils get nothing.

**Short (bio-length)**
Trade fees → Hyperliquid vault → USDC for loyal holders.
hold the month, stack the streak, farm the ×1.5.
paid on the 1st. no lock-ups. no farms.

**Meme**
gm the vault every single month.
every trade feeds it, every epoch it pays you back in USDC.
stack the streak, farm the multiplier, sell whenever. the vault doesn't hold hostages.

**Technical (listing)**
$VAULT on Robinhood Chain. 100% of the 3% trade fee is bridged to HyperEVM and deposited into the top-APR Hyperliquid vault, auto-rotated monthly. Yield is paid in USDC on the 1st to verified holders by time-weighted balance. Consecutive epochs stack a multiplier up to ×1.5.
