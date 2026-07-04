// ─────────────────────────────────────────────────────────────────────────────
// QUANT — faithful implementations of the algorithms specified in the financial-
// markets EIOS brief: no-arbitrage building blocks, risk aggregation, liquidity-
// adjusted execution cost, and alternative-asset NAV unsmoothing. Real math over
// values YOU enter — no live feeds, no advice. Continuous-compounding throughout,
// matching the brief's exp()-based forms.
// ─────────────────────────────────────────────────────────────────────────────

// Generic forward from cost-of-carry: F = S · e^((r + storage − income − conv)·t)
export const fairForwardPrice = (spot, carry, income, storage, convenience, t) =>
  spot * Math.exp((carry + storage - income - convenience) * t);

// Covered interest parity FX forward: F = S · e^((r_dom − r_for + basis)·t)
export const fxForward = (spot, rDom, rFor, basis, t) =>
  spot * Math.exp((rDom - rFor + basis) * t);

// Bond present value over cashflows, flat discount rate r plus a credit spread.
export function bondPrice(cashflows, times, r, spread) {
  let pv = 0;
  for (let i = 0; i < cashflows.length; i++) pv += cashflows[i] * Math.exp(-(r + spread) * times[i]);
  return pv;
}

// Convenience: a plain coupon bond → cashflows, then price via bondPrice.
export function couponBond(face, couponRate, years, freq, r, spread) {
  const n = Math.max(1, Math.round(years * freq));
  const cf = [], tt = [];
  for (let k = 1; k <= n; k++) { tt.push(k / freq); cf.push((face * couponRate) / freq + (k === n ? face : 0)); }
  return bondPrice(cf, tt, r, spread);
}

// ETF deviation from fair value: (price / NAV) − 1. Positive = premium.
export const premiumDiscount = (price, nav) => (nav ? price / nav - 1 : null);

// Expected execution cost = half-spread + market impact + timing risk (Almgren-style).
export function executionCost(spread, participation, dailyVolume, orderSize, sigma, horizon) {
  const impact = sigma * Math.sqrt(orderSize / Math.max(dailyVolume, 1)) * participation;
  return 0.5 * spread + impact + sigma * Math.sqrt(horizon);
}

// Margin- and funding-aware P&L for one linear position over a horizon.
//   mtm = delta · marketMove ; funding = notional · fundingSpread · days/360
export function pnlWithFunding({ delta, marketMove, marginChange = 0, notional = 0, fundingSpread = 0, days = 0 }) {
  const mtm = delta * marketMove;
  const funding = notional * fundingSpread * (days / 360);
  return { mtm, funding, marginChange, total: mtm - marginChange - funding };
}

// Geltner-style unsmoothing of appraisal-based (private-asset) returns: recovers
// the true economic return hidden by smoothed marks. rho = smoothing parameter.
export const unsmoothReturn = (rT, rPrev, rho = 0.7) => (rT - rho * rPrev) / Math.max(1 - rho, 1e-6);

// ── Market-microstructure execution models (from the microstructure brief) ──
// Square-root market-impact law: impact ≈ Y · σ · √(Q/ADV) — the concave parent-
// order approximation. `frac` = order size as a fraction of average daily volume.
export const sqrtImpact = (sigma, frac, Y = 1) => Y * sigma * Math.sqrt(Math.max(frac, 0));

// Almgren–Chriss-style execution trade-off for a parent order worked over `days`.
// σ = daily volatility (decimal); returns cost pieces as fractions of price plus
// the timing risk (std of drift over the schedule). Faster ⇒ less timing risk,
// more impact; slower ⇒ the reverse.
export function executionPlan({ sigma, frac, spread = 0, days = 1, permanentFrac = 0.5, Y = 1 }) {
  const impact = sqrtImpact(sigma, frac, Y);
  const permanent = impact * permanentFrac;
  const temporary = impact * (1 - permanentFrac);
  const halfSpread = 0.5 * spread;
  const timingRisk = sigma * Math.sqrt(Math.max(days, 0));
  const participation = days > 0 ? frac / days : frac;
  return { impact, permanent, temporary, halfSpread, timingRisk, participation, expectedCost: halfSpread + impact };
}

// Roll's implied effective spread from the serial covariance of price changes:
// s = 2·√(−cov(Δp_t, Δp_{t−1})). Only defined when that covariance is negative
// (bid-ask bounce). Coarse on daily data — a rough proxy, not a real quote.
export function rollSpread(closes) {
  if (!closes || closes.length < 4) return null;
  const dp = [];
  for (let i = 1; i < closes.length; i++) dp.push(closes[i] - closes[i - 1]);
  const n = dp.length;
  const mean = dp.reduce((a, b) => a + b, 0) / n;
  let cov = 0;
  for (let i = 1; i < n; i++) cov += (dp[i] - mean) * (dp[i - 1] - mean);
  cov /= (n - 1);
  if (cov >= 0) return { spread: null, cov };       // no bid-ask-bounce signature
  const last = closes[closes.length - 1];
  const spread = 2 * Math.sqrt(-cov);
  return { spread, cov, relBps: last ? (spread / last) * 1e4 : null };
}

// Scenario-based portfolio loss: reprice every position under each scenario and
// sum the change (the brief's portfolio_loss, specialised to linear positions).
// positions: [{ notional, delta }]; scenarios: { name: { move } } as a fractional
// price move applied to each position's delta-notional.
export function portfolioLoss(positions, scenarios) {
  const out = {};
  for (const [name, scen] of Object.entries(scenarios)) {
    out[name] = positions.reduce((tot, p) => tot + (p.delta ?? p.notional ?? 0) * (scen.move ?? 0), 0);
  }
  return out;
}
