// The self-grading loop, server-side (service key). Two jobs each run:
//   1) RESOLVE any open forecast whose resolves_at has passed, by looking up the
//      actual close from instrument_series (data the app didn't fabricate) and
//      scoring it. Resolution is written once and never re-opened.
//   2) LOG today's honest baseline: a volatility-based interval for USD/ZAR at two
//      horizons. A vol band is a real, defensible forecast — and it gives the
//      scorecard something to grade within days, earned rather than seeded.
// The richer probabilistic calls (repo-rate model, etc.) log into the same table
// later; this just makes sure the machine is alive and scoring from day one.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing Supabase env."); process.exit(1); }

const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };
const rest = (path, opts = {}) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...opts, headers: { ...H, ...(opts.headers || {}) } });
const nowIso = new Date().toISOString();
const num = (v, d = 4) => +Number(v).toFixed(d);

// --- helper: daily closes for an instrument, oldest→newest [[date, close], ...] ---
async function seriesFor(target) {
  const r = await rest(`instrument_series?id=eq.${encodeURIComponent(target)}&select=series`);
  if (!r.ok) throw new Error(`series ${target} ${r.status}`);
  const j = await r.json();
  const s = j?.[0]?.series;
  return Array.isArray(s) ? s : [];
}
// close on/after a date (the resolution rule), else the latest available.
function closeOnOrAfter(series, isoDate) {
  const d = isoDate.slice(0, 10);
  for (const [date, close] of series) if (date >= d) return { date, close };
  return series.length ? { date: series[series.length - 1][0], close: series[series.length - 1][1] } : null;
}

// ============ 1) RESOLVE due forecasts ============
let resolved = 0;
try {
  const r = await rest(`forecasts?status=eq.open&resolves_at=lte.${nowIso}&select=*`);
  const due = r.ok ? await r.json() : [];
  for (const f of due) {
    try {
      if (f.lo != null && f.hi != null && f.target) {
        const series = await seriesFor(f.target);
        const hit = closeOnOrAfter(series, f.resolves_at);
        if (!hit) continue; // no data yet — leave open, try next run
        const inBand = hit.close >= f.lo && hit.close <= f.hi;
        const patch = { status: "resolved", actual_value: num(hit.close), correct: inBand, resolved_at: nowIso, updated_at: nowIso };
        const up = await rest(`forecasts?id=eq.${f.id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(patch) });
        if (up.ok) resolved++;
      }
      // (probabilistic kinds resolve via their own model scripts.)
    } catch (e) { console.error("resolve skip", f.id, e.message); }
  }
} catch (e) { console.error("resolve pass failed:", e.message); }

// ============ 2) LOG today's volatility-baseline intervals ============
const TARGETS = ["usdzar"];
const HORIZONS = [
  { label: "next trading day", tradingDays: 1, calDays: 2 },
  { label: "next ~5 trading days", tradingDays: 5, calDays: 7 },
];
const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
let logged = 0;

for (const target of TARGETS) {
  let series;
  try { series = await seriesFor(target); } catch (e) { console.error("log skip", target, e.message); continue; }
  if (series.length < 20) { console.error("log skip", target, "too little history"); continue; }

  // realised daily volatility from log returns of the last ~30 closes.
  const closes = series.slice(-31).map((x) => x[1]);
  const rets = [];
  for (let i = 1; i < closes.length; i++) if (closes[i] > 0 && closes[i - 1] > 0) rets.push(Math.log(closes[i] / closes[i - 1]));
  const mean = rets.reduce((a, c) => a + c, 0) / rets.length;
  const sigma = Math.sqrt(rets.reduce((a, c) => a + (c - mean) ** 2, 0) / (rets.length - 1));
  const last = closes[closes.length - 1];

  // skip horizons already logged today (idempotent — the Action runs every 30 min).
  const existRes = await rest(`forecasts?kind=eq.rand_range&target=eq.${target}&made_at=gte.${todayStart.toISOString()}&select=resolution_rule`);
  const existing = existRes.ok ? (await existRes.json()).map((x) => x.resolution_rule) : [];

  for (const h of HORIZONS) {
    const rule = `${target} close on/after resolves_at (${h.label}), from instrument_series`;
    if (existing.includes(rule)) continue;
    const band = Math.exp(sigma * Math.sqrt(h.tradingDays)); // 1σ ≈ 68%
    const lo = num(last / band), hi = num(last * band);
    const resolves = new Date(Date.now() + h.calDays * 864e5).toISOString();
    const row = {
      kind: "rand_range", target,
      statement: `USD/ZAR ~68% likely within R${lo}–R${hi} over the ${h.label} (volatility baseline).`,
      lo, hi, conf: 0.68,
      resolves_at: resolves, resolution_rule: rule,
      status: "open",
    };
    const ins = await rest(`forecasts`, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify([row]) });
    if (ins.ok) logged++; else console.error("log insert failed", target, h.label, ins.status, await ins.text());
  }
}

console.log(`Forecasts: resolved ${resolved}, logged ${logged}.`);
