"""Brand assets for Vault: avatar 500x500, banner 1500x500, SVG logo. Run: python3 brand/make_brand.py"""
import os, math, random
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
from matplotlib.patches import Circle, Polygon, FancyBboxPatch
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
LIME, INK, CREAM = "#CCFF00", "#110E08", "#F5F2EA"
serif = fm.FontProperties(fname=os.path.join(HERE, "InstrumentSerif-Regular.ttf"))

def keyhole(ax, cx, cy, s, color=INK, alpha=1.0, z=3):
    """Keyhole whose lower part is a V. s = overall height."""
    r = s * 0.25
    ax.add_patch(Circle((cx, cy + s * 0.20), r, fc=color, ec="none", alpha=alpha, zorder=z))
    ax.add_patch(Polygon([(cx - s * 0.155, cy + s * 0.10), (cx + s * 0.155, cy + s * 0.10), (cx, cy - s * 0.48)], closed=True, fc=color, ec="none", alpha=alpha, zorder=z))

# ---------- avatar 500x500: lime background + keyhole only ----------
f = plt.figure(figsize=(5, 5), dpi=100); ax = f.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis("off"); f.patch.set_facecolor(LIME)
keyhole(ax, 50, 50, 58)
f.savefig(os.path.join(ROOT, "avatar-500.png"), dpi=100, facecolor=LIME); plt.close(f); print("avatar-500.png")

# ---------- banner 1500x500 ----------
W, H = 1500, 500
f = plt.figure(figsize=(15, 5), dpi=100); ax = f.add_axes([0, 0, 1, 1]); ax.set_xlim(0, W); ax.set_ylim(0, H); ax.axis("off")
# dark green gradient (diagonal) + soft lime glow
x = np.linspace(0, 1, W); y = np.linspace(0, 1, H); X, Y = np.meshgrid(x, y)
t = np.clip(0.75 * X + 0.25 * (1 - Y), 0, 1)
c0 = np.array([0x0A, 0x12, 0x0C]) / 255; c1 = np.array([0x16, 0x2E, 0x1B]) / 255
img = c0 * (1 - t[..., None]) + c1 * t[..., None]
glow = np.exp(-(((X - 0.78) ** 2) / 0.09 + ((Y - 0.55) ** 2) / 0.35))
img = np.clip(img + glow[..., None] * np.array([0.10, 0.18, 0.02]), 0, 1)
ax.imshow(img, extent=[0, W, 0, H], origin="lower", zorder=0, interpolation="bilinear")
# coin monogram pattern: semi-transparent coins with the keyhole
random.seed(7)
def coin(cx, cy, r, a):
    ax.add_patch(Circle((cx, cy), r, fc=LIME, ec="none", alpha=a * 0.55, zorder=1))
    ax.add_patch(Circle((cx, cy), r, fc="none", ec=LIME, lw=1.2, alpha=a * 1.3, zorder=1))
    ax.add_patch(Circle((cx, cy), r * 0.82, fc="none", ec=LIME, lw=0.8, alpha=a * 0.9, zorder=1))
    keyhole(ax, cx, cy, r * 1.15, color=INK, alpha=min(1, a * 3.2), z=2)
cols, rows = 13, 5
for j in range(rows):
    for i in range(cols):
        cx = 60 + i * 118 + (59 if j % 2 else 0) + random.uniform(-10, 10)
        cy = 55 + j * 100 + random.uniform(-10, 10)
        # fade coins out toward the left where the wordmark sits; brighter on the right
        fade = 0.05 + 0.20 * (cx / W) ** 1.4
        if cx < 720 and 120 < cy < 380: fade *= 0.35
        r = random.uniform(24, 34)
        coin(cx, cy, r, fade)
# wordmark: lime square with keyhole + "Vault"
mx, my, ms = 205, 250, 150
ax.add_patch(FancyBboxPatch((mx - ms / 2, my - ms / 2), ms, ms, boxstyle="round,pad=0,rounding_size=34", fc=LIME, ec="none", zorder=5))
keyhole(ax, mx, my, ms * 0.62, z=6)
ax.text(mx + ms / 2 + 42, my - 6, "Vault", fontproperties=serif, fontsize=150, color=CREAM, va="center", ha="left", zorder=6)
ax.text(mx - ms / 2, my - ms / 2 - 40, "Trade fees → Hyperliquid vault → USDC for loyal holders", fontsize=17, color="#8FA88F", family=["Menlo", "DejaVu Sans Mono"], va="top", zorder=6)
f.savefig(os.path.join(ROOT, "banner-1500x500.png"), dpi=100); plt.close(f); print("banner-1500x500.png")
