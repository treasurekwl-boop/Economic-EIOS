# Growth Engine

A self-calibrating economic growth engine for **South Africa**, built in VS Code. It works *backwards* from a target: instead of watching the economy, it asks **what every lever must be to produce a steady 3%** — and tells you what's holding growth back and what to fix.

Four connected views, one shared model.

---

## Running it

You need [Node.js](https://nodejs.org) 18+.

```bash
npm install     # first time only
npm run dev     # opens http://localhost:5173
```

Build for production with `npm run build`, preview it with `npm run preview`.

In VS Code: `File → Open Folder…`, then run the commands in the integrated terminal (`` Ctrl+` ``).

---

## The four views

- **Overview** — engine status: solved growth vs the 3% setpoint, the inflation and jobs that fall out, and whether the result is *durable* or *borrowed*.
- **Solver** — the connected macro engine. Set the levers (repo rate, government spending, investment, exports); the engine solves the expenditure identity and reports inflation and jobs. The repo rate flows through investment and consumption — it's not a detached dial. *Solve to 3%* moves the unlocked levers for you.
- **Sectors** — the production side. GDP growth is the exact share-weighted sum of the ten sectors. Drag one down (try the drought preset) and watch the shortfall and what must compensate.
- **Diagnosis** — what's actually wrong: the binding constraints holding potential growth near 1.3%, what the government is already doing about each (Operation Vulindlela), and what still has to change. Toggle fixes and watch potential climb toward 3%.

**They're connected.** Reforms you apply in **Diagnosis** raise the economy's *potential growth*, which flows into the **Solver** and **Overview** as the structural contribution. That's the core lesson made literal: 3% is durable only when the supply side (reform) does the work, not when the repo rate is forced.

---

## Live data

The structural figures are pulled live from the **World Bank Open Data API** — free, no key, fetched straight from the browser — and auto-update as new figures publish. On load (and on country change) the app fetches GDP growth, inflation, the investment rate, unemployment, the expenditure shares (C/I/G/X−M), and GDP size, then feeds them into the engine. The status strip under the tabs shows whether data is **Live** (with its vintage), **Fetching**, or **Offline** (using the built-in baseline). A **Refresh** button re-pulls.

The app also pulls the **live USD/ZAR exchange rate** (ECB reference rates via Frankfurter, with ExchangeRate-API as a fallback) — free, no key, and updated every banking day. It's shown on the Overview and in the status strip. The rand is the freshest signal here and the main channel behind 2026's fuel-driven inflation.

### What auto-updates, and what doesn't

| Figure | Source | Auto-updates? | Freshness |
|--------|--------|---------------|-----------|
| GDP growth, inflation, investment, unemployment, expenditure shares, GDP size | World Bank API | **Yes**, on load / refresh | Annual, lagged ~1–2 yrs |
| USD/ZAR exchange rate | Frankfurter / ExchangeRate-API | **Yes**, on load / refresh | Daily (banking days) |
| Repo rate, latest monthly CPI, quarterly GDP | hardcoded snapshot | **No** — edit after each release | Today's confirmed values |

That's the honest picture: a browser app with no backend and no API keys can auto-update the World Bank series and the exchange rate, and nothing else. Making the repo rate, monthly CPI, and quarterly GDP auto-update needs the backend proxy described below.

Two honest limits, by design:

- **World Bank data is annual and lagged** (typically 1–2 years). That's the right granularity for structural figures — sector shares and the investment rate don't move month to month — but it means "latest available year," not "this morning."
- **The repo rate and the latest monthly CPI have no free real-time feed.** They're set at SARB meetings / published monthly, so they're **dated, editable** values you confirm after each release (there's a "check SARB" link in the status strip). Current verified figures: repo **7.00%** (SARB, 28 May 2026), CPI **4.5%** (Stats SA, May 2026), real GDP **+1.1%** in 2025, target **3% ±1pp**.

### Pulling from South African government sources directly

The natural question is whether the app can fetch straight from **SARB** and **Stats SA** instead of the World Bank. The honest position:

- **SARB publishes a data API** (listed on its statistics page), which is the right home for the repo rate, the exchange rate, and the Quarterly Bulletin series. **Stats SA**, by contrast, releases GDP, CPI, and the QLFS mainly as PDF/Excel — there's no clean public JSON API for headline figures.
- The blocker for a *pure frontend* is **CORS**: the World Bank API sends permissive CORS headers (which is why it works in-browser); most government endpoints don't, so the browser refuses the request even when the data is public.
- The fix is a **thin backend proxy** — a small Node service that fetches SARB's API (and scrapes the Stats SA releases), normalises the numbers, and serves clean JSON the frontend can read. That's the same backend that would hold an API key for any paid real-time provider. It's the one piece that turns "confirm after each release" into true auto-pull from official SA sources.

Until that proxy exists, the app uses the World Bank live feed for annual structural data and these confirmed values for the fast-moving SA figures.

Selecting a different country fetches *that* country's real World Bank figures, so the Solver, Diagnosis, and Overview become country-correct. The 10-sector split and the behavioural assumptions remain South-Africa-calibrated.

If the World Bank API is unreachable (offline, blocked network), the app silently falls back to the June 2026 baseline and says so. It never breaks.

## What's exact vs modelled

- **Exact (accounting identities):** GDP = C + I + G + X − M, and GDP growth = the weighted sum of sectors. These are not estimates.
- **Modelled (transparent assumptions):** how the repo rate moves investment (β), how the output gap moves inflation (Phillips), how growth moves jobs (Okun), and how investment + reform lift potential. The key assumptions sit on sliders in the Solver so you can argue with them.
- **Illustrative:** the per-reform potential-growth uplifts in the Diagnosis are drawn from published reform-impact ranges, not precise forecasts.

Sources: World Bank (live), Stats SA, National Treasury 2026 Budget, SARB, Operation Vulindlela.

## Where it goes next

- **Calibration**: tune the elasticities against history instead of assuming them.
- A keyed data provider for true real-time policy rates and monthly CPI, if you want sub-annual freshness.
- Scenario saving, and an AI briefing that explains each solve in plain language.

---

## Project structure

```
src/
├── main.jsx                 # React root + EngineProvider
├── App.jsx                  # header + tab nav + view switching
├── index.css                # Tailwind + instrument-panel base styles
├── config/
│   ├── model.js             # ALL SA baseline data: params, sectors, expenditure, constraints
│   └── countries.js
├── context/
│   └── EngineContext.jsx    # shared state: levers, assumptions, sectors, reforms
├── lib/
│   ├── engine.js            # the connected model (run) + the target-seeking solver
│   ├── dataService.js       # live World Bank fetch + normalisation + fallback
│   └── format.js            # number helpers
└── components/
    ├── layout/              # Header, Nav, DataStatus (live-data strip)
    ├── views/               # Overview, Solver, Sectors, Diagnosis
    └── ui/                  # Stat, Gauge
```

`config/model.js` is the single source of truth. Change South Africa's numbers — or add another country's — in one place and every view updates.

---

## Where it goes next

- A **Sensor layer** that pulls live per-country data (World Bank, SARB) so the baseline isn't hardcoded.
- **Calibration**: tune the elasticities against history instead of assuming them.
- Scenario saving, and an AI briefing that explains each solve in plain language.

## Tech

Vite · React 18 · Tailwind CSS · Recharts · lucide-react.
