// ─────────────────────────────────────────────────────────────────────────────
// THE ECONOMIC BRAIN — a knowledge graph, not a page.
// Every metric, lever, sector, commodity and constraint is a NODE. Every causal
// link is a directed EDGE with a mechanism and a tone (support / pressure).
// The app's screens are windows into this one graph; the Intelligence view lets
// you stand on any node and see what moves it and what it moves — then walk the
// chain. This is the connective tissue that makes the platform a digital twin
// rather than a stack of dashboards.
// ─────────────────────────────────────────────────────────────────────────────
import { edgeMultiplier } from "./lenses.js";

// Node categories → the six-accent premium palette + a couple of neutrals.
export const NODE_TYPES = {
  global:     { label: "Global",      color: "#8A8F88" },
  currency:   { label: "Currency",    color: "#6FBDB4" },
  price:      { label: "Prices",      color: "#C6A15B" },
  policy:     { label: "Policy",      color: "#A99BF5" },
  demand:     { label: "Demand",      color: "#D8AF6A" },
  output:     { label: "Output",      color: "#F3F1EA" },
  labour:     { label: "Labour",      color: "#D98BB6" },
  people:     { label: "People",      color: "#7FB58A" },
  sector:     { label: "Sectors",     color: "#6FBDB4" },
  constraint: { label: "Constraints", color: "#D8735E" },
  commodity:  { label: "Commodities", color: "#D8AF6A" },
  fiscal:     { label: "Fiscal",      color: "#E08B70" },
};

