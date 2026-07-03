// ─────────────────────────────────────────────────────────────────────────────
// SOUTH AFRICA BASELINE — June 2026
// Sources: Stats SA (GDP Q4 2025), National Treasury 2026 Budget, SARB,
// Operation Vulindlela progress reports, World Bank.
// The expenditure split is an exact identity. The behavioural links (rates →
// investment, growth → inflation & jobs) are a transparent model; key
// assumptions are exposed in the UI. Reform uplifts are illustrative estimates.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SOUTH AFRICA BASELINE
// Sources: Stats SA, SARB, National Treasury 2026 Budget, Operation Vulindlela,
// World Bank (the live feed). The expenditure split is an exact identity. The
// behavioural links (rates → investment, growth → inflation & jobs) are a
// transparent model; key assumptions are exposed in the UI.
//
// Verified official figures, current as of late June 2026:
//   • Repo rate 7.00% — SARB hiked 25bps from 6.75% on 28 May 2026 (prime 10.5%);
//     next MPC 23 July 2026.
//   • CPI 4.5% (May 2026, Stats SA) — up from 4.0% April; SARB forecasts 4.4%
//     average 2026, back to the 3% target by 2028.
//   • Real GDP +1.1% in 2025 (Stats SA). Latest print Q1 2026: +0.5% q/q and
//     +1.9% y/y (Stats SA, 3 Jun 2026) — sixth straight quarter of expansion,
//     finance-led, manufacturing the drag, fixed investment still falling (−1.1%).
//     SARB's May-MPC forecast for 2026 is 1.2%.
//   • Official unemployment 32.7% (QLFS Q1 2026, Stats SA, 12 May 2026).
//   • Inflation target: 3% with a ±1pp tolerance band (framework adopted Nov 2025,
//     replacing the old 3–6% range).
// Confirm the fast-moving figures (repo, monthly CPI) after each release — there's
// no free real-time feed for them; see notes in dataService.js.
// ─────────────────────────────────────────────────────────────────────────────

export const SETPOINT = 3.0;        // target: minimum real GDP growth, %
export const GDP_LEVEL = 7300;      // approx nominal GDP, R billion → 1pp ≈ R73bn

// Latest hard figures from official sources — confirm after each release.
export const LATEST = {
  repo: { value: 7.0, asOf: "May 2026" },       // SARB MPC, 28 May 2026
  cpi: { value: 4.5, asOf: "May 2026" },        // Stats SA, released 17 Jun 2026
  gdp: { qoq: 0.5, yoy: 1.9, asOf: "Q1 2026" }, // Stats SA, released 3 Jun 2026
  unemployment: { value: 32.7, asOf: "Q1 2026" }, // QLFS Q1 2026, Stats SA, 12 May 2026
  growth2025: 1.1,                              // Stats SA, real GDP 2025
  growthForecast2026: 1.2,                      // SARB forecast, May 2026 MPC
  target: { point: 3, tol: 1 },                 // 3% ±1pp, adopted Nov 2025
};

// The repo rate has no free real-time feed — it's set at SARB MPC meetings.
export const REPO_AS_OF = LATEST.repo.asOf;
export const SARB_URL = "https://www.resbank.co.za/en/home/what-we-do/monetary-policy";

// Connected macro-model parameters
export const PARAMS = {
  PI_E: 3.5,            // inflation expectations, anchoring toward the new 3% target
  C_BASE: 1.6,         // baseline consumption growth
  THETA_C: 0.25,       // consumption sensitivity to the real rate
  I_NORM: 2.0,         // "normal" investment growth
  LAMBDA_I: 0.15,      // how investment above normal lifts potential
  POT_BASE: 1.3,       // current potential (trend) growth — SA's low speed limit
  KAPPA: 0.45,         // Phillips slope: output gap → inflation
  PROD_TREND: 1.0,     // productivity trend → jobs = growth − this
  EMPLOYED: 16800,     // thousands employed (QLFS ~16.8m)
  NEW_ENTRANTS: 360,   // ~k jobs/yr needed just to hold unemployment steady
  shares: { C: 0.60, I: 0.15, G: 0.21, X: 0.30, M: 0.30 }, // expenditure shares of GDP
};

export const LEVER_DEFAULTS = { repo: 7.0, gG: 1.0, gI: 2.0, gX: 2.0 };
export const ASSUMPTION_DEFAULTS = { neutral: 2.75, thetaI: 0.8, shock: 0.5 };

// Lever metadata for the Solver UI
export const LEVERS = [
  { id: "repo", name: "Repo rate", group: "Policy", min: 1, max: 12, step: 0.25, unit: "%", note: "↓ cuts boost investment + consumption", invert: true },
  { id: "gG",   name: "Govt spending growth", group: "Policy", min: -4, max: 10, step: 0.25, unit: "%", note: "≈0.21pp per pp · watch debt (~79% GDP)" },
  { id: "gI",   name: "Investment growth", group: "Investment & trade", min: -5, max: 12, step: 0.25, unit: "%", note: "drives capacity → raises potential" },
  { id: "gX",   name: "Export growth", group: "Investment & trade", min: -8, max: 14, step: 0.25, unit: "%", note: "≈0.30pp per pp · world demand + rand" },
];

