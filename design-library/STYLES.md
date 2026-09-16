# Style vocabulary

Five named styles, each derived from a site in this library. The point of the
naming is speed: **say the name and get the whole system** — palette, type,
density, geometry, motion — without re-litigating it every time.

All five happen to be dark-first crypto/fintech surfaces, so they share a family
resemblance. What separates them is *temperament*, and that's what the names
encode.

---

## Quick pick

| If the ask sounds like… | Style | Reference |
| --- | --- | --- |
| "landing page", "we need to explain the thing", "make it memorable", story, scroll | **LAB** | [basebluechip.com](sites/basebluechip-com/README.md) |
| "it lives inside X/Telegram/Discord", "people arrive from social", social payouts | **NATIVE** | [usepaid.app](sites/usepaid-app/README.md) |
| "a proper product", launchpad, dashboard people return to, needs its own brand | **JADE** | [minara.fun](sites/minara-fun/README.md) |
| "make it nicer / premium / friendlier", consumer-facing, light mode needed | **SOFT** | [lift.fun](sites/lift-fun/README.md) |
| "traders", "as much data as possible", tables, charts, pro tool | **TERMINAL** | [deltaliquidity.app](sites/deltaliquidity-app/README.md) |

Rough axes, if the ask is ambiguous:

```
decorated ←──────────────────────────────────────────→ bare
   LAB          SOFT        JADE       NATIVE      TERMINAL

marketing page ←─────────────────────────────────────→ daily tool
   LAB        NATIVE        SOFT        JADE       TERMINAL
```

If two fit, pick the one further right — under-decorating is recoverable,
over-decorating is not.

---

## LAB — lab instrument / spec sheet

**Use for**: a narrative landing page, a launch, a manifesto, anything where the
reader is meant to scroll once and remember it.
**Avoid for**: dashboards, docs, anything with repeat visits or search traffic.

| | |
| --- | --- |
| Ground | 8–11 near-blacks with a cast toward the accent (`#000` → `#2a3346`), named by role (`void`, `panel`, `bar`, `line`, `grid-line`) |
| Ink | cool white `#e9edf4`, then `#9aa4b2`, `#6b7686`, `#4a5261`. Pure `#fff` only for display type |
| Accent | one hue, split into **fill** (`#0052ff`) and **text** (`#6e9bff`) |
| Display | heavy grotesque (Archivo 800–900), ALL CAPS, 44–160px, tracking −0.03em → −0.05em as size grows, line-height 1.02 → 0.84 |
| UI/body | monospace everywhere. ≤13px → tracking 0.18–0.22em uppercase; ≥15px → 0.05em. line-height 1.5 always |
| Spacing | `clamp()` triples, same horizontal padding on every section: `clamp(20px,4vw,60px)` |
| Geometry | square. 0–4px radius, 1px hairlines |
| Motion | scroll-scrubbed sticky scenes; 3–5 ambient loops (marquee, blink, scanline) and nothing else |
| The tell | numbered sections (`04 / THE BLUEPRINT` + `DWG. BC-001 — REV. A`), figure captions, units and tolerances on every number |
| Rhythm | exactly two ground changes in a long scroll — one warm light section ~⅓ down, one saturated accent band before the CTA |

Patterns: [scroll-scrubbed scene](patterns/scroll-scrubbed-sticky-scene.md) ·
[telemetry chrome](patterns/telemetry-chrome.md) ·
[single-accent dark](patterns/single-accent-dark-palette.md)

---

## NATIVE — platform native

**Use for**: a product that is an extension of a social platform, where the
reader arrives from there and the connection *is* the value prop.
**Avoid for**: anything that needs its own brand recall. This style has none by
design.

| | |
| --- | --- |
| Ground | `#0a0a0a` page, `#1a1a1a` panel |
| Panels | translucent white — `rgba(255,255,255,.04 / .06 / .08)` — not lighter greys |
| Ink | `#fff`, then **opacity steps** `.7 / .6 / .45 / .4 / .35`. No named greys |
| Accent | the host platform's link colour (X: `#1d9bf0`) |
| Type | the host's face if licensing allows, otherwise Inter/Geist. 10–17px UI, 22–34px headings, weights 400–700, normal tracking |
| Data | one mono face at 11px for addresses, amounts, timestamps. That's its only job |
| Geometry | pills everywhere; 12px and 16px cards; 3–4px chips; **no shadows** |
| The tell | the hero is a live feed of real activity — avatars, verified ticks, real names, real amounts — not an illustration |
| Layout | left icon rail, pill search, `Connect` pill top-right |

The opacity-based ink ramp is the portable half of this style: it survives a
ground-colour change for free.

---

## JADE — tinted design system

**Use for**: a product with returning users that still needs to look like
someone designed it. The default choice when nothing else obviously fits.
**Avoid for**: long-form reading; this is a mono-first system.

