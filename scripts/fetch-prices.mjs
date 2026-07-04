// Free live FX + commodity prices → Supabase. No API keys:
//   FX from open.er-api.com (reliable, keyless), enriched with Yahoo Finance for
//   intraday change; commodities (gold, Brent, platinum) from Yahoo (best-effort).
// Runs in the same every-30-min GitHub Action as the headlines. Global fetch only.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing Supabase env."); process.exit(1); }

const num = (v, d = 2) => (v == null ? null : +Number(v).toFixed(d));
const mk = (id, label, value, unit, change) => ({
  id, label, value: num(value), unit, change_pct: num(change), updated_at: new Date().toISOString(),
});
const rows = [];

// 1) FX values from a keyless, reliable source.
try {
  const j = await (await fetch("https://open.er-api.com/v6/latest/USD")).json();
  const { ZAR, EUR, GBP } = j?.rates ?? {};
  if (ZAR) rows.push(mk("usdzar", "USD / ZAR", ZAR, "R", null));
  if (ZAR && EUR) rows.push(mk("eurzar", "EUR / ZAR", ZAR / EUR, "R", null));
  if (ZAR && GBP) rows.push(mk("gbpzar", "GBP / ZAR", ZAR / GBP, "R", null));
} catch (e) { console.error("fx source failed:", e.message); }

// 2) Yahoo Finance for commodities + FX intraday change (best-effort).
async function yahoo(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`yahoo ${sym} ${r.status}`);
  const meta = (await r.json())?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`no meta ${sym}`);
  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose ?? meta.previousClose;
  return { value: price, change: price != null && prev ? ((price - prev) / prev) * 100 : null };
}

const YQ = [
  { id: "gold", sym: "GC=F", label: "Gold", unit: "$/oz" },
  { id: "brent", sym: "BZ=F", label: "Brent crude", unit: "$/bbl" },
  { id: "platinum", sym: "PL=F", label: "Platinum", unit: "$/oz" },
  { id: "usdzar", sym: "ZAR=X" },
  { id: "eurzar", sym: "EURZAR=X" },
  { id: "gbpzar", sym: "GBPZAR=X" },
];
for (const s of YQ) {
  try {
    const q = await yahoo(s.sym);
    if (s.label) {
      if (q.value != null) rows.push(mk(s.id, s.label, q.value, s.unit, q.change));
    } else {
      const ex = rows.find((r) => r.id === s.id);   // enrich FX row with change/realtime value
      if (ex) { if (q.change != null) ex.change_pct = num(q.change); if (q.value != null) ex.value = num(q.value); }
    }
  } catch (e) { console.error("skip", s.id, e.message); }
}

if (!rows.length) { console.warn("No prices fetched (sources unreachable) — leaving table unchanged."); process.exit(0); }

const up = await fetch(`${SUPABASE_URL}/rest/v1/market_prices?on_conflict=id`, {
  method: "POST",
  headers: {
    apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(rows),
});
if (!up.ok) { console.error("Upsert failed:", up.status, await up.text()); process.exit(1); }
console.log(`Prices: upserted ${rows.length} (${rows.map((r) => r.id).join(", ")}).`);