// `val`: a static current reading (live ones are resolved in the view from the
// engine feed). `note`: the one-line identity of the node.
export const NODES = [
  // Global
  { id: "oil",    label: "Brent crude",         type: "global", val: "~$75", note: "SA imports all its oil; crude sets fuel and the import bill." },
  { id: "fed",    label: "US rates / global risk", type: "global", note: "Higher US rates or risk-off pull capital out of emerging markets." },
  { id: "world",  label: "World demand",        type: "global", note: "The buyers for SA's exports — commodities, cars, citrus." },

  // Currency & prices
  { id: "rand",   label: "The rand",            type: "currency", live: "rand", note: "USD/ZAR — the economy's daily mood ring; weakness feeds inflation." },
  { id: "fuel",   label: "Fuel price",          type: "price", val: "~R21/l", note: "Oil × rand × levies, administered monthly with a lag." },
  { id: "cpi",    label: "Headline CPI",        type: "price", live: "cpi", note: "How fast prices rise; target 3% ±1pp." },
  { id: "core",   label: "Core inflation",      type: "price", val: "3.8%", note: "CPI without food & fuel — the underlying, home-grown pressure." },
  { id: "food",   label: "Food prices",         type: "price", val: "1.9%", note: "The most regressive inflation — hits the poorest hardest." },
  { id: "infexp", label: "Inflation expectations", type: "price", note: "What firms and workers expect — partly self-fulfilling." },

  // Money & policy
  { id: "repo",   label: "Repo rate",           type: "policy", live: "repo", note: "SARB's main dial; sets the cost of money to hit the 3% target." },
  { id: "realrate", label: "Real interest rate", type: "policy", val: "3.5%", note: "Repo minus expected inflation — what borrowing really costs." },
  { id: "credit", label: "Credit",              type: "policy", note: "Loans to households and firms, rationed by the repo rate." },

  // Demand (the GDP identity)
  { id: "C",  label: "Consumption",  type: "demand", val: "60% of GDP", note: "Household spending — the biggest slice of GDP." },
  { id: "I",  label: "Investment",   type: "demand", val: "13.7%", note: "GFCF — builds capacity: demand today, potential tomorrow." },
  { id: "G",  label: "Govt spending", type: "demand", note: "State expenditure, squeezed by the debt-service bill." },
  { id: "X",  label: "Exports",      type: "demand", note: "What SA sells to the world." },
  { id: "M",  label: "Imports",      type: "demand", note: "What SA buys — subtracted from GDP." },

  // Output
  { id: "gdp",       label: "GDP",              type: "output", live: "gdp", note: "The sum of it all: C + I + G + X − M." },
  { id: "potential", label: "Potential growth", type: "output", val: "1.3%", note: "The speed limit — what the economy can sustain without overheating." },
  { id: "gap",       label: "Output gap",       type: "output", note: "Actual minus potential — positive means running hot." },

  // Labour & people
  { id: "jobs",       label: "Employment",     type: "labour", val: "16.8m", note: "Jobs grow with output minus productivity." },
  { id: "unemp",      label: "Unemployment",   type: "labour", live: "unemp", note: "8.1m want work the economy isn't creating." },
  { id: "households", label: "Households",     type: "people", note: "Where income becomes spending and saving." },
  { id: "savings",    label: "Savings",        type: "people", val: "15%", note: "The domestic pool that should fund investment." },
  { id: "wages",      label: "Wages",          type: "people", note: "Labour income — and a cost to firms." },

  // Sectors
  { id: "mining", label: "Mining",        type: "sector", note: "Gold & PGMs — export earners, gated by rail." },
  { id: "manuf",  label: "Manufacturing", type: "sector", note: "Value-added industry, hit hardest by load-shedding." },
  { id: "agri",   label: "Agriculture",   type: "sector", note: "Small share of GDP, outsized food-price swing." },
  { id: "finance",label: "Finance",       type: "sector", note: "The biggest sector — 22.7% of output." },
  { id: "constr", label: "Construction",  type: "sector", note: "Nine years of decline; the investment thermometer." },

  // Constraints (drags on potential)
  { id: "energy",    label: "Energy / grid",    type: "constraint", note: "Load-shedding — the constraint that broke the economy." },
  { id: "logistics", label: "Rail & ports",     type: "constraint", note: "Transnet's decline strands mining & manufacturing exports." },
  { id: "crime",     label: "Crime & corruption", type: "constraint", note: "A top deterrent to fixed investment." },
  { id: "water",     label: "Water security",   type: "constraint", note: "The next load-shedding, especially in Gauteng." },
  { id: "skills",    label: "Skills & education", type: "constraint", note: "Weak schooling caps productivity and the speed limit." },
  { id: "state",     label: "Municipalities",   type: "constraint", note: "Failing metros choke local service delivery and investment." },

  // Commodities
  { id: "gold",     label: "Gold",       type: "commodity", val: "~$3,270", note: "SA's counter-cyclical insurance; rises when the world panics." },
  { id: "platinum", label: "Platinum (PGMs)", type: "commodity", note: "Biggest export complex; caught between EVs and hydrogen." },
  { id: "maize",    label: "Maize",      type: "commodity", note: "The staple; its price is the engine of food inflation." },

  // Fiscal
  { id: "debt",    label: "Government debt",  type: "fiscal", val: "78.9%", note: "Stabilising for the first time in 17 years." },
  { id: "debtsvc", label: "Debt-service cost", type: "fiscal", val: "~17%", note: "Interest eats R1 in every R6 the state spends." },
  { id: "tax",     label: "Tax base",        type: "fiscal", note: "A narrow base strains fiscal space." },
];

