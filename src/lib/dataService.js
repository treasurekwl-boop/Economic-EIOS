// ─────────────────────────────────────────────────────────────────────────────
// LIVE DATA — World Bank Open Data API
// Free, no API key, CORS-enabled, so it works directly from the browser.
// Returns the latest available annual figure per indicator (World Bank data is
// annual and lagged, typically 1–2 years). Fast-moving figures the World Bank
// doesn't carry in real time — the policy/repo rate and the latest monthly CPI —
// are handled as dated, editable inputs in the app, not faked here.
//
// If a fetch fails (offline, blocked, API down), callers fall back to the
// built-in baseline in model.js. The app never breaks.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://api.worldbank.org/v2";

// World Bank indicator codes
const INDICATORS = {
  gdpGrowth: "NY.GDP.MKTP.KD.ZG",   // GDP growth (annual %)
  inflation: "FP.CPI.TOTL.ZG",      // Inflation, consumer prices (annual %)
  investment: "NE.GDI.FTOT.ZS",     // Gross fixed capital formation (% of GDP)
  unemployment: "SL.UEM.TOTL.ZS",   // Unemployment (% of labour force, modelled ILO)
  gdpLCU: "NY.GDP.MKTP.CN",         // GDP (current local currency units)
  cons: "NE.CON.PRVT.ZS",           // Household consumption (% of GDP) → C
  govt: "NE.CON.GOVT.ZS",           // Government consumption (% of GDP) → G
  exports: "NE.EXP.GNFS.ZS",        // Exports of goods & services (% of GDP) → X
  imports: "NE.IMP.GNFS.ZS",        // Imports of goods & services (% of GDP) → M
};

async function fetchIndicator(iso3, code, signal) {
  const url = `${BASE}/country/${iso3}/indicator/${code}?format=json&per_page=60&date=2010:2027`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`World Bank ${code}: ${res.status}`);
  const json = await res.json();
  const rows = Array.isArray(json) ? json[1] : null;
  if (!Array.isArray(rows)) return null;
  const valid = rows
    .filter((r) => r && r.value != null)
    .sort((a, b) => Number(b.date) - Number(a.date));
  if (!valid.length) return null;
  return { value: valid[0].value, year: valid[0].date };
}

// Fetch all indicators for a country (ISO-3 code). Returns
// { status: 'live' | 'error', data, asOf } where data holds {value, year} per key.
export async function fetchCountryData(iso3, { timeoutMs = 9000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const pairs = await Promise.all(
      Object.entries(INDICATORS).map(async ([key, code]) => {
        try {
          return [key, await fetchIndicator(iso3, code, controller.signal)];
        } catch {
          return [key, null];
        }
      })
    );
    clearTimeout(timer);
    const data = Object.fromEntries(pairs);

    // Consider it a success only if the core series came back
    if (!data.gdpGrowth && !data.investment && !data.cons) {
      return { status: "error" };
    }

    const years = Object.values(data).filter(Boolean).map((d) => Number(d.year));
    const asOf = years.length ? Math.max(...years) : null;
    return { status: "live", data, asOf };
  } catch {
    clearTimeout(timer);
    return { status: "error" };
  }
}

// ── Live exchange rate (the rand) ────────────────────────────────────────────
// The one genuinely fresh, free, no-key, CORS-friendly feed a browser can pull.
// Frankfurter (ECB reference rates) primary; open.er-api.com as fallback.
// Updates on banking days — genuinely auto-updating, not a snapshot.

function isoDaysAgo(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function fetchFX({ timeoutMs = 7000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Primary: Frankfurter (USD → ZAR), with a 30-day change
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=ZAR", { signal: controller.signal });
      if (res.ok) {
        const j = await res.json();
        const rate = j?.rates?.ZAR;
        const date = j?.date;
        if (rate && date) {
          let change30 = null;
          try {
            const ts = await fetch(`https://api.frankfurter.app/${isoDaysAgo(date, 30)}..${date}?from=USD&to=ZAR`, { signal: controller.signal });
            if (ts.ok) {
              const tj = await ts.json();
              const vals = tj?.rates ? Object.keys(tj.rates).sort().map((k) => tj.rates[k].ZAR) : [];
              if (vals.length >= 2) change30 = ((vals[vals.length - 1] - vals[0]) / vals[0]) * 100;
            }
          } catch { /* change is best-effort */ }
          clearTimeout(timer);
          return { status: "live", usdZar: rate, date, change30, source: "ECB / Frankfurter" };
        }
      }
    } catch { /* fall through to backup */ }

    // Fallback: open.er-api.com
    const res2 = await fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal });
    if (res2.ok) {
      const j2 = await res2.json();
      const rate = j2?.rates?.ZAR;
      if (rate) {
        const date = j2?.time_last_update_utc ? new Date(j2.time_last_update_utc).toISOString().slice(0, 10) : null;
        clearTimeout(timer);
        return { status: "live", usdZar: rate, date, change30: null, source: "ExchangeRate-API" };
      }
    }
    clearTimeout(timer);
    return { status: "error" };
  } catch {
    clearTimeout(timer);
    return { status: "error" };
  }
}
export function normalise(result) {
  if (!result || result.status !== "live") return null;
  const d = result.data;
  const num = (x) => (x && typeof x.value === "number" ? x.value : undefined);

  // expenditure shares as fractions of GDP
  const shares = {};
  if (num(d.cons) != null) shares.C = num(d.cons) / 100;
  if (num(d.investment) != null) shares.I = num(d.investment) / 100;
  if (num(d.govt) != null) shares.G = num(d.govt) / 100;
  if (num(d.exports) != null) shares.X = num(d.exports) / 100;
  if (num(d.imports) != null) shares.M = num(d.imports) / 100;

  return {
    actuals: {
      gdpGrowth: num(d.gdpGrowth),
      inflation: num(d.inflation),
      investment: num(d.investment),
      unemployment: num(d.unemployment),
    },
    years: {
      gdpGrowth: d.gdpGrowth?.year,
      inflation: d.inflation?.year,
      investment: d.investment?.year,
      unemployment: d.unemployment?.year,
    },
    shares: Object.keys(shares).length ? shares : undefined,
    gdpLevelBn: num(d.gdpLCU) != null ? num(d.gdpLCU) / 1e9 : undefined, // local currency, billions
    asOf: result.asOf,
  };
}
