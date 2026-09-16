# basebluechip.com

Captured 2026-09-16 · 1440×900 viewport, 2× DPR · page height ≈ 17,700px
Stack observed: Next.js (Turbopack build), Tailwind v4 (`@theme` tokens), one
external stylesheet, canvas/WebGL set pieces.

> Reference material for private study. Screenshots in `shots/` are the site
> owners' work. Nothing from their source is copied into this repo — the notes
> below describe how to build the same effects from scratch.

## The one-line idea

A memecoin site that refuses to look like one. It commits completely to a single
metaphor — **the token is a physical semiconductor going through factory
inspection** — and then renders every section as a page from that process:
intake, geometry acquisition, blueprint, quality control, material analysis,
fabrication, spec sheet, acquisition.

That is the whole lesson. The design is not "a dark site with blue accents"; it
is a consistent *fiction*, and every typographic and motion choice serves it.
Copy the discipline, not the chip.

## What's worth stealing

### 1. A conceit carried to the last label

Section headers are numbered like document sections (`03 / ORIGIN`,
`09 / SPECIFICATION SHEET`) with a right-aligned sub-caption that reads like a
drawing revision (`DWG. BC-001 — REV. A`, `BC-001 / REV. A`). Images carry
figure captions (`FIG. 1 — SPECIMEN 001 UNDER INSPECTION LIGHT`). Readouts show
units and tolerances (`540.00 ± 0.00`, `FIELD OF VIEW / 0.08 MM`,
`SURFACE ANALYSIS / 4800×`).

None of that is functional. All of it is what makes the page feel *made*. The
cost is close to zero — it's copywriting inside the layout, not extra
engineering.

### 2. Two typefaces, two jobs, no overlap

- **Archivo** (grotesque, very heavy) — only for the display lines, set huge,
  all-caps, tight leading, tight tracking. `BLUECHIP. / LITERALLY.` stacked in
  two colours is the entire hero.
- **IBM Plex Mono** — *everything* else: nav, labels, body copy, footnotes,
  data. Uppercase with wide letter-spacing for anything that reads as a machine
  label; sentence-length mono paragraphs for body copy.

The count in the DOM was ~267 mono nodes vs ~157 display nodes. Mono is the
default voice; the grotesque is the shout. That ratio is the trick — mono
everywhere is what makes the display type land when it appears.

### 3. Scroll-scrubbed set pieces, not scroll-triggered animation

Two sections are `240svh` and `220svh` tall with a sticky full-viewport child.
Scroll position inside the section maps to animation progress — the 3D chip
rotates and the scan completes *as you scroll*, and reverses when you scroll
back. Percentage readouts (`ACQUISITION 000%` → `100%`) are wired to the same
progress value, so the fiction and the mechanics are the same number.

Compare with the cheap version (fade-in on `IntersectionObserver`): scrubbing
makes the page feel like an instrument you're operating. Write-up:
[patterns/scroll-scrubbed-sticky-scene.md](../../patterns/scroll-scrubbed-sticky-scene.md).

### 4. The rhythm of the long scroll

14 sections over ~17,700px, and the page never tires because the *texture*
changes even though the palette doesn't:

| # | Section | Texture |
| --- | --- | --- |
| 01 | Hero | Dark, WebGL chip, 4-up stat bar pinned to the bottom |
| 02 | Geometry acquisition | Sticky scroll-scrub, wireframe/scan overlay |
| 03 | Origin | Text + a vertical dated timeline of embedded screenshots |
| 04 | Blueprint | Technical drawing: dimension lines, leader callouts, tolerances |
| 05 | O1 exchange | **Light section** — full palette inversion |
| 06 | Quality control | Animated meter rows counting to 100% |
| 07 | Material | Full-bleed microscopy image, sticky, caption-only chrome |
| 08 | Fabrication | Horizontal "conveyor" of Base blocks |
| 09 | Spec sheet | Two-column key/value table, mono throughout |
| 10 | Financial evolution | Six-step horizontal progression |
| 11 | Thesis | Numbered argument, `01`–`05` |
| 12 | CTA band | **Solid blue**, white type, full bleed |
| 13 | Acquisition | Contract address + copy button + primary buttons |
| 14 | Footer | Thin mono row, disclaimer as a joke |

Two interruptions in a dark page — one light section (05), one saturated blue
band (12) — and they're placed roughly at the 1/3 and 4/5 marks. That's the
whole pacing strategy.

### 5. Fluid spacing, not breakpoints

Every section's padding is a `clamp()`: horizontal `clamp(20px, 4vw, 60px)`,
vertical `clamp(60px, 9vw, 140px)`, with the hero and CTA band reaching
`clamp(70px, 11vw, 180px)`. Almost no media queries for spacing — the page
breathes continuously between mobile and desktop. Three numbers (floor, rate,
ceiling) replace four breakpoints.

### 6. Persistent chrome sells "operational"

A marquee ticker at the very top scrolls status fragments
(`CHIP STATUS / OPERATIONAL`, `DEFECT RATE / 0.00%`, `SERIOUSNESS / 0.04`) past
forever, with the accent-coloured items breaking up the grey ones. Below it, a
fixed header row with a live UTC clock. Before all that, a boot sequence: six
mono lines typed out on black, ending with `STATUS: OPERATIONAL` in blue, then
the page arrives.

The boot screen is a ~3s gate in front of the content. It works here because it
is short, skippable by scrolling, and pays off the metaphor immediately. It is
also the riskiest thing on the page — see *What I wouldn't copy*.

### 7. The joke stays deadpan

`SERIOUSNESS / 0.04`. `FUNDAMENTALS: DATA UNAVAILABLE`. `ENGINEERED FOR
ABSOLUTELY NO REASON.` `PAST PERFORMANCE IS BLUE.` The humour is never in the
layout — the layout is played completely straight, which is what makes the
copy funny. A site that *looked* like a joke could not do this.

## What I wouldn't copy

- **The boot sequence.** ~3s before a first-time visitor sees anything. Fine for
  a site people arrive at deliberately; bad for anything with acquisition cost.
  If you want it, gate it behind `sessionStorage` so it plays once.
- **17,700px with no navigation.** There's no nav, no section index, no jump
  links — only the `#contract` anchor. Great for a single-sitting read, hostile
  to anyone returning to find one fact.
- **Mono for long body copy.** It looks right and reads slower. The paragraphs
  here are short enough to survive it; a docs page wouldn't be.
- **All-caps everywhere.** Same trade: strong texture, measurably slower
  reading. It's a decoration budget you spend once.

## Applying it to this project

The vault/holder site already shares the ingredients — dark ground, one accent,
data readouts, a serif display face. What it doesn't have yet is the *fiction*.
Things worth trying:

- Number the sections and give each a right-aligned revision caption.
- Give real numbers units and precision, the way `540.00 ± 0.00` does.
- Add one palette interruption in the middle of the scroll, and one saturated
  accent band before the final CTA.
- Replace any fade-in-on-scroll with one scroll-scrubbed scene — the holder
  multiplier curve is the obvious candidate: scrub day 1 → day 7.
- Convert the spacing scale to `clamp()` triples and delete the spacing media
  queries.

## Files

- [tokens.md](tokens.md) — palette, type, motion, as observed
- [shots/](shots/) — 22 screenshots, top of page to footer
