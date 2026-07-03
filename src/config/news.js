// ─────────────────────────────────────────────────────────────────────────────
// NEWS DESK — current affairs that directly move the SA economy, each mapped to
// its transmission channel: event → channel → the indicator it moves. Curated
// against verified reporting at each data refresh; the analysis explains WHY
// each story matters, not just what happened.
// Last curated: 3 July 2026.
// ─────────────────────────────────────────────────────────────────────────────

// tone: tailwind (good for the economy) | headwind (bad) | watch (could go either way)
export const NEWS = [
  {
    id: "pmi-jun", date: "1 Jul 2026", source: "Absa / S&P Global PMI", tone: "headwind",
    title: "Factory activity stalls — production back in contraction",
    what: "The manufacturing PMI eased to 50.8 (from 52.6), but the production sub-index tumbled to 43.5 and new orders to 44.6: demand pulled forward in April faded and a softer rand raised input costs.",
    why: ["new orders ↓", "output contracts", "manufacturing drags GDP", "factory jobs at risk"],
    impact: "Manufacturing stays the recovery's weak link — the sector that fell 0.8% in Q1 GDP still can't find momentum even as fuel relief lands.",
    tags: ["Manufacturing", "GDP", "Jobs"],
  },
  {
    id: "ceasefire-oil", date: "late Jun 2026", source: "Markets / energy wires", tone: "tailwind",
    title: "US–Iran MOU collapses Brent's monthly average from ~$105 to ~$87",
    what: "The Strait of Hormuz risk premium that drove oil above $100 unwound after the US–Iran memorandum. The rand firmed from ~R16.65 to an average ~R16.37/$ as the import-bill outlook improved; spot Brent fell toward ~$75.",
    why: ["Brent −$29", "basic fuel price ↓", "transport CPI cools", "inflation expectations ease", "pressure off SARB"],
    impact: "Biggest single disinflation impulse of the year. If it holds, the July CPI print (due Aug) turns the corner.",
    tags: ["CPI", "Rand", "Repo"],
  },
  {
    id: "july-fuel", date: "1 Jul 2026 · in effect", source: "DMRE fuel adjustment", tone: "tailwind",
    title: "July fuel cut now in effect: petrol −R2.01/l, diesel −R3.59/l",
    what: "Live from 1 July: 93-octane petrol −R2.01, 95-octane −R1.96, diesel −R3.14 to −R3.59, paraffin −R5.23. The oil collapse and a firmer rand (avg R16.37/$) passed straight through to the pump.",
    why: ["pump price ↓", "household real income ↑", "freight & food logistics costs ↓", "food CPI relief with a lag"],
    impact: "Direct relief to the exact categories (transport 9.4%, food) that drove the May CPI spike to 4.5%.",
    tags: ["CPI", "Consumption", "Sectors"],
  },
  {
    id: "mpc-july", date: "due 23 Jul 2026", source: "SARB MPC", tone: "watch",
    title: "MPC decision: hold now favoured after the oil crash",
    what: "May's 25bps hike to 7.00% was a pre-emptive strike at the oil shock. With Brent at ~$75 and the rand firmer, the hike case has faded — but SARB flagged services inflation at 4.6% and non-fuel pressures (insurance, financial services).",
    why: ["June CPI print 22 Jul", "MPC reads it next morning", "hold = relief for borrowers", "surprise hike = rand support, growth drag"],
    impact: "The first big test of the new 3% target's credibility in a shock. Watch the vote split — May's was 4–2.",
    tags: ["Repo", "Rand", "CPI"],
  },
  {
    id: "qlfs-q1", date: "12 May 2026", source: "Stats SA QLFS", tone: "headwind",
    title: "345,000 jobs lost in Q1 — unemployment 32.7%",
    what: "The worst quarterly jobs print in years: unemployment up 1.3pp, youth at 45.8%, and only KwaZulu-Natal added jobs. 8.1m people now want work the economy isn't creating.",
    why: ["employment ↓", "household income & spending ↓", "consumption (60% of GDP) weakens", "social strain & fiscal pressure ↑"],
    impact: "Confirms the core thesis: 1–2% growth cannot absorb ~360k new entrants a year. The speed limit is the jobs crisis.",
    tags: ["Labour", "Consumption", "Potential"],
  },
  {
    id: "gdp-q1", date: "3 Jun 2026", source: "Stats SA GDP", tone: "watch",
    title: "GDP grows +0.5% q/q — sixth straight quarter of expansion",
    what: "Growth accelerated to +1.9% y/y, beating forecasts. Finance led, agriculture bounced (+3.9%) — but manufacturing fell 0.8% and fixed investment dropped another 1.1%.",
    why: ["momentum ↑", "but investment ↓", "capacity (potential) stays capped", "recovery quality in question"],
    impact: "Direction is right, composition is wrong: consumption-led upticks fade; investment-led ones compound. Watch GFCF.",
    tags: ["GDP", "Investment", "Sectors"],
  },
  {
    id: "budget-debt", date: "25 Feb 2026", source: "National Treasury 2026 Budget", tone: "tailwind",
    title: "Debt stabilises at 78.9% of GDP — first time in 17 years",
    what: "Gross loan debt peaks in 2025/26 and declines to 76.5% by 2028/29. Debt-service cost growth slows to ~3.7%/yr from 7.4% on improved market confidence and cheaper borrowing.",
    why: ["borrowing costs ↓", "debt-service growth slows", "fiscal space opens slowly", "sovereign risk premium compresses"],
    impact: "The quiet macro win underneath everything: every basis point saved on the R6.1tn debt stock is money for investment.",
    tags: ["Fiscal", "Debt", "Rates"],
  },
  {
    id: "eskom-tariff", date: "ongoing 2026", source: "NERSA / Eskom", tone: "headwind",
    title: "Electricity tariff hikes keep utilities inflation at 5.3%",
    what: "Administered prices — electricity, water, municipal rates — keep rising well above the 3% target even as market-driven prices cool.",
    why: ["tariffs ↑", "housing & utilities CPI 5.3%", "sticky core pressure", "SARB stays hawkish longer"],
    impact: "The structural inflation problem no repo rate can fix — administered prices are a supply-side, governance problem.",
    tags: ["CPI", "Energy", "Structural"],
  },
  {
    id: "rail-reform", date: "ongoing 2026", source: "Transnet / Op. Vulindlela", tone: "tailwind",
    title: "Private rail operators start moving freight on Transnet's network",
    what: "Eleven private operators awarded slots as third-party access to the freight network becomes real; port concessions grind through litigation.",
    why: ["rail tonnage ↑", "mining & manufacturing exports unlock", "logistics constraint eases", "potential growth ↑"],
    impact: "One of the two reforms (with energy) that most directly raises the speed limit — the Diagnosis tab's +0.4pp in motion.",
    tags: ["Structural", "Exports", "Potential"],
  },
  {
    id: "water-gauteng", date: "ongoing 2026", source: "DWS / municipalities", tone: "headwind",
    title: "Gauteng water stress becomes an investment risk",
    what: "Leaks, pump failures and demand growth strain the Vaal system supplying the country's economic hub; intermittent outages spread across Johannesburg and Tshwane.",
    why: ["water reliability ↓", "operating costs ↑", "new-investment deterrent in the 33%-of-GDP province", "emerging binding constraint"],
    impact: "The next load-shedding if unaddressed — the Diagnosis tab's water constraint moving from 'emerging' to 'binding'.",
    tags: ["Structural", "Water", "Investment"],
  },
];

