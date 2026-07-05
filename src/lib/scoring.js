// The scoring core for the self-grading forecast engine. Pure functions, no I/O —
// so they're testable in isolation (see the node check in the commit). This is the
// part an analyst actually respects: proper scoring rules, not vibes.
//
// Two forecast shapes:
//   • probabilistic — a probability assigned to a stated outcome (repo "70% hold").
//     Scored with the BRIER score: mean squared error of probability vs outcome.
//     0 = perfect, 0.25 = a coin flip on a binary, 1 = confidently wrong.
//   • interval — a range with a nominal confidence (rand "68% chance inside 18.0–18.6").
//     Scored by COVERAGE: did reality land inside, and does realised coverage match
//     the nominal confidence (a 68% band should contain the truth ~68% of the time).

// Brier for one binary probabilistic call: prob = probability put on the outcome
// that was CLAIMED; occurred = whether that claimed outcome happened.
export function brierBinary(prob, occurred) {
  const o = occurred ? 1 : 0;
  return (prob - o) ** 2;
}

// Brier for a full categorical distribution, e.g. {hold:0.7, cut25:0.25, hike:0.05}.
// Sum over classes of (p - outcome)^2. Range 0 (perfect) .. 2 (worst).
export function brierMulti(dist, actual) {
  let s = 0;
  for (const [k, p] of Object.entries(dist)) {
    const o = k === actual ? 1 : 0;
    s += (Number(p) - o) ** 2;
  }
  return +s.toFixed(6);
}

// Reliability / calibration table: bucket resolved probabilistic calls by the
// probability they assigned, and compare mean predicted probability to the actual
// hit rate in each bucket. A calibrated forecaster sits on the diagonal.
export function calibration(items, nbins = 5) {
  const bins = Array.from({ length: nbins }, (_, i) => ({ lo: i / nbins, hi: (i + 1) / nbins, ps: [], hits: 0 }));
  for (const it of items) {
    if (it.prob == null) continue;
    const idx = Math.min(nbins - 1, Math.max(0, Math.floor(it.prob * nbins)));
    bins[idx].ps.push(it.prob);
    if (it.correct) bins[idx].hits++;
  }
  return bins
    .filter((b) => b.ps.length)
    .map((b) => ({
      lo: b.lo, hi: b.hi, n: b.ps.length,
      predicted: +(b.ps.reduce((a, c) => a + c, 0) / b.ps.length).toFixed(3),
      actual: +(b.hits / b.ps.length).toFixed(3),
    }));
}

// Aggregate a list of forecast rows (shape from the `forecasts` table) into the
// track record the UI shows. Only resolved rows count toward scores.
export function trackRecord(forecasts) {
  const all = forecasts ?? [];
  const open = all.filter((f) => f.status === "open");
  const resolved = all.filter((f) => f.status === "resolved");

  const prob = resolved.filter((f) => f.prob != null && f.correct != null);
  const ranges = resolved.filter((f) => f.lo != null && f.hi != null && f.actual_value != null);

  const brier = prob.length ? +(prob.reduce((a, f) => a + brierBinary(f.prob, f.correct), 0) / prob.length).toFixed(4) : null;
  const hitRate = prob.length ? +(prob.filter((f) => f.correct).length / prob.length).toFixed(3) : null;
  const inBand = ranges.filter((f) => f.actual_value >= f.lo && f.actual_value <= f.hi).length;
  const coverage = ranges.length ? +(inBand / ranges.length).toFixed(3) : null;
  const nominal = ranges.length ? +(ranges.reduce((a, f) => a + (f.conf ?? 0.68), 0) / ranges.length).toFixed(3) : null;

  // Per-kind breakdown (repo_rate, rand_range, …) so wins/losses are attributable.
  const kinds = {};
  for (const f of resolved) {
    const k = f.kind || "other";
    kinds[k] = kinds[k] || { kind: k, n: 0, correct: 0, inBand: 0, ranges: 0 };
    kinds[k].n++;
    if (f.correct === true) kinds[k].correct++;
    if (f.lo != null && f.hi != null && f.actual_value != null) {
      kinds[k].ranges++;
      if (f.actual_value >= f.lo && f.actual_value <= f.hi) kinds[k].inBand++;
    }
  }

  return {
    openCount: open.length,
    resolvedCount: resolved.length,
    brier, hitRate,
    coverage, nominal, rangeCount: ranges.length,
    calibration: calibration(prob.map((f) => ({ prob: f.prob, correct: f.correct }))),
    byKind: Object.values(kinds).sort((a, b) => b.n - a.n),
  };
}
