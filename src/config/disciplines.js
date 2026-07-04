// The reference layer: the fields of economics and what each brings, plus the
// "what it gets right / blind spot" notes that turn the six lenses into a
// teaching tool. Written in plain language — no prior economics assumed.

// Extra reference notes for each school (keyed by lens id in lenses.js).
export const SCHOOL_REF = {
  nk: {
    gets_right: "Why central banks can actually steer the short run — because prices are slow to move, demand and interest rates shift real output.",
    blind_spot: "Can over-simplify by averaging everyone together; heterogeneity, finance and climate often get bolted on too weakly.",
    figures: "Calvo · Clarida–Galí–Gertler · Smets–Wouters · today's HANK models",
  },
  keynes: {
    gets_right: "Why slumps happen — not enough spending — and why government can pull an economy out of one.",
    blind_spot: "On its own it stays too aggregate, and it's light on expectations and supply limits.",
    figures: "Keynes · Hicks",
  },
  classical: {
    gets_right: "The long run: productivity, capital and trade set what an economy can actually make.",
    blind_spot: "Under-plays crises, sticky prices and the damage of a demand shortfall.",
    figures: "Smith · Ricardo",
  },
  austrian: {
    gets_right: "How booms built on cheap credit quietly set up the next bust.",
    blind_spot: "Lightly formalised and rarely used as a working forecast model by central banks.",
    figures: "Mises · Hayek",
  },
  monetarist: {
    gets_right: "That expectations and credibility discipline policy — if people see it coming, only surprises move output.",
    blind_spot: "Strict 'everyone is perfectly rational and informed' is now treated as a limiting case, not reality.",
    figures: "Lucas · Barro–Gordon",
  },
  mmt: {
    gets_right: "That a government issuing its own currency can't be forced to default — so financing isn't the hard limit.",
    blind_spot: "Weak where a country lacks monetary sovereignty or carries heavy foreign-currency debt; most economists are sceptical of the strong claims.",
    figures: "Wray · Tcherneva · Tymoigne",
  },
};

