// Free watchlist price history → Supabase. Pulls ~6 months of daily closes for
// each Desk instrument from Yahoo Finance (keyless, best-effort) and upserts one
// JSONB row per instrument. Runs in the same every-30-min GitHub Action. Global
// fetch only — no npm install. Per-symbol try/catch: a bad symbol never blocks
// the rest, and an empty pull leaves the table unchanged.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing Supabase env."); process.exit(1); }

// Mirror of src/config/desk.js (kept in sync by hand — small, changes rarely).
const INSTRUMENTS = [
  { id: "usdzar", sym: "ZAR=X",    label: "USD / ZAR", type: "fx" },
  { id: "eurzar", sym: "EURZAR=X", label: "EUR / ZAR", type: "fx" },
  { id: "gbpzar", sym: "GBPZAR=X", label: "GBP / ZAR", type: "fx" },
  { id: "gold",     sym: "GC=F", label: "Gold",     type: "commodity" },
  { id: "platinum", sym: "PL=F", label: "Platinum", type: "commodity" },
  { id: "brent",    sym: "BZ=F", label: "Brent",    type: "commodity" },
  { id: "jse40",  sym: "^J200.JO", label: "JSE Top 40",     type: "equity" },
  { id: "npn",    sym: "NPN.JO",   label: "Naspers",        type: "equity" },
  { id: "fsr",    sym: "FSR.JO",   label: "FirstRand",      type: "equity" },
  { id: "agl",    sym: "AGL.JO",   label: "Anglo American", type: "equity" },
  { id: "sol",    sym: "SOL.JO",   label: "Sasol",          type: "equity" },
  { id: "gfi",    sym: "GFI.JO",   label: "Gold Fields",    type: "equity" },
];

async function history(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=6mo`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`yahoo ${sym} ${r.status}`);
  const res = (await r.json())?.chart?.result?.[0];
  const ts = res?.timestamp;
  const closes = res?.indicators?.quote?.[0]?.close;
  if (!ts || !closes) throw new Error(`no data ${sym}`);
  const series = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c == null) continue;
    series.push([new Date(ts[i] * 1000).toISOString().slice(0, 10), +Number(c).toFixed(4)]);
  }
  return series;
}

const rows = [];
for (const inst of INSTRUMENTS) {
  try {
    const series = await history(inst.sym);
    if (series.length < 2) continue;
    const last = series[series.length - 1][1];
    const prev = series[series.length - 2][1];
    rows.push({ id: inst.id, label: inst.label, type: inst.type, series, last, prev, updated_at: new Date().toISOString() });
  } catch (e) { console.error("skip", inst.id, e.message); }
}

if (!rows.length) { console.warn("No instrument history fetched — leaving table unchanged."); process.exit(0); }

const up = await fetch(`${SUPABASE_URL}/rest/v1/instrument_series?on_conflict=id`, {
  method: "POST",
  headers: {
    apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(rows),
});
if (!up.ok) { console.error("Upsert failed:", up.status, await up.text()); process.exit(1); }
console.log(`Instruments: upserted ${rows.length} (${rows.map((r) => r.id).join(", ")}).`);
