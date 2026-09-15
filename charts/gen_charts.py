"""Plain-language chart images for $VAULT posts (weekly epochs). Run: python3 charts/gen_charts.py"""
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Circle
import matplotlib.font_manager as fm
import os, random

OUT = os.path.dirname(os.path.abspath(__file__))
BG, PANEL, LINE = "#110E08", "#171410", "#2A2620"
LIME, LIME_DIM, TEXT, MUTED, RED, CREAM = "#CCFF00", "#5E7500", "#F5F2EA", "#8C8778", "#FF5A3C", "#F5F2EA"
def pick(names, fb):
    have = {f.name for f in fm.fontManager.ttflist}
    return next((n for n in names if n in have), fb)
SANS = [pick(["Helvetica Neue", "Helvetica", "Arial"], "DejaVu Sans"), "DejaVu Sans"]; MONO = pick(["Menlo", "Courier New"], "DejaVu Sans Mono")
plt.rcParams.update({"font.family": SANS, "text.color": TEXT, "axes.edgecolor": LINE, "xtick.color": MUTED, "ytick.color": MUTED,
                     "figure.facecolor": BG, "axes.facecolor": BG, "savefig.facecolor": BG})
FOOT = r"\$VAULT  ·  simulated numbers, conservative 100% vault APR  ·  not financial advice"

def fig(title, sub=None):
    f = plt.figure(figsize=(16, 9), dpi=100)
    f.text(0.05, 0.92, title, fontsize=34, fontweight="bold", va="top")
    if sub: f.text(0.05, 0.835, sub, fontsize=19, color=MUTED, va="top")
    f.text(0.05, 0.045, FOOT, fontsize=13, color=MUTED, family=MONO); f.text(0.95, 0.045, r"\$VAULT", fontsize=13, color=LIME, family=MONO, ha="right")
    return f
def clean(ax, left=False, bottom=True):
    for s in ax.spines.values(): s.set_visible(False)
    if not left: ax.set_yticks([])
    if not bottom: ax.set_xticks([])
    ax.tick_params(length=0, labelsize=17)
def save(f, n): f.savefig(os.path.join(OUT, n), dpi=100); plt.close(f); print(n)
def lab(ax, x, y, t, size=22, color=TEXT): ax.text(x, y, t, ha="center", va="bottom", fontsize=size, color=color, family=MONO)
def mult(d): return 0 if d <= 0 else round(d * 2 / 7, 2) if d <= 7 else min(4, round(2 + (d - 7) * 0.1, 2))

# 01 fee: 100% to vault
f = fig(r"Every \$100 traded → \$3 goes into the vault", "3% fee on every buy and sell. 100% of it goes to the treasury on Hyperliquid.")
ax = f.add_axes([0.05, 0.34, 0.9, 0.34]); clean(ax, bottom=False)
ax.barh([0], [100], color=LIME, height=0.55); ax.set_xlim(0, 100); ax.set_ylim(-0.6, 0.6)
ax.text(50, 0, "100%  →  vault treasury", ha="center", va="center", fontsize=28, fontweight="bold", color=BG)
f.text(0.05, 0.26, "Team: 0% of the fee, 0% of supply. We earn 1% of each week’s yield, after the epoch, same as you.", fontsize=19)
save(f, "01_fee_split.png")

# 02 flow
f = fig("How the machine works", "Five steps. Nothing manual in the middle.")
ax = f.add_axes([0.03, 0.18, 0.94, 0.58]); ax.set_xlim(0, 100); ax.set_ylim(0, 10); ax.axis("off")
steps = [("1", "You trade\n$VAULT", "on Robinhood Chain"), ("2", "3% fee\ncollected", "100% → treasury"), ("3", "Deposited in a\nHyperliquid vault", "top-APR vault, auto"),
         ("4", "Vault earns\nyield", "every 7 days"), ("5", "USDC for\nloyal holders", "99% holders · 1% team")]
n = len(steps); bw = 16; gap = (100 - n * bw) / (n - 1)
for i, (num, t, s) in enumerate(steps):
    x = i * (bw + gap); last = i == n - 1
    ax.add_patch(FancyBboxPatch((x, 2.5), bw, 5.5, boxstyle="round,pad=0,rounding_size=0.8", fc=LIME if last else PANEL, ec=LIME if last else LINE, lw=2))
    ax.text(x + 1.2, 7.3, num, fontsize=16, color=BG if last else LIME, family=MONO, fontweight="bold", va="top")
    ax.text(x + bw / 2, 5.4, t, ha="center", va="center", fontsize=20, fontweight="bold", color=BG if last else TEXT)
    ax.text(x + bw / 2, 3.2, s, ha="center", va="center", fontsize=14, color="#3d4a00" if last else MUTED)
    if not last: ax.annotate("", xy=(x + bw + gap - 0.6, 5.25), xytext=(x + bw + 0.6, 5.25), arrowprops=dict(arrowstyle="-|>", color=LIME, lw=2.5, mutation_scale=22))
