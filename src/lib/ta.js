// Technical-analysis helpers — pure functions over an array of closing prices
// (oldest → newest). These COMPUTE signals; they don't give advice. Every
// function degrades gracefully (returns null) when there isn't enough history.

export function sma(closes, n) {
  if (!closes || closes.length < n) return null;
  const slice = closes.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / n;
}

export function ema(closes, n) {
  if (!closes || closes.length < n) return null;
  const k = 2 / (n + 1);
  let e = closes.slice(0, n).reduce((a, b) => a + b, 0) / n;
  for (let i = n; i < closes.length; i++) e = closes[i] * k + e * (1 - k);
  return e;
}

// Wilder's RSI over `n` periods → 0..100. >70 often called overbought, <30 oversold.
export function rsi(closes, n = 14) {
  if (!closes || closes.length < n + 1) return null;
  let gain = 0, loss = 0;
  for (let i = closes.length - n; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  const avgG = gain / n, avgL = loss / n;
  if (avgL === 0) return 100;
  const rs = avgG / avgL;
  return 100 - 100 / (1 + rs);
}

// Annualised volatility from daily log returns (std dev × √252), as a %.
export function annualVol(closes, n = 30) {
  if (!closes || closes.length < n + 1) return null;
  const rets = [];
  for (let i = closes.length - n; i < closes.length; i++) {
    if (closes[i - 1] > 0) rets.push(Math.log(closes[i] / closes[i - 1]));
  }
  if (rets.length < 2) return null;
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const varr = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
  return Math.sqrt(varr) * Math.sqrt(252) * 100;
}

// % change between the first and last point of the last `n` sessions.
export function pctChange(closes, n) {
  if (!closes || closes.length < 2) return null;
  const arr = n ? closes.slice(-n) : closes;
  const first = arr[0], last = arr[arr.length - 1];
  if (!first) return null;
  return ((last - first) / first) * 100;
}

// Recent range: lowest low and highest high over the last `n` sessions.
export function range(closes, n = 60) {
  if (!closes || !closes.length) return null;
  const arr = closes.slice(-n);
  return { lo: Math.min(...arr), hi: Math.max(...arr) };
}

// A compact, opinion-free signal summary a trader can read at a glance.
export function signals(closes) {
  if (!closes || closes.length < 15) return null;
  const last = closes[closes.length - 1];
  const s20 = sma(closes, 20), s50 = sma(closes, 50);
  const r = rsi(closes, 14);
  const vol = annualVol(closes, 30);
  const rng = range(closes, 60);

  // Trend read from price vs moving averages (description, not a recommendation).
  let trend = "neutral";
  if (s20 != null && s50 != null) {
    if (last > s20 && s20 > s50) trend = "up";
    else if (last < s20 && s20 < s50) trend = "down";
  } else if (s20 != null) {
    trend = last > s20 ? "up" : "down";
  }

  const rsiTag = r == null ? null : r >= 70 ? "overbought" : r <= 30 ? "oversold" : "neutral";
  const pos = rng && rng.hi > rng.lo ? (last - rng.lo) / (rng.hi - rng.lo) : null; // 0..1 within 60d range

  return { last, s20, s50, rsi: r, rsiTag, vol, trend, range: rng, pos };
}
