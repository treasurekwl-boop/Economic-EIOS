// ─────────────────────────────────────────────────────────────────────────────
// MICRO MARKET ATLAS — supply & demand models for the goods and services that
// make up the SA economy. Linear curves: demand P = aD − bD·Q, supply
// P = aS + bS·Q, Q a 0–100 quantity index, P in real SA units. Parameters are
// calibrated so the unshifted equilibrium lands near the actual 2026 price —
// the point is the mechanics (shifts, controls, shortages), not forecasting.
//
// Markets with real-world price controls carry them, because they teach SA's
// defining distortions:
//   electricity — capped tariff below equilibrium → shortage = load-shedding
//   water       — administered price under stress  → shortage = restrictions
//   low-skill labour — wage floor above equilibrium → surplus = unemployment
//   credit      — SARB administers the price of money to hit the 3% target
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: "food",      label: "Food & staples",        color: "#7FB58A" },
  { id: "energy",    label: "Energy & utilities",    color: "#C6A15B" },
  { id: "housing",   label: "Housing & construction", color: "#C77DFF" },
  { id: "transport", label: "Transport",             color: "#4FB8F0" },
  { id: "services",  label: "Services & finance",    color: "#A99BF5" },
  { id: "labour",    label: "Labour",                color: "#D98BB6" },
  { id: "exports",   label: "Exports & commodities", color: "#D8AF6A" },
];

