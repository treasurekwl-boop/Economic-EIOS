// Event-study math. Pure + testable. Two jobs:
//   • scaleReaction — turn a surprise of size s into an asset's expected move using
//     the curated per-step sensitivity (the calculator).
//   • reactionAround — MEASURE the actual move around a real event date from a price
//     series (the honest, data-driven side; fills in as the feed spans events).

// Expected asset move for a given signed surprise (in the event's natural units).
// asset: { sign, per, u }; step: the event's surprise unit (e.g. 0.1pp, 25bps).
export function scaleReaction(asset, surprise, step) {
  const units = surprise / step;
  return { value: +(asset.sign * asset.per * units).toFixed(2), unit: asset.u };
}

// Measure the actual reaction around an event from [[date, close], ...] (oldest→
// newest). baseline = close the trading day BEFORE the event; returns the % move to
// each horizon (t+1 = the event-day reaction). null if the series doesn't cover it.
export function reactionAround(series, eventISO, horizons = [1, 3, 5]) {
  if (!Array.isArray(series) || series.length < 3) return null;
  const day = String(eventISO).slice(0, 10);
  let ev = series.findIndex(([d]) => d >= day);
  if (ev < 1) return null;                       // no pre-event baseline in range
  const baseline = series[ev - 1][1];
  if (!(baseline > 0)) return null;
  const at = {};
  let any = false;
  for (const h of horizons) {
    const i = ev - 1 + h;
    if (i < series.length) { at[h] = +(((series[i][1] - baseline) / baseline) * 100).toFixed(2); any = true; }
  }
  return any ? { baseline, eventIndex: ev, at } : null;
}

// Run reactionAround for one event across several instruments (a data map keyed by
// instrument id, each with a `series`). Returns per-instrument measured moves.
export function measureEvent(dataById, eventISO, instrumentIds, horizons = [1, 3, 5]) {
  const out = {};
  for (const id of instrumentIds) {
    const s = dataById?.[id]?.series;
    const r = s ? reactionAround(s, eventISO, horizons) : null;
    if (r) out[id] = r;
  }
  return out;
}
