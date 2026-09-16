# Pattern — telemetry chrome

*Seen on: [basebluechip.com](../sites/basebluechip-com/README.md)*

The set of small, cheap, non-functional details that make a page read as a
running machine rather than a document. Almost none of it requires engineering;
it is mostly type discipline and copywriting placed inside the layout.

## 1. Mono uppercase as the default voice

Set *everything* that isn't a headline in monospace, uppercase, widely tracked.
Two tracking regimes, split by size:

```css
.label {                 /* ≤13px — reads as a machine label */
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.22em;
  line-height: 1.5;
  text-transform: uppercase;
}
.mono-body {             /* ≥15px — something you actually read */
  font-size: 15px;
  letter-spacing: 0.05em;
  line-height: 1.5;
}
```

Wide tracking at small sizes is the entire effect. At `0.22em` an 11px label
stops looking like small text and starts looking like a readout. Above ~13px it
becomes unreadable, hence the split.

Trailing letter-spacing adds a gap after the last character, which breaks
right-aligned and centred text. Compensate:

```css
.label { margin-right: -0.22em }   /* for right-aligned labels */
```

## 2. Number the sections

```
03 / ORIGIN                                      COBIE · JUNE 2014
09 / SPECIFICATION SHEET                          BC-001 / REV. A
```

A zero-padded index and a name on the left; a revision, date or serial on the
right. Both in the 11px label style, separated by a hairline rule. This is one
flex row per section and it does more for "this is a designed document" than any
amount of illustration.

```html
<div class="sec-head">
  <span class="label">03 / ORIGIN</span>
  <span class="label">COBIE · JUNE 2014</span>
</div>
```

```css
.sec-head {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  padding-bottom: 12px;
  color: var(--muted);
}
```

## 3. Give numbers units and precision

`540.00 ± 0.00`. `FIELD OF VIEW / 0.08 MM`. `DEFECT RATE / 0.00%`.
`SURFACE ANALYSIS / 4800×`.

Trailing zeros, tolerances and units signal *measurement*. `540` is a number;
`540.00 ± 0.00` is an instrument reading. Use `font-variant-numeric: tabular-nums`
so live values don't jitter as digits change width:

```css
.readout { font-variant-numeric: tabular-nums }
```

## 4. Figure captions

Under every image or canvas:

```
FIG. 1 — SPECIMEN 001 UNDER INSPECTION LIGHT
```

11px, muted, uppercase. Costs a line of HTML, buys a whole register.

## 5. The marquee ticker

A strip of status fragments scrolling forever across the top. The trick is
duplicating the content so the loop is seamless, and translating by exactly
`-50%`:

```html
<div class="ticker"><div class="ticker-run">
  <span>CHIP STATUS / OPERATIONAL</span><span>DEFECT RATE / 0.00%</span>
  <!-- …then the exact same list again… -->
</div></div>
```

```css
.ticker { overflow: hidden; border-bottom: 1px solid var(--line); background: var(--bar) }
.ticker-run {
  display: flex;
  gap: 48px;
  width: max-content;
  animation: marquee 40s linear infinite;
}
@keyframes marquee { to { transform: translateX(-50%) } }
@media (prefers-reduced-motion: reduce) { .ticker-run { animation: none } }
```

Colour roughly one item in three with the accent so the strip has rhythm instead
of reading as grey mush. Keep it slow — 40s+ for a full pass. A fast ticker is
a distraction; a slow one is ambience.

## 6. A live clock

`13:57:35 UTC`, updating every second, in the header row. One `setInterval` and
a tabular-nums span. Nothing signals "live system" more cheaply.

```js
setInterval(() => {
  clock.textContent = new Date().toISOString().slice(11, 19) + ' UTC';
}, 1000);
```

## 7. The boot sequence

Mono lines typed onto black, one every ~250ms, the last one in the accent
colour, then the page fades in:

```
BLUECHIP SYSTEMS
INITIALIZING
NETWORK: BASE MAINNET
COLOR CHECK: BLUE
CHIP CHECK: CHIP
STATUS: OPERATIONAL        ← accent
```

**The one to be careful with.** It is a few seconds of nothing in front of a
first-time visitor. Rules if you use it:

- Keep it under ~3s total.
- Let any scroll, click or key skip it immediately.
- Play it once per session — `sessionStorage.setItem('booted', '1')`.
- Skip it entirely under `prefers-reduced-motion`.
- Never put it in front of content people arrive at from search or an ad.

## Why the whole set works

Every item is played completely straight. The reference site's copy is a joke
(`SERIOUSNESS / 0.04`, `FUNDAMENTALS: DATA UNAVAILABLE`) and the chrome around
it is not — the layout never winks. If the design itself looked like a joke,
none of it would land. The same applies to a serious product: this chrome only
reads as credible while it is used consistently and not decorated further.