// The fields. `group`: "core" (the analytical spine) or "applied" (realism & policy).
export const FIELDS = [
  {
    id: "micro", name: "Microeconomics", color: "#C6A15B", group: "core", priority: "High",
    studies: "Single households, firms and markets — how prices are set and how people and companies choose under scarcity.",
    methods: "Supply & demand, game theory, demand estimation, market design",
    data: "Household spending, scanner & CPI microdata, firm surveys",
    strength: "Fine-grained realism about behaviour and prices.",
    limit: "On its own it can't produce a whole-economy forecast.",
    eios: "Powers tax & subsidy incidence, price-control analysis, and sector demand blocks.",
  },
  {
    id: "macro", name: "Macroeconomics", color: "#F3F1EA", group: "core", priority: "High",
    studies: "The whole economy at once — growth, inflation, unemployment and the business cycle.",
    methods: "Growth accounting, DSGE, semi-structural models, HANK",
    data: "National accounts, prices, labour, financial accounts",
    strength: "Keeps the whole system consistent.",
    limit: "Can miss detail — heterogeneity, finance — if kept too aggregate.",
    eios: "Anchors the baseline forecast, recession scenarios and medium-run policy packages.",
  },
  {
    id: "econ", name: "Econometrics", color: "#6FBDB4", group: "core", priority: "High",
    studies: "Turning raw data into estimated relationships, causal effects and forecast ranges.",
    methods: "Regression, time-series, VAR, nowcasting, machine learning",
    data: "Every official series — especially real-time, revision-aware vintages",
    strength: "Empirical discipline and speed.",
    limit: "Past patterns can break when the policy regime changes.",
    eios: "The engine for nowcasts, forecast densities and honest uncertainty bands.",
  },
  {
    id: "money", name: "Monetary economics", color: "#A99BF5", group: "core", priority: "High",
    studies: "Money, interest rates, credit and inflation — and how the central bank's moves travel through the economy.",
    methods: "Policy-rule models, yield-curve models, bank-lending channels",
    data: "Inflation & expectations, yield curves, credit aggregates",
    strength: "Directly relevant to policy.",
    limit: "Transmission shifts in crises and when rates are very low.",
    eios: "Drives rate-path scenarios, inflation decomposition and balance-sheet stress tests.",
  },
  {
    id: "intl", name: "International economics", color: "#7FB58A", group: "core", priority: "High",
    studies: "Trade, exchange rates, capital flows and how shocks spill between countries.",
    methods: "Comparative advantage, gravity, open-economy & multi-country models",
    data: "Trade & balance-of-payments, input-output tables, FDI",
    strength: "Keeps the external side coherent.",
    limit: "Geopolitics and logistics often move faster than the equations.",
    eios: "Indispensable for tariff, sanction, exchange-rate and current-account scenarios.",
  },
  {
    id: "io", name: "Industrial organization", color: "#D8AF6A", group: "core", priority: "Medium",
    studies: "Market structure — competition, market power, mergers, platforms and regulation.",
    methods: "Structural demand/supply, merger simulation, markup measurement",
    data: "Firm panels, market shares, scanner data",
    strength: "Realistic about imperfect competition.",
    limit: "Needs embedding in a wider model for economy-wide effects.",
    eios: "Sharpens inflation modelling and supply-chain concentration risk.",
  },
  {
    id: "behav", name: "Behavioural economics", color: "#D98BB6", group: "applied", priority: "Medium",
    studies: "How people really decide — bias, habits, limited attention, fairness, present bias.",
    methods: "Lab & field experiments, RCTs, behavioural models",
    data: "Experiments, expectations surveys, administrative records",
    strength: "Realism about how people actually behave, not the textbook ideal.",
    limit: "Effects can be context-specific and hard to scale into a forecast.",
    eios: "Improves take-up, compliance, communication and expectations modelling.",
  },
  {
    id: "dev", name: "Development economics", color: "#7FB58A", group: "applied", priority: "Medium",
    studies: "Poverty, inequality, human capital, informality and the barriers to lasting growth.",
    methods: "RCTs, panel econometrics, poverty microsimulation",
    data: "World Development Indicators, living-standards & health surveys",
    strength: "Connects headline growth to lived welfare.",
    limit: "Evidence from one country transfers imperfectly to another.",
    eios: "Turns output scenarios into poverty, education and inequality outcomes.",
  },
  {
    id: "labour", name: "Labour economics", color: "#D98BB6", group: "applied", priority: "High",
    studies: "Jobs, wages, skills, job search and unemployment.",
    methods: "Search-and-matching, wage equations, linked employer-employee data",
    data: "Labour-force surveys, payroll & administrative records",
    strength: "Ties directly to social stability and inflation persistence.",
    limit: "Labour institutions and informality differ hugely between countries.",
    eios: "Feeds unemployment nowcasts, wage-price dynamics and skills-mismatch monitoring.",
  },
  {
    id: "public", name: "Public finance", color: "#E08B70", group: "applied", priority: "High",
    studies: "Taxes, spending, transfers, debt — and who ultimately pays.",
    methods: "Microsimulation, optimal-tax theory, debt-sustainability analysis",
    data: "Tax records, budget microdata, household income surveys",
    strength: "Direct budget and reform decision support.",
    limit: "Static models miss the knock-on macro effects.",
    eios: "Runs budget scoring, reform packages, debt paths and distribution outputs.",
  },
  {
    id: "env", name: "Environmental economics", color: "#7FB58A", group: "applied", priority: "High",
    studies: "Pollution, carbon, energy and natural capital — and the output-vs-environment trade-off.",
    methods: "Carbon-pricing models, integrated climate-economy models (IAMs)",
    data: "Emissions inventories, energy balances, climate scenarios",
    strength: "Makes climate a first-class constraint, not an afterthought.",
    limit: "Deep uncertainty over damages, tipping points and technology.",
    eios: "Powers net-zero plans, carbon-tax design and transition-risk scenarios.",
  },
  {
    id: "poli", name: "Political economy", color: "#C6A15B", group: "applied", priority: "Medium",
    studies: "The politics behind policy — coalitions, distribution, trust and state capacity.",
    methods: "Voter & state-capacity models, governance-data analysis",
    data: "Governance & trust indices, election and conflict data",
    strength: "Tells you whether a policy is actually feasible and will stick.",
    limit: "Many variables are hard to measure at high frequency.",
    eios: "Adds reform feasibility, compliance risk and political-cycle checks.",
  },
  {
    id: "inst", name: "Institutional economics", color: "#D8735E", group: "applied", priority: "Medium",
    studies: "The rules of the game — property rights, law, governance and norms.",
    methods: "Comparative & historical analysis, contract theory",
    data: "Governance indices, enterprise surveys, legal archives",
    strength: "Explains why countries diverge over the long run.",
    limit: "Institutions move slowly and are hard to pin down causally.",
    eios: "Informs long-run potential growth, investment climate and state-capacity checks.",
  },
];

export const FIELD_GROUPS = [
  { id: "core", label: "Core analytical spine", blurb: "The fields that build, estimate and keep the model consistent." },
  { id: "applied", label: "Applied & social realism", blurb: "The fields that make it real: who's affected, what's feasible, and the long-run constraints." },
];

export const REFERENCE_INTRO =
  "No single field or school runs a real economy. The best modelling combines many — as competing lenses and complementary tools. This is the map: the schools of thought (which you can run live in Intelligence) and the fields of economics behind them.";