export const NEWS_AS_OF = "3 July 2026";

export const TONES = {
  tailwind: { label: "Tailwind", color: "#7FB58A" },
  headwind: { label: "Headwind", color: "#D8735E" },
  watch:    { label: "Watch",    color: "#C6A15B" },
};

// Each story maps to the node it hits first and the direction of the shock, so
// the News desk can fire the cascade on the Intelligence graph — the headline
// literally lighting up every indicator it moves.
// dir: +1 the origin rises, −1 it falls. verb = how to describe firing it.
export const NEWS_GRAPH = {
  "pmi-jun":       { origin: "manuf",     dir: -1, verb: "Trace the factory slump" },
  "ceasefire-oil": { origin: "oil",       dir: -1, verb: "Trace oil's collapse" },
  "july-fuel":     { origin: "fuel",      dir: -1, verb: "Trace the fuel cut" },
  "mpc-july":      { origin: "repo",      dir: 1,  verb: "Trace a rate hike" },
  "qlfs-q1":       { origin: "jobs",      dir: -1, verb: "Trace the job losses" },
  "gdp-q1":        { origin: "gdp",       dir: 1,  verb: "Trace the growth print" },
  "budget-debt":   { origin: "debt",      dir: -1, verb: "Trace debt stabilising" },
  "eskom-tariff":  { origin: "energy",    dir: 1,  verb: "Trace the tariff shock" },
  "rail-reform":   { origin: "logistics", dir: -1, verb: "Trace the rail reform" },
  "water-gauteng": { origin: "water",     dir: 1,  verb: "Trace the water risk" },
};