export const MARKETS = [
  // ── FOOD & STAPLES ──────────────────────────────────────────────────────
  {
    id: "maize", cat: "food", name: "Maize", icon: "Wheat", color: "#7FB58A",
    unitP: "R '000 / ton", unitQ: "quantity index",
    d: { a: 8, b: 0.05 }, s: { a: 2, b: 0.04 }, slider: { d: 3, s: 3 }, control: null,
    story: "The staple. White maize feeds households, yellow feeds livestock. Supply swings violently with rain — SA flips between exporter and importer — while demand barely moves, because pap is the last thing households cut.",
    lesson: "Inelastic demand + volatile supply = violent price swings. A drought doesn't reduce eating; it multiplies the price. Food CPI is SA's most regressive inflation.",
    shifters: [
      { id: "drought", label: "El Niño drought", dS: 2, dD: 0, explain: "Harvest fails — supply shifts hard left. 2024's drought cut the crop ~20% and drove white maize to record prices." },
      { id: "rains", label: "Good rains", dS: -1.2, dD: 0, explain: "A bumper crop shifts supply right; prices fall and SA exports the surplus into the region." },
      { id: "exports", label: "Regional export demand", dD: 1.5, dS: 0, explain: "Neighbours' shortfalls add demand at every price — good for farmers, harder on local consumers." },
    ],
  },
  {
    id: "bread", cat: "food", name: "Bread", icon: "Sandwich", color: "#D8AF6A",
    unitP: "R / loaf", unitQ: "quantity index",
    d: { a: 34, b: 0.2 }, s: { a: 8, b: 0.15 }, slider: { d: 5, s: 5 }, control: null,
    story: "SA imports roughly half its wheat, so a loaf's price is set in Chicago and at the rand's exchange rate before it reaches the bakery. Brown bread is VAT zero-rated — one of the few deliberate price supports for the poor.",
    lesson: "Traded-goods inflation is imported: a weak rand or a global wheat shock lands on the shelf in weeks. Zero-rating cushions the level, not the volatility.",
    shifters: [
      { id: "wheat", label: "Global wheat shock", dS: 4, dD: 0, explain: "War or drought in exporter countries raises the import price — supply shifts up. 2022's Ukraine shock ran this exact play." },
      { id: "rand", label: "Rand weakens 10%", dS: 2.5, dD: 0, explain: "Imported wheat costs more rand — the exchange rate is a supply shifter for every traded good." },
      { id: "harvest", label: "Local harvest improves", dS: -2, dD: 0, explain: "More domestic wheat displaces imports and eases the cost base." },
    ],
  },
  {
    id: "poultry", cat: "food", name: "Chicken", icon: "Drumstick", color: "#E08B70",
    unitP: "R / kg", unitQ: "quantity index",
    d: { a: 90, b: 0.8 }, s: { a: 20, b: 0.5 }, slider: { d: 15, s: 15 }, control: null,
    story: "SA's most-eaten protein — and a running trade-policy battlefield. Local producers compete with Brazilian and EU imports; tariffs protect jobs upstream but raise the price of the working family's staple protein downstream.",
    lesson: "Protection is a transfer: an import tariff shifts supply up, and with a staple's inelastic demand, consumers pay most of it. The question is never 'tariff or not' — it's who carries the cost.",
    shifters: [
      { id: "tariff", label: "Import tariff raised", dS: 8, dD: 0, explain: "Imported supply gets costlier — total supply shifts up. Producers gain; consumers pay more per kg." },
      { id: "avianflu", label: "Avian flu outbreak", dS: 12, dD: 0, explain: "Culls destroy supply outright — 2023's outbreak wiped out ~30% of the breeding flock." },
      { id: "squeeze", label: "Consumer squeeze", dD: -6, dS: 0, explain: "When incomes fall households trade down — but chicken is already the floor, so demand falls less than for beef." },
    ],
  },
  {
    id: "beef", cat: "food", name: "Beef", icon: "Beef", color: "#D8735E",
    unitP: "R / kg", unitQ: "quantity index",
    d: { a: 240, b: 1.5 }, s: { a: 50, b: 1.2 }, slider: { d: 30, s: 30 }, control: null,
    story: "The aspirational protein — demand rises with income, falls in a squeeze. Export markets (China, Middle East) matter hugely, which is why a single foot-and-mouth outbreak can crash the local price overnight.",
    lesson: "An export ban is a demand shock in reverse: meat that can't leave floods the local market, and the price falls even as farmers are ruined. Cheap steak can be a symptom of disaster.",
    shifters: [
      { id: "fmd", label: "FMD export ban", dD: -20, dS: 0, explain: "Foot-and-mouth disease closes China and other markets — export demand vanishes and diverted supply floods home." },
      { id: "feed", label: "Feed costs spike", dS: 15, dD: 0, explain: "Maize is the cattle industry's biggest input — a drought upstream becomes a beef price rise downstream." },
      { id: "access", label: "New export markets open", dD: 15, dS: 0, explain: "Protocol deals (Saudi, China re-opening) add demand at every price — farm-gate prices firm." },
    ],
  },
  {
    id: "eggs", cat: "food", name: "Eggs", icon: "Egg", color: "#C6A15B",
    unitP: "R / dozen", unitQ: "quantity index",
    d: { a: 90, b: 0.7 }, s: { a: 20, b: 0.5 }, slider: { d: 15, s: 15 }, control: null,
    story: "The cheapest complete protein — until avian flu. The 2023 outbreak culled millions of layers, emptied shelves, and taught the whole country what a supply shock looks like in one shopping trip.",
    lesson: "When supply collapses in an inelastic staple, you get both: higher prices AND empty shelves (rationing). Rebuilding a layer flock takes 6+ months — supply shocks in living systems don't reverse on command.",
    shifters: [
      { id: "flu", label: "Avian flu cull", dS: 18, dD: 0, explain: "2023 in one chip: ~30% of layers culled, prices spiked ~40%, shops rationed cartons." },
      { id: "feed", label: "Feed (maize) costs up", dS: 8, dD: 0, explain: "Feed is ~70% of the cost of an egg — the maize market sits directly upstream." },
      { id: "rebuild", label: "Flock rebuilt", dS: -10, dD: 0, explain: "Import of fertilised eggs and restocking normalises supply over several months." },
    ],
  },
  {
    id: "sugar", cat: "food", name: "Sugar", icon: "Candy", color: "#D98BB6",
    unitP: "R / kg", unitQ: "quantity index",
    d: { a: 45, b: 0.35 }, s: { a: 10, b: 0.25 }, slider: { d: 8, s: 8 }, control: null,
    story: "A protected industry (import tariffs, local price premium) colliding with a public-health tax: the Health Promotion Levy explicitly tries to shift demand for sugary drinks left. Both interventions in one market.",
    lesson: "Governments shape markets from both sides: tariffs shift supply (protecting producers), sin taxes shift demand (protecting health). Each has a cost someone pays.",
    shifters: [
      { id: "levy", label: "Sugar tax extended", dD: -5, dS: 0, explain: "The Health Promotion Levy raises the price of sugary drinks — manufacturers reformulate and demand for raw sugar shifts left." },
      { id: "imports", label: "Cheap world sugar", dS: -4, dD: 0, explain: "Global surplus leaks past the tariff wall — supply shifts right and the local premium erodes." },
      { id: "tariff", label: "Tariff protection raised", dS: 4, dD: 0, explain: "The industry's standing request: costlier imports shift supply up, defending mill jobs at consumers' expense." },
    ],
  },

  // ── ENERGY & UTILITIES ──────────────────────────────────────────────────
  {
    id: "petrol", cat: "energy", name: "Petrol", icon: "Fuel", color: "#C6A15B",
    unitP: "R / litre", unitQ: "quantity index",
    d: { a: 33, b: 0.15 }, s: { a: 9, b: 0.14 }, slider: { d: 8, s: 8 }, control: null,
    story: "SA imports its oil, so this market is priced by the world: Brent + the rand + levies (~R6/l of every litre is tax). Government administers the pump price monthly via the Basic Fuel Price formula — which passes these fundamentals through with a one-month lag.",
    lesson: "Demand is inelastic — people still drive to work — which is exactly why fuel is such an effective tax base and why oil shocks hit CPI so hard.",
    shifters: [
      { id: "hormuz", label: "Oil shock (Hormuz +$30)", dS: 6, dD: 0, explain: "Crude is the refiner's cost — a $30 spike shifts supply left/up. This was June 2026: pump price +R1.43/l." },
      { id: "ceasefire", label: "Ceasefire (Brent → $75)", dS: -4, dD: 0, explain: "The shock unwinds: supply shifts back down. This was July 2026: petrol −R2.01/l." },
      { id: "levy", label: "Fuel levy +R1.50", dS: 1.5, dD: 0, explain: "A tax on sellers acts like a cost increase. With inelastic demand, most of it lands on motorists." },
      { id: "ev", label: "EV & efficiency shift", dD: -4, dS: 0, explain: "Structurally less petrol demanded at every price — a decade-long story, not a monthly one." },
    ],
  },
  {
    id: "electricity", cat: "energy", name: "Electricity", icon: "Bolt", color: "#4FB8F0",
    unitP: "R / kWh", unitQ: "quantity index",
    d: { a: 5.5, b: 0.03 }, s: { a: 0.5, b: 0.07 }, slider: { d: 1.5, s: 1.5 },
    control: { type: "ceiling", value: 3.4, label: "NERSA tariff", explain: "The regulated tariff sits below the market-clearing price while supply is constrained. Price can't ration demand — so quantity does. That rationing has a household name: load-shedding." },
    story: "The market that broke the economy. Supply is nearly fixed in the short run (steep curve) — you can't build a power station this quarter. The tariff is set by NERSA, not the market, so when demand exceeds supply at that price, the gap becomes scheduled blackouts.",
    lesson: "A price ceiling below equilibrium doesn't make electricity cheap — it converts the shortage from money into hours of darkness. The queue replaces the price.",
    shifters: [
      { id: "capacity", label: "New capacity online", dS: -0.8, dD: 0, explain: "Private generation and returning units shift supply right — the shortage narrows at the same tariff. This is 2024–26's improvement." },
      { id: "heatwave", label: "Winter demand surge", dD: 0.8, dS: 0, explain: "Cold snaps shift demand right; at a capped tariff the extra demand goes straight into the shortage." },
      { id: "efficiency", label: "Solar & efficiency", dD: -0.6, dS: 0, explain: "Rooftop panels shift grid demand left — every panel is load the constrained grid doesn't carry." },
    ],
  },
  {
    id: "water", cat: "energy", name: "Water", icon: "Droplets", color: "#4FB8F0",
    unitP: "R / kilolitre", unitQ: "quantity index",
    d: { a: 80, b: 0.5 }, s: { a: 10, b: 0.6 }, slider: { d: 15, s: 15 },
    control: { type: "ceiling", value: 40, label: "Municipal tariff", explain: "Tariffs are set politically, below what scarcity justifies, while ~40% of supply leaks away unbilled. The gap becomes throttled pressure, outages and restrictions — Gauteng's daily reality." },
    story: "The next electricity. Supply depends on dams, pumps and pipes that municipalities have under-maintained for decades — non-revenue water (leaks and theft) runs ~40%. Demand grows with population and heat.",
    lesson: "Load-shedding taught SA what a binding constraint feels like; water is the same model with a slower clock. The shortage at a held-down price is rationed in outages.",
    shifters: [
      { id: "leaks", label: "Infrastructure decay", dS: 8, dD: 0, explain: "Every burst main is effective supply lost — the curve shifts left as the network rots." },
      { id: "fix", label: "War-on-leaks programme", dS: -6, dD: 0, explain: "Fixing non-revenue water is the cheapest new 'supply' in the country — recovered losses shift the curve right." },
      { id: "drought", label: "Vaal system drought", dS: 10, dD: 0, explain: "Dam levels fall and the scarce resource gets scarcer — restrictions become rationing by law." },
    ],
  },
  {
    id: "coal", cat: "energy", name: "Coal (export)", icon: "Mountain", color: "#8A8F88",
    unitP: "R '000 / ton", unitQ: "quantity index",
    d: { a: 3, b: 0.02 }, s: { a: 0.5, b: 0.015 }, slider: { d: 0.6, s: 0.6 }, control: null,
    story: "Still a top export earner — when it can reach the port. Richards Bay volumes collapsed with Transnet's rail failures, so the constraint isn't the mine or the market; it's the railway line in between.",
    lesson: "A supply curve isn't just production — it's production that reaches the buyer. Logistics failure is a supply shift as real as a strike or a flood.",
    shifters: [
      { id: "rail", label: "Rail failure worsens", dS: 0.4, dD: 0, explain: "Coal that can't reach Richards Bay is supply that doesn't exist — trucks cost multiples of trains." },
      { id: "railfix", label: "Private rail operators scale", dS: -0.3, dD: 0, explain: "Third-party access restores export capacity — the Diagnosis logistics reform in one commodity." },
      { id: "decarb", label: "Global decarbonisation", dD: -0.5, dS: 0, explain: "The long fade: buyers commit to exit coal, shifting demand left decade by decade." },
      { id: "india", label: "India demand surge", dD: 0.4, dS: 0, explain: "The offsetting force: developing-Asia growth still bids for SA coal." },
    ],
  },

  // ── HOUSING & CONSTRUCTION ──────────────────────────────────────────────
  {
    id: "rent", cat: "housing", name: "Rental housing", icon: "Home", color: "#C77DFF",
    unitP: "R '000 / month", unitQ: "quantity index",
    d: { a: 18, b: 0.12 }, s: { a: 4, b: 0.08 }, slider: { d: 4, s: 4 }, control: null,
    story: "The biggest line in most household budgets. Supply moves slowly (buildings take years); demand moves fast (people move in months). That asymmetry is why rents jump quickly but fall slowly.",
    lesson: "Semigration is a demand shock: the Western Cape's in-migration pushed Cape Town rents up ~10%/yr while Joburg's stagnated — same country, opposite curves.",
    shifters: [
      { id: "semigration", label: "Semigration wave", dD: 3, dS: 0, explain: "Households relocating to better-run metros shift demand right where they land — and left where they leave." },
      { id: "newbuilds", label: "Building boom", dS: -2, dD: 0, explain: "New stock shifts supply right — the only durable way rents fall. Approval-to-keys is 2–4 years." },
      { id: "rates", label: "Municipal rates ↑", dS: 1.5, dD: 0, explain: "Higher rates and utilities are a landlord cost — supply shifts up and part passes into rent." },
    ],
  },
  {
    id: "houses", cat: "housing", name: "Houses (to buy)", icon: "Building2", color: "#A99BF5",
    unitP: "R '000 (avg price)", unitQ: "quantity index",
    d: { a: 2500, b: 15 }, s: { a: 400, b: 12 }, slider: { d: 400, s: 400 }, control: null,
    story: "A market priced in monthly instalments, not rands: what buyers really bid with is the bond repayment, so the repo rate sits inside the demand curve. Average price ~R1.4m nationally, wildly split by metro.",
    lesson: "Interest rates are a demand shifter for anything bought on credit. A 1pp repo change moves a R1.4m bond's instalment by ~R900/month — that's the mechanism connecting SARB to your street.",
    shifters: [
      { id: "cuts", label: "Repo cut cycle", dD: 200, dS: 0, explain: "Cheaper bonds let the same salary bid more — demand shifts right and prices firm." },
      { id: "hikes", label: "Repo hike cycle", dD: -200, dS: 0, explain: "May 2026's hike in this market: affordability shrinks, demand shifts left, sellers wait longer." },
      { id: "buildcost", label: "Building costs spike", dS: 150, dD: 0, explain: "Cement, steel and labour costs shift new-supply up — existing homes gain scarcity value." },
    ],
  },
  {
    id: "cement", cat: "housing", name: "Cement", icon: "Factory", color: "#8A8F88",
    unitP: "R / 50kg bag", unitQ: "quantity index",
    d: { a: 190, b: 1.2 }, s: { a: 40, b: 0.9 }, slider: { d: 35, s: 35 }, control: null,
    story: "The economy's construction thermometer. Nine straight years of construction decline hollowed out demand; meanwhile cheap Vietnamese imports pressure local kilns, prompting tariff protection.",
    lesson: "Watch cement sales to see the investment story in real time: no GFCF recovery is real until someone orders more bags.",
    shifters: [
      { id: "infra", label: "Infrastructure drive", dD: 30, dS: 0, explain: "Public works and private capex shift demand right — the GFCF recovery made concrete, literally." },
      { id: "slump", label: "Construction decline", dD: -25, dS: 0, explain: "The last nine years: a shrinking order book at every price." },
      { id: "imports", label: "Cheap imports", dS: -20, dD: 0, explain: "Vietnamese cement lands below local cost — supply shifts right, local kilns idle." },
      { id: "tariff", label: "Import tariff", dS: 15, dD: 0, explain: "Protection shifts supply back up — builders pay more so kilns stay open. The poultry debate in grey powder." },
    ],
  },

  // ── TRANSPORT ───────────────────────────────────────────────────────────
  {
    id: "newcars", cat: "transport", name: "New cars", icon: "Car", color: "#4FB8F0",
    unitP: "R '000 (avg)", unitQ: "quantity index",
    d: { a: 750, b: 5 }, s: { a: 150, b: 3.5 }, slider: { d: 120, s: 120 }, control: null,
    story: "Bought on credit and priced half-offshore: the rand and the repo rate both sit inside this market. The big 2020s story is Chinese entrants (Chery, Haval, GWM) undercutting incumbents — a supply revolution.",
    lesson: "Competition is a supply shift: new entrants at lower cost move the whole curve right and the price level down — no regulator required.",
    shifters: [
      { id: "chinese", label: "Chinese brands scale up", dS: -50, dD: 0, explain: "New entrants with lower cost bases shift supply right — incumbents discount or lose share." },
      { id: "randweak", label: "Rand weakens", dS: 60, dD: 0, explain: "Imported vehicles and components cost more rand — supply shifts up across the market." },
      { id: "rates", label: "Finance costs rise", dD: -60, dS: 0, explain: "Cars are bought as instalments: rate hikes shrink what buyers qualify for." },
    ],
  },
  {
    id: "taxi", cat: "transport", name: "Minibus taxi fares", icon: "Bus", color: "#C6A15B",
    unitP: "R / trip", unitQ: "quantity index",
    d: { a: 30, b: 0.15 }, s: { a: 6, b: 0.12 }, slider: { d: 5, s: 5 }, control: null,
    story: "The people's transport — ~70% of commuter trips, unsubsidised, priced by associations rather than posted markets. When petrol moves or trains fail, this market carries the shock straight into working households.",
    lesson: "PRASA's collapse was a demand shift ONTO taxis: commuters who lost R10 train trips now pay R20 taxi fares. The failure of a public substitute is a price rise in the private one.",
    shifters: [
      { id: "fuel", label: "Petrol price spike", dS: 4, dD: 0, explain: "Fuel is the operator's biggest cost — associations pass it into fares within weeks." },
      { id: "rail", label: "Commuter rail collapses", dD: 5, dS: 0, explain: "Train passengers become taxi passengers — demand shifts right and fares harden." },
      { id: "railfix", label: "PRASA recovery", dD: -3, dS: 0, explain: "Every restored rail corridor pulls demand back off the taxis — the cheapest fare relief there is." },
    ],
  },
  {
    id: "airfares", cat: "transport", name: "Domestic airfares", icon: "Plane", color: "#A99BF5",
    unitP: "R (one-way avg)", unitQ: "quantity index",
    d: { a: 3000, b: 18 }, s: { a: 600, b: 14 }, slider: { d: 500, s: 500 }, control: null,
    story: "A brutally thin market: when Comair (BA/Kulula) died in 2022, a third of seats vanished overnight and fares jumped ~40%. Every entrant or exit reprices the whole sky.",
    lesson: "In concentrated markets, supply shifts come in lumps — one bankruptcy is a massive left shift. Competition policy is consumer protection here.",
    shifters: [
      { id: "exit", label: "Airline exits", dS: 250, dD: 0, explain: "Comair 2022: seats vanish, the supply curve lurches left, fares spike for years." },
      { id: "entrant", label: "Low-cost entrant", dS: -200, dD: 0, explain: "New capacity shifts supply right — the fastest route to cheaper tickets." },
      { id: "jetfuel", label: "Jet fuel spike", dS: 300, dD: 0, explain: "Fuel is ~35% of airline costs — the oil market sits directly upstream of your ticket." },
    ],
  },

  // ── SERVICES & FINANCE ──────────────────────────────────────────────────
  {
    id: "credit", cat: "services", name: "Credit (loans)", icon: "CreditCard", color: "#A99BF5",
    unitP: "% interest (prime)", unitQ: "credit extended (index)",
    d: { a: 20, b: 0.12 }, s: { a: 2, b: 0.1 }, slider: { d: 4, s: 4 },
    control: { type: "floor", value: 10.5, label: "Prime (repo 7% + 3.5)", explain: "The price of money is administered: SARB sets repo to hit the 3% inflation target, and prime follows at repo+3.5. Set above the clearing rate, it deliberately rations borrowing — that's what 'restrictive policy' means in a picture." },
    story: "The market where the price is the interest rate. Households and firms demand credit (downward-sloping — cheaper money, more borrowing); deposits and bank capital supply it. SARB doesn't let this price float: it administers the short rate as its inflation tool.",
    lesson: "Monetary policy IS a price control — a deliberate one. The May 2026 hike raised the floor to cool borrowing before the oil shock's second-round effects; the cost is every marginal project that no longer clears.",
    shifters: [
      { id: "crowd", label: "Government borrows more", dD: 2, dS: 0, explain: "The state competes for the same pool of savings — crowding out shifts credit demand right and rates pressure up." },
      { id: "confidence", label: "Investment confidence returns", dD: 2, dS: 0, explain: "Firms borrowing to build is the healthy demand shift — the one the whole growth engine is trying to create." },
      { id: "deposits", label: "Savings pool shrinks", dS: 1.5, dD: 0, explain: "Two-pot withdrawals and squeezed households mean less loanable funds — supply shifts up/left." },
    ],
  },
  {
    id: "medical", cat: "services", name: "Medical aid", icon: "HeartPulse", color: "#D9799B",
    unitP: "R '000 / member / month", unitQ: "quantity index",
    d: { a: 5, b: 0.03 }, s: { a: 1, b: 0.025 }, slider: { d: 1, s: 1 }, control: null,
    story: "Premiums rise above CPI every year — claims inflation, an ageing risk pool, and specialists' pricing power all shift supply up. Meanwhile young, healthy members drop out, which worsens the pool and pushes premiums higher still.",
    lesson: "The death-spiral mechanic: every price rise drives out the healthiest buyers, which raises the cost of covering those who stay. Some markets don't find a stable equilibrium on their own.",
    shifters: [
      { id: "claims", label: "Claims inflation", dS: 0.8, dD: 0, explain: "Hospital and specialist costs rise above CPI — the supply curve of cover shifts up annually." },
      { id: "nhi", label: "NHI uncertainty", dS: 0.5, dD: 0, explain: "Regulatory limbo freezes investment in the private system and prices in risk." },
      { id: "exit", label: "Young members exit", dD: -0.6, dS: 0, explain: "The healthy leave first — demand shifts left AND the remaining pool costs more to cover." },
    ],
  },
  {
    id: "data", cat: "services", name: "Mobile data", icon: "Smartphone", color: "#6FBDB4",
    unitP: "R / GB (effective)", unitQ: "quantity index",
    d: { a: 150, b: 1.2 }, s: { a: 20, b: 0.8 }, slider: { d: 30, s: 30 }, control: null,
    story: "The rare SA market where prices FELL for a decade — competition inquiries, new entrants, and the 2022 spectrum auction all shifted supply right. Then load-shedding forced towers onto batteries and diesel, pushing costs back up.",
    lesson: "'Data must fall' happened through supply, not decree: spectrum + competition moved the curve. The counterforce is the energy crisis taxing every industry's cost base.",
    shifters: [
      { id: "spectrum", label: "Spectrum released", dS: -15, dD: 0, explain: "The 2022 auction let networks carry more traffic per rand — a textbook rightward supply shift." },
      { id: "competition", label: "Price war", dS: -10, dD: 0, explain: "Challenger networks force effective prices down across the market." },
      { id: "loadshed", label: "Load-shedding costs", dS: 12, dD: 0, explain: "Generators and batteries at 15,000 towers — the energy constraint taxing a healthy market." },
    ],
  },
  {
    id: "security", cat: "services", name: "Private security", icon: "Shield", color: "#E08B70",
    unitP: "R / household / month", unitQ: "quantity index",
    d: { a: 800, b: 5 }, s: { a: 150, b: 3.5 }, slider: { d: 120, s: 120 }, control: null,
    story: "The world's largest private security industry — ~2.5x more guards than police officers. This market exists at this scale because the free public substitute (effective policing) is under-supplied. Households buy safety like a utility.",
    lesson: "Security spend is the crime constraint priced in rands: money that could fund investment buys protection instead. When a public good fails, a private market prices the failure. Same pattern as solar and private schools.",
    shifters: [
      { id: "crime", label: "Crime wave", dD: 100, dS: 0, explain: "Every hijacking statistic shifts demand right — fear is this market's demand curve." },
      { id: "police", label: "Policing recovers", dD: -80, dS: 0, explain: "The Diagnosis crime reform in micro: a working public substitute pulls demand left." },
      { id: "wages", label: "Guard wage floor rises", dS: 60, dD: 0, explain: "Sectoral minimum wages lift the industry's cost base — supply shifts up." },
    ],
  },
  {
    id: "school", cat: "services", name: "Private schooling", icon: "GraduationCap", color: "#7FB58A",
    unitP: "R '000 / year", unitQ: "quantity index",
    d: { a: 150, b: 1 }, s: { a: 30, b: 0.7 }, slider: { d: 25, s: 25 }, control: null,
    story: "Demand here is a referendum on public education: every failing state school shifts demand for private seats right. Low-fee private chains (SPARK, Curro) are the supply response to a mass-market gap.",
    lesson: "The same pattern a third time — security, solar, schools: when the free public version fails, households pay twice (taxes + fees), and a private market prices the gap. That double payment is a hidden tax on growth.",
    shifters: [
      { id: "publicfail", label: "Public schools decline", dD: 20, dS: 0, explain: "Every parent who loses faith in the local school becomes demand at every price." },
      { id: "lowfee", label: "Low-fee chains expand", dS: -12, dD: 0, explain: "Scalable private models shift supply right, pulling fees toward mass-market reach." },
      { id: "emigration", label: "Middle-class emigration", dD: -15, dS: 0, explain: "The paying customer base shrinks as skilled families leave — demand shifts left." },
    ],
  },

  // ── LABOUR ──────────────────────────────────────────────────────────────
  {
    id: "labour", cat: "labour", name: "Low-skill labour", icon: "HardHat", color: "#D98BB6",
    unitP: "R / hour", unitQ: "quantity index (workers)",
    d: { a: 55, b: 0.5 }, s: { a: 5, b: 0.35 }, slider: { d: 10, s: 10 },
    control: { type: "floor", value: 28.8, label: "National minimum wage", explain: "The wage floor sits above the market-clearing wage for low-skill work. More people offer labour at that wage than firms demand — the surplus of workers is measured unemployment. The floor raises pay for the employed and lengthens the queue outside." },
    story: "The market behind the 32.7%. Demand for workers comes from growth (firms hire when output grows); supply is ~40m working-age people. The minimum wage (~R28.80/hr) protects the employed — the debate is what it does to the queue.",
    lesson: "This chart is the whole macro story in micro form: argue about the floor if you like, but the deeper fix is shifting demand right — which is exactly what raising the growth speed limit means.",
    shifters: [
      { id: "growth", label: "3% growth arrives", dD: 5, dS: 0, explain: "Firms expand and hiring demand shifts right — the surplus (unemployment) shrinks without touching the floor. The engine's whole argument." },
      { id: "mechanise", label: "Mechanisation", dD: -5, dS: 0, explain: "Machines substitute for routine labour — demand shifts left and the queue lengthens at any wage." },
      { id: "publicworks", label: "Public employment schemes", dD: 3, dS: 0, explain: "The state adds demand directly (EPWP-style) — real relief, fiscally bounded; buys time, not a new speed limit." },
    ],
  },
  {
    id: "skilled", cat: "labour", name: "Skilled professionals", icon: "Briefcase", color: "#A99BF5",
    unitP: "R / hour", unitQ: "quantity index (workers)",
    d: { a: 600, b: 3 }, s: { a: 100, b: 2.5 }, slider: { d: 100, s: 100 }, control: null,
    story: "The mirror image of the low-skill market: engineers, artisans, coders and CAs are SCARCE. Emigration shifts supply left every year; digitisation shifts demand right. No floor needed — wages here clear far above any minimum.",
    lesson: "SA runs two labour markets at once: a surplus at the bottom and a shortage at the top. The skills premium is the education system's failure, priced hourly. Skilled-visa reform is a supply shift you can legislate.",
    shifters: [
      { id: "emigration", label: "Skills emigration", dS: 60, dD: 0, explain: "Every professional who leaves shifts supply left — remaining skills get pricier, projects stall." },
      { id: "visas", label: "Critical-skills visas work", dS: -40, dD: 0, explain: "Importing scarce skills is the fastest supply shift available — the Diagnosis skills reform in micro." },
      { id: "digital", label: "Digitisation demand", dD: 50, dS: 0, explain: "Every firm becoming a software firm bids for the same engineers — demand shifts right globally, not just locally." },
    ],
  },

  // ── EXPORTS & COMMODITIES ───────────────────────────────────────────────
  {
    id: "gold", cat: "exports", name: "Gold", icon: "Coins", color: "#D8AF6A",
    unitP: "$ / oz", unitQ: "quantity index",
    d: { a: 6000, b: 30 }, s: { a: 1000, b: 25 }, slider: { d: 800, s: 800 }, control: null,
    story: "SA is a price-taker: the gold price is set by global fear and central banks, not by anything decided in Johannesburg. Deep-level mines are costly and old — supply responds slowly no matter the price.",
    lesson: "Gold is SA's counter-cyclical insurance: when the world panics, our terms of trade improve. The 2026 rally is quietly funding the current account while everything else struggles.",
    shifters: [
      { id: "fear", label: "Global crisis bid", dD: 500, dS: 0, explain: "War, inflation scares and central-bank buying shift demand right — SA's export earnings windfall." },
      { id: "calm", label: "Risk-on unwind", dD: -400, dS: 0, explain: "Ceasefires and soft landings drain the fear premium — the same channel in reverse." },
      { id: "depth", label: "Deep-level costs rise", dS: 300, dD: 0, explain: "4km-deep shafts, rising wages and power costs shift supply up — old mines close at the margin." },
    ],
  },
  {
    id: "platinum", cat: "exports", name: "Platinum (PGMs)", icon: "Gem", color: "#4FB8F0",
    unitP: "$ / oz", unitQ: "quantity index",
    d: { a: 2400, b: 12 }, s: { a: 400, b: 10 }, slider: { d: 300, s: 300 }, control: null,
    story: "SA's biggest export complex, riding two opposing technology waves: catalytic converters (demand fading with EVs) versus hydrogen fuel cells (demand rising if that future arrives). Whole mining towns hang on which wave wins.",
    lesson: "Technology change is a demand shifter you can't negotiate with. The PGM basket is a bet on the hydrogen economy arriving before the combustion engine dies.",
    shifters: [
      { id: "ev", label: "EV transition accelerates", dD: -250, dS: 0, explain: "Electric cars need no catalytic converters — the historic core of PGM demand fades." },
      { id: "hydrogen", label: "Hydrogen economy scales", dD: 200, dS: 0, explain: "Fuel cells and electrolysers are platinum-hungry — the replacement demand wave, if it comes." },
      { id: "closures", label: "Shaft closures", dS: 150, dD: 0, explain: "Low prices close marginal shafts — supply shifts left, cushioning the price at the cost of jobs." },
    ],
  },
  {
    id: "citrus", cat: "exports", name: "Citrus (export)", icon: "Citrus", color: "#C6A15B",
    unitP: "R / 15kg carton", unitQ: "quantity index",
    d: { a: 320, b: 2 }, s: { a: 60, b: 1.5 }, slider: { d: 60, s: 60 }, control: null,
    story: "The world's second-largest citrus exporter — an agricultural success story constrained by everything except farming: port delays, EU cold-treatment rules, and shipping costs decide whether record harvests become record earnings.",
    lesson: "Trade rules and logistics are demand and supply shifters as real as weather. The EU's citrus black spot regulations are a demand curve drawn in Brussels.",
    shifters: [
      { id: "eu", label: "EU tightens rules", dD: -30, dS: 0, explain: "Cold-treatment and pest regulations raise the cost of accessing the biggest market — demand shifts left." },
      { id: "ports", label: "Port congestion", dS: 25, dD: 0, explain: "Fruit rotting at anchor is supply that never existed — the logistics constraint, refrigerated." },
      { id: "orchards", label: "New orchards mature", dS: -20, dD: 0, explain: "A decade of planting comes online — supply shifts right, needing new markets to absorb it." },
    ],
  },
];

