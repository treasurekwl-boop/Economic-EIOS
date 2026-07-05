// ─────────────────────────────────────────────────────────────────────────────
// MLKIT — the honestly-buildable slice of the AI-forecasting brief: UNSUPERVISED
// methods computed transparently in the browser on an EOD close series. No deep
// learning, no training infra — just k-means regime clustering and robust (MAD)
// anomaly detection. Everything the brief describes as supervised deep / RL / GNN
// needs a Python+GPU backend and is deliberately NOT faked here.
// ─────────────────────────────────────────────────────────────────────────────

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const std = (a) => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const median = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const h = Math.floor(s.length / 2); return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const logReturns = (s) => { const r = []; for (let i = 1; i < s.length; i++) if (s[i - 1] > 0) r.push(Math.log(s[i] / s[i - 1])); return r; };

// Robust anomaly flags on daily returns: z = (r − median) / (1.4826·MAD) over a
// trailing window. |z| > k marks a statistically unusual move. Returns per-day
// {i, ret, z, anom} aligned to the return series (oldest→newest).
export function anomalies(closes, win = 40, k = 3.5) {
  const r = logReturns(closes), out = [];
  for (let i = 0; i < r.length; i++) {
    const w = r.slice(Math.max(0, i - win), i);
    if (w.length < 10) { out.push({ i, ret: r[i], z: 0, anom: false }); continue; }
    const med = median(w), mad = median(w.map((x) => Math.abs(x - med))) || 1e-9;
    const z = (r[i] - med) / (1.4826 * mad);
    out.push({ i, ret: r[i], z, anom: Math.abs(z) > k });
  }
  return out;
}

// Small deterministic 2-D k-means (init spreads seeds by index → stable regimes).
export function kmeans(pts, K = 3, iters = 40) {
  const n = pts.length;
  if (n < K) return { assign: pts.map(() => 0), centroids: pts.slice() };
  const cent = [];
  for (let kk = 0; kk < K; kk++) cent.push(pts[Math.round((kk * (n - 1)) / (K - 1))].slice());
  const assign = new Array(n).fill(0);
  for (let it = 0; it < iters; it++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      let best = 0, bd = Infinity;
      for (let kk = 0; kk < K; kk++) { const d = (pts[i][0] - cent[kk][0]) ** 2 + (pts[i][1] - cent[kk][1]) ** 2; if (d < bd) { bd = d; best = kk; } }
      if (assign[i] !== best) { assign[i] = best; moved = true; }
    }
    const sum = Array.from({ length: K }, () => [0, 0, 0]);
    for (let i = 0; i < n; i++) { sum[assign[i]][0] += pts[i][0]; sum[assign[i]][1] += pts[i][1]; sum[assign[i]][2]++; }
    for (let kk = 0; kk < K; kk++) if (sum[kk][2] > 0) cent[kk] = [sum[kk][0] / sum[kk][2], sum[kk][1] / sum[kk][2]];
    if (!moved && it > 1) break;
  }
  return { assign, centroids: cent };
}

// Regime detection: cluster each day by (rolling volatility, rolling momentum),
// then label clusters transparently — the highest-vol cluster is "stress", the
// rest split by momentum sign. Returns current regime + a recent history strip.
const REGIME_META = {
  calmUp:   { label: "Calm uptrend", color: "#7FB58A" },
  calmDown: { label: "Calm downtrend", color: "#D8735E" },
  range:    { label: "Range / drift", color: "#8A8F88" },
  stress:   { label: "High volatility / stress", color: "#C6A15B" },
};

export function regimes(closes, win = 15, K = 3, histN = 60) {
  const r = logReturns(closes);
  if (r.length < win + K + 8) return null;
  const feats = [];
  for (let i = win; i < r.length; i++) {
    const w = r.slice(i - win, i);
    feats.push({ i, vol: std(w), mom: w.reduce((a, b) => a + b, 0) });
  }
  const vols = feats.map((f) => f.vol), moms = feats.map((f) => f.mom);
  const mv = mean(vols), sv = std(vols) || 1, mm = mean(moms), sm = std(moms) || 1;
  const pts = feats.map((f) => [(f.vol - mv) / sv, (f.mom - mm) / sm]);
  const { assign, centroids } = kmeans(pts, K);

  // Label each cluster: the top-vol centroid = stress; others by momentum sign.
  const order = centroids.map((c, kk) => ({ kk, vol: c[0], mom: c[1] })).sort((a, b) => b.vol - a.vol);
  const clusterLabel = {};
  order.forEach((c, rank) => {
    if (rank === 0) clusterLabel[c.kk] = "stress";
    else if (c.mom > 0.15) clusterLabel[c.kk] = "calmUp";
    else if (c.mom < -0.15) clusterLabel[c.kk] = "calmDown";
    else clusterLabel[c.kk] = "range";
  });

  const history = feats.slice(-histN).map((f, idx) => {
    const gi = feats.length - Math.min(histN, feats.length) + idx;
    return { i: f.i, key: clusterLabel[assign[gi]] };
  });
  const currentKey = clusterLabel[assign[assign.length - 1]];
  return { currentKey, current: REGIME_META[currentKey], history, meta: REGIME_META };
}

export { REGIME_META };