// Directed causal edges. tone: "support" (green — FROM rising helps TO),
// "pressure" (red — FROM rising hurts TO), "mixed" (gold). mech = the mechanism.
export const EDGES = [
  // Global → SA
  { from: "oil", to: "fuel", tone: "pressure", mech: "Crude is the refiner's cost — higher oil, higher pump price." },
  { from: "oil", to: "rand", tone: "pressure", mech: "A bigger oil import bill worsens the trade balance and weakens the rand." },
  { from: "fed", to: "rand", tone: "pressure", mech: "Higher US rates pull capital out of SA, weakening the rand." },
  { from: "fed", to: "repo", tone: "pressure", mech: "SARB can't stray too far from global rates without currency pain." },
  { from: "world", to: "X", tone: "support", mech: "Stronger global demand lifts SA's exports." },
  { from: "world", to: "mining", tone: "support", mech: "World growth bids for SA's minerals." },
  { from: "world", to: "gold", tone: "mixed", mech: "Risk-off lifts gold; risk-on drains the fear premium." },

  // Currency
  { from: "rand", to: "fuel", tone: "pressure", mech: "A weak rand makes imported oil dearer at the pump." },
  { from: "rand", to: "cpi", tone: "pressure", mech: "A weak rand raises the price of everything imported." },
  { from: "rand", to: "X", tone: "support", mech: "A weak rand makes SA exports cheaper abroad." },
  { from: "rand", to: "infexp", tone: "pressure", mech: "Currency weakness unanchors inflation expectations." },

  // Fuel & prices
  { from: "fuel", to: "cpi", tone: "pressure", mech: "Transport ran 9.4% — fuel is a heavy CPI weight." },
  { from: "fuel", to: "food", tone: "pressure", mech: "Diesel is the cost of moving every crop to market." },
  { from: "fuel", to: "C", tone: "pressure", mech: "Costlier fuel drains household real income." },
  { from: "food", to: "cpi", tone: "pressure", mech: "Food is a large, volatile slice of the basket." },
  { from: "food", to: "C", tone: "pressure", mech: "Food-price spikes crowd out other spending." },
  { from: "cpi", to: "infexp", tone: "pressure", mech: "Lived inflation shapes what people expect next." },
  { from: "cpi", to: "repo", tone: "pressure", mech: "Above-target inflation pushes SARB to hike." },
  { from: "cpi", to: "C", tone: "pressure", mech: "Inflation erodes real incomes and spending power." },
  { from: "core", to: "repo", tone: "pressure", mech: "Core is what SARB really targets — sticky pressure keeps it hawkish." },
  { from: "infexp", to: "repo", tone: "pressure", mech: "Unanchored expectations force a policy response." },
  { from: "infexp", to: "wages", tone: "pressure", mech: "Expected inflation drives wage demands." },

  // Policy
  { from: "repo", to: "realrate", tone: "pressure", mech: "A higher repo lifts the real cost of borrowing." },
  { from: "repo", to: "credit", tone: "pressure", mech: "Dearer money rations lending." },
  { from: "repo", to: "rand", tone: "support", mech: "Higher rates attract yield-seeking capital, supporting the rand." },
  { from: "realrate", to: "I", tone: "pressure", mech: "A higher hurdle rate kills marginal investment projects." },
  { from: "realrate", to: "C", tone: "pressure", mech: "Costlier credit curbs big-ticket consumption." },
  { from: "credit", to: "C", tone: "support", mech: "Available credit funds consumption." },
  { from: "credit", to: "I", tone: "support", mech: "Available credit funds firms' investment." },

  // Demand → output
  { from: "C", to: "gdp", tone: "support", mech: "Consumption is ~60% of GDP." },
  { from: "I", to: "gdp", tone: "support", mech: "Investment adds demand today." },
  { from: "I", to: "potential", tone: "support", mech: "Capital deepening raises the speed limit tomorrow." },
  { from: "I", to: "constr", tone: "support", mech: "Fixed investment is construction's order book." },
  { from: "I", to: "jobs", tone: "support", mech: "New capacity is new hiring." },
  { from: "G", to: "gdp", tone: "support", mech: "Government spending is a direct demand component." },
  { from: "X", to: "gdp", tone: "support", mech: "Exports add to output." },
  { from: "M", to: "gdp", tone: "pressure", mech: "Imports are subtracted in the GDP identity." },
  { from: "potential", to: "gdp", tone: "support", mech: "The speed limit is the ceiling growth can hold." },
  { from: "potential", to: "gap", tone: "support", mech: "A higher limit means less overheating at any output." },

  // Output → everything
  { from: "gdp", to: "gap", tone: "mixed", mech: "Output measured against potential is the gap." },
  { from: "gdp", to: "jobs", tone: "support", mech: "Growth above the productivity trend creates jobs." },
  { from: "gdp", to: "households", tone: "support", mech: "Output is ultimately household income." },
  { from: "gdp", to: "tax", tone: "support", mech: "A bigger economy is a bigger tax take." },
  { from: "gdp", to: "debt", tone: "support", mech: "Growth shrinks the debt-to-GDP ratio's denominator." },
  { from: "gap", to: "cpi", tone: "pressure", mech: "The Phillips link: overheating demand lifts prices." },
  { from: "gap", to: "core", tone: "pressure", mech: "A positive gap feeds underlying inflation." },

  // Labour & people
  { from: "jobs", to: "unemp", tone: "support", mech: "More jobs cut the unemployment queue." },
  { from: "jobs", to: "households", tone: "support", mech: "Employment is household income." },
  { from: "unemp", to: "C", tone: "pressure", mech: "Joblessness starves consumption." },
  { from: "unemp", to: "G", tone: "pressure", mech: "High unemployment raises the social-grant bill." },
  { from: "unemp", to: "crime", tone: "pressure", mech: "Idle, excluded youth feed the crime constraint." },
  { from: "households", to: "C", tone: "support", mech: "Households are the spenders." },
  { from: "households", to: "savings", tone: "support", mech: "What households don't spend, they save." },
  { from: "savings", to: "I", tone: "support", mech: "Domestic savings are the pool that funds investment." },
  { from: "wages", to: "C", tone: "support", mech: "Wages are spending power." },
  { from: "wages", to: "manuf", tone: "pressure", mech: "Wages are a cost that can price out industry." },

  // Sectors
  { from: "mining", to: "X", tone: "support", mech: "Minerals are a top export earner." },
  { from: "mining", to: "gdp", tone: "support", mech: "Mining is a direct slice of output." },
  { from: "manuf", to: "gdp", tone: "support", mech: "Manufacturing is 13% of value added." },
  { from: "manuf", to: "jobs", tone: "support", mech: "Industry is a large formal employer." },
  { from: "agri", to: "food", tone: "support", mech: "A good harvest lowers food prices." },
  { from: "agri", to: "X", tone: "support", mech: "Citrus, wine and fruit are strong exporters." },
  { from: "finance", to: "gdp", tone: "support", mech: "Finance is the single biggest sector." },
  { from: "finance", to: "I", tone: "support", mech: "The financial system channels savings into capital." },
  { from: "constr", to: "jobs", tone: "support", mech: "Construction is labour-intensive employment." },

  // Constraints (the drags)
  { from: "energy", to: "manuf", tone: "pressure", mech: "Load-shedding idles production lines." },
  { from: "energy", to: "I", tone: "pressure", mech: "Unreliable power deters fixed investment." },
  { from: "energy", to: "gdp", tone: "pressure", mech: "Blackouts shaved up to 1.5pp off growth at their worst." },
  { from: "energy", to: "potential", tone: "pressure", mech: "A capacity ceiling is a speed-limit ceiling." },
  { from: "logistics", to: "X", tone: "pressure", mech: "Rail and port failures strand exports at the mine." },
  { from: "logistics", to: "mining", tone: "pressure", mech: "Coal and ore can't reach the port." },
  { from: "crime", to: "I", tone: "pressure", mech: "Crime and corruption are top investment deterrents." },
  { from: "crime", to: "potential", tone: "pressure", mech: "A high cost of doing business lowers the ceiling." },
  { from: "water", to: "I", tone: "pressure", mech: "Water insecurity threatens new investment in Gauteng." },
  { from: "skills", to: "potential", tone: "pressure", mech: "Weak human capital caps productivity growth." },
  { from: "state", to: "I", tone: "pressure", mech: "Dysfunctional municipalities choke local investment." },
  { from: "state", to: "water", tone: "pressure", mech: "Municipal decay is the proximate cause of water loss." },

  // Commodities
  { from: "gold", to: "X", tone: "support", mech: "Gold is a major export line." },
  { from: "gold", to: "rand", tone: "support", mech: "A gold rally improves the terms of trade and firms the rand." },
  { from: "platinum", to: "X", tone: "support", mech: "PGMs are SA's biggest export complex." },
  { from: "platinum", to: "rand", tone: "support", mech: "Strong PGM prices support the current account and the rand." },
  { from: "maize", to: "food", tone: "pressure", mech: "Maize is the staple that anchors food inflation." },

  // Fiscal
  { from: "debt", to: "debtsvc", tone: "pressure", mech: "More debt means a bigger interest bill." },
  { from: "debt", to: "rand", tone: "pressure", mech: "A rising debt path lifts the sovereign risk premium." },
  { from: "debtsvc", to: "G", tone: "pressure", mech: "Interest is paid before any service — it crowds out spending." },
  { from: "debtsvc", to: "I", tone: "pressure", mech: "Debt service crowds out public investment." },
  { from: "tax", to: "G", tone: "support", mech: "Revenue funds government spending." },
  { from: "tax", to: "debt", tone: "support", mech: "A broader base means less borrowing." },
];

