// ── Schools of thought as "lenses" on the same causal graph ──────────────────
// The six schools don't disagree about whether the economy is connected — they
// disagree about which CHANNELS are strong. Classical/Austrian distrust demand
// multipliers and watch the credit cycle; Keynesians lean on demand and fiscal
// policy; Monetarists/New-Classical put expectations and money first; MMT says
// that for a currency issuer, financing is not the binding constraint — inflation
// and the external balance are.
//
// So a "lens" is just a set of MULTIPLIERS on channel groups of the graph. Same
// shock, re-weighted channels, different story. These are STYLISED TEACHING
// PRIORS to show how assumptions change conclusions — NOT calibrated models.

// Each load-bearing edge is tagged with one channel. Anything untagged is "core"
// (multiplier 1 in every school), so the baseline is untouched.
const CHANNEL_OF = {
  // government spending & the fiscal multiplier
  "G->gdp": "fiscal_spend", "tax->G": "fiscal_spend", "debtsvc->G": "fiscal_spend", "unemp->G": "fiscal_spend",
  // the debt / financing penalty (risk premium, crowding out)
  "debt->rand": "fiscal_debt", "debt->debtsvc": "fiscal_debt", "gdp->debt": "fiscal_debt", "tax->debt": "fiscal_debt", "debtsvc->I": "fiscal_debt",
  // money & credit transmission (repo->rand is an FX/capital-flow effect, see trade)
  "repo->realrate": "credit", "repo->credit": "credit", "realrate->I": "credit",
  "realrate->C": "credit", "credit->I": "credit", "credit->C": "credit", "savings->I": "credit", "finance->I": "credit", "fed->repo": "credit",
  // demand multiplier core
  "C->gdp": "demand", "I->gdp": "demand", "households->C": "demand", "wages->C": "demand", "unemp->C": "demand",
  "jobs->households": "demand", "gdp->households": "demand", "gdp->jobs": "demand", "households->savings": "demand",
  // expectations
  "rand->infexp": "expectations", "cpi->infexp": "expectations", "infexp->repo": "expectations", "infexp->wages": "expectations", "cpi->repo": "expectations", "core->repo": "expectations",
  // price / inflation pass-through
  "oil->fuel": "prices", "rand->fuel": "prices", "rand->cpi": "prices", "fuel->cpi": "prices", "fuel->food": "prices",
  "food->cpi": "prices", "gap->cpi": "prices", "gap->core": "prices", "food->C": "prices", "fuel->C": "prices", "cpi->C": "prices", "maize->food": "prices", "agri->food": "prices",
  // supply side, capital, potential, constraints
  "I->potential": "supply", "potential->gdp": "supply", "potential->gap": "supply", "energy->manuf": "supply",
  "energy->I": "supply", "energy->gdp": "supply", "energy->potential": "supply", "crime->I": "supply", "crime->potential": "supply",
  "water->I": "supply", "skills->potential": "supply", "state->I": "supply", "state->water": "supply", "I->jobs": "supply",
  "I->constr": "supply", "constr->jobs": "supply", "manuf->jobs": "supply", "mining->gdp": "supply", "manuf->gdp": "supply", "finance->gdp": "supply", "wages->manuf": "supply",
  // external / trade (incl. the rate→currency carry channel)
  "repo->rand": "trade", "oil->rand": "trade", "fed->rand": "trade", "world->X": "trade", "world->mining": "trade", "rand->X": "trade",
  "X->gdp": "trade", "M->gdp": "trade", "mining->X": "trade", "gold->X": "trade", "platinum->X": "trade",
  "agri->X": "trade", "gold->rand": "trade", "platinum->rand": "trade", "logistics->X": "trade", "logistics->mining": "trade",
};

export const channelOf = (from, to) => CHANNEL_OF[`${from}->${to}`] ?? "core";

// Human-readable channel names (for the "what this lens changes" note).
export const CHANNEL_LABEL = {
  fiscal_spend: "government spending", fiscal_debt: "debt & financing risk", credit: "money & credit",
  demand: "demand multipliers", expectations: "expectations", prices: "price pass-through",
  supply: "supply side", trade: "trade & the rand", core: "core",
};

// The lenses. `mult` scales each channel's pass-through; unlisted channels = 1.
export const LENSES = [
  {
    id: "nk", label: "New Keynesian", short: "Mainstream",
    tagline: "Demand, sticky prices and policy rules — the central-bank mainstream.",
    blurb: "The default here. Prices adjust slowly, so demand and interest-rate policy move real output in the short run. This is close to how the Fed, ECB and SARB actually model.",
    mult: {},
  },
  {
    id: "keynes", label: "Keynesian", short: "Demand-led",
    tagline: "Demand and fiscal policy do the heavy lifting; prices barely budge.",
    blurb: "Slumps come from too little spending. Government spending has a big multiplier, and because prices are very sticky, inflation channels stay quiet.",
    mult: { demand: 1.5, fiscal_spend: 1.7, credit: 0.7, expectations: 0.5, prices: 0.7 },
  },
  {
    id: "classical", label: "Classical", short: "Supply-side",
    tagline: "Markets clear; supply and trade dominate and demand stimulus fades.",
    blurb: "Output is set by productivity, capital and trade — not by demand. A spending push mostly leaks into prices, so the real effect is small.",
    mult: { demand: 0.4, fiscal_spend: 0.3, fiscal_debt: 1.2, expectations: 1.1, prices: 1.25, supply: 1.5, trade: 1.3 },
  },
  {
    id: "austrian", label: "Austrian", short: "Credit-cycle",
    tagline: "Watch the credit cycle — cheap money now, a harder correction later.",
    blurb: "Booms built on cheap credit misallocate capital and set up the bust. Fiscal multipliers are distrusted; the credit and capital-structure channels carry the story — and the pain arrives with a lag.",
    mult: { credit: 1.6, fiscal_spend: 0.35, fiscal_debt: 1.2, demand: 0.6, supply: 1.3, prices: 1.15 },
  },
  {
    id: "monetarist", label: "New Classical", short: "Expectations",
    tagline: "Expectations and money rule; predictable demand policy is near-neutral.",
    blurb: "Agents see policy coming, so only surprises move output. Expectations and the money/credit channels dominate; systematic fiscal stimulus is largely undone.",
    mult: { expectations: 1.6, prices: 1.4, credit: 1.3, fiscal_spend: 0.4, fiscal_debt: 1.1, demand: 0.7 },
  },
  {
    id: "mmt", label: "MMT", short: "Sovereign-money",
    tagline: "For a currency issuer, financing isn't the limit — inflation is.",
    blurb: "A government that issues its own currency can't be forced to default, so the debt-risk channel is muted. Spending has real bite — but the true ceiling is inflation and the external balance, which this lens amplifies.",
    mult: { fiscal_spend: 1.6, fiscal_debt: 0.25, demand: 1.3, prices: 1.35, expectations: 0.9, trade: 1.1 },
  },
];

const BY_ID = Object.fromEntries(LENSES.map((l) => [l.id, l]));
export const lensById = (id) => BY_ID[id] ?? BY_ID.nk;
export const DEFAULT_LENS = "nk";

// The multiplier a given lens applies to a given edge (via its channel).
export const edgeMultiplier = (lensId, from, to) => (BY_ID[lensId] ?? BY_ID.nk).mult[channelOf(from, to)] ?? 1;

export const LENSES_DISCLAIMER =
  "Lenses are stylised teaching priors — they re-weight the same causal map to show how a school's assumptions change the conclusion. They are not five separately calibrated models.";
