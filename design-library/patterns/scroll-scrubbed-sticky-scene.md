# Pattern — scroll-scrubbed sticky scene

*Seen on: [basebluechip.com](../sites/basebluechip-com/README.md) (sections 02 and 07)*

## The idea

Instead of playing an animation *when* a section enters the viewport, map the
section's scroll progress directly onto the animation's timeline. The reader
scrubs. Scrolling back rewinds it.

The difference in feel is large and the difference in code is small:

| Scroll-triggered | Scroll-scrubbed |
| --- | --- |
| Fires once, plays on its own clock | Reader controls every frame |
| Scrolling back does nothing (or replays awkwardly) | Scrolling back reverses cleanly |
| Reader waits | Reader operates |

Use it for things that have a natural 0→1 axis: an object rotating, a value
counting up, a scan completing, a curve drawing itself, a before/after wipe.

## The structure

A tall outer section, and a child pinned to the viewport inside it. The extra
height *is* the timeline — `300vh` of section means 200vh of scrolling with the
scene pinned.

```html
<section class="scene" style="height: 240svh">
  <div class="scene-pin"><!-- canvas, SVG, whatever --></div>
</section>
```

```css
.scene-pin {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}
```

Use `svh`, not `vh`. On mobile `vh` is the *largest* viewport height, so a
`100vh` sticky child is taller than the visible area whenever browser chrome is
showing, and the scene's bottom gets clipped.

## Driving it

```js
const scene = document.querySelector('.scene');

function progress() {
  const r = scene.getBoundingClientRect();
  const travel = r.height - innerHeight;      // scrollable distance while pinned
  return Math.min(1, Math.max(0, -r.top / travel));
}
```

`progress()` is 0 when the section's top hits the viewport top, 1 when its
bottom does. Read it inside `requestAnimationFrame`, not in the scroll handler —
scroll events fire faster than frames and `getBoundingClientRect()` forces
layout:

```js
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { render(progress()); ticking = false; });
}, { passive: true });
```

`{ passive: true }` matters — without it the browser can't start scrolling until
the handler returns.

## Making it feel good

**Smooth the value.** Raw scroll progress is jittery on trackpads and violent on
mouse wheels. Lerp toward the target in a persistent rAF loop:

```js
let target = 0, current = 0;
function loop() {
  target = progress();
  current += (target - current) * 0.12;   // 0.08 sluggish, 0.2 responsive
  render(current);
  requestAnimationFrame(loop);
}
```

This is what separates a scene that feels like an instrument from one that feels
like a broken scrollbar.

**Give one progress value to everything.** The lesson from the reference site:
the same number that rotates the object also drives the `ACQUISITION 000%`
readout and the scan-line position. One source of truth, so nothing can
desynchronise.

```js
function render(p) {
  chip.rotation.y = p * Math.PI * 2;
  readout.textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
  scanline.style.transform = `translateY(${p * 100}%)`;
}
```

**Stage it.** Don't run one linear ramp for 240svh. Split the timeline into
phases and remap each to its own 0→1:

```js
const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
// 0–0.3 fade in, 0.25–0.8 rotate, 0.7–1 pull back
```

Overlapping the ranges slightly (0.25 starting before 0.3 ends) avoids visible
seams between phases.

**Respect the setting.** A scrubbed scene has no autoplay to disable, but the
smoothing and any ambient loop should still stop:

```css
@media (prefers-reduced-motion: reduce) { .scene { height: auto } .scene-pin { position: static } }
```

Then render a static frame at `p = 0.5` and let the section be a normal image.

## Costs

- **The height is a lie to the scrollbar.** 240svh of section for one scene makes
  the page look far longer than it reads. Budget it: two scrubbed scenes in a
  14-section page was the reference's ratio, and it was already a lot.
- **Nothing is linkable.** A reader can't deep-link to "the part where it's
  rotated". Fine for a narrative page, wrong for reference content.
- **It costs a frame budget.** If `render()` can't finish in ~8ms, scrolling
  itself stutters and the whole page feels broken — worse than no animation.
  Profile on the slowest device you care about before committing.

## In this project

Best candidate: the multiplier curve. Scrub day 1 → day 7, with the multiplier
readout, the curve draw and the example payout all driven by the same `p`.
