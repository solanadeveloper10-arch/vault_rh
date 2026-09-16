# deltaliquidity.app/pools

Analysed 2026-09-16 · 1024px viewport · page ≈ 3,510px · **analysis only, no capture**

A liquidity/pools dashboard built as a **trading terminal**. Maximum information
per pixel, zero decoration.

## The one-line idea

Every design decision answers one question: *how many rows fit on screen while
staying scannable?* It is the densest of the five sites in the library, and the
one with the least visual personality — deliberately.

## What's worth stealing

### 1. System mono for the entire interface

`ui-monospace` on 1,042 nodes — that's everything: nav, labels, table cells,
headings, buttons. Not a web font. Zero network cost, zero FOUT, renders as SF
Mono / Cascadia / whatever the reader's OS considers its terminal face.

For a data tool this is close to a free win:

```css
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

Columns align without table layout, digits never jitter, and the page inherits
the reader's own sense of "this is a terminal". The cost is that it will look
slightly different on every OS — which matters for a brand and doesn't for a
tool.

### 2. A half-pixel type scale

`8.5px · 9.5px · 10.5px · 11px · 11.5px · 12px · 12.5px · 13.5px · 14px · 15px`

Fractional sizes, every step ~1px apart, all with line-height ≈1.65. The
workhorse is **13.5px / 1.65**. Column headers are **10.5px, weight 600,
uppercase, tracking 1.47px (0.14em)**.

That's a finer-grained scale than any design system would recommend, and it's
the right call here: at these sizes a 1px step is a real hierarchy level, and a
conventional 12/14/16/20 scale would waste vertical space.

The one proportional exception: Space Grotesk at 17px/700 for the brand mark.

### 3. Directional colour, and only directional colour

| | |
| --- | --- |
| Up / positive | `#3f9e74` |
| Down / negative | `#e5675b` |
| Everything else | `#edf1f2` text, `#9ba3a6` secondary |

194 nodes in green, 93 in red, and essentially nothing else is coloured. Both
are **muted** — a desaturated forest green and a dusty coral, not `#00ff00` and
`#ff0000`. On a wall of numbers, saturated red/green becomes visual noise within
seconds; these stay readable for hours.

The green also does double duty as the brand colour (`--grad-accent:
linear-gradient(135deg, #237a52, #178578)`), which works only because nothing
else on the page competes.

### 4. Sparklines inside table rows

Every row ends with a `LAST 24H` micro-chart — no axes, no labels, no
interaction. It answers "what shape is this?" in the same glance as the numbers,
and costs one narrow column.

This is the highest-value-per-effort element on the whole page. Any table of
time-varying numbers should have one.

### 5. Ground and hairlines, no elevation

```
page      #0a0b0b
card      #0f1211
raised    #121414
hairline  #242929        stronger hairline  #333939
```

Green-tinted near-blacks again (the same trick as minara.fun), 1px hairlines,
`6px` radius on cards and controls, `50%` on avatars, no shadows anywhere.
Translucent panel backgrounds (`#0f1211 / 0.7`) for overlays and sticky headers.

### 6. The stat strip in the header

`TOTAL POSITIONS 21,262 · TOTAL FEES $3,122,026 · TVL $771,542 · ETH PRICE
$2,391.51` — four key/value pairs inline in the top bar, tiny uppercase label
above a larger value, each with a small glyph.

It puts the numbers people came for above every page of the app, at the cost of
~50px. Compare with a dashboard "overview" section that has to be scrolled to.

## Layout

- Narrow left icon rail (~44px), icon-only, no labels
- Full-width top bar: logo, search, stat strip, theme toggle, connect
- Content: two summary cards, then trending table, then the pools table
- Tables carry their own filter row (`All / ETH / USDG`, `24h`)
- 3,510px total — it's an app, not a page

## What I wouldn't copy

- 8.5–11px uppercase labels with 0.14em tracking are at the edge of legible and
  there is no density control. A "comfortable / compact" toggle would cost
  little.
- No visual identity at all. A screenshot is indistinguishable from any other
  terminal. Right for a tool people use daily, wrong for anything that has to be
  remembered after one visit.
- `ui-monospace` means you don't control the rendering. Fine for a tool; don't
  ship a brand on it.
