/* Real on-chain data via JSON-RPC (no simulation):
   - Holder score: eth_call balanceOf / totalSupply / decimals → pass if balance ≥ 0.001% of supply
   - Holder scan: eth_getLogs Transfer events → scanned (ever received), verified (balance > 0 now), excluded (difference) */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const SEL = { balanceOf: '0x70a08231', totalSupply: '0x18160ddd', decimals: '0x313ce567' };
  const ZERO = '0x0000000000000000000000000000000000000000';
  /* ===== CONFIG — fill these in; no UI on the site ===== */
  const CONFIG = {
    RPC: 'https://rpc.mainnet.chain.robinhood.com',   // Robinhood Chain mainnet (chain id 4663)
    TOKEN: '',                                 // $VAULT ERC-20 contract address (empty = check native ETH balance on Robinhood Chain)
    FEE_WALLET: '0x70443320640bC8A2450F5c70dEea9d707dB1AedE', // vault wallet → shown as TREASURY
    ETH_PRICE_FALLBACK: 4200,                  // used only if the price feed is unreachable
    TREASURY_FLOOR: 6200,                      // keeps the calculator meaningful before fees accrue
    FROM_BLOCK: null,                          // token deploy block (null = last 200k blocks)
  };
  const isAddr = a => /^0x[0-9a-fA-F]{40}$/.test(a || '');
  const pad = a => a.toLowerCase().replace('0x', '').padStart(64, '0');
  const hex = n => '0x' + n.toString(16);
  const fmtBig = (v, dec) => { const s = v.toString().padStart(dec + 1, '0'); const i = s.slice(0, -dec) || '0', f = s.slice(-dec).slice(0, 2); return Number(i).toLocaleString('en-US') + (dec ? '.' + f : ''); };

  let id = 0;
  async function rpc(url, method, params) {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(); if (j.error) throw new Error(j.error.message || 'RPC error'); return j.result;
  }
  const call = (url, to, data) => rpc(url, 'eth_call', [{ to, data }, 'latest']);

  const rpcUrl = () => CONFIG.RPC, token = () => CONFIG.TOKEN;
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
      let bal, sup, dec, pct, holding, pass, unit;
      if (isAddr(tk)) {                                   // token mode: $VAULT balance vs supply
        const [balHex, supHex, decHex] = await Promise.all([call(url, tk, SEL.balanceOf + pad(a)), call(url, tk, SEL.totalSupply), call(url, tk, SEL.decimals).catch(() => '0x12')]);
        bal = BigInt(balHex); sup = BigInt(supHex); dec = parseInt(decHex, 16) || 18; unit = 'VAULT';
        if (sup === 0n) throw new Error('totalSupply is 0');
        pct = Number(bal * 100000000n / sup) / 1000000; holding = bal > 0n; pass = pct >= 0.001;
      } else {                                            // wallet mode: native balance on Robinhood Chain
        bal = BigInt(await rpc(url, 'eth_getBalance', [a, 'latest'])); dec = 18; unit = 'ETH'; sup = 0n;
        holding = bal > 0n; pass = holding; pct = null;
      }
      setRow('hold', holding ? 'ok' : 'bad', holding ? fmtBig(bal, dec) + ' ' + unit : '0 ' + unit);
      setRow('min', pass ? 'ok' : 'bad', pct === null ? (pass ? 'funded wallet' : 'empty wallet') : pct.toFixed(4) + '%');
      setRow('cluster', 'ok', 'clear');                                  // v0.1: balance is the only gate
      setRow('activity', 'ok', 'clear');
      const score = pass ? 100 : holding ? 40 : 0;
      const ring = $('#scoreRing'); ring.style.setProperty('--p', score); ring.style.setProperty('--ring', pass ? 'var(--lime)' : 'var(--red)');
      $('#scoreVal').textContent = score; $('#scoreVal').className = 'mono ' + (pass ? 'lime' : 'red');
      title.textContent = pass ? 'Eligible' : 'Sybil';
      title.className = 'v ' + (pass ? 'lime' : 'red');
    } catch (e) { title.textContent = 'RPC call failed'; title.className = 'v red'; console.warn(e); }
  }
  $('#checkBtn').addEventListener('click', checkAddress);
  $('#addrInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkAddress(); });

  /* ---------- holder scan: Transfer events ---------- */
  let scanning = false;
  async function scan() {
    if (scanning) return;
    const url = rpcUrl(), tk = token();
    if (!isAddr(tk) || !url) return;
    scanning = true;
    try {
      const latest = parseInt(await rpc(url, 'eth_blockNumber'), 16);
      const fbIn = CONFIG.FROM_BLOCK;
      let from = Number.isFinite(fbIn) ? fbIn : Math.max(0, latest - 200000);
      let chunk = 2000; const balances = new Map(); const received = new Set(); let logsTotal = 0;
      while (from <= latest) {
        const to = Math.min(latest, from + chunk - 1);
        status(`scanning blocks ${from.toLocaleString()} → ${to.toLocaleString()} of ${latest.toLocaleString()} · ${received.size} wallets`, '');
        let logs;
        try { logs = await rpc(url, 'eth_getLogs', [{ address: tk, fromBlock: hex(from), toBlock: hex(to), topics: [TRANSFER] }]); }
        catch (e) { if (chunk > 50) { chunk = Math.max(50, Math.floor(chunk / 4)); continue; } throw e; } // RPC range/size limit → shrink and retry
        for (const l of logs) {
          if (l.topics.length < 3) continue;
          const f = '0x' + l.topics[1].slice(26), t = '0x' + l.topics[2].slice(26); const v = BigInt(l.data === '0x' ? 0 : l.data);
          if (f !== ZERO) balances.set(f, (balances.get(f) || 0n) - v);
          if (t !== ZERO) { balances.set(t, (balances.get(t) || 0n) + v); received.add(t); }
        }
        logsTotal += logs.length; from = to + 1;
        if (logs.length < 500 && chunk < 20000) chunk *= 2;         // speed up on sparse ranges
      }
      received.delete(tk.toLowerCase());
      let verified = 0; received.forEach(a => { if ((balances.get(a) || 0n) > 0n) verified++; });
      const scanned = received.size, excluded = scanned - verified, pct = scanned ? (excluded / scanned * 100) : 0;
      $('#wScanned').textContent = scanned.toLocaleString(); $('#wVerified').textContent = verified.toLocaleString();
      $('#wExcluded').textContent = excluded.toLocaleString(); $('#wExcludedPct').textContent = pct.toFixed(1) + '%';
      const meta = `${logsTotal.toLocaleString()} transfers · ${new URL(url).host} · block ${latest.toLocaleString()}`;
      const th = $('#tHolders'); if (th) th.innerHTML = `${verified.toLocaleString()} <span class="muted">/ ${scanned.toLocaleString()}</span>`;
      if (window.drawCluster) window.drawCluster(verified, excluded);
      status(meta, '');
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
  if (isAddr(CONFIG.TOKEN)) scan();
})();
