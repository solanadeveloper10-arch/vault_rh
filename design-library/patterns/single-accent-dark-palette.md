# Pattern — single-accent dark palette

*Seen on: [basebluechip.com](../sites/basebluechip-com/README.md)*

## The shape of it

One hue, a long ramp of near-blacks, a short ramp of cool whites, and exactly
two interruptions across the whole page. Most dark sites reach for a second
accent when things feel flat; the better move is to make the *ground* do the
work and keep the accent scarce.

## 1. Build a ramp of blacks, not one black

The reference site defines eleven values between `#000000` and `#2a3346`,
separated by 2–5 points of lightness and each carrying a slightly different blue
cast. They're named by role, never by number:

```css
:root {
  --void:      #000000;   /* page ground, full-bleed sections */
  --panel:     #02040a;   /* raised panel */
  --panel-2:   #040810;
  --panel-3:   #050b18;
  --bar:       #0a0e16;   /* chrome bars */
  --grid:      #0b111e;   /* pattern fills */
  --line:      #14171d;   /* default hairline */
  --line-4:    #1b2333;
  --line-2:    #262b33;   /* visible hairline */
  --line-3:    #23324e;   /* hairline, blue cast */
  --grid-line: #2a3346;
}
```

Why it works: on a good screen those steps read as real depth, so panels,
hairlines and fills separate without a single shadow. On a bad screen they all
collapse to black — which is a *safe* failure, because the layout never depended
on them. Compare with elevating panels via `box-shadow` on dark, which looks
like grey haze everywhere.

Naming by role rather than by number is the part most people skip. `--panel-2`
tells you where to use it. `--gray-850` does not, and six months later you're
picking by eye again.

## 2. Split the accent into "fill" and "text"

The single most portable idea here:

```css
:root {
  --accent:      #0052ff;   /* buttons, bands, fills */
  --accent-text: #6e9bff;   /* accent-coloured TYPE on dark */
  --accent-deep: #0a3ac9;   /* pressed / darker fill */
  --accent-mid:  #8fb4ff;   /* highlights */
}
```

`#0052ff` on `#000000` is about 3.4:1 — fine as a button fill with white text on
top, and unreadable as body-sized text. Rather than fixing that with opacity or
a filter, it's a separate token: `#6e9bff` on black is ~7.6:1.

Two rules follow, and they're worth enforcing in review:

- **Fill tokens are never used on `color`.**
- **Text tokens are never used on `background`.**

## 3. Ink is cool white, not white

```css
--ink:   #e9edf4;   /* body text */
--steel: #9aa4b2;   /* secondary */
--muted: #6b7686;   /* labels */
--dim:   #4a5261;   /* de-emphasised */
```

Pure `#ffffff` on pure black is harsh and halates on OLED. Reserve it for
display headlines, where the halation actually helps them shout, and set
everything else in `--ink`. Four steps of grey is enough for any page; a fifth
usually means the hierarchy is wrong somewhere else.

## 4. Interrupt the page exactly twice

A 17,700px dark page stays interesting because it changes ground twice:

- **A light section**, roughly a third of the way down.
- **A saturated accent band**, just before the final call to action.

The light section is the subtle part: it's **warm** (`#f1efea`, paper) against a
**cool** dark page. That temperature shift is what makes it read as a different
document inserted into the page rather than as a light-mode bug. A pure-white
section in the same slot reads as broken.

```css
.section--paper {
  --ground:   #f1efea;
  --ground-2: #e7e4de;
  --ink:      #0b0d10;
  --body:     #5a6069;
  --muted:    #6a6f78;
  --line:     #d5d2ca;
  background: var(--ground);
  color: var(--ink);
}
```

Redefining the *same variable names* inside the section is what keeps this cheap
— components inside it need no variants, they just resolve different values.
That only works if components consistently use tokens and never hardcode a hex.

The accent band is the blunt one: full-bleed `--accent`, white type, generous
vertical padding, no other colour. It works because by then the reader has gone
thousands of pixels without seeing the accent at that scale.

## 5. Scarcity is the rule

Across the entire reference page the accent appears as: two buttons in the hero,
roughly one in three ticker items, a handful of links and live values, the
scan/meter fills, the final band. That's it. Everything else is the black ramp
and the grey ink ramp.

The temptation on a dark palette is to tint panels with the accent for
"cohesion". Don't — the blue cast already living in the black ramp (`#02040a`,
`#050b18`, `#23324e`) does that job invisibly, and leaves the actual accent free
to mean something.

## Quick audit for your own page

- Count your near-blacks. Fewer than 4 → the page will look flat. More than ~12
  → you're picking by eye, not by role.
- Is any text set in your *fill* accent? Check its contrast; if it's under 4.5:1
  you need a second, lighter accent token.
- Is `#ffffff` used anywhere but display type?
- Do your dark hairlines survive on a cheap screen — and does the layout still
  read when they don't?
- How many ground changes are there in the full scroll? Zero is monotonous,
  two is the reference, five is noise.