ax.text(50, 0.8, "The principal never leaves the vault. Only the yield is paid out, every Monday.", ha="center", fontsize=18, color=MUTED)
save(f, "02_flow.png")

# 03 weekly fees by scenario
f = fig("How much flows into the vault every week", "Per 7-day epoch. Depends on one thing: how much $VAULT is traded per day.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
vals = [105, 420, 1050]
ax.bar(range(3), vals, color=[LIME_DIM, LIME, LIME], width=0.55)
ax.set_xticks(range(3)); ax.set_xticklabels(["Quiet\n$500K / day", "Good\n$2M / day", "Degen\n$5M / day"], fontsize=18)
for i, v in enumerate(vals): lab(ax, i, v + 20, f"${v/1000:.2f}M" if v >= 1000 else f"${v}K", 28)
ax.set_ylim(0, 1250); save(f, "03_fees_by_scenario.png")

# 04 pool growth weekly (good, 100% APR, 99% to holders)
t = 0; pools = []
for w in range(8): t += 420_000; pools.append(t / 52 * 0.99)
f = fig("The weekly payout pool keeps growing", "Good scenario ($2M/day). Holder pool = 99% of yield. Treasury never leaves the vault.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
ax.bar(range(8), [p / 1000 for p in pools], color=LIME, width=0.55)
ax.set_xticks(range(8)); ax.set_xticklabels([f"Week {i+1}" for i in range(8)], fontsize=16)
for i, p in enumerate(pools): lab(ax, i, p / 1000 + 1.2, f"${p/1000:,.0f}K", 22)
ax.set_ylim(0, 78)
ax.text(0, 66, "Every week more fees sit in the vault,\nso every week there is more yield to split.", fontsize=17, color=MUTED, va="top")
save(f, "04_pool_growth.png")

# 05 per holder week 8, 7 days held (×2), avg ×2
pool8 = pools[-1]; elig = 1e9 * 0.42
bags = [("100K", 1e5), ("1M", 1e6), ("5M", 5e6), ("20M", 2e7)]
f = fig("What one holder gets in week 8", "Good scenario. Held 7 days (×2). Share = your tokens × multiplier ÷ everyone’s (42% of supply verified).")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
vals = [pool8 * b / elig for _, b in bags]
ax.bar(range(4), vals, color=[LIME_DIM, LIME, LIME, LIME], width=0.55)
ax.set_xticks(range(4)); ax.set_xticklabels([f"{n} $VAULT" for n, _ in bags], fontsize=18)
for i, v in enumerate(vals): lab(ax, i, v + 60, f"${v:,.0f}", 26)
ax.set_ylim(0, 3700); ax.text(0, 3200, "in USDC, for that one week.\nHold 27 days → ×4 → double these numbers.", fontsize=17, color=MUTED, va="top")
save(f, "05_per_holder.png")

# 06 holder check: eligible vs sybil
f = fig("Who gets paid: one check, on-chain", "Wallet holds $VAULT on Robinhood Chain → Eligible. Empty wallet → Sybil. Checked live via RPC, nothing to submit.")
ax = f.add_axes([0.05, 0.18, 0.9, 0.58]); ax.set_xlim(0, 100); ax.set_ylim(0, 10); ax.axis("off")
for x, col, tcol, head, sub in [(4, LIME, BG, "ELIGIBLE", "balance ≥ 0.001% of supply\nverified · paid every Monday"), (54, RED, TEXT, "SYBIL", "0 balance on Robinhood Chain\nexcluded · gets nothing")]:
    ax.add_patch(FancyBboxPatch((x, 1.5), 42, 7, boxstyle="round,pad=0,rounding_size=1", fc=col, ec="none"))
    ax.text(x + 21, 6.3, head, ha="center", va="center", fontsize=44, fontweight="bold", color=tcol, family=MONO)
    ax.text(x + 21, 3.4, sub, ha="center", va="center", fontsize=17, color=tcol, alpha=.85)
save(f, "06_holder_score.png")

# 07 verified vs excluded (example)
f = fig("Bought once and sold out? You’re out of the pool.", "Example scan: everyone who ever received the token vs. wallets still holding right now.")
ax = f.add_axes([0.05, 0.36, 0.9, 0.3]); clean(ax, bottom=False)
ax.barh([0], [42], color=LIME, height=0.6); ax.barh([0], [58], left=[42.4], color=RED, height=0.6); ax.set_xlim(0, 100.4); ax.set_ylim(-0.7, 0.7)
ax.text(21, 0, "42% still holding", ha="center", va="center", fontsize=26, fontweight="bold", color=BG)
ax.text(71.4, 0, "58% sold out → excluded", ha="center", va="center", fontsize=26, fontweight="bold", color=BG)
ax.annotate("", xy=(30, -0.52), xytext=(71, -0.52), arrowprops=dict(arrowstyle="-|>", color=LIME, lw=3, mutation_scale=26))
f.text(0.5, 0.25, "Excluded wallets don’t get a smaller slice. They get zero.\nTheir share goes to the wallets that are still holding.", ha="center", fontsize=20, va="top")
save(f, "07_verified_vs_excluded.png")

# 08 multiplier curve
f = fig("Every day you hold, your multiplier grows", "0 days → nothing. Day 7 → ×2. Then +0.1 per day up to ×4 at day 27. No tiers, no cliffs.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax, left=True)
days = list(range(0, 31)); ms = [mult(d) for d in days]
ax.fill_between(days, ms, color=LIME, alpha=.18); ax.plot(days, ms, color=LIME, lw=3.5)
for d in (1, 7, 14, 27): ax.plot([d], [mult(d)], "o", ms=11, mfc=BG, mec=LIME, mew=2.5); ax.text(d, mult(d) + 0.22, f"day {d} · ×{mult(d):g}", ha="center", fontsize=17, family=MONO)
ax.set_xlim(0, 30); ax.set_ylim(0, 4.7); ax.set_yticks([0, 1, 2, 3, 4]); ax.set_yticklabels(["×0", "×1", "×2", "×3", "×4"], fontsize=15)
ax.set_xticks([0, 7, 14, 21, 27]); ax.set_xticklabels(["day 0", "day 7", "day 14", "day 21", "day 27"], fontsize=16)
save(f, "08_multiplier_curve.png")

# 09 payout per 1M tokens by days held (week 8 pool)
f = fig("Same bag, different patience", "1M $VAULT in week 8 (good scenario). Only the days held change.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
ds = [1, 3, 7, 14, 27]; vals = [pool8 * 1e6 * mult(d) / (elig * 2) for d in ds]
ax.bar(range(5), vals, color=[LIME_DIM, LIME_DIM, LIME, LIME, LIME], width=0.55)
ax.set_xticks(range(5)); ax.set_xticklabels([f"{d} day{'s' if d > 1 else ''}\n×{mult(d):g}" for d in ds], fontsize=17)
for i, v in enumerate(vals): lab(ax, i, v + 6, f"${v:,.0f}", 24)
ax.set_ylim(0, 360); ax.text(0, 320, "Selling restarts the counter for the part you sold.\nThe part you keep holds its days.", fontsize=16, color=MUTED, va="top")
save(f, "09_days_held_payout.png")

# 10 treasury vs pool weekly
f = fig("Principal stays. Yield gets paid.", "Good scenario, 100% APR. Green = money staying in the vault. Cream = paid out that week.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
tre = [(i + 1) * 0.42 for i in range(8)]; pm = [p / 1e6 for p in pools]
ax.bar(range(8), tre, color=LIME, width=0.55, label="Treasury in the vault (stays)")
ax.bar(range(8), [max(p, 0.02) for p in pm], bottom=[x + 0.02 for x in tre], color=CREAM, width=0.55, label="Paid out to holders that week")
ax.set_xticks(range(8)); ax.set_xticklabels([f"Week {i+1}" for i in range(8)], fontsize=16)
for i in range(8):
    ax.text(i, tre[i] / 2, f"${tre[i]:.2f}M", ha="center", va="center", fontsize=15, color=BG, family=MONO, fontweight="bold")
    ax.text(i, tre[i] + 0.09, f"+${pools[i]/1000:,.0f}K", ha="center", va="bottom", fontsize=15, color=TEXT, family=MONO)
ax.set_ylim(0, 4.1); ax.legend(loc="upper left", fontsize=16, frameon=False, labelcolor=TEXT)
save(f, "10_treasury_vs_pool.png")
print("pools", [round(p) for p in pools], "per1M", round(pool8*1e6/elig))