| | |
| --- | --- |
| Ground | a 12-step neutral ramp **tinted toward the accent** (`#050807` → `#f5f7f6`, all with a green cast) |
| Accent | a full ramp, not a value: `050 / 100 / 300 / 500 / 600 / 700 / 800 / 900`. `500` fills buttons, with near-black text on it |
| Signal | a **separate** palette for meaning — lime/amber/coral/blue/violet — so "brand green" and "price up" are never the same colour |
| Type | mono-dominant for the whole UI (labels, tabs, headers, numbers), 10–16px, uppercase labels at 0.08em, line-height 1.5. One proportional face for the headline only |
| Spacing | strict 4px scale, named by multiple: `space-1: 4px` … `space-24: 96px` |
| Geometry | tight radii `4 / 6 / 8 / 12`, `999px` only on filter pills. 1px hairline on every card |
| The tell | rank badges (`#1`, `#2`) in a dedicated left block of each card; emoji-prefixed filter pills; paged sections (`1/10`) instead of infinite scroll |

**Recipe for the tinted ramp** — the most reusable idea in the library: take the
accent's hue, drop saturation to 3–6%, and generate every neutral in that hue.

---

## SOFT — soft organic

**Use for**: consumer-facing products, anything that should feel premium and
approachable; when light mode is a real requirement.
**Avoid for**: dense tables, anything where you can't commission the 3D art.

| | |
| --- | --- |
| Ground | four near-black steps `#0a0b0b → #141618 → #191c1e → #1f2325`, borderless |
| Ink | one numbered ramp `--fg` … `--fg-6` |
| Accent | green `#06b56c` light / `#06d07d` dark — **brightened for dark mode**, not reused |
| Status | tinted `-bg` pairs: `--info-bg`, `--warn-bg`, `--danger-bg`, `--accent-bg` |
| Type | neutral grotesque for structure, a **rounded** face for the small text (the inversion of the usual instinct) |
| Scale | tiny: 8–14px UI, 8px/500/uppercase/0.06em as the workhorse label; only the headline goes large |
| Geometry | pills on every control, 10px and 14px cards, no visible borders |
| Emphasis | **glow** — an accent ring plus bloom, on exactly one element per screen |
| The tell | glossy organic 3D renders instead of icons; genuine light/dark, both designed |

If the renders aren't available, don't substitute stock 3D — drop to a type-only
hero and keep the rest.

---

## TERMINAL — trading terminal

**Use for**: pro tools, tables, positions, pools, anything used daily by people
who care about rows-per-screen.
**Avoid for**: first-time visitors, marketing, anything needing brand recall.

| | |
| --- | --- |
| Ground | `#0a0b0b` page, `#0f1211` card, `#121414` raised; hairlines `#242929` / `#333939`; no shadows |
| Ink | `#edf1f2`, secondary `#9ba3a6` |
| Colour | **directional only** — muted green `#3f9e74` up, dusty coral `#e5675b` down. Nothing else is coloured |
| Type | `ui-monospace` system stack for the entire interface. No web font |
| Scale | half-pixel steps `8.5 · 9.5 · 10.5 · 11 · 11.5 · 12 · 12.5 · 13.5 · 14 · 15`, line-height ≈1.65. Workhorse 13.5px. Column heads 10.5px/600/uppercase/0.14em |
| Geometry | 6px radius on everything, 50% on avatars |
| The tell | a sparkline in every table row; a key/value stat strip pinned in the top bar; narrow icon-only left rail |

Saturated red/green is the classic mistake here — mute both or the table becomes
unreadable within a minute.

---

## Mixing

The styles aren't sealed. Common and safe combinations:

- **JADE + TERMINAL** — branded shell, terminal-density tables inside. Probably
  the right answer for most DeFi products.
- **LAB landing → JADE app** — one narrative page for first-time visitors, a
  calm product behind the CTA. They share the near-black ramp and mono-label
  habit, so the seam is small.
- **SOFT + JADE** — rounded small text and glow emphasis dropped onto the tinted
  system when it feels too severe.

Combinations to avoid:

- **LAB + SOFT** — the lab style's credibility comes from being played straight;
  rounded type and glow undercut it immediately.
- **NATIVE + anything** — borrowing a platform's identity only works if nothing
  competes with it. Mixing in a second visual system makes it read as a cheap
  clone.

## Applying a style

When a style is picked, these get set before any component is written:

1. Ground ramp (how many steps, what hue cast)
2. Ink ramp (named greys, or opacity steps)
3. Accent — fill value and text value, separately
4. Type: which faces, mono-first or proportional-first, the size scale
5. Spacing scale
6. Radius scale
7. Separation: hairline, ground-step, or glow — pick one
8. Motion budget: how many ambient loops, and whether anything is scroll-driven
