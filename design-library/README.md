# Design library

A personal study collection of sites worth learning from. Each entry is
**reference material, not source**: screenshots of what the page actually
renders, the design decisions behind it, and notes on how to rebuild the
technique from scratch.

What deliberately is *not* here: copies of anyone's HTML, CSS, JS or image
assets. The point is to learn the pattern and re-implement it, not to lift a
build. Screenshots are third-party work kept for private study — they are not
for reuse, redistribution or publishing.

## → [STYLES.md](STYLES.md)

The five named styles distilled from these entries — **LAB, NATIVE, JADE, SOFT,
TERMINAL** — with a quick-pick table, full token recipes, and which ones mix.
Start there when choosing a direction; the site entries are the evidence behind
it.

## Entries

| Site | Style | Why it's here |
| --- | --- | --- |
| [basebluechip.com](sites/basebluechip-com/README.md) | **LAB** | Lab-instrument / spec-sheet aesthetic; long scroll-scrubbed narrative with WebGL + canvas set pieces. Screenshots included |
| [usepaid.app](sites/usepaid-app/README.md) | **NATIVE** | Wears X's visual language wholesale; hero is a live wall of real payments |
| [minara.fun](sites/minara-fun/README.md) | **JADE** | A complete named design system — accent-tinted neutral ramp, separate signal palette, 4px scale |
| [lift.fun](sites/lift-fun/README.md) | **SOFT** | Rounded face on the *small* text, glow as emphasis, organic 3D renders, real light/dark |
| [deltaliquidity.app](sites/deltaliquidity-app/README.md) | **TERMINAL** | System-mono trading terminal; half-pixel type scale, directional colour only, sparkline per row |

## Cross-site patterns

Techniques pulled out of the entries above, written to be reusable:

- [Scroll-scrubbed sticky scene](patterns/scroll-scrubbed-sticky-scene.md) — tall
  section, sticky viewport child, progress drives the animation instead of time
- [Telemetry chrome](patterns/telemetry-chrome.md) — mono uppercase labels, section
  numbering, marquee ticker, boot sequence
- [Single-accent dark palette](patterns/single-accent-dark-palette.md) — near-black
  ramp + one saturated hue, and the inverted section that keeps it from going flat

## Adding a site

```
sites/<domain-with-dashes>/
  README.md        analysis: what works, why, how to rebuild
  tokens.md        palette, type, spacing, motion — as observed (optional)
  shots/           1440px-wide JPEGs, numbered top-to-bottom (optional)
```

Then add a row to **Entries** above, and either tag it with an existing style in
[STYLES.md](STYLES.md) or add a sixth one.

Entries don't need screenshots — most here are analysis-only, read live in the
browser. Capture them when the layout is hard to describe or the page is a long
narrative scroll.

Screenshots are captured with headless Chrome over CDP — scroll to a position,
wait for scroll-driven animation to settle, capture. The capture script lives in
[tools/shoot.mjs](tools/shoot.mjs).
