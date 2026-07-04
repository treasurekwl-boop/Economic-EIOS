// ─────────────────────────────────────────────────────────────────────────────
// TRADING DESK — your personal watchlist universe. Each instrument maps to a
// Yahoo Finance symbol (pulled as daily history by the GitHub Action) AND to a
// node in the causal brain, so a macro shock can be traced onto your positions.
//
// `invert: true` means the QUOTE moves opposite to the graph node: e.g. the
// USD/ZAR quote rises when the rand (the node) weakens.
// Prices are delayed / end-of-day from a free feed — analysis, not a live terminal.
// ─────────────────────────────────────────────────────────────────────────────

export const INSTRUMENTS = [
  // ── FX (rand pairs) ──
  { id: "usdzar", sym: "ZAR=X",    label: "USD / ZAR", type: "fx", node: "rand", invert: true,  fmt: "R", dp: 2 },
  { id: "eurzar", sym: "EURZAR=X", label: "EUR / ZAR", type: "fx", node: "rand", invert: true,  fmt: "R", dp: 2 },
  { id: "gbpzar", sym: "GBPZAR=X", label: "GBP / ZAR", type: "fx", node: "rand", invert: true,  fmt: "R", dp: 2 },

  // ── Commodities & metals ──
  { id: "gold",     sym: "GC=F", label: "Gold",     type: "commodity", node: "gold",     invert: false, fmt: "$", dp: 0 },
  { id: "platinum", sym: "PL=F", label: "Platinum", type: "commodity", node: "platinum", invert: false, fmt: "$", dp: 0 },
  { id: "brent",    sym: "BZ=F", label: "Brent",    type: "commodity", node: "oil",      invert: false, fmt: "$", dp: 1 },

  // ── JSE shares & index (quoted in ZAc = rand-cents on Yahoo) ──
  // Each maps to the economic node that most drives it: a gold miner tracks the
  // gold price, a bank tracks the domestic economy (GDP), Naspers is a rand-hedge
  // (offshore assets → rises when the rand weakens, hence invert), Sasol tracks oil.
  { id: "jse40",  sym: "^J200.JO", label: "JSE Top 40",     type: "equity", node: "gdp",    invert: false, fmt: "",   dp: 0 },
  { id: "npn",    sym: "NPN.JO",   label: "Naspers",        type: "equity", node: "rand",   invert: true,  fmt: "ZAc", dp: 0 },
  { id: "fsr",    sym: "FSR.JO",   label: "FirstRand",      type: "equity", node: "gdp",    invert: false, fmt: "ZAc", dp: 0 },
  { id: "agl",    sym: "AGL.JO",   label: "Anglo American", type: "equity", node: "mining", invert: false, fmt: "ZAc", dp: 0 },
  { id: "sol",    sym: "SOL.JO",   label: "Sasol",          type: "equity", node: "oil",    invert: false, fmt: "ZAc", dp: 0 },
  { id: "gfi",    sym: "GFI.JO",   label: "Gold Fields",    type: "equity", node: "gold",   invert: false, fmt: "ZAc", dp: 0 },
];

// TradingView symbols for the embedded live charts (best-effort — the widget
// lets you change the symbol if an exchange code differs on your plan).
export const TV_SYMBOL = {
  usdzar: "FX_IDC:USDZAR", eurzar: "FX_IDC:EURZAR", gbpzar: "FX_IDC:GBPZAR",
  gold: "TVC:GOLD", platinum: "TVC:PLATINUM", brent: "TVC:UKOIL",
  jse40: "JSE:J200", npn: "JSE:NPN", fsr: "JSE:FSR", agl: "JSE:AGL", sol: "JSE:SOL", gfi: "JSE:GFI",
};

export const INSTRUMENT_TYPES = {
  fx:        { label: "FX", color: "#6FBDB4" },
  commodity: { label: "Commodities", color: "#D8AF6A" },
  equity:    { label: "JSE", color: "#7FB58A" },
};

// Preset macro shocks to run against the watchlist (each = a node + direction).
export const DESK_SHOCKS = [
  { id: "oil",       label: "Oil spikes",       node: "oil",  dir: 1 },
  { id: "randweak",  label: "Rand weakens",     node: "rand", dir: -1 },
  { id: "repo",      label: "SARB hikes",       node: "repo", dir: 1 },
  { id: "cut",       label: "SARB cuts",        node: "repo", dir: -1 },
  { id: "goldrally", label: "Gold rally",       node: "gold", dir: 1 },
  { id: "riskoff",   label: "Global risk-off",  node: "fed",  dir: 1 },
];

export const DESK_NOTE =
  "Prices are free, delayed / end-of-day data (Yahoo Finance via the every-30-min job) — for analysis, not live execution. Signals and shock impacts are modelled estimates, and none of this is financial advice: the calls are yours, and trades you place yourself in your broker.";