// Economic implications of each event — who tends to benefit ("up") or suffer
// ("down") as it works through the economy. This is general economic reasoning
// about exposure, NOT personalised financial advice or a prediction of any
// asset's price. See IMPLICATIONS_DISCLAIMER.
export const IMPLICATIONS = {
  "pmi-jun": [
    { theme: "Manufacturers & industrial jobs", dir: "down", note: "Contracting output puts factory employment under pressure." },
    { theme: "Steel, chemicals, auto suppliers", dir: "down", note: "Weak orders ripple up the industrial supply chain." },
    { theme: "Importers of finished goods", dir: "up", note: "Local weakness leaves room for imported substitutes." },
    { theme: "Rate-cut case", dir: "up", note: "Soft activity strengthens the argument for eventual easing." },
  ],
  "ceasefire-oil": [
    { theme: "Transport & logistics", dir: "up", note: "Cheaper diesel cuts freight, taxi and delivery costs." },
    { theme: "Consumers & retail", dir: "up", note: "Lower pump prices free up household income to spend." },
    { theme: "Fuel-levy revenue", dir: "down", note: "Government's fuel take softens as prices fall." },
    { theme: "Rand-hedge exposure", dir: "down", note: "A firmer rand reduces the value of offshore hedges." },
  ],
  "july-fuel": [
    { theme: "Freight & food logistics", dir: "up", note: "Diesel down R3.59/l lowers the cost of moving everything." },
    { theme: "Household budgets", dir: "up", note: "The biggest pump cut in years restores real income." },
    { theme: "Inflation-linked assets", dir: "down", note: "Cooling CPI erodes the inflation premium." },
  ],
  "mpc-july": [
    { theme: "Borrowers & mortgages", dir: "down", note: "A hike lifts repayments and squeezes disposable income." },
    { theme: "Banks' endowment margins", dir: "up", note: "Higher rates widen the spread earned on deposits." },
    { theme: "The rand", dir: "up", note: "A wider rate gap attracts yield-seeking (carry) inflows." },
    { theme: "Rate-sensitive retail & property", dir: "down", note: "Big-ticket, credit-driven demand cools." },
  ],
  "qlfs-q1": [
    { theme: "Consumer-facing sectors", dir: "down", note: "Fewer earners means weaker retail and services demand." },
    { theme: "The social-grant bill", dir: "down", note: "Rising joblessness adds fiscal pressure." },
    { theme: "Defensive staples", dir: "up", note: "Spending concentrates on essentials in a squeeze." },
  ],
  "gdp-q1": [
    { theme: "Cyclical sectors (finance, trade)", dir: "up", note: "They lead a broadening recovery." },
    { theme: "Tax revenue", dir: "up", note: "A bigger economy widens the fiscal take." },
    { theme: "Manufacturing", dir: "down", note: "Still contracting despite the headline — the weak link." },
  ],
  "budget-debt": [
    { theme: "SA government bonds", dir: "up", note: "A stabilising debt path compresses the risk premium." },
    { theme: "The rand & sovereign rating", dir: "up", note: "Fiscal credibility supports the currency and outlook." },
    { theme: "Banks & insurers", dir: "up", note: "Large domestic bondholders gain from firmer prices." },
  ],
  "eskom-tariff": [
    { theme: "Energy-intensive industry", dir: "down", note: "Above-inflation tariffs raise the cost base." },
    { theme: "Solar & alternative energy", dir: "up", note: "Grid pain accelerates rooftop and private-generation adoption." },
    { theme: "Households", dir: "down", note: "Administered prices keep utilities inflation elevated." },
  ],
  "rail-reform": [
    { theme: "Bulk miners & exporters", dir: "up", note: "Restored rail capacity unlocks stranded export volumes." },
    { theme: "Private rail operators", dir: "up", note: "Third-party access is a new market opening up." },
    { theme: "Road freight (trucking)", dir: "down", note: "Volumes shift back to rail as it recovers." },
  ],
  "water-gauteng": [
    { theme: "Gauteng property & new investment", dir: "down", note: "Water insecurity deters investment in the economic hub." },
    { theme: "Water infrastructure & services", dir: "up", note: "Demand rises for fixes, storage and treatment." },
    { theme: "Bottled water & tankering", dir: "up", note: "Households and firms buy around the shortfall." },
  ],
};

export const IMPLICATIONS_DISCLAIMER =
  "Educational — general economic exposure, not financial advice or a prediction of any asset's price.";