export const MARKETS_AS_OF = "calibrated to early-July 2026 price levels";

// ── Annotated price histories ───────────────────────────────────────────────
// A real price path over time with the events that moved it — so you can see
// what happened when, not just where the price sits today. `series` is the line;
// `events` mark the turning points (matched to a series label). Illustrative but
// directionally faithful to actual SA price history.
export const MARKET_HISTORY = {
  maize: {
    unit: "R / ton (white)",
    series: [["2019", 2600], ["2020", 3200], ["2021", 3400], ["2022", 4200], ["2023", 3800], ["2024", 5200], ["2025", 4600], ["2026", 4700]],
    events: [
      { at: "2020", title: "COVID stockpiling", note: "Panic buying and a weak rand lifted prices." },
      { at: "2022", title: "Ukraine grain shock", note: "Global grain disruption fed local prices." },
      { at: "2024", title: "El Niño drought", note: "The crop fell ~20% — white maize hit records." },
    ],
  },
  petrol: {
    unit: "R / litre",
    series: [["2019", 15.7], ["2020", 14.5], ["2021", 17.2], ["2022", 24.5], ["2023", 23.0], ["2024", 22.8], ["2025", 21.5], ["Jun′26", 22.4], ["Jul′26", 20.4]],
    events: [
      { at: "2020", title: "COVID demand collapse", note: "Oil briefly went negative; pumps eased." },
      { at: "2022", title: "Ukraine war peak", note: "Petrol spiked toward ~R26/l mid-year." },
      { at: "Jun′26", title: "Hormuz spike", note: "US–Iran tension pushed petrol +R1.43/l." },
      { at: "Jul′26", title: "Ceasefire relief", note: "Brent crashed to ~$75 — petrol −R2.01/l." },
    ],
  },
  electricity: {
    unit: "R / kWh (avg tariff)",
    series: [["2019", 1.6], ["2020", 1.8], ["2021", 2.0], ["2022", 2.3], ["2023", 2.6], ["2024", 2.9], ["2025", 3.2], ["2026", 3.4]],
    events: [
      { at: "2023", title: "Worst load-shedding", note: "Record blackouts alongside above-inflation hikes." },
      { at: "2025", title: "Multi-year tariff path", note: "NERSA increases kept utilities inflation ~5%+." },
    ],
  },
  eggs: {
    unit: "R / dozen",
    series: [["2021", 28], ["2022", 32], ["2023", 55], ["2024", 42], ["2025", 44], ["2026", 45]],
    events: [
      { at: "2023", title: "Avian flu crisis", note: "~30% of layers culled; shelves rationed, prices +40%." },
      { at: "2024", title: "Flock rebuilt", note: "Imports of fertilised eggs normalised supply." },
    ],
  },
  beef: {
    unit: "R / kg",
    series: [["2021", 95], ["2022", 110], ["2023", 105], ["2024", 120], ["2025", 130], ["2026", 134]],
    events: [
      { at: "2023", title: "Foot-and-mouth ban", note: "Export markets closed — local glut capped prices." },
      { at: "2025", title: "Markets reopen", note: "Protocol deals firmed farm-gate prices again." },
    ],
  },
  poultry: {
    unit: "R / kg",
    series: [["2021", 38], ["2022", 42], ["2023", 48], ["2024", 46], ["2025", 47], ["2026", 47]],
    events: [
      { at: "2023", title: "Flu + tariff fight", note: "Supply shock met the running import-tariff battle." },
    ],
  },
  gold: {
    unit: "$ / oz",
    series: [["2019", 1390], ["2020", 1770], ["2021", 1800], ["2022", 1800], ["2023", 1940], ["2024", 2380], ["2025", 2900], ["2026", 3270]],
    events: [
      { at: "2020", title: "COVID safe-haven", note: "Fear and stimulus drove the first leg up." },
      { at: "2024", title: "Central-bank buying", note: "Reserve diversification launched a new bull run." },
      { at: "2026", title: "Geopolitical bid", note: "Middle-East risk kept the fear premium elevated." },
    ],
  },
  airfares: {
    unit: "R (one-way avg)",
    series: [["2019", 1600], ["2021", 1400], ["2022", 2400], ["2023", 2600], ["2024", 2700], ["2025", 2900], ["2026", 3000]],
    events: [
      { at: "2022", title: "Comair collapse", note: "Kulula/BA grounded — a third of seats vanished, fares +40%." },
      { at: "2024", title: "Thin competition", note: "Few carriers kept domestic fares structurally high." },
    ],
  },
  data: {
    unit: "R / GB (effective)",
    series: [["2018", 120], ["2020", 90], ["2021", 70], ["2022", 55], ["2023", 60], ["2024", 55], ["2026", 50]],
    events: [
      { at: "2020", title: "#DataMustFall + probe", note: "Competition pressure forced effective prices down." },
      { at: "2022", title: "Spectrum auction", note: "New spectrum let networks carry more per rand." },
      { at: "2023", title: "Load-shedding tax", note: "Generators at 15,000 towers pushed costs back up." },
    ],
  },
  newcars: {
    unit: "R '000 (avg)",
    series: [["2019", 380], ["2021", 420], ["2022", 470], ["2023", 490], ["2024", 500], ["2025", 540], ["2026", 560]],
    events: [
      { at: "2021", title: "Chip shortage", note: "Semiconductor scarcity constrained supply, lifted prices." },
      { at: "2025", title: "Chinese entrants", note: "Chery/Haval/GWM undercut incumbents — the price war begins." },
    ],
  },
  rent: {
    unit: "R '000 / month (metro 1-bed)",
    series: [["2019", 7.8], ["2020", 7.6], ["2021", 8.0], ["2022", 8.4], ["2023", 8.9], ["2024", 9.3], ["2026", 9.6]],
    events: [
      { at: "2020", title: "COVID softness", note: "Urban rents dipped as demand and incomes fell." },
      { at: "2024", title: "Semigration surge", note: "In-migration pushed Cape Town rents up ~10%/yr." },
    ],
  },
};
