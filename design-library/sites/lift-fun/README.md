# lift.fun

Analysed 2026-09-16 · 1024px viewport · page ≈ 1,640px · **analysis only, no capture**

*Token launchpad on Arc* — the same category as minara.fun, solved with the
opposite temperament: soft, rounded, organic, expensive-looking.

## The one-line idea

Take a dense financial app and make every surface **soft**: rounded typeface,
pill geometry, glossy organic 3D renders instead of icons, and a glow instead of
a border for emphasis. The data is identical to any other launchpad; the feel is
a consumer product.

## What's worth stealing

### 1. A rounded typeface for the small stuff

Two faces, and the split is unusual:

- **Helvetica Neue LT** — structure: headline (`Token launchpad on Arc`, large,
  tight), nav, buttons, table text
- **Helvetica Rounded** — the *small* text: 9–14px labels, card metadata,
  secondary rows

Most sites would round the headline and keep the small text neutral. Doing the
reverse is why the page feels warm without looking childish: the geometry of the
page stays sharp, and the softness lives in the texture you read up close.

### 2. Micro-typography

The workhorse label is **8px, weight 500, uppercase, tracking 0.48px (0.06em)**,
line-height 1.0. Secondary labels sit at 9–11px. The headline is the only thing
above 16px.

An 8px uppercase label is aggressive — it works only because there's a lot of
air around it and the contrast is kept high (`#eef3f1` on `#141618`). The
lesson: extreme small type needs *spacing*, not boldness, to stay legible.

### 3. Glow as the emphasis primitive

The "King of the hill" card is marked with a green ring and outer glow
(`box-shadow` with the accent at ~2px spread plus a soft bloom) rather than a
badge, a larger size or a different background. One card on the page has it.

Glow is the dark-UI equivalent of elevation — it says "this one" without adding
a colour or a label. Use once per screen; two glows and neither means anything.

### 4. Organic 3D instead of icons

The hero background is a dark glossy liquid-metal render with a thin green light
trail curving through it; token art and the brand mark are the same material.
No flat icons, no line art, no gradients-as-decoration.

It's expensive (someone modelled and rendered these) and it's the entire reason
the site doesn't look like a template. If you can't produce them, the honest
alternative is *nothing* — one clean type-only hero beats stock 3D.

### 5. Genuine light/dark

There's a theme toggle in the header, and the light theme is a real design, not
an inversion. The variables are authored light-first:

```
--surface  #fff          --accent         #06b56c
--fg       #111716       --accent-bright  #0e8f58
--fg-2     #2f3b36       --accent-deep    #05834e
--fg-3     #66736e       --accent-soft    #34c98a
--fg-4     #7c8883       --accent-bg      #e3f6ec
--fg-5     #8b9691
--fg-6     #a6b0ab       --info-bg  #e4eefb
                         --warn-bg  #fbf1de
                         --danger-bg #fde7e4
```

Dark mode shifts the accent up to `#06d07d` — brighter, because the same green
on black reads darker than on white. That per-theme accent adjustment is the
detail almost everyone skips.

Note also the naming: `--fg` through `--fg-6`, a single numbered text ramp, and
`-bg` suffixes reserved for tinted status backgrounds.

### 6. Geometry

Pills (`9999px`) for every control — buttons, tabs, filters, search. Cards at
10px and 14px, one 24px container. Nothing square, nothing very round. Almost no
visible borders; separation comes from ground-colour steps (`#0a0b0b` page →
`#141618` → `#191c1e` → `#1f2325`).

## What I wouldn't copy

- 8px type is below what a lot of people can read comfortably, and there is no
  size control. It's a real accessibility cost taken for density.
- The organic renders carry the whole identity. Swap them for flat icons and
  nothing distinctive is left — that's a fragile brand.
- Borderless cards on a four-step near-black ramp disappear on cheap or
  mis-calibrated screens. minara.fun's hairline-on-every-card is the safer build
  of the same idea.