export const driversOf = (id) => EDGES.filter((e) => e.to === id);
export const effectsOf = (id) => EDGES.filter((e) => e.from === id);
export const nodeById = (id) => NODES.find((n) => n.id === id);

// ── Shock propagation — the digital twin ────────────────────────────────────
// Pass-through strength (0..1) and lag (weeks) for the load-bearing channels.
// Anything unlisted uses a tone-based default. Honest and qualitative, not a
// calibrated DSGE — the point is to show a shock cascade with plausible size
// and timing, so you can watch the economy react.
const EDGE_W = {
  "oil->fuel": 0.85, "oil->rand": 0.45, "fed->rand": 0.5, "world->X": 0.5,
  "rand->fuel": 0.6, "rand->cpi": 0.55, "rand->X": 0.45, "rand->infexp": 0.4,
  "fuel->cpi": 0.6, "fuel->food": 0.5, "fuel->C": 0.4, "food->cpi": 0.5, "food->C": 0.4,
  "cpi->repo": 0.7, "core->repo": 0.6, "cpi->infexp": 0.5, "cpi->C": 0.4, "infexp->repo": 0.5,
  "repo->realrate": 0.9, "repo->credit": 0.6, "repo->rand": 0.4,
  "realrate->I": 0.6, "realrate->C": 0.45, "credit->I": 0.5, "credit->C": 0.5,
  "C->gdp": 0.7, "I->gdp": 0.55, "G->gdp": 0.4, "X->gdp": 0.45, "M->gdp": 0.4,
  "I->potential": 0.5, "potential->gdp": 0.6, "gap->cpi": 0.5, "gap->core": 0.4,
  "gdp->jobs": 0.6, "gdp->households": 0.6, "gdp->tax": 0.5, "gdp->debt": 0.4,
  "jobs->unemp": 0.75, "jobs->households": 0.6, "unemp->C": 0.5,
  "households->C": 0.6, "households->savings": 0.5, "savings->I": 0.5,
  "energy->gdp": 0.6, "energy->manuf": 0.6, "energy->I": 0.5, "energy->potential": 0.5,
  "logistics->X": 0.5, "logistics->mining": 0.5, "crime->I": 0.5, "water->I": 0.4,
  "skills->potential": 0.45, "state->I": 0.4, "debt->debtsvc": 0.7, "debt->rand": 0.4,
  "debtsvc->G": 0.5, "debtsvc->I": 0.4, "gold->rand": 0.4, "platinum->rand": 0.4,
  "mining->X": 0.55, "manuf->gdp": 0.5, "finance->gdp": 0.5, "maize->food": 0.6,
};
const EDGE_LAG = {
  "oil->fuel": 4, "oil->rand": 1, "fed->rand": 1, "world->X": 8,
  "rand->fuel": 4, "rand->cpi": 8, "rand->X": 12, "rand->infexp": 6,
  "fuel->cpi": 6, "fuel->food": 10, "fuel->C": 4, "food->cpi": 6, "food->C": 4,
  "cpi->repo": 6, "core->repo": 6, "cpi->infexp": 8, "cpi->C": 6, "infexp->repo": 8,
  "repo->realrate": 2, "repo->credit": 6, "repo->rand": 2,
  "realrate->I": 26, "realrate->C": 13, "credit->I": 20, "credit->C": 13,
  "C->gdp": 6, "I->gdp": 13, "I->potential": 104, "potential->gdp": 52,
  "gap->cpi": 26, "gdp->jobs": 20, "jobs->unemp": 4, "gdp->households": 8,
  "energy->gdp": 26, "energy->manuf": 8, "energy->potential": 78,
  "logistics->X": 8, "debt->debtsvc": 52, "gold->rand": 1, "platinum->rand": 1,
  "maize->food": 8, "mining->X": 8,
};

