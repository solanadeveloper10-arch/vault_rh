# basebluechip.com — tokens

Observed values, read off the live page at a 1440×900 viewport (2026-09-16).
Names in the left column are the site's own Tailwind v4 `@theme` token names,
which are worth reading as a lesson in themselves: they are named by *role in
the fiction* (`lab`, `void`, `panel`, `bar`, `steel`, `grid-line`), not by hue
or by number.

## Palette

### Dark ground (the default page)

| Token | Value | Role |
| --- | --- | --- |
| `void` / `black` | `#000000` | page ground, full-bleed sections |
| `panel` | `#02040a` | raised panel, barely off black |
| `panel-2` | `#040810` | second panel level |
| `panel-3` | `#050b18` | third panel level |
| `bar` | `#0a0e16` | top ticker / chrome bars |
| `grid` | `#0b111e` | grid-pattern fill |
| `line` | `#14171d` | default hairline border |
| `line-4` | `#1b2333` | hairline, slightly lifted |
| `line-2` | `#262b33` | hairline, visible |
| `line-3` | `#23324e` | hairline with blue cast |
| `grid-line` | `#2a3346` | technical-drawing grid |

Eleven near-black steps. That is the actual craft here: the page is not
"black + blue", it is a *ramp* of eleven blacks separated by 2–5 points of
lightness, each with a slightly different blue cast. It reads as depth on an
OLED screen and as a flat black on a bad one — a deliberate, safe failure mode.

### Ink

| Token | Value | Role |
| --- | --- | --- |
| `white` | `#ffffff` | display headlines, on-accent text |
| `ink` | `#e9edf4` | default body text (cool white, not pure) |
| `steel` | `#9aa4b2` | secondary text |
| `muted` | `#6b7686` | labels, captions |
| `dim` | `#4a5261` | disabled, de-emphasised readouts |

### Accent

| Token | Value | Role |
| --- | --- | --- |
| `bc` | `#0052ff` | the accent — Base's brand blue |
| `base-blue` | `#0a50dc` | the full-bleed CTA band (slightly dropped) |
| `bc-deep` | `#0a3ac9` | pressed/darker accent |
| `bc-2` | `#6e9bff` | accent *text* on dark — the one you actually read |
| `bc-mid` | `#8fb4ff` | lightest accent, highlights |

One hue. Five stops. Note the split between the accent you *fill* with
(`#0052ff`) and the accent you *set type* in (`#6e9bff`) — pure `#0052ff` text
on black is unreadable, and they solved it with a token rather than with
opacity. Worth copying exactly.

### Light section (section 05, the inversion)

| Token | Value | Role |
| --- | --- | --- |
| `lab` | `#f1efea` | warm paper ground |
| `lab-2` | `#e7e4de` | panel on paper |
| `lab-ink` | `#0b0d10` | text |
| `lab-body` | `#5a6069` | body text |
| `lab-muted` | `#6a6f78` | labels |
| `lab-dim` | `#8a8f98` | de-emphasised |
| `lab-line` | `#d5d2ca` | hairline |
| `lab-line-2` | `#cfcbc3` | hairline, stronger |

The inverted section is **warm** (`#f1efea`, not `#ffffff`) against a cool dark
page. That temperature shift is what makes it read as a different *document*
rather than as a light-mode bug.

## Type

Two families, loaded as variable web fonts with local fallback metrics
(`Archivo Fallback`, `IBM Plex Mono Fallback`) so the swap doesn't reflow.

### Display — Archivo, weight 800–900, all caps

| Size @1440 | Weight | Tracking | Line height | Use |
| --- | --- | --- | --- | --- |
| 158px | 900 | −0.045em | 0.84 | hero |
| 107px | 900 | −0.05em | 0.90 | full-bleed statement |
| 86px | 800 | −0.03em | 0.90 | section headline |
| 76px | 800 | −0.035em | 0.92 | section headline |
| 64px | 800 | −0.035em | 0.94 | section headline |
| 44px | 800 | −0.03em | 1.02 | sub-headline |

The rule underneath: **as size goes up, tracking goes more negative and line
height goes down** — from `−0.03em / 1.02` at 44px to `−0.05em / 0.84` at 158px.
Big type needs its gaps closed or it falls apart into separate letters and
separate lines. Most sites set one tracking value for all headings and get
loose 100px type.

### Mono — IBM Plex Mono, weight 400

| Size | Tracking | Line height | Transform | Use |
| --- | --- | --- | --- | --- |
| 9–10px | 0.13–0.22em | 1.5 | uppercase | micro-labels, figure captions |
| 11px | 0.20–0.22em | 1.5 | uppercase | the workhorse label (most common node on the page) |
| 12–13px | 0.16–0.24em | 1.5 | uppercase | section numbers, nav, ticker |
| 15–16px | 0.04–0.06em | 1.5 | uppercase | body copy |
| 24px | 0.05em | 1.5 | uppercase | section lead paragraph |

Two tracking regimes, and the split is the whole system: **≤13px gets
0.16–0.24em** (machine label), **≥15px gets 0.04–0.06em** (something you read).
Line height is `1.5` for every mono size without exception.

## Spacing

Fluid `clamp()` triples, essentially no spacing breakpoints:

| Axis | Value | Where |
| --- | --- | --- |
| Horizontal page padding | `clamp(20px, 4vw, 60px)` | every section, identical |
| Vertical section padding | `clamp(60px, 9vw, 140px)` | standard section |
| Vertical, generous | `clamp(70px, 10–11vw, 160–180px)` | hero, CTA band, acquisition |
| Vertical, light section | `clamp(60px, 10vw, 150px)` | section 05 |
| Internal gap | `clamp(24px, 4vw, 44px)` | hero grid rows |
| Footer | `clamp(30px, 4vw, 52px)` top / `clamp(24px, 3vw, 40px)` bottom | — |

Horizontal padding is the *same value* on all 14 sections. Every section's left
edge lines up down the whole 17,700px scroll — that single shared value is what
holds the page together while the textures change.

Heights use `svh`, not `vh` — correct on mobile, where the browser chrome
collapses (`min-h-[100svh]` hero, `h-[240svh]` / `h-[220svh]` scroll scenes).

## Motion

Five named keyframe animations on the whole site:

| Name | What it does |
| --- | --- |
| `bc-marquee` | the infinite top ticker |
| `bc-scanx` | a scan line sweeping horizontally |
| `bc-blink` | cursor / status blink |
| `bc-lane` | the fabrication conveyor of Base blocks |
| `bc-out` | the boot-sequence exit |

Everything else — the chip rotation, the acquisition percentage, the quality
meters, the material zoom — is **scroll-driven**, not keyframed. Five ambient
loops for "the machine is on", and scroll progress for everything the reader is
meant to control.

## Structure at a glance

- 14 sections, ~17,700px at 1440 wide
- 1 external stylesheet (~43KB), 7 JS chunks — Next.js with Turbopack
- 2 sticky scroll-scrub scenes (`240svh`, `220svh`)
- 1 light section, 1 saturated-accent band
- 1 anchor target in the entire page (`#contract`); no navigation
