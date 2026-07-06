// ─────────────────────────────────────────────────────────────────────────────
// NEWS DESK — current affairs that directly move the SA economy, each mapped to
// its transmission channel: event → channel → the indicator it moves. Curated
// against verified reporting at each data refresh; the analysis explains WHY
// each story matters, not just what happened.
// Last curated: 6 July 2026.
// ─────────────────────────────────────────────────────────────────────────────

// tone: tailwind (good for the economy) | headwind (bad) | watch (could go either way)
export const NEWS = [
  {
    id: "absa-trading-update", date: "30 Jun 2026", source: "Absa Group / JSE SENS", tone: "headwind",
    title: "Absa slides ~6% as trading update flags Africa earnings pressure",
    what: "Absa's voluntary H1 2026 trading update wiped roughly R14bn off its market cap as the share price fell as much as 6.4% to around R228. Net interest income growth stays low-single-digit on margin compression from policy-rate cuts across its Africa Regions operations, with Africa Regions and CIB earnings both softening; return on equity is guided at ~15% for FY2026, weaker than the market had hoped.",
    why: ["Africa Regions margins compress as other central banks cut", "bank earnings guidance softens", "finance-sector sentiment cools", "credit-extension appetite may tighten"],
    impact: "Finance is SA's single biggest sector (22.7% of GDP) — a wobble at one of the big four banks is a read-through on credit conditions and confidence, even though the immediate driver is Absa's pan-African footprint rather than the domestic economy.",
    tags: ["Finance", "Banks", "Markets"],
  },
  {
    id: "trade-deficit-may", date: "May 2026 data, released Jun 2026", source: "SARS Trade Statistics", tone: "watch",
    title: "Trade balance swings to a R1.8bn deficit in May",
    what: "SARS recorded a preliminary May trade deficit of R1.8bn (exports R178.8bn vs imports R180.6bn) — the first monthly deficit after several months of surpluses. Excluding BELN neighbours the gap widens to R11.9bn. The year-to-date position is still a R85.8bn surplus for Jan–May, well ahead of the R60.1bn surplus over the same months in 2025.",
    why: ["import bill (fuel, capital goods) rises", "single-month surplus streak breaks", "rand loses a supportive monthly data point", "cumulative external position still comfortably positive"],
    impact: "One soft month doesn't undo the current account's best position in four years, but it's a reminder the gold-and-PGM-driven surplus is commodity-price dependent rather than a broad-based export recovery.",
    tags: ["Trade", "Rand", "Exports"],
  },
  {
    id: "eskom-408-days", date: "6 Jul 2026", source: "Eskom", tone: "tailwind",
    title: "Eskom passes 413 days without load-shedding, on track for a blackout-free winter",
    what: "Eskom has now gone more than 413 consecutive days without load-shedding — a streak stretching back to 16 May 2025 — with a forecast 6GW surplus carrying it through the Winter Outlook period (1 April–31 August). The Energy Availability Factor has climbed to 63.81% (from 58.31% a year ago) and diesel-generator spend is down 84% year-to-date (R746m vs R4.72bn).",
    why: ["unplanned outages ↓", "grid reliability ↑", "factories can plan production", "investment deterrent eases", "potential growth ↑"],
    impact: "The single biggest constraint on the 2010s economy keeps easing structurally — good news for manufacturing and investment, though administered tariffs (below) keep the cost of that reliability high.",
    tags: ["Energy", "Structural", "Potential"],
  },
  {
    id: "rand-rally-jul", date: "3 Jul 2026", source: "Market data / SARB", tone: "tailwind",
    title: "Rand extends its rally to ~R16.22/$ — firmest levels in weeks",
    what: "USD/ZAR slipped to around R16.22 on 3 July from ~R16.56 a week earlier, extending the recovery that began when the US–Iran ceasefire unwound oil's risk premium. The currency is now holding at the strong end of its 2026 range.",
    why: ["oil risk premium keeps fading", "import bill cheaper", "inflation pass-through eases further", "SARB's hike case weakens"],
    impact: "A firmer rand heading into the 23 July MPC decision strengthens the case for a hold — though it's also squeezing rand-hedge earners like Absa's African operations.",
    tags: ["Rand", "CPI", "Repo"],
  },
  {
    id: "pmi-jun", date: "1 Jul 2026", source: "Absa / S&P Global PMI", tone: "headwind",
    title: "Factory activity stalls — production back in contraction",
    what: "The manufacturing PMI eased to 50.8 (from 52.6), but the production sub-index tumbled to 43.5 and new orders to 44.6: demand pulled forward in April faded and a softer rand raised input costs.",
    why: ["new orders ↓", "output contracts", "manufacturing drags GDP", "factory jobs at risk"],
    impact: "Manufacturing stays the recovery's weak link — the sector that fell 0.8% in Q1 GDP still can't find momentum even as fuel relief lands.",
    tags: ["Manufacturing", "GDP", "Jobs"],
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
    what: "May's 25bps hike to 7.00% was a pre-emptive strike at the oil shock. With Brent at ~$75 and the rand firmer, the hike case has faded — economists including PSG's Johann Els now expect no July hike despite firmer inflation expectations — but SARB flagged services inflation at 4.6% and non-fuel pressures (insurance, financial services).",
    why: ["June CPI print 22 Jul", "MPC reads it next morning", "hold = relief for borrowers", "surprise hike = rand support, growth drag"],
    impact: "The first big test of the new 3% target's credibility in a shock. Watch the vote split — May's was 4–2 — with PwC's mid-year outlook flagging 'higher for longer' rates as the FNB/BER Consumer Confidence Index sank to -19 in Q2 (from -7 in Q1), its weakest since early 2025.",
    tags: ["Repo", "Rand", "CPI"],
  },
  {
    id: "qlfs-q1", date: "12 May 2026 (QLFS); 30 Jun 2026 (QES)", source: "Stats SA QLFS / QES", tone: "headwind",
    title: "345,000 jobs lost in Q1 — unemployment 32.7%, formal payrolls confirm the slide",
    what: "The worst quarterly jobs print in years: unemployment up 1.3pp, youth at 45.8%, and only KwaZulu-Natal added jobs. Stats SA's formal non-agricultural payroll survey (QES) corroborates it: 80,000 formal-sector jobs were shed q/q in Q1 (121,000 y/y), led by community services and trade, while gross earnings fell R43.4bn (-4.0%) to R1.04tn.",
    why: ["employment ↓", "household income & spending ↓", "consumption (60% of GDP) weakens", "social strain & fiscal pressure ↑"],
    impact: "Confirms the core thesis: 1–2% growth cannot absorb ~360k new entrants a year. The speed limit is the jobs crisis — and now it shows up in payrolls and pay packets, not just the household survey.",
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

export const NEWS_AS_OF = "6 July 2026";

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
  "absa-trading-update": { origin: "finance", dir: -1, verb: "Trace the bank earnings wobble" },
  "trade-deficit-may":   { origin: "rand",    dir: 1,  verb: "Trace the trade deficit's drag" },
  "eskom-408-days":     { origin: "energy", dir: -1, verb: "Trace the reliability milestone" },
  "rand-rally-jul":   { origin: "rand",   dir: -1, verb: "Trace the rand's rally" },
  "pmi-jun":       { origin: "manuf",     dir: -1, verb: "Trace the factory slump" },
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
  "absa-trading-update": [
    { theme: "Absa & bank shareholders", dir: "down", note: "Softer earnings guidance and Africa-region margin compression weigh directly on near-term profitability." },
    { theme: "SA bank credit extension", dir: "down", note: "Margin pressure gives banks less incentive to chase loan growth aggressively." },
    { theme: "Domestically focused lenders", dir: "up", note: "Banks without heavy pan-African rate-cut exposure look relatively more resilient by comparison." },
  ],
  "trade-deficit-may": [
    { theme: "Importers of capital & consumer goods", dir: "down", note: "A wider import bill and single-month deficit add modest pressure on rand-priced input costs." },
    { theme: "Miners & agricultural exporters", dir: "up", note: "The year-to-date position is still a large cumulative surplus, so underlying export earnings remain healthy despite the monthly wobble." },
    { theme: "The rand", dir: "down", note: "A swing to deficit removes one supportive data point, even though the cumulative external balance stays strongly positive." },
  ],
  "eskom-408-days": [
    { theme: "Manufacturers & energy-intensive industry", dir: "up", note: "Grid stability removes the load-shedding tax on output and lets factories plan production with confidence." },
    { theme: "Fixed investment & business confidence", dir: "up", note: "A stable grid removes one of the biggest deterrents to investment that held back capacity for a decade." },
    { theme: "Diesel generator & backup-power suppliers", dir: "down", note: "Demand for emergency backup power fades as outages become rare." },
    { theme: "Households", dir: "up", note: "Fewer power cuts mean less food spoilage and lower spending on alternative lighting and cooking." },
  ],
  "rand-rally-jul": [
    { theme: "Importers & retailers of imported goods", dir: "up", note: "A stronger rand lowers the landed cost of everything bought in dollars." },
    { theme: "Exporters & rand-hedge earners", dir: "down", note: "Miners and multinationals earning offshore see fewer rand per dollar of revenue." },
    { theme: "Inflation-linked assets", dir: "down", note: "A firmer currency eases price pressure, cooling the inflation premium." },
    { theme: "Foreign tourists & travel costs", dir: "down", note: "A stronger rand makes South Africa pricier for dollar-based visitors." },
  ],
  "pmi-jun": [
    { theme: "Manufacturers & industrial jobs", dir: "down", note: "Contracting output puts factory employment under pressure." },
    { theme: "Steel, chemicals, auto suppliers", dir: "down", note: "Weak orders ripple up the industrial supply chain." },
    { theme: "Importers of finished goods", dir: "up", note: "Local weakness leaves room for imported substitutes." },
    { theme: "Rate-cut case", dir: "up", note: "Soft activity strengthens the argument for eventual easing." },
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
