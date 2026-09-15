"""Text-free teaser: building the vault on Robinhood Chain (lime blocks) with Hyperliquid (mint liquid). 1600x900."""
import os, math, random
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Circle, Polygon, Rectangle
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIME, INK, MINT, CREAM = "#CCFF00", "#110E08", "#50D2C1", "#F5F2EA"
W, H = 1600, 900
f = plt.figure(figsize=(16, 9), dpi=100); ax = f.add_axes([0, 0, 1, 1]); ax.set_xlim(0, W); ax.set_ylim(0, H); ax.axis("off")

# gradient: warm black (left) → deep green (right) + mint glow far right, lime glow left
x = np.linspace(0, 1, W); y = np.linspace(0, 1, H); X, Y = np.meshgrid(x, y)
t = np.clip(0.8 * X + 0.2 * (1 - Y), 0, 1)
c0 = np.array([0x11, 0x0E, 0x08]) / 255; c1 = np.array([0x0B, 0x25, 0x1F]) / 255
img = c0 * (1 - t[..., None]) + c1 * t[..., None]
img += np.exp(-(((X - 0.9) ** 2) / 0.05 + ((Y - 0.5) ** 2) / 0.4))[..., None] * np.array([0.02, 0.16, 0.14])
img += np.exp(-(((X - 0.1) ** 2) / 0.05 + ((Y - 0.5) ** 2) / 0.4))[..., None] * np.array([0.10, 0.14, 0.0])
ax.imshow(np.clip(img, 0, 1), extent=[0, W, 0, H], origin="lower", zorder=0, interpolation="bilinear")

# blueprint grid
for gx in range(0, W + 1, 80): ax.plot([gx, gx], [0, H], color=CREAM, alpha=.035, lw=1, zorder=1)
for gy in range(0, H + 1, 80): ax.plot([0, W], [gy, gy], color=CREAM, alpha=.035, lw=1, zorder=1)

# LEFT — Robinhood Chain: a chain of lime blocks being laid, some still outlined (under construction)
random.seed(11)
blocks = [(120, 300), (230, 300), (340, 300), (120, 410), (230, 410), (120, 520), (340, 410), (230, 520), (340, 520), (450, 410)]
for i, (bx, by) in enumerate(blocks):
    solid = i < 6
    ax.add_patch(FancyBboxPatch((bx, by), 90, 90, boxstyle="round,pad=0,rounding_size=16", fc=LIME if solid else "none", ec=LIME, lw=2.5 if not solid else 0,
                                ls="-" if solid else (0, (6, 5)), alpha=1 if solid else .55, zorder=3))
# RIGHT — Hyperliquid: layered mint liquid waves
xs = np.linspace(940, 1600, 500); ramp = 1 / (1 + np.exp(-(xs - 1060) / 28))   # smooth rise from the left
for k, (amp, ph, base, al) in enumerate([(28, 0.0, 300, .55), (36, 1.7, 380, .40), (44, 3.1, 470, .28), (52, 4.4, 570, .18)]):
    ys = (base + amp * np.sin(xs / 90 + ph) + 10 * np.sin(xs / 31 + ph * 2)) * ramp
    ax.fill_between(xs, 0, ys, color=MINT, alpha=al, zorder=2, lw=0)
    ax.plot(xs, ys, color=MINT, lw=2, alpha=min(1, al + .35), zorder=3)
# droplets rising
for (dx, dy, r) in [(1120, 640, 9), (1210, 700, 6), (1330, 660, 12), (1450, 720, 7), (1520, 630, 10)]:
    ax.add_patch(Circle((dx, dy), r, fc=MINT, ec="none", alpha=.7, zorder=3))

# CENTER — the vault: big lime square with keyhole, dashed construction outline + scaffolding ticks
cx, cy, s = 800, 450, 260
ax.add_patch(FancyBboxPatch((cx - s / 2 - 26, cy - s / 2 - 26), s + 52, s + 52, boxstyle="round,pad=0,rounding_size=70", fc="none", ec=LIME, lw=2, ls=(0, (10, 8)), alpha=.6, zorder=4))
ax.add_patch(FancyBboxPatch((cx - s / 2, cy - s / 2), s, s, boxstyle="round,pad=0,rounding_size=56", fc=LIME, ec="none", zorder=5))
kr = s * 0.155
ax.add_patch(Circle((cx, cy + s * 0.13), kr, fc=INK, ec="none", zorder=6))
ax.add_patch(Polygon([(cx - s * 0.095, cy + s * 0.06), (cx + s * 0.095, cy + s * 0.06), (cx, cy - s * 0.30)], closed=True, fc=INK, ec="none", zorder=6))
# corner ticks (blueprint markers)
for (tx, ty, dx, dy) in [(cx - s / 2 - 60, cy + s / 2 + 60, 1, -1), (cx + s / 2 + 60, cy + s / 2 + 60, -1, -1), (cx - s / 2 - 60, cy - s / 2 - 60, 1, 1), (cx + s / 2 + 60, cy - s / 2 - 60, -1, 1)]:
    ax.plot([tx, tx + 28 * dx], [ty, ty], color=CREAM, lw=2, alpha=.5, zorder=4); ax.plot([tx, tx], [ty, ty + 28 * dy], color=CREAM, lw=2, alpha=.5, zorder=4)

# flows: lime blocks → vault (dashed lime), vault → liquid (dashed mint), liquid → back to vault as yield (mint dots)
ax.annotate("", xy=(cx - s / 2 - 40, cy), xytext=(560, cy), arrowprops=dict(arrowstyle="-|>", color=LIME, lw=3, ls=(0, (8, 6)), mutation_scale=30), zorder=4)
ax.annotate("", xy=(1040, cy), xytext=(cx + s / 2 + 40, cy), arrowprops=dict(arrowstyle="-|>", color=MINT, lw=3, ls=(0, (8, 6)), mutation_scale=30), zorder=4)
for i in range(7):
    px = 1040 - i * 26; ax.add_patch(Circle((px, cy + 70 + 8 * math.sin(i)), 5, fc=MINT, ec="none", alpha=.35 + i * .09, zorder=4))
ax.annotate("", xy=(cx + s / 2 + 44, cy + 70), xytext=(cx + s / 2 + 70, cy + 70), arrowprops=dict(arrowstyle="-|>", color=MINT, lw=2, mutation_scale=18), zorder=4)

f.savefig(os.path.join(ROOT, "teaser-building.png"), dpi=100); print("teaser-building.png")
