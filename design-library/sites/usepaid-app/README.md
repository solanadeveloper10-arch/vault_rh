# usepaid.app

Analysed 2026-09-16 · 1024px viewport · page ≈ 4,160px · **analysis only, no capture**

*Route token fees through X Money* — a token-launch tool whose entire design
strategy is "look like the platform you live on".

## The one-line idea

It doesn't have a visual identity. It borrows X's — down to the typeface — and
spends all its design budget on **showing real money moving to real people**.

## The move worth learning

### Wear the host platform's clothes

The font stack is `chirp` / `chirpNumerals` — X's own typeface. The link blue is
`#1d9bf0`, X's exact blue. The left icon rail, the pill search field, the round
avatars, the verified badges, the `Connect wallet` pill top-right: it reads as an
X surface, not as a crypto site.

This is a real strategy, not laziness. The product's value prop is *paying
people at their X handle*, so a reader arriving from X has zero adjustment cost
and an immediate sense that the two things are connected. The design is an
argument.

**The rule underneath**: when your product is an extension of someone else's
platform, inheriting their visual language is a feature. When it isn't, this
same move reads as a knockoff. Ask which one you are before reaching for it.

### The hero is a wall of receipts

Below the headline: a live feed of actual payments — `$100.00 sent to Naval`,
`$5.00 sent to Paul Grah…`, with avatars, verified ticks and timestamps —
running beside cards of real token launches and a screenshot collage.

No illustration, no abstract 3D, no feature grid. The proof *is* the visual.
For anything with live activity this beats any hero image, and it costs nothing
to design — the data is already there.

### Chrome in mono, content in the brand face

`geistMono` at 11px appears only for addresses, amounts and small metadata.
Everything human-readable is Chirp. Two voices, cleanly split, same trick as the
lab-instrument style but at a much lower dose.

## Tokens observed

| | |
| --- | --- |
| Ground | `#0a0a0a`, panels `#1a1a1a` |
| Overlays | `white / 0.04`, `0.06`, `0.08` — panels as translucent white, not as lighter greys |
| Text | `#ffffff`, then `white/0.6`, `/0.45`, `/0.4`, `/0.35` — hierarchy by **opacity**, not by grey values |
| Accent | `#1d9bf0` (X blue), secondary `#0ea5e9` |
| Type | Chirp 10–34px, weights 400/500/600/700, tracking ~normal; Geist Mono 11px for data |
| Radius | fully-round pills everywhere, 16px and 12px cards, 3–4px on chips |
| Shadows | **none** — separation is by border and by ground colour only |
| Density | high, app-like; 4,160px total |

The opacity-based text ramp is the portable detail: `rgba(255,255,255,.6)` etc.
instead of five named greys. It survives a ground colour change for free — the
same tokens work on `#0a0a0a` and on `#1a1a1a`.

## What I wouldn't copy

- Using another company's proprietary typeface. Chirp is X's; there's licensing
  risk and there's the "this looks like a phishing page" risk. If you want the
  effect, use a near-neighbour (Inter, Geist) and borrow only the *layout*.
- Nothing distinguishes it in a screenshot. Zero brand recall — deliberate here,
  fatal for a product that needs to be remembered on its own.
