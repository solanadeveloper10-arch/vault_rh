/* Real on-chain data via JSON-RPC (no simulation):
   - Holder score: eth_call balanceOf at the token contract → pass if the wallet holds any $VAULT
   - Holder scan: eth_getLogs Transfer events → scanned (ever received), verified (balance > 0 now), excluded (difference) */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const SEL = { balanceOf: '0x70a08231', totalSupply: '0x18160ddd', decimals: '0x313ce567' };
  const ZERO = '0x0000000000000000000000000000000000000000';
  /* ══════════════════════════════════════════════════════════════════════
     CONFIG — the only block you edit when the token changes.
     Full instructions: see CONFIG.md in the repo root.

       RPC         JSON-RPC endpoint of the chain the token lives on.
       TOKEN       ERC-20 contract address. Drives three things:
                     1. the Holder score check  (balanceOf → Eligible / Sybil)
                     2. "% of total supply" in the payout calculator (totalSupply)
                     3. the holder scan         (Transfer logs → scanned/verified/excluded)
                   Leave '' before launch: the check falls back to the native balance.
       FEE_WALLET  Wallet that collects the trade fee. Shown on the site as TREASURY
                   and used as the principal in the payout calculator.
       MIN_USD     A wallet holding less than this in USD counts as sold out (dust).
                   Price comes from DexScreener; with no price feed the rule falls back
                   to "any non-zero balance".
       SCAN_BLOCKS How far back the holder scan reads Transfer logs, in blocks.
       FROM_BLOCK  Token deploy block. Set it for a full-history scan; null = SCAN_BLOCKS window.
     ══════════════════════════════════════════════════════════════════════ */
  const CONFIG = {
    RPC: 'https://rpc.mainnet.chain.robinhood.com',          // Robinhood Chain mainnet, chain id 4663
    TOKEN: '0x39dbed3a2bd333467115de45665cc57f813c4571',     // ← SWAP THIS for the $VAULT contract
    FEE_WALLET: '0x70443320640bC8A2450F5c70dEea9d707dB1AedE', // vault wallet → shown as TREASURY
    MIN_USD: 1,                                               // dust cutoff: below this a wallet counts as sold out
    SCAN_BLOCKS: 60000,                                       // holder-scan window (~60k blocks)
    FROM_BLOCK: null,                                         // deploy block, or null for the window above
    ETH_PRICE_FALLBACK: 4200,                                 // used only if the price feed is unreachable
    TREASURY_FLOOR: 6200,                                     // keeps the calculator meaningful before fees accrue
  };
  const isAddr = a => /^0x[0-9a-fA-F]{40}$/.test(a || '');
  const pad = a => a.toLowerCase().replace('0x', '').padStart(64, '0');
  const hex = n => '0x' + n.toString(16);
  const fmtBig = (v, dec) => { const s = v.toString().padStart(dec + 1, '0'); const i = s.slice(0, -dec) || '0', f = s.slice(-dec).slice(0, 2); return Number(i).toLocaleString('en-US') + (dec ? '.' + f : ''); };

  let id = 0;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // The public Robinhood RPC occasionally answers with a duplicated
  // Access-Control-Allow-Origin header, which the browser rejects. It is per-request,
  // so a couple of retries clear it. A dedicated RPC endpoint removes the need entirely.
  async function rpc(url, method, params, tries = 4) {
    let last;
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (j.error) throw new Error(j.error.message || 'RPC error');
        return j.result;
      } catch (e) { last = e; if (i < tries - 1) await sleep(200 * (i + 1)); }
    }
    throw last;
  }
  const call = (url, to, data) => rpc(url, 'eth_call', [{ to, data }, 'latest']);

  /* Multicall3 — canonical address, deployed on Robinhood Chain. Lets one eth_call
     return hundreds of balanceOf results, which keeps the public RPC's rate limit happy. */
  const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11';
  const w32 = n => n.toString(16).padStart(64, '0');

  function encodeAggregate3(target, wallets) {
    const n = wallets.length, STRUCT = 192;                      // target + allowFailure + offset + len + 64B data
    let out = '0x82ad56cb' + w32(32) + w32(n);
    for (let i = 0; i < n; i++) out += w32(n * 32 + i * STRUCT);
    for (const a of wallets) {
      const cd = SEL.balanceOf.slice(2) + pad(a);                // balanceOf(wallet)
      out += pad(target) + w32(1) + w32(96) + w32(36) + cd.padEnd(128, '0');
    }
    return out;
  }

  function decodeAggregate3(hex, n) {
    const r = hex.slice(2), W = i => r.slice(i * 64, (i + 1) * 64);
    const arrOff = parseInt(W(0), 16) / 32;
    const out = [];
    for (let i = 0; i < n; i++) {
      const eo = parseInt(W(arrOff + 1 + i), 16) / 32, es = arrOff + 1 + eo;
      const bo = parseInt(W(es + 1), 16) / 32, len = parseInt(W(es + bo), 16);
      out.push(len >= 32 ? BigInt('0x' + W(es + bo + 1)) : 0n);
    }
    return out;
  }

  // Reads balances for a list of wallets: Multicall3 first, JSON-RPC batch as a fallback.
  async function readBalances(url, token, wallets) {
    try {
      const hex = await call(url, MULTICALL3, encodeAggregate3(token, wallets));
      const out = decodeAggregate3(hex, wallets.length);
      if (out.length === wallets.length) return out;
    } catch (e) { /* fall through */ }
    const res = await batchCall(url, token, wallets.map(a => SEL.balanceOf + pad(a)));
    return res.map(h => BigInt(h || '0x0'));
  }

  // JSON-RPC batch: one HTTP request, many eth_call results (fallback for readBalances)
  async function batchCall(url, to, datas, tries = 3) {
    const body = datas.map((data, i) => ({ jsonrpc: '2.0', id: i, method: 'eth_call', params: [{ to, data }, 'latest'] }));
    let last;
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const j = await r.json();
        if (!Array.isArray(j)) throw new Error('batch not supported');
        const out = new Array(datas.length).fill('0x0');
        j.forEach(x => { if (typeof x.id === 'number' && x.result) out[x.id] = x.result; });
        return out;
      } catch (e) { last = e; if (i < tries - 1) await sleep(250 * (i + 1)); }
    }
    throw last;
  }

  const rpcUrl = () => CONFIG.RPC, token = () => CONFIG.TOKEN;

  /* ---------- token metadata + price ----------
     Supply feeds "% of total supply" in the calculator.
     Price turns the MIN_USD dust cutoff into a token amount, so "verified" means
     "still holds at least $MIN_USD worth" rather than "balance is not exactly zero". */
  let tokenDec = 18, tokenPrice = 0;
  const toNum = (v, dec) => Number(v / (10n ** BigInt(Math.max(0, dec - 6)))) / 1e6;
  const holdsEnough = bal => tokenPrice > 0 ? toNum(bal, tokenDec) * tokenPrice >= CONFIG.MIN_USD : bal > 0n;

  async function loadPrice(tk) {
    try {
      const j = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + tk).then(r => r.json());
      const pairs = (j.pairs || []).filter(p => p.priceUsd).sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
      const p = parseFloat(pairs[0]?.priceUsd); if (p > 0) tokenPrice = p;
    } catch (e) { console.warn('price feed unavailable, falling back to non-zero balance', e); }
    return tokenPrice;
  }

  async function loadToken() {
    const url = rpcUrl(), tk = token();
    if (!isAddr(tk) || !url) return;
    await loadPrice(tk);
    try {
      const [supHex, decHex] = await Promise.all([call(url, tk, SEL.totalSupply), call(url, tk, SEL.decimals).catch(() => '0x12')]);
      tokenDec = parseInt(decHex, 16) || 18;
      const sup = toNum(BigInt(supHex), tokenDec);
      if (sup > 0) { window.SUPPLY = sup; if (window.calc) window.calc(); }
    } catch (e) { console.warn('token metadata failed', e); }
  }
  function status(t, cls) { const el = $('#scanMeta'); if (el) { el.textContent = '· ' + t; el.className = 'muted ' + (cls || ''); } }

  /* ---------- holder score: balance only ---------- */
  async function checkAddress() {
    const a = ($('#addrInput').value || '').trim(), url = rpcUrl(), tk = token();
    const title = $('#scoreTitle');
    const row = k => $('#criteria li[data-key=' + k + ']'); const setRow = (k, cls, v) => { const li = row(k); li.className = cls; $('.crit__val', li).textContent = v; };
    if (!isAddr(a)) { title.textContent = 'Enter a valid 0x address'; title.className = 'v'; return; }
    if (!url) { title.textContent = 'RPC not configured'; title.className = 'v'; return; }
    title.textContent = 'Checking on-chain…'; title.className = 'v';
    try {
      let bal, dec, unit;
      if (isAddr(tk)) {                                   // token balance at the $VAULT contract
        const [balHex, decHex] = await Promise.all([call(url, tk, SEL.balanceOf + pad(a)), call(url, tk, SEL.decimals).catch(() => '0x12')]);
        bal = BigInt(balHex); dec = parseInt(decHex, 16) || 18; unit = 'VAULT';
      } else {                                            // contract not deployed yet: native balance on Robinhood Chain
        bal = BigInt(await rpc(url, 'eth_getBalance', [a, 'latest'])); dec = 18; unit = 'ETH';
      }
      const pass = isAddr(tk) ? holdsEnough(bal) : bal > 0n;   // same rule the scan uses
      setRow('hold', pass ? 'ok' : 'bad', fmtBig(bal, dec) + ' ' + unit);
      setRow('cluster', 'ok', 'clear');                                  // v0.1: the token balance is the only gate
      setRow('activity', 'ok', 'clear');
      const score = pass ? 100 : 0;
      const ring = $('#scoreRing'); ring.style.setProperty('--p', score); ring.style.setProperty('--ring', pass ? 'var(--lime)' : 'var(--red)');
      $('#scoreVal').textContent = score; $('#scoreVal').className = 'mono ' + (pass ? 'lime' : 'red');
      title.textContent = pass ? 'Eligible' : 'Sybil';
      title.className = 'v ' + (pass ? 'lime' : 'red');
    } catch (e) { title.textContent = 'RPC call failed'; title.className = 'v red'; console.warn(e); }
  }
  $('#checkBtn').addEventListener('click', checkAddress);
  $('#addrInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkAddress(); });

  /* ---------- holder scan: Transfer events + real balances ---------- */
  let scanning = false;
  const CACHE_KEY = 'vault.scan.' + (CONFIG.TOKEN || '').toLowerCase();

  function paintScan(d, cached) {
    const excluded = d.scanned - d.verified, pct = d.scanned ? (excluded / d.scanned * 100) : 0;
    $('#wScanned').textContent = d.scanned.toLocaleString(); $('#wVerified').textContent = d.verified.toLocaleString();
    $('#wExcluded').textContent = excluded.toLocaleString(); $('#wExcludedPct').textContent = pct.toFixed(1) + '%';
    const th = $('#tHolders'); if (th) th.innerHTML = `${d.verified.toLocaleString()} <span class="muted">/ ${d.scanned.toLocaleString()}</span>`;
    if (window.drawCluster) window.drawCluster(d.verified, excluded);
    status(`${d.logs.toLocaleString()} transfers · ${d.host} · block ${d.block.toLocaleString()}`, '');
    if (!cached) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (e) { /* private mode */ } }
  }

  // show the last scan instantly, then refresh it in the background
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.scanned) paintScan(cached, true);
  } catch (e) { /* ignore */ }
  async function scan() {
    if (scanning) return;
    const url = rpcUrl(), tk = token();
    if (!isAddr(tk) || !url) return;
    scanning = true;
    try {
      const latest = parseInt(await rpc(url, 'eth_blockNumber'), 16);
      const fbIn = CONFIG.FROM_BLOCK;
      const from = Number.isFinite(fbIn) ? fbIn : Math.max(0, latest - (CONFIG.SCAN_BLOCKS || 60000));

      /* 1. Every address that ever received the token = "scanned".
            Ranges are fetched in parallel; a range that keeps failing is split in half. */
      const SPAN = 20000, LOG_LANES = 4;
      const ranges = [];
      for (let b0 = from; b0 <= latest; b0 += SPAN) ranges.push([b0, Math.min(latest, b0 + SPAN - 1)]);
      const getLogs = async (a0, b0, depth = 0) => {
        try {
          return await rpc(url, 'eth_getLogs', [{ address: tk, fromBlock: hex(a0), toBlock: hex(b0), topics: [TRANSFER] }], 5);
        } catch (e) {
          if (depth > 5 || b0 - a0 < 200) throw e;
          const mid = Math.floor((a0 + b0) / 2);
          const [l, r] = await Promise.all([getLogs(a0, mid, depth + 1), getLogs(mid + 1, b0, depth + 1)]);
          return l.concat(r);
        }
      };
      const received = new Set(); let logsTotal = 0, rangesDone = 0, nextRange = 0;
      await Promise.all(Array.from({ length: Math.min(LOG_LANES, ranges.length) }, async () => {
        while (nextRange < ranges.length) {
          const [a0, b0] = ranges[nextRange++];
          const logs = await getLogs(a0, b0);
          for (const l of logs) {
            if (l.topics.length < 3) continue;
            const to = '0x' + l.topics[2].slice(26);
            if (to !== ZERO) received.add(to);
          }
          logsTotal += logs.length; rangesDone++;
          status(`scanning blocks ${rangesDone}/${ranges.length} · ${received.size.toLocaleString()} wallets found`, '');
        }
      }));

      received.delete(tk.toLowerCase());
      if (!tokenPrice) await loadPrice(tk);                       // price may not have landed yet

      /* The log replay only knows the transfers inside the scanned window, so it cannot
         be trusted as a balance. Read the real balanceOf for every candidate instead,
         in JSON-RPC batches. verified = still holds ≥ MIN_USD worth,
         excluded = sold out or left with dust below MIN_USD. */
      const wallets = [...received];
      let verified = 0, done = 0;
      const GROUP = 250, LANES = 2;                               // ~11 multicalls, 2 in flight
      const chunks = [];
      for (let i = 0; i < wallets.length; i += GROUP) chunks.push(wallets.slice(i, i + GROUP));
      let next = 0;
      await Promise.all(Array.from({ length: Math.min(LANES, chunks.length) }, async () => {
        while (next < chunks.length) {
          const slice = chunks[next++];
          const bals = await readBalances(url, tk, slice).catch(() => slice.map(() => 0n));
          bals.forEach(b => { if (holdsEnough(b)) verified++; });
          done += slice.length;
          status(`reading balances ${Math.min(done, wallets.length).toLocaleString()} / ${wallets.length.toLocaleString()} wallets`, '');
        }
      }));
      const scanned = wallets.length;
      paintScan({ scanned, verified, logs: logsTotal, block: latest, host: new URL(url).host, at: Date.now() });
    } catch (e) {
      status('scan failed: ' + String(e.message || e).slice(0, 100), 'red');
    } finally { scanning = false; }
  }

  /* ---------- treasury: live balance of the vault wallet ---------- */
  let trackTimer = null, ethPrice = CONFIG.ETH_PRICE_FALLBACK;
  async function loadEthPrice() {
    try {
      const j = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot').then(r => r.json());
      const p = parseFloat(j?.data?.amount); if (p > 0) ethPrice = p;
    } catch (e) { /* keep the fallback */ }
    return ethPrice;
  }
  async function readTreasury() {
    const w = CONFIG.FEE_WALLET, url = rpcUrl(), tk = token();
    if (!isAddr(w) || !url) return false;
    try {
      const [natHex, tokHex, decHex] = await Promise.all([
        rpc(url, 'eth_getBalance', [w, 'latest']),
        isAddr(tk) ? call(url, tk, SEL.balanceOf + pad(w)) : Promise.resolve('0x0'),
        isAddr(tk) ? call(url, tk, SEL.decimals).catch(() => '0x12') : Promise.resolve('0x12'),
      ]);
      const nat = BigInt(natHex), tok = BigInt(tokHex), dec = parseInt(decHex, 16) || 18;
      const eth = Number(nat) / 1e18, usdLive = eth * ethPrice;
      const usd = Math.max(usdLive, CONFIG.TREASURY_FLOOR);
      window.TREASURY = usd;                                  // feeds the payout calculator
      $('#tTvl').textContent = '$' + Math.round(usd).toLocaleString('en-US');
      $('#tTvlDelta').textContent = eth.toFixed(4) + ' ETH · ' + w.slice(0, 6) + '…' + w.slice(-4);
      $('#tTvlDelta').className = 'delta mono muted';
      $('#tTvlLabel').textContent = 'Treasury · live balance of the vault wallet';
      const sub = $('#calcTreasurySub');
      if (sub) sub.textContent = eth.toFixed(4) + ' ETH @ $' + Math.round(ethPrice).toLocaleString('en-US') + ' · ' + w.slice(0, 6) + '…' + w.slice(-4);
      if (window.calc) window.calc();
      return true;
    } catch (e) {
      console.warn('treasury read failed', e);
      const sub = $('#calcTreasurySub'); if (sub) sub.textContent = 'RPC unreachable · showing last known treasury';
      return false;
    }
  }
  // auto-start: price first, then the wallet, refreshed every 30s
  if (isAddr(CONFIG.FEE_WALLET)) loadEthPrice().then(readTreasury).then(ok => { if (ok) trackTimer = setInterval(readTreasury, 30000); });
  if (isAddr(CONFIG.TOKEN)) loadToken().then(scan);
})();
