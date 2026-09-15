"""Generate plain-language chart images for the $VAULT Twitter pack. Run: python3 gen_charts.py"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import matplotlib.font_manager as fm
import os

OUT = os.path.dirname(os.path.abspath(__file__))
BG, PANEL, LINE = "#110E08", "#171410", "#2A2620"
LIME, LIME_DIM, TEXT, MUTED, RED, CREAM = "#CCFF00", "#5E7500", "#F5F2EA", "#8C8778", "#FF5A3C", "#F5F2EA"

def pick(names, fallback):
    have = {f.name for f in fm.fontManager.ttflist}
    for n in names:
        if n in have: return n
    return fallback
SANS = pick(["Helvetica Neue", "Helvetica", "Arial"], "DejaVu Sans")
MONO = pick(["Menlo", "SF Mono", "Courier New"], "DejaVu Sans Mono")
plt.rcParams.update({"font.family": [SANS, "DejaVu Sans"], "text.color": TEXT, "axes.edgecolor": LINE, "axes.labelcolor": MUTED,
                     "xtick.color": MUTED, "ytick.color": MUTED, "figure.facecolor": BG, "axes.facecolor": BG, "savefig.facecolor": BG})

def fig(title, sub=None, w=16, h=9):
    f = plt.figure(figsize=(w, h), dpi=100)
    f.text(0.05, 0.92, title, fontsize=34, fontweight="bold", va="top", ha="left")
    if sub: f.text(0.05, 0.835, sub, fontsize=19, color=MUTED, va="top", ha="left")
    f.text(0.05, 0.045, r"\$VAULT  ·  simulated numbers from the site calculator  ·  not financial advice", fontsize=13, color=MUTED, family=MONO)
    f.text(0.95, 0.045, r"\$VAULT", fontsize=13, color=LIME, family=MONO, ha="right")
    return f

def clean(ax, left=False, bottom=True):
    for s in ["top", "right", "left", "bottom"]: ax.spines[s].set_visible(False)
    if not left: ax.set_yticks([])
    if not bottom: ax.set_xticks([])
    ax.tick_params(length=0, labelsize=17)
    ax.grid(False)

def save(f, name):
    f.savefig(os.path.join(OUT, name), dpi=100); plt.close(f); print("saved", name)

def bar_label(ax, x, y, text, color=TEXT, size=22, dy=0.02, fam=MONO):
    ax.text(x, y, text, ha="center", va="bottom", fontsize=size, color=color, family=fam, transform=ax.transData)

# 1 — fee split
f = fig(r"Every \$100 traded → \$3 goes into the vault", "3% fee on every buy and sell. All of it goes to the treasury.")
ax = f.add_axes([0.05, 0.34, 0.9, 0.34]); clean(ax, bottom=False)
ax.barh([0], [100], color=LIME, height=0.55)
ax.set_xlim(0, 100.4); ax.set_ylim(-0.6, 0.6)
ax.text(50, 0, "100%  →  vault treasury", ha="center", va="center", fontsize=28, fontweight="bold", color=BG)
f.text(0.05, 0.26, "Team takes 0% of the fee. We earn 1% of each month’s yield — after the epoch, same as you.", fontsize=20, color=TEXT)
save(f, "01_fee_split.png")

# 2 — flow
f = fig("How the machine works", "Five steps. Nothing manual in the middle.")
ax = f.add_axes([0.03, 0.18, 0.94, 0.58]); ax.set_xlim(0, 100); ax.set_ylim(0, 10); ax.axis("off")
steps = [("1", "You trade\n$VAULT", "on Robinhood Chain"), ("2", "3% fee\ncollected", "100% → treasury"), ("3", "Deposited in a\nHyperliquid vault", "top-APR vault, auto"),
         ("4", "Vault earns\nyield", "every month"), ("5", "USDC sent to\nreal holders", "99% holders · 1% team")]
n = len(steps); bw = 16; gap = (100 - n * bw) / (n - 1)
for i, (num, t, s) in enumerate(steps):
    x = i * (bw + gap)
    last = i == n - 1
    ax.add_patch(FancyBboxPatch((x, 2.5), bw, 5.5, boxstyle="round,pad=0,rounding_size=0.8", fc=LIME if last else PANEL, ec=LIME if last else LINE, lw=2))
    ax.text(x + 1.2, 7.3, num, fontsize=16, color=BG if last else LIME, family=MONO, fontweight="bold", va="top")
    ax.text(x + bw / 2, 5.4, t, ha="center", va="center", fontsize=20, fontweight="bold", color=BG if last else TEXT)
    ax.text(x + bw / 2, 3.2, s, ha="center", va="center", fontsize=14, color="#3d4a00" if last else MUTED)
    if not last: ax.annotate("", xy=(x + bw + gap - 0.6, 5.25), xytext=(x + bw + 0.6, 5.25), arrowprops=dict(arrowstyle="-|>", color=LIME, lw=2.5, mutation_scale=22))
ax.text(50, 0.8, "The principal never leaves the vault. Only the yield is paid out.", ha="center", fontsize=18, color=MUTED)
save(f, "02_flow.png")

# 3 — fees by scenario
f = fig("How much flows into the vault every month", "Per month, into the vault. Depends on one thing: how much $VAULT is traded per day.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
labels = ["Quiet\n$500K / day", "Good\n$2M / day", "Degen\n$5M / day"]; vals = [0.45, 1.8, 4.5]
cols = [LIME_DIM, LIME, LIME]
b = ax.bar(range(3), vals, color=cols, width=0.55)
ax.set_xticks(range(3)); ax.set_xticklabels(labels, fontsize=18)
for i, v in enumerate(vals): bar_label(ax, i, v + 0.08, ("$%.2fM" % v) if v >= 1 else ("$%dK" % (v * 1000)), size=28)
ax.set_ylim(0, 5)
save(f, "03_fees_by_scenario.png")

# 4 — pool growth
treasury = 85_500; fees = 1_800_000; apr = 1.0; pools = []
for m in range(6):
    treasury += fees; pools.append(treasury * apr / 12)
f = fig("The monthly payout pool keeps growing", "Good scenario ($2M/day), 100% vault APR. Holder pool = 99% of yield (team takes 1% after the epoch).")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
ax.bar(range(6), [p * 0.99 / 1000 for p in pools], color=LIME, width=0.55)
ax.set_xticks(range(6)); ax.set_xticklabels([f"Month {i+1}" for i in range(6)], fontsize=17)
for i, p in enumerate(pools): bar_label(ax, i, p * 0.99 / 1000 + 12, f"${p*0.99/1000:,.0f}K", size=22)
ax.set_ylim(0, 1000)
ax.text(0, 830, "Why it grows: the treasury never leaves the vault,\nso every month there is more money earning yield.", fontsize=17, color=MUTED, va="top")
save(f, "04_pool_growth.png")

# 5 — per holder
pool3 = pools[2] * 0.99; eligible = 1e9 * 0.42
bags = [("100K", 1e5), ("1M", 1e6), ("5M", 5e6), ("20M", 2e7)]
f = fig("What one holder gets in month 3", "Good scenario. Your share = your tokens ÷ all verified tokens (42% of supply).")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
vals = [pool3 * b / eligible for _, b in bags]
ax.bar(range(4), vals, color=[LIME_DIM, LIME, LIME, LIME], width=0.55)
ax.set_xticks(range(4)); ax.set_xticklabels([f"{n} $VAULT" for n, _ in bags], fontsize=18)
for i, v in enumerate(vals): bar_label(ax, i, v + 400, f"${v:,.0f}", size=26)
ax.set_ylim(0, 25000)
ax.text(0, 21000, "in USDC, for that one month.\nPaid to your wallet on the 1st. No claim.", fontsize=17, color=MUTED, va="top")
save(f, "05_per_holder.png")

# 6 — holder score
f = fig("Who gets paid: the holder score", "Five checks, 100 points. Score 60+ = verified. Two checks are mandatory no matter what.")
ax = f.add_axes([0.05, 0.16, 0.9, 0.6]); clean(ax, bottom=False)
checks = [("Organic on-chain activity", 15, False), ("Balance ≥ 0.001% of supply", 10, False), ("Not funded from a known cluster", 30, True),
          ("Time-weighted balance this epoch", 25, True), ("Wallet age ≥ 30 days", 20, False)]
ys = range(len(checks))
ax.barh(list(ys), [c[1] for c in checks], color=[LIME if c[2] else LIME_DIM for c in checks], height=0.55)
ax.set_xlim(0, 46); ax.set_ylim(-0.6, len(checks) - 0.4)
for y, (name, w, mand) in zip(ys, checks):
    ax.text(-0.4, y, name, ha="right", va="center", fontsize=19, color=TEXT)
    ax.text(w + 0.5, y, f"{w} pts" + ("   · mandatory" if mand else ""), va="center", fontsize=17, color=LIME if mand else MUTED, family=MONO)
ax.set_position([0.36, 0.16, 0.6, 0.6])
f.text(0.05, 0.10, "Fresh wallet? Funded from the same source as 40 others? → cluster → whole cluster excluded.", fontsize=17, color=MUTED)
save(f, "06_holder_score.png")

# 7 — verified vs excluded
f = fig("Last scan: 58% of supply was farms. It now pays the real 42%.", "2,870 wallets scanned. 1,204 verified. 1,666 excluded.")
ax = f.add_axes([0.05, 0.36, 0.9, 0.3]); clean(ax, bottom=False)
ax.barh([0], [42], color=LIME, height=0.6); ax.barh([0], [58], left=[42.4], color=RED, height=0.6)
ax.set_xlim(0, 100.4); ax.set_ylim(-0.7, 0.7)
ax.text(21, 0, "42% verified", ha="center", va="center", fontsize=28, fontweight="bold", color=BG)
ax.text(71.4, 0, "58% excluded", ha="center", va="center", fontsize=28, fontweight="bold", color=BG)
ax.annotate("", xy=(30, -0.52), xytext=(71, -0.52), arrowprops=dict(arrowstyle="-|>", color=LIME, lw=3, mutation_scale=26))
f.text(0.5, 0.25, "Excluded wallets don't get a smaller slice. They get zero.\nTheir share goes to verified holders.", ha="center", fontsize=20, color=TEXT, va="top")
save(f, "07_verified_vs_excluded.png")

# 8 — sell mid-epoch
f = fig("Sold 40% on day 20? You still get 87% of the payout.", "Your share is your average balance over the 30-day epoch — not a snapshot.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax, left=True)
days = list(range(0, 31)); bal = [100 if d < 20 else 60 for d in days]
ax.fill_between(days, bal, step="post", color=LIME, alpha=0.22); ax.step(days, bal, where="post", color=LIME, lw=3.5)
ax.axvline(20, color=MUTED, ls="--", lw=1.5)
ax.set_xlim(0, 30); ax.set_ylim(0, 115); ax.set_yticks([0, 50, 100]); ax.set_yticklabels(["0%", "50%", "100% of bag"], fontsize=15)
ax.set_xticks([1, 10, 20, 30]); ax.set_xticklabels(["day 1", "day 10", "day 20\nyou sell 40%", "day 30\nsnapshot"], fontsize=16)
ax.text(10, 50, "20 days\nat 100%", ha="center", va="center", fontsize=20, color=BG, fontweight="bold")
ax.text(25, 30, "10 days\nat 60%", ha="center", va="center", fontsize=20, color=BG, fontweight="bold")
ax.text(29.5, 108, "green area = what you get paid for", ha="right", fontsize=15, color=MUTED)
save(f, "08_sell_mid_epoch.png")

# 9 — loyalty streak
f = fig("Stay epoch after epoch → your payout grows", "+10% per consecutive month, up to ×1.5. Trim up to 25% of your bag and the streak stays.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
mult = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.5]
ax.bar(range(7), mult, color=[LIME_DIM] + [LIME] * 6, width=0.55)
ax.set_xticks(range(7)); ax.set_xticklabels([f"Epoch {i+1}" for i in range(7)], fontsize=16)
for i, m in enumerate(mult): bar_label(ax, i, m + 0.03, f"×{m:.1f}", size=24)
ax.set_ylim(0, 1.85)
ax.text(6.3, 1.72, "capped at ×1.5", ha="right", fontsize=15, color=MUTED)
ax.text(0, 1.72, "Sell more than 25% → streak drops ONE step, never to zero.\nOnly a full exit resets it.", fontsize=16, color=MUTED, va="top")
save(f, "09_loyalty_streak.png")

# 10 — treasury vs pool
f = fig("Principal stays. Yield gets paid.", "Good scenario, 100% APR. Green = money staying in the vault. Cream = paid out to holders.")
ax = f.add_axes([0.08, 0.2, 0.86, 0.56]); clean(ax)
tre = []; t = 85_500
for m in range(6): t += fees; tre.append(t)
tre_m = [x / 1e6 for x in tre]; pool_m = [p / 1e6 for p in pools]
ax.bar(range(6), tre_m, color=LIME, width=0.55, label="Treasury in the vault (stays)")
ax.bar(range(6), pool_m, bottom=[x + 0.03 for x in tre_m], color=CREAM, width=0.55, label="Paid out to holders that month")
ax.set_xticks(range(6)); ax.set_xticklabels([f"Month {i+1}" for i in range(6)], fontsize=16)
for i in range(6):
    ax.text(i, tre_m[i] / 2, f"${tre_m[i]:.1f}M", ha="center", va="center", fontsize=17, color=BG, family=MONO, fontweight="bold")
    ax.text(i, tre_m[i] + pool_m[i] + 0.15, f"+${pools[i]/1000:,.0f}K", ha="center", va="bottom", fontsize=17, color=TEXT, family=MONO)
ax.set_ylim(0, 13)
leg = ax.legend(loc="upper left", fontsize=16, frameon=False, labelcolor=TEXT)
save(f, "10_treasury_vs_pool.png")
print("fonts:", SANS, MONO)
