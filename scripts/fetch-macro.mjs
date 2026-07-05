// Free macro driver series → Supabase (macro_series). Pulls the global rate/risk/
// commodity drivers the forecasting models need, all from FRED's KEYLESS CSV
// endpoint (reliable, ~1-day lag). Runs in the same every-30-min GitHub Action.
// Global fetch only — no npm install. Per-series try/catch: a bad/renamed series
// never blocks the rest, and an empty pull leaves the table unchanged.
//
// NOT fetched here (no free live source — kept as manual rows, see macro_series.sql):
//   sa_repo (SARB repo rate) and sa_cpi_yoy (SA CPI YoY) — updated on MPC / Stats SA
//   release dates. We don't invent them.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing Supabase env."); process.exit(1); }

// Start ~13 months back so daily series stay small and monthly ones have a year.
const cosd = new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10);

const FRED = [
  { id: "us10y",    s: "DGS10",           label: "US 10y Treasury",      cat: "us_rates",  unit: "%" },
  { id: "us2y",     s: "DGS2",            label: "US 2y Treasury",       cat: "us_rates",  unit: "%" },
  { id: "us3m",     s: "DGS3MO",          label: "US 3m T-bill",         cat: "us_rates",  unit: "%" },
  { id: "fedfunds", s: "DFF",             label: "US Fed funds",         cat: "us_rates",  unit: "%" },
  { id: "vix",      s: "VIXCLS",          label: "VIX (risk)",           cat: "risk",      unit: "index" },
  { id: "usd_twi",  s: "DTWEXBGS",        label: "USD (trade-weighted)", cat: "risk",      unit: "index" },
  { id: "brent",    s: "DCOILBRENTEU",    label: "Brent crude",          cat: "commodity", unit: "$/bbl" },
  { id: "sa10y",    s: "IRLTLT01ZAM156N", label: "SA 10y govt bond",     cat: "sa_macro",  unit: "%" },
];

async function fred(seriesId) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}&cosd=${cosd}`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`fred ${seriesId} ${r.status}`);
  const text = await r.text();
  const lines = text.trim().split("\n").slice(1); // drop header
  const series = [];
  for (const line of lines) {
    const [date, val] = line.split(",");
    if (!date || val == null || val.trim() === "" || val.trim() === ".") continue;
    const n = Number(val);
    if (!Number.isFinite(n)) continue;
    series.push([date.trim(), +n.toFixed(4)]);
  }
  return series;
}

const rows = [];
for (const d of FRED) {
  try {
    const series = await fred(d.s);
    if (series.length < 2) { console.error("skip", d.id, "too few points"); continue; }
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    rows.push({
      id: d.id, label: d.label, category: d.cat, unit: d.unit,
      value: last[1], prev: prev[1], as_of: last[0],
      series, source: `FRED:${d.s}`, updated_at: new Date().toISOString(),
    });
  } catch (e) { console.error("skip", d.id, e.message); }
}

if (!rows.length) { console.warn("No macro series fetched — leaving table unchanged."); process.exit(0); }

const up = await fetch(`${SUPABASE_URL}/rest/v1/macro_series?on_conflict=id`, {
  method: "POST",
  headers: {
    apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(rows),
});
if (!up.ok) { console.error("Upsert failed:", up.status, await up.text()); process.exit(1); }
console.log(`Macro: upserted ${rows.length} (${rows.map((r) => `${r.id}@${r.as_of}`).join(", ")}).`);