const toneSign = (tone) => (tone === "support" ? 1 : tone === "pressure" ? -1 : 0.3);

// ── Linear input-output propagation with Monte-Carlo uncertainty ─────────────
// The economy is modelled as a weight matrix W (Wij = signed pass-through from
// node j into node i). A shock vector s propagates to the equilibrium
// x = s + Wx + W²x + … — the truncated Neumann series, ≈ the Leontief inverse
// (I − W)⁻¹s. Unlike a greedy walk this sums EVERY path and handles feedback
// loops. Monte-Carlo draws perturb the weights to yield a distribution per node
// (median + 90% band), so effects carry uncertainty rather than false precision.
const NODE_IDX = Object.fromEntries(NODES.map((n, i) => [n.id, i]));

// Build the weight matrix under a given "lens" (school of thought), which scales
// each channel's pass-through. lens "nk" (the default) leaves everything at 1.
// SIGNS come from the co-movement map (edgeCO), NOT the good/bad `tone` field:
// tone doesn't compose (two "pressure" links in series would flip to +), whereas
// co-movement does — so a rate hike correctly stays contractionary down the chain.
function buildW(lensId = "nk") {
  const n = NODES.length;
  const W = Array.from({ length: n }, () => new Float64Array(n));
  for (const e of EDGES) {
    const base = EDGE_W[`${e.from}->${e.to}`] ?? (e.tone === "mixed" ? 0.3 : 0.5);
    const w = base * edgeMultiplier(lensId, e.from, e.to);
    W[NODE_IDX[e.to]][NODE_IDX[e.from]] += edgeCO(e) * w;
  }
  return W;
}

