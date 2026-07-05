// ─────────────────────────────────────────────────────────────────────────────
// EVENT-REACTION LIBRARY — how SA assets typically respond to the major event
// surprises. These are CURATED, documented DIRECTIONAL priors with typical
// magnitude RANGES — not coefficients fitted from a live regression (that needs a
// multi-year event-price database the app doesn't have; see the honest note in the
// view). Direction is high-confidence and well-established; magnitudes are typical
// ballparks, flagged by confidence. The live event-study code (lib/eventStudy.js)
// measures ACTUAL reactions from the price feed as events pass through it.
//
// Convention: `surprise` is signed in the event's natural "up/more/hotter" units
// (positive = hotter CPI / a surprise HIKE / hawkish Fed / a DOWNGRADE / higher
// load-shedding stage / more severe shock). `sign` is each asset's response to a
// +1-step positive surprise. Rand is quoted as USD/ZAR, so +sign = a WEAKER rand.
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  {
    id: "cpi", name: "CPI inflation surprise", node: "cpi",
    step: 0.1, unit: "pp", range: [-0.6, 0.6], posLabel: "hotter", negLabel: "cooler",
    blurb: "Actual CPI vs consensus. Mostly a bond story — the rand reaction is small and two-sided.",
    assets: [
      { asset: "SA 10y bond yield", sign: +1, per: 3, u: "bps", conf: "high", note: "Hotter CPI → higher-for-longer repricing → yields up (bond down)." },
      { asset: "USD/ZAR", sign: -1, per: 0.15, u: "%", conf: "low", note: "Ambiguous: hawkish carry support (rand firms) vs. macro-stress. Small." },
      { asset: "JSE rate-sensitives", sign: -1, per: 0.2, u: "%", conf: "med", note: "Property & retail soften on higher-for-longer." },
    ],
    decay: "Bond move largely sticks; any FX move fades within days.",
  },
  {
    id: "mpc", name: "SARB MPC surprise", node: "repo",
    step: 25, unit: "bps", range: [-50, 50], posLabel: "surprise hike", negLabel: "surprise cut",
    blurb: "The decision vs what was priced. A genuine surprise (not the telegraphed move) is what moves markets.",
    assets: [
      { asset: "USD/ZAR", sign: -1, per: 0.6, u: "%", conf: "med", note: "A surprise hike lifts carry → rand firms (USD/ZAR down)." },
      { asset: "SA 2y bond yield", sign: +1, per: 22, u: "bps", conf: "high", note: "Front-end reprices hard to a surprise." },
      { asset: "JSE banks", sign: +1, per: 0.5, u: "%", conf: "med", note: "Higher rates lift net interest margins." },
    ],
    decay: "Rate move permanent; FX/equity reaction settles over 1–3 days.",
  },
  {
    id: "fed", name: "US Fed decision / tone", node: "repo",
    step: 25, unit: "bps", range: [-50, 50], posLabel: "hawkish surprise", negLabel: "dovish surprise",
    blurb: "SA is a high-beta EM — a hawkish Fed pulls capital to the dollar and hits the rand hard. The single biggest external driver.",
    assets: [
      { asset: "USD/ZAR", sign: +1, per: 0.8, u: "%", conf: "high", note: "Hawkish Fed → stronger dollar, EM outflow → rand weakens." },
      { asset: "SA 10y bond yield", sign: +1, per: 8, u: "bps", conf: "high", note: "Global yields drag SA yields up." },
      { asset: "JSE Top 40", sign: -1, per: 0.7, u: "%", conf: "med", note: "Risk-off; rate-sensitive and rand-hedge offset." },
    ],
    decay: "Can persist for weeks if it shifts the whole Fed path.",
  },
  {
    id: "rating", name: "Sovereign rating action", node: "debt",
    step: 1, unit: "notch", range: [-2, 2], posLabel: "downgrade / negative", negLabel: "upgrade / positive",
    blurb: "Ratings & watchlist changes (incl. FATF-style actions) hit the risk premium directly. Often partly pre-priced, but the tail is fat.",
    assets: [
      { asset: "USD/ZAR", sign: +1, per: 1.5, u: "%", conf: "high", note: "A downgrade lifts the sovereign risk premium → rand weakens." },
      { asset: "SA 10y bond yield", sign: +1, per: 25, u: "bps", conf: "high", note: "Yields jump on higher default/forced-selling risk." },
    ],
    decay: "Semi-permanent — it re-rates the whole curve until reversed.",
  },
  {
    id: "loadshed", name: "Load-shedding escalation", node: "energy",
    step: 1, unit: "stage", range: [-3, 3], posLabel: "worse (higher stage)", negLabel: "better (lower stage)",
    blurb: "An operational-energy shock with direct growth and inflation consequences (the Mar-2025 episode).",
    assets: [
      { asset: "USD/ZAR", sign: +1, per: 0.3, u: "%", conf: "med", note: "Growth-negative → mild rand weakness." },
      { asset: "JSE Top 40", sign: -1, per: 0.4, u: "%", conf: "med", note: "Domestically-geared sectors bear the cost." },
    ],
    decay: "Tracks how long the escalation persists.",
  },
  {
    id: "political", name: "Political / fiscal shock", node: "rand",
    step: 1, unit: "severity", range: [0, 3], posLabel: "more severe", negLabel: "—",
    blurb: "Finance-minister / cabinet shocks. The fat-tail event — the Dec-2015 Nene dismissal moved the rand >5% to a record low.",
    assets: [
      { asset: "USD/ZAR", sign: +1, per: 2.0, u: "%", conf: "med", note: "Gaps weaker on institutional/fiscal-credibility risk." },
      { asset: "JSE banks", sign: -1, per: 3.0, u: "%", conf: "med", note: "Banks (SA-Inc proxy) sold hardest in 2015." },
    ],
    decay: "Sharp, then partial retrace if credibility is restored.",
  },
  {
    id: "gdp", name: "GDP / activity surprise", node: "gdp",
    step: 0.1, unit: "pp q/q", range: [-0.8, 0.8], posLabel: "stronger", negLabel: "weaker",
    blurb: "Growth surprises move the rand modestly via the growth/fiscal channel; smaller and slower than rate or global shocks.",
    assets: [
      { asset: "USD/ZAR", sign: -1, per: 0.2, u: "%", conf: "low", note: "Stronger growth → modest rand support." },
      { asset: "JSE Top 40", sign: +1, per: 0.3, u: "%", conf: "low", note: "Cyclicals firm on better activity." },
    ],
    decay: "Slow-burn; matters more for the trend than the day.",
  },
];

export const EVENT_BY_ID = Object.fromEntries(EVENT_TYPES.map((e) => [e.id, e]));

export const CONF_COLOR = { high: "#7FB58A", med: "#C6A15B", low: "#8A8F88" };

export const REACTION_NOTE =
  "Directional priors are well-documented; magnitudes are typical ranges, not live-fitted coefficients (that needs a multi-year event-price panel — a real data gap, not a fudge). The measured column fills in from your own price feed as CPI/MPC events pass through it.";
