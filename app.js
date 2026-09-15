/* $VAULT prototype — all data is illustrative / simulated */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmtUSD = (n, d = 0) => '$' + Math.round(n).toLocaleString('en-US', { maximumFractionDigits: d });
  const fmtUSDc = (n) => n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K' : '$' + n.toFixed(2);
  const fmtPct = (n, d = 2) => (n > 0 ? '+' : '') + n.toFixed(d) + '%';
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // deterministic pseudo-random
  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function series(seed, n, drift, vol, start = 100) {
    const r = rng(seed); const out = [start];
    for (let i = 1; i < n; i++) out.push(Math.max(1, out[i - 1] * (1 + drift + (r() - 0.5) * vol)));
    return out;
  }

  /* ---------- vault data (snapshot of app.hyperliquid.xyz/vaults, Sep 2026) ---------- */
  const VAULTS = [
    { id: 'hlp', name: 'Hyperliquidity Provider (HLP)', leader: '0x677d...84e7', apr: 4.98, tvl: 186826865, age: 1228, risk: 1, proto: true, seed: 11, drift: 0.0004, vol: 0.01 },
    { id: 'liq', name: 'Liquidator', leader: '0xfc13...80c9', apr: 0.0, tvl: 15566, age: 1295, risk: 1, proto: true, seed: 12, drift: 0, vol: 0.002 },
    { id: 'sys', name: '[ Systemic Strategies ] L/S Grids', leader: '0x2b80...6f4b', apr: 102.65, tvl: 16325880, age: 599, risk: 2, seed: 21, drift: 0.003, vol: 0.03 },
    { id: 'drk', name: 'drkmttr', leader: '0xf4f7...239f', apr: 645.15, tvl: 11809250, age: 278, risk: 4, seed: 22, drift: 0.008, vol: 0.12 },
    { id: 'growi', name: 'Growi HF', leader: '0x7789...f60d', apr: 59.38, tvl: 11315168, age: 412, risk: 2, seed: 23, drift: 0.002, vol: 0.025 },
    { id: 'hg', name: '[ Systemic Strategies ] HyperGrowth', leader: '0x2b80...6f4b', apr: -1.64, tvl: 9270876, age: 540, risk: 3, seed: 24, drift: -0.0002, vol: 0.04 },
    { id: 'dt', name: 'DOUBLETOP Vault', leader: '0xfb9c...d388', apr: 55.78, tvl: 5218630, age: 366, risk: 2, seed: 25, drift: 0.002, vol: 0.03 },
    { id: 'bredo', name: 'BredoStrategy', leader: '0xf5f5...0336', apr: 1045.63, tvl: 3233459, age: 141, risk: 5, seed: 26, drift: 0.012, vol: 0.18 },
    { id: 'lhbtc', name: 'Long HYPE & BTC | Short Garbage', leader: '0xa380...d939', apr: 201.21, tvl: 2584943, age: 233, risk: 3, seed: 27, drift: 0.005, vol: 0.07 },
    { id: 'fcq', name: 'FC Genesis - Quantum', leader: '0x3d32...cfec', apr: 7.95, tvl: 2173051, age: 480, risk: 1, seed: 28, drift: 0.0005, vol: 0.015 },
    { id: 'btcma', name: 'Bitcoin Moving Average Long/Short', leader: '0x1fa1...1d08', apr: -20.32, tvl: 2108562, age: 610, risk: 3, seed: 29, drift: -0.001, vol: 0.05 },
    { id: 'enj', name: 'Enjoyooor V3', leader: '0x8304...42b9', apr: 1361.39, tvl: 1940725, age: 97, risk: 5, seed: 30, drift: 0.015, vol: 0.22 },
  ];
  VAULTS.forEach(v => v.spark = series(v.seed, 40, v.drift, v.vol));
  let range = '30D';
  // rotation policy: the treasury auto-selects the top-APR (30D) vault that passes these limits
  const POLICY = { minTvl: 1e6, minAge: 120 };
  const passes = v => v.tvl >= POLICY.minTvl && v.age >= POLICY.minAge;
  const ranked = VAULTS.filter(passes).sort((a, b) => b.apr - a.apr);
  const selectedId = ranked[0].id;

  /* ---------- canvas utils ---------- */
  function setupCanvas(c, h) {
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth || c.width;
    const hh = h || c.clientHeight || c.height;
    c.width = w * dpr; c.height = hh * dpr;
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h: hh };
  }
  function drawSpark(c, data, color, fill = true) {
    const { ctx, w, h } = setupCanvas(c);
    const min = Math.min(...data), max = Math.max(...data), sp = max - min || 1;
    const x = i => (i / (data.length - 1)) * w, y = v => h - 2 - ((v - min) / sp) * (h - 4);
    ctx.clearRect(0, 0, w, h);
    if (fill) {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, color + '55'); g.addColorStop(1, color + '00');
      ctx.beginPath(); ctx.moveTo(x(0), h); data.forEach((v, i) => ctx.lineTo(x(i), y(v))); ctx.lineTo(w, h); ctx.closePath();
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.beginPath(); data.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
    ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke();
  }

  /* ---------- hero chart + ticker + countdown ---------- */
  const heroData = series(7, 24, 0.12, 0.06, 1); // launch day, hourly
  function drawHero() {
    const c = $('#heroChart'); const { ctx, w, h } = setupCanvas(c, 140);
    const lime = css('--lime');
    // grid
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, (h / 4) * i); ctx.lineTo(w, (h / 4) * i); ctx.stroke(); }
    drawSparkOn(ctx, w, h, heroData, lime);
    // end dot
    ctx.fillStyle = lime; ctx.beginPath(); ctx.arc(w - 2, yOf(heroData, h, heroData[heroData.length - 1]), 3.5, 0, Math.PI * 2); ctx.fill();
  }
  function yOf(data, h, v) { const min = Math.min(...data), max = Math.max(...data); return h - 4 - ((v - min) / ((max - min) || 1)) * (h - 8); }
  function drawSparkOn(ctx, w, h, data, color) {
    const x = i => (i / (data.length - 1)) * w;
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, color + '44'); g.addColorStop(1, color + '00');
    ctx.beginPath(); ctx.moveTo(0, h); data.forEach((v, i) => ctx.lineTo(x(i), yOf(data, h, v))); ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); data.forEach((v, i) => i ? ctx.lineTo(x(i), yOf(data, h, v)) : ctx.moveTo(x(i), yOf(data, h, v)));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function buildTicker() {
    const items = VAULTS.filter(v => !v.proto).map(v => `<span><b>${v.name.replace(/\[ Systemic Strategies \] /, 'SYS · ')}</b>APR <span class="${v.apr >= 0 ? 'up' : 'down'}">${fmtPct(v.apr)}</span> · TVL ${fmtUSDc(v.tvl)}</span>`);
    items.unshift('<span><b>$VAULT</b>$0.00412 <span class="up">+18.4%</span> · vol 24h $612K · Robinhood Chain</span>');
    items.push('<span><b>TREASURY</b>100% of fees · $85.5K in HyperEVM vault · <span class="up">+20%</span> 24h</span>', '<span><b>EPOCH #01</b>first snapshot Sep 22 · epochs every 7 days · no payouts yet</span>');
    $('#tickerTrack').innerHTML = items.join('') + items.join('');
  }

  function tickCountdown() {
    // epochs are 7 days: first snapshot Sep 22, 2026 00:00 UTC (launch Sep 08)
    const next = Date.UTC(2026, 8, 22), prev = Date.UTC(2026, 8, 15);
    const now = Date.now(); const ms = Math.max(0, next - now);
    const d = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    $('#countdown').textContent = `${d}d ${String(hh).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    const p = Math.min(100, Math.max(0, ((now - prev) / (next - prev)) * 100));
    $('#epochProgress').style.width = p.toFixed(1) + '%';
    $('#epochProgressLabel').textContent = `${p.toFixed(0)}% of epoch elapsed`;
  }

  /* ---------- vault table ---------- */
  function riskHtml(r) { return `<span class="risk r${r}">${'<i></i>'.repeat(5)}</span>`; }
  function aprFor(v) { return range === '7D' ? v.apr * (0.6 + (v.seed % 7) / 10) : range === 'ALL' ? v.apr * 0.55 : v.apr; }

  function renderTable() {
    const tb = $('#vaultTable tbody'); tb.innerHTML = '';
    const ordered = [VAULTS.find(v => v.id === selectedId), ...VAULTS.filter(v => v.id !== selectedId)];
    [ordered].forEach(rows => {
      rows.forEach((v, idx) => {
        if (idx === 1) tb.insertAdjacentHTML('beforeend', '<tr class="group"><td colspan="8">Other vaults · for comparison only · not receiving the treasury</td></tr>');
        const apr = aprFor(v);
        const tr = document.createElement('tr');
        tr.dataset.id = v.id; if (v.id === selectedId) tr.classList.add('is-selected');
        const ok = passes(v);
        const status = v.id === selectedId ? '<span class="st st--active">ACTIVE · EPOCH #01</span>' : ok ? '<span class="st st--ok">ELIGIBLE</span>' : '<span class="st st--no">OUT OF POLICY</span>';
        tr.innerHTML = `
          <td class="name">${v.id === selectedId ? '<small class="active-tag">Active vault · epoch #01 · treasury is here</small>' : ''}${v.name}${v.proto ? '<span class="tag-proto">HL</span>' : ''}</td>
          <td class="addr">${v.leader}</td>
          <td class="num ${apr >= 0 ? 'up' : 'down'}">${fmtPct(apr)}</td>
          <td class="num">${fmtUSD(v.tvl)}</td>
          <td class="num">${v.age}</td>
          <td class="num">${riskHtml(v.risk)}</td>
          <td><canvas class="spark" width="88" height="28"></canvas></td>
          <td>${status}</td>`;
        tb.appendChild(tr);
        drawSpark($('canvas', tr), v.spark, apr >= 0 ? css('--lime') : css('--red'));
      });
    });
  }

  function renderDetail() {
    const v = VAULTS.find(x => x.id === selectedId); const apr = aprFor(v);
    const weekly = apr / 52;
    const why = {
      1: ['Protocol-run market making, deep liquidity', 'Lowest drawdown profile on Hyperliquid', 'Best fit for capital preservation'],
      2: ['Consistent 30d and 90d returns', 'Delta-neutral grid exposure, moderate drawdown', 'TVL large enough to absorb treasury deposits'],
      3: ['Long the two strongest assets on Hyperliquid, short weak alts', 'Best 30d return among vaults inside policy', 'Directional exposure — higher variance, monitored monthly'],
      4: ['Very high APR with high leverage', 'Short track record; drawdowns > 30% observed', 'Community vote required before routing fees here'],
      5: ['Highest 30d APR on Hyperliquid right now', 'Aggressive leveraged strategy — high variance, monitored daily', 'Re-evaluated at every weekly snapshot; rotates out if it drops from #1'],
    }[v.risk];
    $('#vaultDetail').innerHTML = `
      <div class="panel vd">
        <div class="vd__head">
          <div><span class="k">Active vault · auto-selected at launch (Sep 15)</span><h3>${v.name}</h3><span class="muted mono">${v.leader} · age ${v.age}d</span></div>
          <span class="chip"><span class="dot dot--live"></span> ${range} window</span>
        </div>
        <canvas id="vdChart"></canvas>
        <div class="vd__stats">
          <div><span class="k">APR (${range})</span><span class="v mono ${apr >= 0 ? 'up' : 'down'}">${fmtPct(apr)}</span></div>
          <div><span class="k">Weekly, simple</span><span class="v mono">${fmtPct(weekly)}</span></div>
          <div><span class="k">TVL</span><span class="v mono">${fmtUSDc(v.tvl)}</span></div>
          <div><span class="k">Treasury share of TVL</span><span class="v mono">${(START_TREASURY / v.tvl * 100).toFixed(3)}%</span></div>
        </div>
      </div>
      <div class="panel vd__why">
        <h4>Why it was picked · risk ${v.risk}/5</h4>
        <ul>${why.map(w => `<li>${w}</li>`).join('')}</ul>
        <h4 style="margin-top:18px">Rotation ranking · next snapshot Sep 22</h4>
        <ol class="rank">${ranked.slice(0, 4).map((r, i) => `<li class="${r.id === selectedId ? 'is-active' : ''}"><span class="n">#${i + 1}</span><span class="name">${r.name}</span><span class="mono ${r.apr >= 0 ? 'up' : 'down'}">${fmtPct(r.apr)}</span></li>`).join('')}</ol>
        <p class="fine" style="margin-top:12px">Policy: TVL ≥ $1M, age ≥ 120 days, highest 30D APR wins. The top-ranked vault at each weekly snapshot receives the treasury automatically.</p>
      </div>`;
    drawSpark($('#vdChart'), v.spark, apr >= 0 ? css('--lime') : css('--red'));
  }

  /* ---------- simple calculator ---------- */
  let lastPool = 0;
  const SUPPLY = 1e9, START_TREASURY = 6200, FEE = 0.015, TO_VAULT = 1.0, ELIGIBLE = 0.42, TEAM_CUT = 0.01, AVG_MULT = 2; // team: 1% of yield after each epoch
  // progressive: day 0 = ×0, linear to ×2 at day 7, then +0.1/day, capped at ×4 (day 27)
  const holdMult = d => d <= 0 ? 0 : d <= 7 ? +(d * 2 / 7).toFixed(2) : Math.min(4, +(2 + (d - 7) * 0.1).toFixed(2));
  window.holdMult = holdMult;

  function calc() {
    const v = VAULTS.find(x => x.id === selectedId); const apr = aprFor(v) / 100;
    const tokens = Math.max(0, +$('#tokens').value || 0), dvol = Math.max(0, +$('#dvol').value || 0), days = Math.max(0, Math.floor(+$('#days').value || 0));
    $('#calcVaultName').textContent = v.name; $('#calcVaultApr').textContent = fmtPct(aprFor(v)) + ' APR';
    $('#calcVaultApr').className = 'mono ' + (apr >= 0 ? 'up' : 'down');

    const fees = dvol * 7 * FEE * TO_VAULT;                  // fees routed to vault this week
    const yieldM = Math.max(0, (START_TREASURY + fees) * apr / 52); // vault yield this 7-day epoch
    const team = yieldM * TEAM_CUT;
    const pool = yieldM - team;                                // distributed to verified holders
    const mult = holdMult(days);
    const share = Math.min(1, tokens * mult / (SUPPLY * ELIGIBLE * AVG_MULT)); // balance × multiplier vs everyone's
    const month = pool * share;

    $('#rMonth').textContent = month < 100 ? '$' + month.toFixed(2) : fmtUSD(month);
    $('#rDay').textContent = '$' + (month / 7).toFixed(2);
    $('#bMult').firstChild.textContent = '×' + mult.toFixed(2) + ' '; $('#bMultNote').textContent = '· ' + days + ' days held' + (mult === 0 ? ' · hold at least 1 day' : '');
    $('#bFees').textContent = fmtUSD(fees); $('#bYield').textContent = fmtUSD(yieldM); $('#bTeam').textContent = fmtUSD(team); $('#bPool').textContent = fmtUSD(pool);
    $('#bShare').textContent = (share * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + '%';
    $('#nextPool').textContent = fmtUSD(pool); lastPool = pool;
    const ep = $('#epochPool'); if (ep) ep.textContent = '~' + fmtUSD(pool);
    $$('.presets').forEach(p => { const val = +$('#' + p.dataset.for).value; $$('button', p).forEach(bt => bt.classList.toggle('is-on', +bt.dataset.v === val)); });
  }

  /* ---------- epoch timeline (project just launched) ---------- */
  const EPOCHS = [
    ['#02', 'Sep 29 2026', 'plan', 0, 'Vault re-selected at the Sep 29 snapshot'],
    ['#01', 'Sep 22 2026', 'next', -1, 'BredoStrategy · first snapshot Sep 22 00:00 UTC · 7-day epoch'],
    ['—', 'Sep 15 2026 · today', 'launch', 0, '$VAULT launched on Robinhood Chain · treasury bridged to HyperEVM'],
  ];
  function renderEpochs() {
    $('#epochs').innerHTML = EPOCHS.map(([n, d, st, pool, note]) => `
      <li><span class="ep">${n}</span>
        <span class="name">${d}<small>${note}</small></span>
        <span class="st st--${st}">${{ next: 'UPCOMING', plan: 'SCHEDULED', launch: 'LAUNCHED' }[st]}</span>
        <span class="hold">${st === 'next' ? '1,204 verified' : st === 'launch' ? '2,870 wallets' : '—'}</span>
        <span class="pool ${st === 'next' ? 'lime' : ''}">${pool < 0 ? '<span id="epochPool">—</span>' : '—'}</span></li>`).join('');
  }

  /* ---------- cluster graph (illustrative layout; counts come from the real scan when configured) ---------- */
  function drawCluster(verified = 1204, excluded = 1666) {
    const svg = $('#clusterSvg'); const r = rng(99); const W = 520, H = 300;
    const nodes = [], edges = [];
    const lime = css('--lime'), red = css('--red'), grey = css('--muted-2');
    const total = Math.max(1, verified + excluded);
    const N = 90; const nv = Math.max(4, Math.round(N * verified / total)); const nx = N - nv;
    for (let i = 0; i < nv; i++) nodes.push({ x: 30 + r() * 300, y: 30 + r() * 240, t: 'ok', s: 3 + r() * 4 });
    for (let i = 0; i < 8; i++) nodes.push({ x: 30 + r() * 300, y: 30 + r() * 240, t: 'pend', s: 3 });
    const hubs = [{ x: 420, y: 80 }, { x: 440, y: 220 }]; const per = Math.max(3, Math.round(nx / hubs.length));
    hubs.forEach(hb => {
      const hi = nodes.push({ x: hb.x, y: hb.y, t: 'bad', s: 8 }) - 1;
      for (let i = 0; i < per; i++) {
        const ang = r() * Math.PI * 2, d = 28 + r() * 40;
        const ni = nodes.push({ x: hb.x + Math.cos(ang) * d, y: hb.y + Math.sin(ang) * d, t: 'bad', s: 2.5 }) - 1;
        edges.push([hi, ni]);
      }
    });
    for (let i = 0; i < 18; i++) edges.push([Math.floor(r() * nv), Math.floor(r() * nv)]);
    const col = t => t === 'ok' ? lime : t === 'bad' ? red : grey;
    let out = '';
    edges.forEach(([a, b]) => { const A = nodes[a], B = nodes[b]; out += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="${A.t === 'bad' ? red : 'rgba(255,255,255,.12)'}" stroke-opacity="${A.t === 'bad' ? .45 : 1}" stroke-width="1"/>`; });
    hubs.forEach(hb => out += `<circle cx="${hb.x}" cy="${hb.y}" r="74" fill="${red}" fill-opacity=".06" stroke="${red}" stroke-opacity=".35" stroke-dasharray="4 4"/>`);
    nodes.forEach(n => out += `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.s}" fill="${col(n.t)}" fill-opacity="${n.t === 'pend' ? .9 : 1}"/>`);
    const half = Math.round(excluded / 2);
    out += `<text x="512" y="18" font-family="${css('--mono')}" font-size="10" fill="${red}" text-anchor="end">CLUSTER A · ${half.toLocaleString()} wallets · excluded</text>`;
    out += `<text x="512" y="296" font-family="${css('--mono')}" font-size="10" fill="${red}" text-anchor="end">CLUSTER B · ${(excluded - half).toLocaleString()} wallets · excluded</text>`;
    svg.innerHTML = out;
  }
  window.drawCluster = drawCluster;

  /* ---------- fee donut ---------- */
  function drawFee() {
    const c = $('#feeChart'); const dpr = window.devicePixelRatio || 1; c.width = 200 * dpr; c.height = 200 * dpr;
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const parts = [['Treasury → vault', 100, css('--lime')]];
    let a = -Math.PI / 2;
    parts.forEach(([, p, col]) => {
      const e = a + (p / 100) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(100, 100, 92, a, e); ctx.arc(100, 100, 62, e, a, true); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = css('--panel'); ctx.lineWidth = 3; ctx.stroke(); a = e;
    });
    ctx.fillStyle = css('--text'); ctx.textAlign = 'center'; ctx.font = '600 22px ' + css('--mono'); ctx.fillText('1.5%', 100, 98);
    ctx.fillStyle = css('--muted'); ctx.font = '11px ' + css('--sans'); ctx.fillText('fee per trade', 100, 116);
    $('#feeLegend').innerHTML = parts.map(([n, p, col]) => `<div><i class="sw" style="background:${col}"></i>${n}<span class="mono">${p}%</span></div>`).join('');
  }

  /* ---------- hold-multiplier simulator (progressive by day) ---------- */
  function loyalSim() {
    const el = $('#heldDays'), d = +el.value, MAX = +el.max;
    el.style.setProperty('--fill', ((d - el.min) / (MAX - el.min)) * 100 + '%');
    $('#heldDaysOut').textContent = d + (d === 1 ? ' day' : ' days');
    const m = holdMult(d);
    $('#loyalKeep').textContent = m === 0 ? 'nothing yet' : '×' + m.toFixed(2);
    const vs = $('#loyalStreak'); const rel = m / 2;
    vs.textContent = m === 0 ? 'hold ≥ 1 day to earn' : rel === 1 ? 'same payout' : (rel > 1 ? '+' : '') + Math.round((rel - 1) * 100) + '%';
    vs.className = 'v mono ' + (rel > 1 ? 'lime' : rel < 1 ? 'red' : '');
    const c = $('#loyalChart'); const { ctx, w, h } = setupCanvas(c, 120);
    const lime = css('--lime'), muted = css('--muted');
    ctx.clearRect(0, 0, w, h); const padB = 18, padL = 4, ih = h - padB - 10, iw = w - padL - 4;
    const x = day => padL + (day / MAX) * iw, y = mult => 10 + ih - (mult / 4) * ih;
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; [1, 2, 3, 4].forEach(v => { ctx.beginPath(); ctx.moveTo(padL, y(v)); ctx.lineTo(w, y(v)); ctx.stroke(); });
    const g = ctx.createLinearGradient(0, 10, 0, h); g.addColorStop(0, lime + '44'); g.addColorStop(1, lime + '00');
    ctx.beginPath(); ctx.moveTo(x(0), y(0)); for (let i = 0; i <= MAX; i++) ctx.lineTo(x(i), y(holdMult(i))); ctx.lineTo(x(MAX), y(0)); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); for (let i = 0; i <= MAX; i++) i ? ctx.lineTo(x(i), y(holdMult(i))) : ctx.moveTo(x(i), y(holdMult(i))); ctx.strokeStyle = lime; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = css('--bg'); ctx.beginPath(); ctx.arc(x(d), y(m), 5, 0, 7); ctx.fill(); ctx.strokeStyle = lime; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = muted; ctx.font = '10px ' + css('--mono'); ctx.textAlign = 'left'; ctx.fillText('day 0', padL, h - 4);
    ctx.textAlign = 'center'; ctx.fillText('day 7 · ×2', x(7), h - 4); ctx.fillText('day 27 · ×4 cap', x(27), h - 4);
    ctx.fillStyle = lime; ctx.textAlign = d > MAX * 0.7 ? 'right' : 'left'; ctx.fillText(' ×' + m.toFixed(2) + ' ', x(d), y(m) - 9);
  }

  /* ---------- wire up ---------- */
  buildTicker(); drawHero(); tickCountdown(); setInterval(tickCountdown, 30000);
  renderTable(); renderDetail(); renderEpochs(); drawCluster(); drawFee(); calc(); loyalSim();
  $('#heldDays').addEventListener('input', loyalSim);
  ['tokens', 'dvol', 'days'].forEach(id => $('#' + id).addEventListener('input', calc));
  $$('.presets button').forEach(bt => bt.addEventListener('click', () => { $('#' + bt.parentElement.dataset.for).value = bt.dataset.v; calc(); }));
  $$('#rangeSeg .seg__btn').forEach(b => b.addEventListener('click', () => {
    $$('#rangeSeg .seg__btn').forEach(x => x.classList.remove('is-active')); b.classList.add('is-active');
    range = b.dataset.range; renderTable(); renderDetail(); calc();
  }));
  $('#connectBtn').addEventListener('click', function () { this.textContent = this.textContent === 'Connect' ? '0x3fA9…c21e' : 'Connect'; });
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { drawHero(); renderTable(); renderDetail(); calc(); loyalSim(); }, 120); });
})();
