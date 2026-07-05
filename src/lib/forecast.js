// ─────────────────────────────────────────────────────────────────────────────
// FORECASTING — honest, pure-JS implementations of the classical univariate
// methods from the forecasting brief, on an EOD close series: benchmarks (random
// walk, drift), Holt exponential smoothing, AR/ARIMA(p,d,0), and GARCH(1,1) for
// volatility — plus the brief's methodology: rolling-origin backtesting, RMSE/
// MAE/MASE, and forecast combination. No faked ML/Bayesian/multivariate models.
// ─────────────────────────────────────────────────────────────────────────────

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

export function diff(s, d = 1) {
  let x = s.slice();
  for (let k = 0; k < d; k++) { const y = []; for (let i = 1; i < x.length; i++) y.push(x[i] - x[i - 1]); x = y; }
  return x;
}
const logReturns = (s) => { const r = []; for (let i = 1; i < s.length; i++) if (s[i - 1] > 0) r.push(Math.log(s[i] / s[i - 1])); return r; };

// Solve A x = b by Gaussian elimination with partial pivoting.
function solve(A, b) {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    if (Math.abs(M[c][c]) < 1e-12) continue;
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => (Math.abs(r[i]) < 1e-12 ? 0 : r[n] / r[i]));
}

// ── Benchmarks — the brief says these are hard to beat ──
export const randomWalk = (closes, h) => Array(h).fill(closes[closes.length - 1]);
export function driftForecast(closes, h) {
  const last = closes[closes.length - 1], dm = mean(diff(closes, 1));
  return Array.from({ length: h }, (_, i) => last + dm * (i + 1));
}

// ── Holt's linear (double exponential smoothing), no seasonality ──
export function holt(closes, h, alpha = 0.4, beta = 0.1) {
  if (closes.length < 3) return randomWalk(closes, h);
  let l = closes[0], b = closes[1] - closes[0];
  for (let i = 1; i < closes.length; i++) {
    const ln = alpha * closes[i] + (1 - alpha) * (l + b);
    const bn = beta * (ln - l) + (1 - beta) * b;
    l = ln; b = bn;
  }
  return Array.from({ length: h }, (_, i) => l + b * (i + 1));
}

// ── AR(p) on the d-times-differenced series (i.e. ARIMA(p,d,0)), iterated ──
export function arForecast(closes, p = 5, d = 1, h = 10) {
  const dd = diff(closes, d);
  if (dd.length < p + 6) return randomWalk(closes, h);
  const mu = mean(dd), y = dd.map((v) => v - mu);
  const A = Array.from({ length: p }, () => Array(p).fill(0)), b = Array(p).fill(0);
  for (let t = p; t < y.length; t++) {
    const lag = []; for (let i = 1; i <= p; i++) lag.push(y[t - i]);
    for (let i = 0; i < p; i++) { b[i] += lag[i] * y[t]; for (let j = 0; j < p; j++) A[i][j] += lag[i] * lag[j]; }
  }
  const phi = solve(A, b);
  let hist = y.slice(-p);
  const fdiff = [];
  for (let step = 0; step < h; step++) {
    let v = 0; for (let i = 0; i < p; i++) v += phi[i] * hist[hist.length - 1 - i];
    fdiff.push(v); hist.push(v);
  }
  const fd = fdiff.map((v) => v + mu);
  if (d === 0) return fd;
  let lvl = closes[closes.length - 1]; return fd.map((v) => (lvl += v));  // undo one difference
}

// ── GARCH(1,1) on log returns: variance-targeting ω, MLE grid over (α, β) ──
export function garch11(closes) {
  const r = logReturns(closes);
  if (r.length < 25) return null;
  const m = mean(r), eps = r.map((v) => v - m), uncond = mean(eps.map((e) => e * e)) || 1e-10;
  const ll = (al, be) => {
    const om = uncond * (1 - al - be); if (om <= 0) return -1e18;
    let s2 = uncond, l = 0;
    for (let i = 0; i < eps.length; i++) { if (i > 0) s2 = om + al * eps[i - 1] * eps[i - 1] + be * s2; l += -0.5 * (Math.log(2 * Math.PI) + Math.log(s2) + (eps[i] * eps[i]) / s2); }
    return l;
  };
  let best = { al: 0.08, be: 0.9, l: -1e18 };
  for (let al = 0.02; al <= 0.25 + 1e-9; al += 0.02) for (let be = 0.6; be <= 0.97 + 1e-9; be += 0.02) {
    if (al + be >= 0.999) continue; const l = ll(al, be); if (l > best.l) best = { al, be, l };
  }
  const om = uncond * (1 - best.al - best.be);
  let s2 = uncond; for (let i = 1; i < eps.length; i++) s2 = om + best.al * eps[i - 1] * eps[i - 1] + best.be * s2;
  const lastEps = eps[eps.length - 1];
  return {
    omega: om, alpha: best.al, beta: best.be,
    dailyVol: Math.sqrt(s2), uncondVol: Math.sqrt(uncond), persistence: best.al + best.be,
    // Per-step forecast variance, oldest→newest over the horizon.
    forecastVar: (hh) => { let v = om + best.al * lastEps * lastEps + best.be * s2; const path = [v]; for (let k = 1; k < hh; k++) { v = om + (best.al + best.be) * v; path.push(v); } return path; },
  };
}

// ── Rolling-origin backtest: h-step error vs the naive (random-walk) benchmark ──
export function backtest(closes, fn, h = 1, folds = 45) {
  const n = closes.length, errs = [], naive = [];
  const start = Math.max(30, n - folds - h);
  for (let t = start; t < n - h; t++) {
    const train = closes.slice(0, t), actual = closes[t + h - 1];
    let f; try { f = fn(train, h); } catch { continue; }
    const pred = f[h - 1]; if (!Number.isFinite(pred)) continue;
    errs.push(Math.abs(pred - actual));
    naive.push(Math.abs(train[train.length - 1] - actual));
  }
  if (errs.length < 5) return null;
  const mae = mean(errs), naiveMae = mean(naive) || 1e-9;
  return { mae, rmse: Math.sqrt(mean(errs.map((e) => e * e))), mase: mae / naiveMae, n: errs.length };
}

// Simple forecast combination (equal-weight average) — the brief's default.
export function combine(forecasts) {
  const h = forecasts[0].length;
  return Array.from({ length: h }, (_, i) => mean(forecasts.map((f) => f[i])));
}
