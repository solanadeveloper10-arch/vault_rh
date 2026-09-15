"""Three text-only banners 1500x500: classic / professional / creative. Run: python3 brand/banner_variants.py"""
import os
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
LIME, CREAM, MUTED = "#CCFF00", "#F5F2EA", "#8FA88F"
serif = fm.FontProperties(fname=os.path.join(HERE, "InstrumentSerif-Regular.ttf"))
ital_path = os.path.join(HERE, "InstrumentSerif-Italic.ttf")
serif_i = fm.FontProperties(fname=ital_path) if os.path.getsize(ital_path) > 10000 else serif
MONO = ["Menlo", "DejaVu Sans Mono"]; SANS = ["Helvetica Neue", "DejaVu Sans"]
W, H = 1500, 500

def canvas(c0, c1, glow_x=0.82, glow_y=0.5, glow_w=0.10, glow_h=0.5, glow_k=(0.10, 0.18, 0.02), diag=0.75):
    f = plt.figure(figsize=(15, 5), dpi=100); ax = f.add_axes([0, 0, 1, 1]); ax.set_xlim(0, W); ax.set_ylim(0, H); ax.axis("off")
    x = np.linspace(0, 1, W); y = np.linspace(0, 1, H); X, Y = np.meshgrid(x, y)
    t = np.clip(diag * X + (1 - diag) * (1 - Y), 0, 1)
    a = np.array(c0) / 255; b = np.array(c1) / 255
    img = a * (1 - t[..., None]) + b * t[..., None]
    glow = np.exp(-(((X - glow_x) ** 2) / glow_w + ((Y - glow_y) ** 2) / glow_h))
    img = np.clip(img + glow[..., None] * np.array(glow_k), 0, 1)
    ax.imshow(img, extent=[0, W, 0, H], origin="lower", zorder=0, interpolation="bilinear")
    return f, ax

def save(f, name): f.savefig(os.path.join(ROOT, name), dpi=100); plt.close(f); print(name)

# ---- 1. classic: serif wordmark, tagline under, right-aligned ----
f, ax = canvas((0x0A, 0x12, 0x0C), (0x16, 0x2E, 0x1B))
ax.text(1380, 262, "Vault", fontproperties=serif, fontsize=190, color=CREAM, ha="right", va="center", zorder=3)
ax.text(1380, 148, "Trade fees → Hyperliquid vault → USDC for loyal holders", fontsize=19, color=MUTED, family=MONO, ha="right", va="center", zorder=3)
save(f, "banner-classic.png")

# ---- 2. professional: restrained, structured, with a rule and meta line ----
f, ax = canvas((0x09, 0x10, 0x0B), (0x12, 0x24, 0x17), glow_x=0.88, glow_w=0.06, glow_h=0.6, glow_k=(0.06, 0.11, 0.01))
# faint horizontal guides for a "terminal" feel
for yy in (110, 250, 390): ax.plot([80, 1420], [yy, yy], color=CREAM, alpha=0.05, lw=1, zorder=1)
ax.text(1380, 300, "Vault", fontproperties=serif, fontsize=132, color=CREAM, ha="right", va="baseline", zorder=3)
ax.plot([1010, 1380], [268, 268], color=LIME, lw=2, zorder=3)
ax.text(1380, 222, "Trade fees → Hyperliquid vault → USDC for loyal holders", fontsize=18, color=CREAM, family=SANS, ha="right", va="center", zorder=3, alpha=0.9)
ax.text(1380, 182, "ROBINHOOD CHAIN  ·  HYPEREVM TREASURY  ·  PAID MONTHLY  ·  VERIFIED HOLDERS ONLY", fontsize=12.5, color=MUTED, family=MONO, ha="right", va="center", zorder=3)
ax.text(80, 60, "$VAULT", fontsize=13, color=LIME, family=MONO, ha="left", va="center", zorder=3)
save(f, "banner-professional.png")

# ---- 3. creative: oversized italic wordmark bleeding off the edge, lime accent line ----
f, ax = canvas((0x08, 0x14, 0x0C), (0x1C, 0x3C, 0x20), glow_x=0.9, glow_y=0.35, glow_w=0.08, glow_h=0.5, glow_k=(0.16, 0.30, 0.03))
ax.text(1540, 42, "Vault", fontproperties=serif_i, fontsize=330, color=CREAM, ha="right", va="baseline", zorder=3, clip_on=True)
ax.text(1390, 452, "the meme coin that", fontproperties=serif_i, fontsize=42, color=CREAM, ha="right", va="center", zorder=4, alpha=0.9)
ax.text(1390, 400, "pays.", fontproperties=serif_i, fontsize=62, color=LIME, ha="right", va="center", zorder=4)
ax.text(80, 60, "trade fees → hyperliquid vault → usdc to holders", fontsize=15, color=MUTED, family=MONO, ha="left", va="center", zorder=3)
save(f, "banner-creative.png")
