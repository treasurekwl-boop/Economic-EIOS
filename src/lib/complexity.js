// ─────────────────────────────────────────────────────────────────────────────
// COMPLEXITY DIAGNOSTICS — the buildable slice of complexity science: pure
// time-series measures on the EOD feed (NO agent-based models, NO contagion
// networks, NO confidential data — those need infrastructure this app doesn't
// have, and we don't fake them). These answer one honest question: how forecastable
// is this series RIGHT NOW?
//   • Hurst exponent (R/S)        — mean-reverting (<0.5) vs random (~0.5) vs trending (>0.5)
//   • Permutation entropy (B–P)   — ordinal complexity; ~1 = near-random, low signal
//   • Largest Lyapunov (Rosenstein, rough) — sensitivity to initial conditions
// ─────────────────────────────────────────────────────────────────────────────

const logReturns = (s) => { const r = []; for (let i = 1; i < s.length; i++) if (s[i - 1] > 0 && s[i] > 0) r.push(Math.log(s[i] / s[i - 1])); return r; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
function slope(xs, ys) {
  const n = xs.length, mx = mean(xs), my = mean(ys);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  return den === 0 ? 0 : num / den;
}
const factorial = (n) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

// Anis–Lloyd expected (R/S)_n for an i.i.d. series — used to de-bias the estimator
// so that a true random walk centres on H = 0.5 rather than the raw ~0.6 overshoot.
function expectedRS(n) {
  let s = 0;
  for (let i = 1; i < n; i++) s += Math.sqrt((n - i) / i);
  return ((n - 0.5) / n) * (1 / Math.sqrt((n * Math.PI) / 2)) * s;
}

// ── Hurst exponent via rescaled-range (R/S) analysis on log returns ──
export function hurst(series) {
  const x = logReturns(series);
  const N = x.length;
  if (N < 32) return null;
  const sizes = [];
  for (let n = 8; n <= Math.floor(N / 2); n = Math.floor(n * 1.5)) sizes.push(n);
  const logN = [], logRS = [], logE = [];
  for (const n of sizes) {
    const chunks = Math.floor(N / n);
    let rsSum = 0, cnt = 0;
    for (let c = 0; c < chunks; c++) {
      const sub = x.slice(c * n, (c + 1) * n);
      const m = mean(sub);
      let cum = 0, mn = Infinity, mx = -Infinity;
      for (const v of sub) { cum += v - m; if (cum < mn) mn = cum; if (cum > mx) mx = cum; }
      const R = mx - mn;
      const S = Math.sqrt(sub.reduce((a, b) => a + (b - m) ** 2, 0) / sub.length);
      if (S > 0) { rsSum += R / S; cnt++; }
    }
    if (cnt > 0) { logN.push(Math.log(n)); logRS.push(Math.log(rsSum / cnt)); logE.push(Math.log(expectedRS(n))); }
  }
  if (logN.length < 3) return null;
  // Anis–Lloyd correction: subtract the estimator's own bias slope, re-centre at 0.5.
  const H = slope(logN, logRS) - slope(logN, logE) + 0.5;
  return +H.toFixed(3);
}

// ── Permutation entropy (Bandt–Pompe), normalised to [0,1] ──
export function permutationEntropy(series, d = 3) {
  const N = series.length;
  if (N < d + 5) return null;
  const counts = {};
  let total = 0;
  for (let i = 0; i + d <= N; i++) {
    const w = series.slice(i, i + d);
    const order = w.map((_, k) => k).sort((a, b) => w[a] - w[b]).join("");
    counts[order] = (counts[order] || 0) + 1;
    total++;
  }
  let H = 0;
  for (const k in counts) { const p = counts[k] / total; H -= p * Math.log(p); }
  return +(H / Math.log(factorial(d))).toFixed(3);
}

// ── Largest Lyapunov exponent, simplified Rosenstein (ROUGH on short series) ──
export function lyapunov(series, m = 4, tau = 1) {
  const s = series;
  const N = s.length;
  const M = N - (m - 1) * tau;
  if (M < 25) return null;
  const Y = [];
  for (let i = 0; i < M; i++) { const v = []; for (let j = 0; j < m; j++) v.push(s[i + j * tau]); Y.push(v); }
  const dist = (a, b) => { let d = 0; for (let k = 0; k < m; k++) d += (a[k] - b[k]) ** 2; return Math.sqrt(d); };
  const minSep = m + 1;                                   // exclude temporally close neighbours
  const nn = new Array(M).fill(-1);
  for (let i = 0; i < M; i++) {
    let best = Infinity, bj = -1;
    for (let j = 0; j < M; j++) { if (Math.abs(i - j) <= minSep) continue; const d = dist(Y[i], Y[j]); if (d > 0 && d < best) { best = d; bj = j; } }
    nn[i] = bj;
  }
  const maxT = Math.min(20, Math.floor(M / 4));
  const xs = [], ys = [];
  for (let t = 0; t < maxT; t++) {
    let sum = 0, cnt = 0;
    for (let i = 0; i < M; i++) { const j = nn[i]; if (j < 0 || i + t >= M || j + t >= M) continue; const d = dist(Y[i + t], Y[j + t]); if (d > 0) { sum += Math.log(d); cnt++; } }
    if (cnt > 0) { xs.push(t); ys.push(sum / cnt); }
  }
  if (xs.length < 4) return null;
  const k = Math.max(3, Math.floor(xs.length / 2));       // slope over the initial (linear) region
  return +slope(xs.slice(0, k), ys.slice(0, k)).toFixed(3);
}

// ── Interpretation helpers ──
export function hurstLabel(H) {
  if (H == null) return { text: "—", tone: "flat" };
  if (H < 0.45) return { text: "mean-reverting · fade extremes", tone: "revert" };
  if (H <= 0.55) return { text: "random walk · low edge", tone: "flat" };
  return { text: "trending · momentum persists", tone: "trend" };
}
export function peLabel(pe) {
  if (pe == null) return { text: "—", tone: "flat" };
  if (pe >= 0.9) return { text: "near-random · low signal", tone: "flat" };
  if (pe >= 0.78) return { text: "some structure", tone: "some" };
  return { text: "structured · more predictable", tone: "struct" };
}
export function lyapLabel(l) {
  if (l == null) return { text: "—", tone: "flat" };
  if (l > 0.01) return { text: "weakly chaotic (rough)", tone: "chaos" };
  if (l >= -0.01) return { text: "edge of stability (rough)", tone: "flat" };
  return { text: "stable / regular (rough)", tone: "stable" };
}

// ── Early-warning / critical slowing down ──
// As a system loses resilience before a regime shift, it recovers more slowly from
// perturbations — showing up as RISING lag-1 autocorrelation AND rising variance
// together. Computed on rolling windows of log returns. HONEST CAVEAT (per the
// literature): a changing noise regime can trigger false alarms, so this is a
// radar, not an alarm bell.
export function earlyWarning(series, win = 30) {
  const x = logReturns(series);
  const N = x.length;
  if (N < win + 20) return null;
  const ar1 = [], varr = [];
  for (let end = win; end <= N; end++) {
    const w = x.slice(end - win, end);
    const m = mean(w);
    let den = 0, num = 0;
    for (let i = 0; i < w.length; i++) den += (w[i] - m) ** 2;
    for (let i = 1; i < w.length; i++) num += (w[i] - m) * (w[i - 1] - m);
    varr.push(den / w.length);
    ar1.push(den > 0 ? num / den : 0);
  }
  // Compare the recent window against the earlier baseline (robust to saturation —
  // captures a gradual loss of resilience even once the signal has partly plateaued).
  const half = Math.max(5, Math.floor(ar1.length / 2));
  const recN = Math.max(8, Math.floor(ar1.length / 4));
  const baseAr = mean(ar1.slice(0, half)), recAr = mean(ar1.slice(-recN));
  const baseVar = (mean(varr.slice(0, half)) || 1e-12), recVar = mean(varr.slice(-recN));
  const ar1Dir = recAr > baseAr + 0.05 ? "rising" : recAr < baseAr - 0.05 ? "falling" : "flat";
  const varDir = recVar > baseVar * 1.15 ? "rising" : recVar < baseVar * 0.85 ? "falling" : "flat";
  return {
    ar1Now: +ar1[ar1.length - 1].toFixed(2),
    ar1Dir, varDir,
    csd: ar1Dir === "rising" && varDir === "rising",
    ar1Spark: ar1.slice(-40).map((v) => +v.toFixed(3)),
    varSpark: varr.slice(-40),
  };
}

// One call → the whole predictability picture for a price series.
export function predictability(series) {
  const H = hurst(series), pe = permutationEntropy(series), l = lyapunov(series);
  return { hurst: H, pe, lyap: l, hurstLabel: hurstLabel(H), peLabel: peLabel(pe), lyapLabel: lyapLabel(l), n: series?.length ?? 0 };
}