// Matrices + sparse nonzero patterns are built once per lens and cached.
const W_CACHE = {};
function getLensW(lensId = "nk") {
  if (!W_CACHE[lensId]) {
    const W = buildW(lensId);
    const NZ = [];
    for (let i = 0; i < NODES.length; i++)
      for (let j = 0; j < NODES.length; j++)
        if (W[i][j] !== 0) NZ.push([i, j, W[i][j]]);
    W_CACHE[lensId] = { W, NZ };
  }
  return W_CACHE[lensId];
}

function neumann(W, s, K, damping) {
  const n = s.length;
  const x = Float64Array.from(s);
  let term = Float64Array.from(s);
  const next = new Float64Array(n);
  for (let k = 1; k <= K; k++) {
    for (let i = 0; i < n; i++) {
      let acc = 0; const Wi = W[i];
      for (let j = 0; j < n; j++) acc += Wi[j] * term[j];
      next[i] = acc * damping;
    }
    for (let i = 0; i < n; i++) { term[i] = next[i]; x[i] += next[i]; }
  }
  return x;
}

// Standard-normal draw (Box–Muller) for the weight perturbations.
function gaussian() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Shortest cumulative lag from the origin to each node (Dijkstra over EDGE_LAG).
function lagsFrom(originId) {
  const dist = { [originId]: 0 };
  const pq = [[0, originId]];
  while (pq.length) {
    let m = 0;
    for (let i = 1; i < pq.length; i++) if (pq[i][0] < pq[m][0]) m = i;
    const [d, u] = pq.splice(m, 1)[0];
    if (d > (dist[u] ?? Infinity)) continue;
    for (const e of effectsOf(u)) {
      const nd = d + (EDGE_LAG[`${e.from}->${e.to}`] ?? 10);
      if (nd < (dist[e.to] ?? Infinity)) { dist[e.to] = nd; pq.push([nd, e.to]); }
    }
  }
  return dist;
}

// A single deterministic run: the effect on `targetId` of a shock on `originId`,
// under a given lens. Fast (no Monte-Carlo) — used to compare schools side by side.
export function pointEstimate(originId, dir = 1, targetId = "gdp", lens = "nk") {
  const oi = NODE_IDX[originId], ti = NODE_IDX[targetId];
  if (oi == null || ti == null) return 0;
  const s = new Float64Array(NODES.length); s[oi] = dir;
  return neumann(getLensW(lens).W, s, 6, 0.9)[ti];
}