export const SOLVER_PRESETS = {
  baseline: { label: "SA baseline", v: { repo: 7.0, gG: 1.0, gI: 2.0, gX: 2.0 } },
  demand:   { label: "Demand-led dash", v: { repo: 2.0, gG: 5.0, gI: 2.0, gX: 2.0 } },
  reform:   { label: "Investment + trade", v: { repo: 6.0, gG: 1.0, gI: 7.0, gX: 4.0 } },
};

// Production side — sector shares of GVA (≈100%) and recent growth trajectories.
// GDP growth is the exact share-weighted sum of these.
export const SECTORS = [
  { id: "agri",   name: "Agriculture, forestry & fishing", short: "Agri",     weight: 2.6,  g: 3.0 },
  { id: "mining", name: "Mining & quarrying",              short: "Mining",   weight: 7.7,  g: -0.5 },
  { id: "manuf",  name: "Manufacturing",                   short: "Manuf",    weight: 13.4, g: 0.8 },
  { id: "util",   name: "Electricity, gas & water",        short: "Util",     weight: 3.6,  g: 1.0 },
  { id: "constr", name: "Construction",                    short: "Constr",   weight: 2.8,  g: 1.5 },
  { id: "trade",  name: "Trade, catering & accommodation", short: "Trade",    weight: 15.0, g: 1.6 },
  { id: "transp", name: "Transport, storage & comms",      short: "Transp",   weight: 8.8,  g: 2.0 },
  { id: "fin",    name: "Finance, real estate & business", short: "Finance",  weight: 22.7, g: 2.2 },
  { id: "govt",   name: "General government services",     short: "Govt",     weight: 17.5, g: 0.5 },
  { id: "pers",   name: "Personal services",               short: "Personal", weight: 5.9,  g: 1.2 },
];

export const SECTOR_PRESETS = {
  baseline: { label: "SA baseline", g: Object.fromEntries(SECTORS.map((s) => [s.id, s.g])) },
  drought:  { label: "Drought hits agriculture", g: { ...Object.fromEntries(SECTORS.map((s) => [s.id, s.g])), agri: -6 } },
  revival:  { label: "Mining & manufacturing revival", g: { ...Object.fromEntries(SECTORS.map((s) => [s.id, s.g])), mining: 3, manuf: 4.5 } },
};

// Investment context for the diagnosis
export const INVESTMENT = { now: 13.7, target: 30, avg2010s: 17.5 }; // GFCF % of GDP

// Binding constraints — each lifts potential growth if fully resolved.
// status.tone: ok (govt acting, progressing) | warn (slow / partial) | bad (gap / outside program)
export const CONSTRAINTS = [
  { id: "energy",    name: "Electricity supply & market", icon: "Bolt",          lift: 0.6,
    status: { tag: "In Op. Vulindlela · stabilising", tone: "ok" },
    wrong: "Years of load-shedding cut up to ~1.5pp off growth; supply is steadier but still fragile.",
    fix: "Build grid capacity, end wheeling/trading policy uncertainty, fix municipal distribution decay." },
  { id: "logistics", name: "Freight rail & ports", icon: "Train",                lift: 0.4,
    status: { tag: "In Op. Vulindlela · in progress", tone: "ok" },
    wrong: "Transnet's decline strands mining & manufacturing exports — a direct hit to the tradable economy.",
    fix: "Scale up private rail access (11 operators awarded); conclude port concessions stuck in litigation." },
  { id: "crime",     name: "Crime & corruption", icon: "ShieldAlert",            lift: 0.4,
    status: { tag: "Gap · largely outside the program", tone: "bad" },
    wrong: "Raises the cost of doing business and is a top deterrent to fixed investment.",
    fix: "Policing capacity, faster prosecution, and real anti-corruption enforcement." },
  { id: "state",     name: "State capacity & municipalities", icon: "Building2", lift: 0.3,
    status: { tag: "In Op. Vulindlela Phase 2", tone: "warn" },
    wrong: "Dysfunctional metros choke service delivery and local investment.",
    fix: "Run water/electricity as accountable utilities, pass MFMA reforms, enforce consequences." },
  { id: "skills",    name: "Skills, labour & education", icon: "GraduationCap",  lift: 0.3,
    status: { tag: "Partly addressed (visas)", tone: "warn" },
    wrong: "Skills shortages and weak schooling outcomes cap productivity; some labour rigidity.",
    fix: "Scarce-skills visas (started), education quality, and labour-market flexibility (contested)." },
  { id: "water",     name: "Water security", icon: "Droplets",                   lift: 0.2,
    status: { tag: "In Op. Vulindlela · slow", tone: "warn" },
    wrong: "An emerging binding constraint, especially in Gauteng — threatens new investment.",
    fix: "Stand up the national water agency & regulator; halt municipal infrastructure decay." },
  { id: "fiscal",    name: "Fiscal space & the wage bill", icon: "Landmark",     lift: 0.3,
    status: { tag: "Gap · Treasury, outside the program", tone: "bad" },
    wrong: "Debt ~79% of GDP; debt-service eats ~17% of spending, crowding out public investment.",
    fix: "Contain the wage bill and SOE bailouts; reprioritise spending toward infrastructure." },
];

export const BIG_FOUR = ["energy", "logistics", "crime", "state"];
