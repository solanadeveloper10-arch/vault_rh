#!/usr/bin/env node
// Capture a site top-to-bottom for the design library.
//
// Scrolls a headless Chrome in steps, waiting at each one so scroll-driven
// animation settles before the shot. Plain CDP over Node's built-in WebSocket —
// no dependencies.
//
//   1. Start Chrome with a debugging port:
//
//      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
//        --headless=new --remote-debugging-port=9222 \
//        --user-data-dir=/tmp/dl-chrome --hide-scrollbars about:blank &
//
//   2. node shoot.mjs https://example.com ./shots
//   3. Downscale:  sips -Z 1440 -s format jpeg -s formatOptions 72 in.png --out out.jpg
//
// Screenshots are third-party work. Keep them as private study reference.

import fs from 'node:fs';
import path from 'node:path';

const [url, out = './shots'] = process.argv.slice(2);
if (!url) {
  console.error('usage: node shoot.mjs <url> [outdir]');
  process.exit(1);
}

const WIDTH = 1440;
const HEIGHT = 900;
const DPR = 2;
const SETTLE_AFTER_LOAD = 9000; // boot sequences, fonts, canvas warm-up
const SETTLE_AFTER_SCROLL = 1400; // scroll-scrubbed scenes need a moment
const STEP = Math.round(HEIGHT * 0.9); // 10% overlap between shots

fs.mkdirSync(out, { recursive: true });

const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
if (!page) {
  console.error('no debuggable page — is Chrome running with --remote-debugging-port=9222?');
  process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let seq = 0;

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result ?? {});
    pending.delete(msg.id);
  }
};
await new Promise((r) => (ws.onopen = r));

const send = (method, params = {}) =>
  new Promise((res) => {
    const id = ++seq;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = (expression) =>
  send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    .then((r) => r.result?.value);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: WIDTH,
  height: HEIGHT,
  deviceScaleFactor: DPR,
  mobile: false,
});
await send('Page.navigate', { url });
await sleep(SETTLE_AFTER_LOAD);

const total = await evaluate('document.body.scrollHeight');
console.log(`page height ${total}px — ${Math.ceil(total / STEP)} shots`);

let i = 0;
for (let y = 0; y < total - 100; y += STEP) {
  await evaluate(`window.scrollTo({ top: ${y}, behavior: 'instant' })`);
  await sleep(SETTLE_AFTER_SCROLL);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  const name = `${String(i).padStart(2, '0')}-y${y}.png`;
  fs.writeFileSync(path.join(out, name), Buffer.from(data, 'base64'));
  console.log('saved', name);
  i++;
}

ws.close();
process.exit(0);
