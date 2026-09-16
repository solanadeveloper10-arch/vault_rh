# minara.fun

Analysed 2026-09-16 · 1024px viewport · page ≈ 2,350px · **analysis only, no capture**

*Discover, launch, and trade tokens with USDC-native liquidity* — a launchpad
that looks like it was built by a design-systems team, because it was.

## The one-line idea

A token app with a **real, named, complete design system** underneath it. Not
"a dark theme with green" — a tinted neutral ramp, a branded accent ramp, a
signal palette, a 4px space scale and a radius scale, all exposed as CSS
variables with human names.

## What's worth stealing

### 1. The tinted neutral ramp

This is the single best thing on the site. The greys aren't grey — every step
carries a green cast, pulled toward the accent:

```
--minara-neutral-950  #050807   ← ground
--minara-neutral-900  #080d0b
--minara-neutral-850  #0b110f
--minara-neutral-800  #101814   ← card
--minara-neutral-700  #18231e   ← hairline
--minara-neutral-600  #2b3a33
--minara-neutral-500  #43534b
--minara-neutral-400  #6f7e76   ← dim text
--minara-neutral-300  #a8b3ad   ← secondary text
--minara-neutral-100  #f0f3f1
--minara-neutral-050  #f5f7f6   ← body text
--minara-neutral-000  #ffffff
```

Twelve steps, one continuous scale from ground to body text, every one tinted
toward jade. The page feels *coloured* while using almost no colour. Neutral
greys next to a green accent always look slightly dirty by comparison — this
fixes it at the token level instead of per-component.

**Steal this wholesale.** Take your accent's hue, push saturation down to
3–6%, and generate the neutral ramp in that hue.

### 2. The accent as a ramp, not a value

```
--minara-jade-050  #e9fff8      --minara-jade-600  #29c99d
--minara-jade-100  #c8f8e9      --minara-jade-700  #159070
--minara-jade-300  #77f3cf      --minara-jade-800  #0d604b
--minara-jade-500  #49edbf      --minara-jade-900  #0a3d31
```

`jade-500` fills the primary button (with near-black text on it, not white —
right call at that luminance). `jade-900`/`800` do tinted backgrounds. The light
end does hover and focus rings.

### 3. A separate "signal" palette

```
--minara-signal-lime    #b7f34e      --minara-signal-coral   #ff6b7a
--minara-signal-amber   #f3bd4f      --minara-signal-blue    #69a7ff
--minara-signal-orange  #f7931a      --minara-signal-violet  #b79cff
```

Deliberately *not* the brand ramp. Price-up uses lime `#b7f34e`, not jade —
which keeps "brand" and "this number went up" from ever being confused. Most
products conflate these and then can't tell you whether green means *ours* or
*good*.

### 4. Mono as the interface font

`Geist Mono` outnumbers `Geist` on the page (678 nodes vs 665) — it's not just
for numbers, it's for labels, tabs, headers, badges. Sizes 10–16px, tracking
`0.8px` at 10px and `0.96px` at 12px uppercase (≈0.08em), line-height 1.5.

Result: everything lines up in columns without a table, and numbers never
shift. In a product that is mostly numbers, that's the correct default.

The display headline is the exception: Instrument Sans at 32px, weight 600,
tracking `-0.028em`. One proportional face, used once.

### 5. Small radii, tight scale

`--minara-radius-1: 4px`, `-2: 6px`, then 8/12 on cards and `999px` only on
filters and pills. Nothing is soft. Combined with 1px `#18231e` hairlines on
everything, it reads as precise rather than friendly — matching the "USDC-native,
this is finance" claim.

### 6. Spacing on a strict 4px scale

`--minara-space-1` = 4px through `-24` = 96px. Named by multiple, not by t-shirt
size. Fewer arguments, and any two components spaced from the same scale line up.

## Density and layout

- Rank badges (`#1`, `#2`) in a separate left block of each card — instantly
  scannable ordering without a table
- Card grid for launches, with a grid/list toggle
- Filter row as pills: `🔥 Trending`, `+ New`, `▲ Top`, `↗ Near graduation`,
  `✓ Graduated` — one emoji or glyph each, doing the icon's job for free
- Paged sections (`1/10` with arrows) instead of infinite scroll — the page
  stays 2,350px and never grows

## What I wouldn't copy

- 11px as the most common text size is small for anything read at length.
  Correct for a dense trading surface, wrong for docs or onboarding.
- All-mono means long prose is uncomfortable. There is almost none here, by
  design — don't adopt the system and then write paragraphs into it.
