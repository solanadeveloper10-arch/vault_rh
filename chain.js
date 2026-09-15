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
     CONFIG – the only block you edit when the token changes.
     Full instructions: see CONFIG.md in the repo root.

       RPC         JSON-RPC endpoint of the chain the token lives on.
       TOKEN       ERC-20 contract address. Drives three things:
                     1. the Holder score check  (balanceOf → Eligible / Sybil)
                     2. "% of total supply" in the payout calculator (totalSupply)
                     3. the holder scan         (Transfer logs → scanned/verified/excluded)
                   Leave '' before launch: the check falls back to the native balance.
       FEE_WALLET  Wallet that collects the trade fee. Its native balance is valued at the
                   live ETH price and shown as TREASURY in USDC equivalent; it is also the
                   principal in the payout calculator.
       VAULT       Hyperliquid vault address holding the treasury. Its real name, APR and
                   TVL are read from the Hyperliquid API and drive the payout calculator.
       MIN_USD     A wallet holding less than this in USD counts as sold out (dust).
                   Price comes from DexScreener; with no price feed the rule falls back
                   to "any non-zero balance".
       SCAN_DAYS   How far back the holder scan tries to read Transfer logs. Robinhood Chain
                   produces a block every ~0.1s, so a day is ~840k blocks; the scan converts
                   days to blocks from the measured block time.
       MAX_RANGES  Hard cap on eth_getLogs requests. If SCAN_DAYS needs more, the window is
                   shortened and the panel reports the period actually covered.
       FROM_BLOCK  Token deploy block. Set it at launch for a true full-history scan.
     ══════════════════════════════════════════════════════════════════════ */
  const CONFIG = {
    RPC: 'https://rpc.mainnet.chain.robinhood.com',          // Robinhood Chain mainnet, chain id 4663
    TOKEN: '0x39dbed3a2bd333467115de45665cc57f813c4571',     // ← SWAP THIS for the $VAULT contract
    FEE_WALLET: '0xe9a0f656D0aABF40f47a54CD3F3147373a336dFB', // vault wallet → shown as TREASURY
    VAULT: '0xdfc24b077bc1425ad1dea75bcb6f8158e10df303',       // ← Hyperliquid vault holding the treasury
    MIN_USD: 1,                                               // dust cutoff: below this a wallet counts as sold out
    SCAN_DAYS: 7,                                             // holder-scan window it aims for
    MAX_RANGES: 12,                                           // cap on eth_getLogs requests per scan
    FROM_BLOCK: null,                                         // deploy block, or null for the window above
    ETH_PRICE_FALLBACK: 4200,                                 // used only if the price feed is unreachable
    TREASURY_FLOOR: 0,                                        // no placeholder: the treasury is whatever the wallet holds
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

  /* Multicall3 – canonical address, deployed on Robinhood Chain. Lets one eth_call
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

  /* Reads balances for a list of wallets. Multicall3 first; on failure the group is split
     and retried, then the JSON-RPC batch is tried. It throws rather than returning zeros:
     a failed read must never be mistaken for "this wallet sold everything". */
  async function readBalances(url, token, wallets, depth = 0) {
    try {
      const hex = await call(url, MULTICALL3, encodeAggregate3(token, wallets));
      const out = decodeAggregate3(hex, wallets.length);
      if (out.length === wallets.length) return out;
    } catch (e) { /* fall through */ }
    if (wallets.length > 40 && depth < 3) {
      const mid = Math.ceil(wallets.length / 2);
      const [l, r] = await Promise.all([
        readBalances(url, token, wallets.slice(0, mid), depth + 1),
        readBalances(url, token, wallets.slice(mid), depth + 1),
      ]);
      return l.concat(r);
    }
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

  /* ---------- active vault: real name, APR and TVL from Hyperliquid ---------- */
  async function loadVault() {
    if (!isAddr(CONFIG.VAULT)) return;
    try {
      const d = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type: 'vaultDetails', vaultAddress: CONFIG.VAULT.toLowerCase() }),
      }).then(r => r.json());
      if (!d || !d.name) return;
      const days = d.portfolio ? null : null;
      const info = { name: d.name, apr: Number(d.apr) * 100, tvl: Number(d.maxDistributable) || 0, leader: d.leader || CONFIG.VAULT };
      window.VAULT_INFO = info;
      if (window.setVault) window.setVault(info);
    } catch (e) { console.warn('vault details unavailable, keeping the snapshot row', e); }
  }

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
      const p = parseFloat(pairs[0]?.priceUsd); if (p > 0) { tokenPrice = p; window.TOKEN_PRICE = p; if (window.buildTicker) window.buildTicker(); }
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
      if (sup > 0) {
        window.SUPPLY = sup;
        const el = document.getElementById('tokenSupply');
        if (el) el.textContent = Math.round(sup).toLocaleString('en-US');
        if (window.calc) window.calc();
        if (window.buildTicker) window.buildTicker();
      }
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
  let scanning = false, scanTries = 0;
  const CACHE_KEY = 'vault.scan.' + (CONFIG.TOKEN || '').toLowerCase();

  function paintScan(d, cached) {
    const excluded = d.scanned - d.verified, pct = d.scanned ? (excluded / d.scanned * 100) : 0;
    $('#wScanned').textContent = d.scanned.toLocaleString(); $('#wVerified').textContent = d.verified.toLocaleString();
    $('#wExcluded').textContent = excluded.toLocaleString(); $('#wExcludedPct').textContent = pct.toFixed(1) + '%';
    const th = $('#tHolders'); if (th) th.innerHTML = `${d.verified.toLocaleString()} <span class="muted">/ ${d.scanned.toLocaleString()}</span>`;
    const ev = $('#epochVerified'); if (ev) ev.textContent = d.verified.toLocaleString();
    const es = $('#epochScanned'); if (es) es.textContent = d.scanned.toLocaleString();
    if (window.drawCluster) window.drawCluster(d.verified, excluded);
    if (Number.isFinite(d.eligible) && d.eligible > 0) window.ELIGIBLE = d.eligible;
    if (Number.isFinite(d.avgMult) && d.avgMult > 0) window.AVG_MULT = d.avgMult;
    if (window.calc) window.calc();
    if (window.buildTicker) window.buildTicker();
    window.SCAN = d;
    status(`last ${d.covered || '?'}${d.partial ? ' (partial)' : ''} · ${d.logs.toLocaleString()} transfers · ${d.host} · block ${d.block.toLocaleString()}`, '');
    // only a complete scan is worth remembering; a partial one would freeze bad numbers
    if (!cached && !d.partial) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (e) { /* private mode */ } }
  }

  // show the last scan instantly, then refresh it in the background
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.scanned && cached.verified > 0) paintScan(cached, true);
  } catch (e) { /* ignore */ }
  async function scan() {
    if (scanning) return;
    const url = rpcUrl(), tk = token();
    if (!isAddr(tk) || !url) return;
    scanning = true;
    try {
      const latest = parseInt(await rpc(url, 'eth_blockNumber', [], 8), 16);

      /* Robinhood Chain produces a block roughly every 0.1s, so "how many blocks back"
         is meaningless on its own. Measure the block time, turn SCAN_DAYS into blocks,
         then cap the request count and report the period actually covered. */
      const blockTs = async b => parseInt((await rpc(url, 'eth_getBlockByNumber', [hex(b), false])).timestamp, 16);
      const PROBE = 10000;
      let secPerBlock = 0.1;
      try {
        const [tNow, tOld] = await Promise.all([blockTs(latest), blockTs(Math.max(1, latest - PROBE))]);
        if (tNow > tOld) secPerBlock = (tNow - tOld) / PROBE;
      } catch (e) { /* keep the default */ }
      const blocksPerDay = Math.max(1, Math.round(86400 / secPerBlock));

      const SPAN = 20000, LOG_LANES = 4;
      const maxBlocks = (CONFIG.MAX_RANGES || 40) * SPAN;
      const wanted = Number.isFinite(CONFIG.FROM_BLOCK)
        ? Math.max(0, latest - CONFIG.FROM_BLOCK)
        : (CONFIG.SCAN_DAYS || 7) * blocksPerDay;
      const blocks = Math.min(wanted, maxBlocks);
      const from = Math.max(0, latest - blocks);
      const coveredH = blocks * secPerBlock / 3600;
      const covered = coveredH >= 48 ? (coveredH / 24).toFixed(1) + 'd'
        : coveredH >= 1 ? coveredH.toFixed(1) + 'h'
        : Math.round(coveredH * 60) + 'm';

      /* 1. Every address that ever received the token in that window = "scanned".
            Ranges are fetched in parallel; a range that keeps failing is split in half. */
      const ranges = [];
      for (let b0 = from; b0 <= latest; b0 += SPAN) ranges.push([b0, Math.min(latest, b0 + SPAN - 1)]);
      const getLogs = async (a0, b0, depth = 0) => {
        try {
          return await rpc(url, 'eth_getLogs', [{ address: tk, fromBlock: hex(a0), toBlock: hex(b0), topics: [TRANSFER] }], 2);
        } catch (e) {
          if (depth >= 2 || b0 - a0 < 1000) throw e;
          const mid = Math.floor((a0 + b0) / 2);
          const [l, r] = await Promise.all([getLogs(a0, mid, depth + 1), getLogs(mid + 1, b0, depth + 1)]);
          return l.concat(r);
        }
      };
      const received = new Set(), lastTouch = new Map();
      let logsTotal = 0, rangesDone = 0, nextRange = 0, failed = 0;
      await Promise.all(Array.from({ length: Math.min(LOG_LANES, ranges.length) }, async () => {
        while (nextRange < ranges.length) {
          const [a0, b0] = ranges[nextRange++];
          // a range the RPC will not serve is skipped, not fatal: the scan reports partial coverage
          let logs;
          try { logs = await getLogs(a0, b0); }
          catch (e) { failed++; rangesDone++; continue; }
          for (const l of logs) {
            if (l.topics.length < 3) continue;
            const bn = parseInt(l.blockNumber, 16);
            const f = '0x' + l.topics[1].slice(26), t2 = '0x' + l.topics[2].slice(26);
            if (f !== ZERO) lastTouch.set(f, Math.max(lastTouch.get(f) || 0, bn));
            if (t2 !== ZERO) { received.add(t2); lastTouch.set(t2, Math.max(lastTouch.get(t2) || 0, bn)); }
          }
          logsTotal += logs.length; rangesDone++;
          status(`scanning ${covered} of history · ${rangesDone}/${ranges.length} · ${received.size.toLocaleString()} wallets`, '');
        }
      }));

      received.delete(tk.toLowerCase());
      if (!tokenPrice) await loadPrice(tk);                       // price may not have landed yet

      /* 2. The log replay only knows the transfers inside the window, so it cannot be
            trusted as a balance. Read the real balanceOf for every candidate through
            Multicall3. verified = still holds >= MIN_USD worth; excluded = sold out or dust.
            The same pass sums the verified balances, which gives the real eligible share
            of supply instead of the 42% assumption. */
      const wallets = [...received];
      let verified = 0, done = 0, unread = 0, eligibleRaw = 0n, weighted = 0, weightBase = 0;
      const GROUP = 250, LANES = 2;
      const chunks = [];
      for (let i = 0; i < wallets.length; i += GROUP) chunks.push(wallets.slice(i, i + GROUP));
      let next = 0;
      await Promise.all(Array.from({ length: Math.min(LANES, chunks.length) }, async () => {
        while (next < chunks.length) {
          const idx = next++, slice = chunks[idx];
          let bals = null;
          try { bals = await readBalances(url, tk, slice); }
          catch (e) { unread += slice.length; done += slice.length; continue; }
          bals.forEach((b, j) => {
            if (!holdsEnough(b)) return;
            verified++; eligibleRaw += b;
            const days = (latest - (lastTouch.get(slice[j]) || from)) / blocksPerDay;
            const tokens = toNum(b, tokenDec);
            weighted += tokens * Math.min(2, Math.max(0, days * 2 / 7));
            weightBase += tokens;
          });
          done += slice.length;
          status(`reading balances ${Math.min(done, wallets.length).toLocaleString()} / ${wallets.length.toLocaleString()} wallets`, '');
        }
      }));

      // real eligible share of supply; the average multiplier needs a window of a full epoch
      const eligibleTokens = toNum(eligibleRaw, tokenDec);
      const eligible = window.SUPPLY > 0 ? eligibleTokens / window.SUPPLY : null;
      const avgMult = coveredH >= 168 && weightBase > 0 ? weighted / weightBase : null;

      const scanned = wallets.length - unread;    // wallets whose balance could not be read are left out
      paintScan({ scanned, verified, logs: logsTotal, block: latest, host: new URL(url).host, covered, eligible, avgMult, partial: failed > 0 || unread > 0, at: Date.now() });
    } catch (e) {
      console.warn('scan failed, will retry', e);
      status('rpc busy, retrying…', '');
      scanning = false;
      if (scanTries++ < 4) { await sleep(12000); return scan(); }
      status('scan unavailable, the public RPC refused the request', 'red');
    } finally { scanning = false; }
  }

  /* ---------- treasury: live balance of the vault wallet ---------- */
  let trackTimer = null, ethPrice = CONFIG.ETH_PRICE_FALLBACK;
  const TRE_KEY = 'vault.treasury.' + (CONFIG.FEE_WALLET || '').toLowerCase();

  function paintTreasury(d, cached) {
    window.TREASURY = d.usd;                                   // feeds the payout calculator
    const shown = d.usd >= 1000 ? Math.round(d.usd).toLocaleString('en-US') : d.usd.toFixed(2);
    const short = d.w.slice(0, 6) + '…' + d.w.slice(-4);
    $('#tTvl').textContent = '$' + shown;
    $('#tTvlDelta').textContent = d.eth.toFixed(6) + ' ETH · ' + short;
    $('#tTvlDelta').className = 'delta mono muted';
    $('#tTvlLabel').textContent = 'Treasury · live balance of the vault wallet, in USDC';
    const sub = $('#calcTreasurySub');
    if (sub) sub.textContent = d.eth.toFixed(6) + ' ETH @ $' + Math.round(d.price).toLocaleString('en-US') + ' · ' + short;
    if (window.calc) window.calc();
    if (!cached) { try { localStorage.setItem(TRE_KEY, JSON.stringify(d)); } catch (e) { /* private mode */ } }
  }

  // last known treasury paints instantly; the live read replaces it a moment later
  try {
    const cached = JSON.parse(localStorage.getItem(TRE_KEY) || 'null');
    if (cached && typeof cached.usd === 'number') paintTreasury(cached, true);
  } catch (e) { /* ignore */ }
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
        rpc(url, 'eth_getBalance', [w, 'latest'], 6),
        isAddr(tk) ? call(url, tk, SEL.balanceOf + pad(w)) : Promise.resolve('0x0'),
        isAddr(tk) ? call(url, tk, SEL.decimals).catch(() => '0x12') : Promise.resolve('0x12'),
      ]);
      const nat = BigInt(natHex), tok = BigInt(tokHex), dec = parseInt(decHex, 16) || 18;
      // native ETH held by the vault wallet, valued at the live ETH price = USDC equivalent
      const eth = Number(nat) / 1e18, usd = Math.max(eth * ethPrice, CONFIG.TREASURY_FLOOR);
      paintTreasury({ usd, eth, price: ethPrice, w, at: Date.now() });
      return true;
    } catch (e) {
      console.warn('treasury read failed', e);
      const sub = $('#calcTreasurySub'); if (sub) sub.textContent = 'RPC unreachable · showing last known treasury';
      return false;
    }
  }
  // auto-start: price first, then the wallet, refreshed every 30s
  // always keep the 30s refresh running: a failed read just retries on the next tick
  if (isAddr(CONFIG.FEE_WALLET)) loadEthPrice().then(readTreasury).finally(() => { trackTimer = setInterval(readTreasury, 30000); });
  loadVault();
  if (isAddr(CONFIG.TOKEN)) loadToken().then(scan);
})();