// Returns Map<id, { impulse, lo, hi, lagWeeks }>. `impulse` is the MEDIAN effect;
// [lo, hi] is the 90% Monte-Carlo band; lagWeeks is when it's first felt. `lens`
// picks a school of thought, re-weighting the channels (default = New Keynesian).
export function propagate(originId, dir = 1, K = 6, { draws = 160, noise = 0.22, damping = 0.9, lens = "nk" } = {}) {
  const n = NODES.length;
  const oi = NODE_IDX[originId];
  if (oi == null) return new Map();
  const s = new Float64Array(n); s[oi] = dir;

  const { W: BW, NZ } = getLensW(lens);
  const samples = Array.from({ length: n }, () => new Float64Array(draws));
  const W = BW.map((r) => Float64Array.from(r));   // zeros stay zero
  for (let d = 0; d < draws; d++) {
    for (const [i, j, base] of NZ) W[i][j] = base * Math.exp(gaussian() * noise);  // lognormal jitter
    const x = neumann(W, s, K, damping);
    for (let i = 0; i < n; i++) samples[i][d] = x[i];
  }

  const lags = lagsFrom(originId);
  const q = (arr, p) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(p * arr.length)))];
  const map = new Map();
  for (let i = 0; i < n; i++) {
    const id = NODES[i].id;
    if (id === originId) { map.set(id, { impulse: dir, lo: dir, hi: dir, lagWeeks: 0 }); continue; }
    const arr = Array.from(samples[i]).sort((a, b) => a - b);
    const lo = q(arr, 0.05), median = q(arr, 0.5), hi = q(arr, 0.95);
    if (Math.abs(median) < 0.02 && Math.abs(lo) < 0.02 && Math.abs(hi) < 0.02) continue;
    map.set(id, { impulse: median, lo, hi, lagWeeks: lags[id] ?? 999 });
  }
  return map;
}

export function lagLabel(weeks) {
  if (weeks < 5) return "within weeks";
  if (weeks < 18) return "~1 quarter";
  if (weeks < 40) return "~2 quarters";
  if (weeks < 80) return "~1 year";
  return "years out";
}

// Trace the dominant downstream chain from a node — the "neurons firing" path.
// Greedy: follow the first not-yet-visited effect, up to `maxHops` hops.
export function tracePath(startId, maxHops = 5) {
  const path = [startId];
  const seen = new Set(path);
  let cur = startId;
  for (let i = 0; i < maxHops; i++) {
    const next = effectsOf(cur).find((e) => !seen.has(e.to));
    if (!next) break;
    path.push(next.to);
    seen.add(next.to);
    cur = next.to;
  }
  return path;
}

// The clearest single reason `targetId` moves when `originId` is shocked: the
// downstream path with the strongest total pass-through, returned as a list of
// edges (each carrying a plain-English `mech`). This is what lets the app *say*
// why a node was hit, step by step, instead of just drawing a bar. [] if none.
export function explainChain(originId, targetId, maxHops = 5) {
  const wOf = (e) => EDGE_W[`${e.from}->${e.to}`] ?? (e.tone === "mixed" ? 0.3 : 0.5);
  let best = null, bestScore = -Infinity;
  const dfs = (cur, edges, score, seen) => {
    if (cur === targetId) { if (score > bestScore) { bestScore = score; best = edges.slice(); } return; }
    if (edges.length >= maxHops) return;
    for (const e of effectsOf(cur)) {
      if (seen.has(e.to)) continue;
      seen.add(e.to); edges.push(e);
      dfs(e.to, edges, score + Math.log(wOf(e)), seen);
      edges.pop(); seen.delete(e.to);
    }
  };
  dfs(originId, [], 0, new Set([originId]));
  return best ?? [];
}

// Does `to` RISE (+1) or FALL (−1) when `from` rises? The true mechanical
// co-movement, read from each mechanism. This is what the good/bad `tone` field
// cannot give us: `tone` says whether a link is helpful or harmful, not which
// way the number moves — so "a stronger rand" correctly makes fuel FALL here,
// even though that edge's tone is "pressure". For constraint nodes (energy,
// crime…) "up" means the constraint WORSENS.
const CO = {
  "oil->fuel": 1, "oil->rand": -1, "fed->rand": -1, "fed->repo": 1,
  "world->X": 1, "world->mining": 1, "world->gold": 0,
  "rand->fuel": -1, "rand->cpi": -1, "rand->X": -1, "rand->infexp": -1,
  "fuel->cpi": 1, "fuel->food": 1, "fuel->C": -1, "food->cpi": 1, "food->C": -1,
  "cpi->infexp": 1, "cpi->repo": 1, "cpi->C": -1, "core->repo": 1, "infexp->repo": 1, "infexp->wages": 1,
  "repo->realrate": 1, "repo->credit": -1, "repo->rand": 1, "realrate->I": -1, "realrate->C": -1,
  "credit->C": 1, "credit->I": 1,
  "C->gdp": 1, "I->gdp": 1, "I->potential": 1, "I->constr": 1, "I->jobs": 1,
  "G->gdp": 1, "X->gdp": 1, "M->gdp": -1, "potential->gdp": 1, "potential->gap": -1,
  "gdp->gap": 1, "gdp->jobs": 1, "gdp->households": 1, "gdp->tax": 1, "gdp->debt": -1,
  "gap->cpi": 1, "gap->core": 1,
  "jobs->unemp": -1, "jobs->households": 1, "unemp->C": -1, "unemp->G": 1, "unemp->crime": 1,
  "households->C": 1, "households->savings": 1, "savings->I": 1, "wages->C": 1, "wages->manuf": -1,
  "mining->X": 1, "mining->gdp": 1, "manuf->gdp": 1, "manuf->jobs": 1,
  "agri->food": -1, "agri->X": 1, "finance->gdp": 1, "finance->I": 1, "constr->jobs": 1,
  "energy->manuf": -1, "energy->I": -1, "energy->gdp": -1, "energy->potential": -1,
  "logistics->X": -1, "logistics->mining": -1, "crime->I": -1, "crime->potential": -1,
  "water->I": -1, "skills->potential": -1, "state->I": -1, "state->water": 1,
  "gold->X": 1, "gold->rand": 1, "platinum->X": 1, "platinum->rand": 1, "maize->food": 1,
  "debt->debtsvc": 1, "debt->rand": -1, "debtsvc->G": -1, "debtsvc->I": -1, "tax->G": 1, "tax->debt": -1,
};
const edgeCO = (e) => CO[`${e.from}->${e.to}`] ?? 0;  // 0 = unknown ⇒ degrade to "unclear"

// Is a RISE in this node good news for the average person? true / false / null.
// null = neutral (a rate, the currency, a commodity) — no simple good/bad.
export const NODE_GOOD = {
  gdp: true, jobs: true, C: true, I: true, G: true, X: true, households: true,
  savings: true, wages: true, tax: true, potential: true, credit: true,
  mining: true, manuf: true, agri: true, finance: true, constr: true,
  cpi: false, fuel: false, food: false, core: false, infexp: false, unemp: false,
  debt: false, debtsvc: false, crime: false, energy: false, logistics: false,
  water: false, skills: false, state: false,
};

// The value direction of the strongest channel from origin → target, for a shock
// of sign `shockDir` on the origin. +1 rises, −1 falls, 0 unclear.
export function valueDirection(originId, targetId, shockDir = 1) {
  if (originId === targetId) return shockDir > 0 ? 1 : -1;
  const chain = explainChain(originId, targetId);
  if (!chain.length) return 0;
  let s = shockDir > 0 ? 1 : -1;
  for (const e of chain) s *= edgeCO(e);
  return s;
}

// Read one impact the way a non-economist would, straight from its aggregate
// effect (`impulse`, now the true signed value direction): which way it moves,
// and whether that's good or bad news for THIS node. `uncertain` folds in the
// Monte-Carlo sign ambiguity. This is the single source of truth for direction,
// so every card on screen agrees.
export function readDirection(nodeId, impulse, uncertain = false) {
  const tiny = Math.abs(impulse) < 0.02;
  const unclear = uncertain || tiny;
  const rises = impulse > 0;
  const good = NODE_GOOD[nodeId];
  const dirWord = unclear ? "could go either way" : rises ? "rises" : "falls";
  const sentiment = unclear || good == null ? null : (rises === good ? "good" : "bad");
  const color = unclear ? "#C6A15B" : sentiment === "good" ? "#7FB58A" : sentiment === "bad" ? "#D8735E" : "#8A8F88";
  return { dir: unclear ? 0 : rises ? 1 : -1, unclear, dirWord, sentiment, color };
}
