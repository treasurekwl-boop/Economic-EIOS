// ─────────────────────────────────────────────────────────────────────────────
// LEARN — plain-language explanations of the concepts the engine uses.
// Surfaced as hover tooltips (InfoTip) and insight cards so the app teaches as
// you explore, instead of assuming you already speak macroeconomics.
// ─────────────────────────────────────────────────────────────────────────────

export const CONCEPTS = {
  setpoint: {
    title: "The 3% setpoint",
    body: "The growth rate the country is aiming for. 3% is roughly the minimum needed to create jobs faster than the population grows — below it, unemployment tends to rise.",
  },
  potential: {
    title: "Potential growth",
    body: "The economy's speed limit — how fast it can grow without overheating. Set by how many people work, how much capital they have, and how productively they combine. South Africa's is only ~1.3%, which is the core problem.",
  },
  outputGap: {
    title: "Output gap",
    body: "Actual output minus potential. A positive gap means the economy is running hotter than its speed limit — which shows up as inflation. You can't hold a positive gap open for long.",
  },
  repo: {
    title: "Repo rate",
    body: "The interest rate the Reserve Bank (SARB) charges banks. Raise it and borrowing gets dearer, cooling investment and spending; cut it and you stimulate them. It's the main dial of monetary policy.",
  },
  realRate: {
    title: "Real interest rate",
    body: "The repo rate minus expected inflation — what borrowing actually costs once you strip out rising prices. Investment responds to the real rate, not the headline one.",
  },
  inflation: {
    title: "Inflation",
    body: "How fast prices rise. South Africa's target is 3% with a ±1pp tolerance band. Too-fast growth or a weak rand pushes it up; the Reserve Bank fights it with the repo rate.",
  },
  phillips: {
    title: "How growth feeds inflation",
    body: "When the economy runs above its speed limit, demand outstrips supply and prices rise. That link — the output gap pushing on inflation — is why stimulus alone can't buy lasting growth.",
  },
  gfcf: {
    title: "Investment (GFCF)",
    body: "Gross Fixed Capital Formation — spending on factories, machines, roads and buildings. It both adds demand today and raises the speed limit tomorrow. SA invests ~14% of GDP; the National Development Plan target is 30%.",
  },
  gva: {
    title: "Sector weights (GVA)",
    body: "Each sector's share of total output. GDP growth is the weighted sum of sector growth — so a tiny sector booming barely moves the total, while a heavyweight stalling drags everything.",
  },
  potentialLift: {
    title: "Reform uplift",
    body: "Fixing a binding constraint (power, rail, crime…) raises the speed limit by an estimated amount. Stack enough of them and potential growth can clear 3% — the only way the target becomes durable rather than borrowed.",
  },
  netJobs: {
    title: "Net jobs",
    body: "Roughly, jobs grow with output minus productivity gains. The economy needs ~360k new jobs a year just to absorb new entrants — below that, the unemployment rate climbs.",
  },
  identity: {
    title: "GDP = C + I + G + X − M",
    body: "The expenditure identity: everything produced is either Consumed, Invested, bought by Government, eXported, or (subtract) iMported. The Solver moves these pieces and the total must always add up exactly.",
  },
  coreInflation: {
    title: "Core inflation",
    body: "Inflation with food, fuel and energy stripped out — the noisy, imported bits. Core shows the underlying, home-grown price pressure. If headline spikes but core stays in the band, the shock is probably temporary.",
  },
  debt: {
    title: "Debt-to-GDP",
    body: "Government debt as a share of the economy — the cleanest gauge of fiscal health. SA's stabilises at 78.9% in 2025/26, the first stabilisation in 17 years. High debt isn't just a number: its interest bill crowds out everything else.",
  },
  debtService: {
    title: "Debt-service costs",
    body: "The interest bill on government debt — roughly R1 of every R6 the state spends. It's paid before a single school, clinic or road, which is how high debt quietly eats public investment.",
  },
  currentAccount: {
    title: "Current account",
    body: "The country's balance with the rest of the world — trade plus income flows. A deficit means SA spends more abroad than it earns and must attract foreign capital to cover the gap; small and funded is fine, large and chronic is fragile.",
  },
  supplyDemand: {
    title: "Supply & demand",
    body: "The two forces behind every price. Demand slopes down (higher price, less bought); supply slopes up (higher price, more offered). Prices change for exactly two reasons: a curve SHIFTS (drought, tariff, income change) or you MOVE along one. Confusing the two is the most common economics error.",
  },
  equilibrium: {
    title: "Market equilibrium",
    body: "The crossing point — the one price where buyers' plans and sellers' plans agree. Above it, unsold surplus pushes price down; below it, shortage pulls price up. Markets grind toward this point unless something blocks the price from moving.",
  },
  priceControl: {
    title: "Price floors & ceilings",
    body: "Laws that block the price from reaching equilibrium. A ceiling below equilibrium creates a shortage rationed by queues — SA's capped electricity tariff makes that queue load-shedding. A floor above equilibrium creates a surplus — a wage floor's surplus of workers is measured unemployment.",
  },
  elasticity: {
    title: "Elasticity",
    body: "How much quantity responds when price changes. Petrol, pap and chicken are inelastic — people buy them almost regardless — so price shocks hit budgets instead of reducing use. That's why fuel is taxed, why droughts are regressive, and why staple-price spikes hurt the poorest hardest.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FLUENCY — the personal training layer. A tiered curriculum over the exact
// concepts the dashboard runs on, plus one quiz question per concept. Mastery
// is tracked on-device: the dashboard teaches until the vocabulary is yours.
// ─────────────────────────────────────────────────────────────────────────────

export const CURRICULUM = [
  { id: "foundations", label: "Foundations", color: "#6FBDB4",
    blurb: "The vocabulary of the dashboard — what GDP is made of and what the target means.",
    concepts: ["setpoint", "identity", "gva", "inflation"] },
  { id: "engine", label: "The Engine Room", color: "#A99BF5",
    blurb: "Why growth is capped and how the cap feeds inflation — the model's core mechanics.",
    concepts: ["potential", "outputGap", "phillips", "gfcf"] },
  { id: "policy", label: "Policy & Levers", color: "#C6A15B",
    blurb: "What the Reserve Bank and reforms can and can't do — the dials and their limits.",
    concepts: ["repo", "realRate", "netJobs", "potentialLift"] },
  { id: "analysis", label: "Fundamental Analysis", color: "#E08B70",
    blurb: "Reading a country like an analyst — the fiscal and external vitals behind the Fundamentals board.",
    concepts: ["coreInflation", "debt", "debtService", "currentAccount"] },
  { id: "micro", label: "Micro Markets", color: "#D98BB6",
    blurb: "The mechanics under every price — the curves, the crossing point, and what happens when the law blocks them.",
    concepts: ["supplyDemand", "equilibrium", "priceControl", "elasticity"] },
];

export const QUIZ = {
  setpoint: {
    q: "Why does the engine treat 3% as the minimum growth target?",
    options: [
      "It's the IMF's requirement for emerging markets",
      "Below roughly 3%, jobs grow slower than the workforce and unemployment rises",
      "It's the highest growth SA has ever achieved",
      "The rand collapses below 3%",
    ],
    answer: 1,
    why: "3% is roughly the pace needed to absorb ~360k new work-seekers a year — anything less and unemployment climbs even while the economy 'grows'.",
  },
  identity: {
    q: "In GDP = C + I + G + X − M, why is M subtracted?",
    options: [
      "Imports are bad for the economy",
      "Imports are taxed at the border",
      "C, I, G and X already contain imported goods, so M removes what wasn't produced locally",
      "It's a rounding adjustment",
    ],
    answer: 2,
    why: "GDP measures what's made inside the country. Subtracting M stops foreign production hiding inside consumption and investment.",
  },
  gva: {
    q: "Agriculture booms at +6% while finance stalls at 0%. What happens to GDP?",
    options: [
      "GDP jumps — agriculture feeds everyone",
      "Barely anything: agriculture is ~2.6% of output, finance is ~22.7%",
      "GDP falls — food prices drop",
      "Impossible to say",
    ],
    answer: 1,
    why: "GDP growth is the weighted sum of sector growth. A tiny sector swinging hard moves the total less than a heavyweight twitching.",
  },
  inflation: {
    q: "What is SA's official inflation target since November 2025?",
    options: ["A 3–6% range", "A 6% ceiling", "3% with a ±1pp tolerance band", "2%, like the US Fed"],
    answer: 2,
    why: "The framework moved from the old 3–6% range to a 3% point target with a ±1pp tolerance band.",
  },
  potential: {
    q: "SA's potential growth is ~1.3%. What does that number actually mean?",
    options: [
      "The official forecast for next year",
      "The speed the economy can sustain without overheating — its supply-side limit",
      "The minimum growth guaranteed by government",
      "The rate of population growth",
    ],
    answer: 1,
    why: "Potential is the speed limit set by labour, capital and productivity. Demand can push above it only briefly — then inflation bites.",
  },
  outputGap: {
    q: "A positive output gap means…",
    options: [
      "The economy is producing above its sustainable capacity",
      "Exports exceed imports",
      "The budget is in surplus",
      "Unemployment is zero",
    ],
    answer: 0,
    why: "Gap = actual − potential. Positive means running hot: demand outstrips what the economy can supply, and prices start rising.",
  },
  phillips: {
    q: "Why can't SA simply stimulate demand up to 3% growth and stay there?",
    options: [
      "The constitution forbids it",
      "With potential at ~1.3%, the excess leaks into inflation, forcing rates back up",
      "Consumers refuse to spend",
      "Exports would collapse",
    ],
    answer: 1,
    why: "That's the app's core verdict — 'on target, but borrowed'. Demand above the speed limit converts to inflation, not lasting growth.",
  },
  gfcf: {
    q: "SA invests ~14% of GDP. Why does the NDP target 30%?",
    options: [
      "To match China's number",
      "Investment adds demand now AND raises the speed limit later — the only durable path to 3%",
      "To reduce imports",
      "Because the banks require it",
    ],
    answer: 1,
    why: "GFCF is the one lever that works both sides of the model: demand today, capacity (potential) tomorrow.",
  },
  repo: {
    q: "The repo rate mainly moves the economy through…",
    options: [
      "Government spending",
      "The cost of borrowing → investment and consumption",
      "Export prices",
      "The tax rate",
    ],
    answer: 1,
    why: "Repo → real borrowing cost → firms invest and households spend more or less. That's the transmission chain the Solver models.",
  },
  realRate: {
    q: "Repo is 7% and expected inflation is 3.5%. The real rate is…",
    options: ["10.5%", "7%", "3.5%", "0.5%"],
    answer: 2,
    why: "Real ≈ nominal − expected inflation = 7 − 3.5 = 3.5%. Investment decisions respond to this, not the headline number.",
  },
  netJobs: {
    q: "Growth runs at 2% while the productivity trend is 1%. Roughly what happens to jobs?",
    options: [
      "Employment grows ~1% — which may still trail new entrants",
      "Jobs fall 1%",
      "Jobs grow 3%",
      "No change",
    ],
    answer: 0,
    why: "Jobs ≈ growth − productivity. ~1% of 16.8m is ~168k jobs — under the ~360k a year needed, so unemployment still rises.",
  },
  potentialLift: {
    q: "Why does the Diagnosis insist no single reform reaches a durable 3%?",
    options: [
      "Reforms are too expensive",
      "Each fix lifts potential a few tenths — only the stacked set clears the target",
      "Government refuses to do them",
      "Because of load-shedding",
    ],
    answer: 1,
    why: "Energy +0.6, logistics +0.4, crime +0.4… individually small, jointly decisive. The constraints bind as a stack.",
  },
  coreInflation: {
    q: "Headline CPI jumps to 4.5% on fuel prices while core stays at 3.8%. What does an analyst conclude?",
    options: [
      "Inflation is out of control — hike hard",
      "The pressure is imported and likely temporary; underlying inflation is still near the band",
      "The CPI data must be wrong",
      "Core doesn't matter",
    ],
    answer: 1,
    why: "Core strips the noisy, imported items. Headline above core on fuel = a pass-through shock, not home-grown overheating.",
  },
  debt: {
    q: "Why is SA's debt stabilising at 78.9% of GDP such a big deal?",
    options: [
      "It means the debt is paid off",
      "It's the first time in 17 years the ratio stops rising — the turning point of the fiscal story",
      "It lets government spend freely again",
      "It guarantees a ratings upgrade",
    ],
    answer: 1,
    why: "Stabilisation means growth + budget discipline finally outpace new borrowing. From here the ratio is projected to fall to 76.5% by 2028/29.",
  },
  debtService: {
    q: "Debt-service costs take ~17% of government spending. Why do analysts treat this as growth-negative?",
    options: [
      "Interest payments cause inflation",
      "That money is spent before schools, clinics or infrastructure — it crowds out public investment",
      "It weakens the rand directly",
      "Bondholders don't pay tax",
    ],
    answer: 1,
    why: "R1 in every R6 goes to interest first. It's the mechanism by which yesterday's borrowing eats tomorrow's capacity.",
  },
  currentAccount: {
    q: "SA runs a current account deficit of 0.5% of GDP. How worried should you be?",
    options: [
      "Very — any deficit is a crisis",
      "Not very — it's small and fundable; the risk is if imports outrun exports and it widens",
      "Deficits are good for the rand",
      "It means exports are zero",
    ],
    answer: 1,
    why: "A small, funded deficit is normal for a developing economy. The watch-point is the projected widening to ~1.4% in 2026.",
  },
  supplyDemand: {
    q: "A drought hits the maize harvest. In the supply-demand model, what happened?",
    options: [
      "Demand shifted right",
      "The supply curve shifted left — less offered at every price, so the price rises",
      "People moved along the demand curve for no reason",
      "Equilibrium disappeared",
    ],
    answer: 1,
    why: "The harvest shock changes what sellers can offer at every price — that's a supply SHIFT. The price rise then moves buyers along their demand curve.",
  },
  equilibrium: {
    q: "Why does a market price tend to settle at the crossing point of supply and demand?",
    options: [
      "Because the government sets it there",
      "Above it unsold surplus pushes price down; below it shortage bids price up — only the crossing point is stable",
      "Because firms prefer that price",
      "It's a coincidence",
    ],
    answer: 1,
    why: "Equilibrium is self-enforcing: any other price creates a surplus or shortage that pushes the price back toward the cross.",
  },
  priceControl: {
    q: "Load-shedding and unemployment are, in micro terms, the same phenomenon. Why?",
    options: [
      "Both are caused by corruption",
      "Both are rationing: a blocked price (capped tariff / wage floor) can't clear the market, so quantity does",
      "Both are caused by the repo rate",
      "They aren't related at all",
    ],
    answer: 1,
    why: "A ceiling below equilibrium leaves demand unmet (blackout hours ration power); a floor above it leaves supply unused (the queue of workers is unemployment).",
  },
  elasticity: {
    q: "Petrol demand is inelastic. What does that predict when government raises the fuel levy by R1?",
    options: [
      "People stop driving and revenue falls",
      "Usage barely drops, so motorists absorb most of the levy and revenue rises",
      "The price of petrol falls",
      "Oil producers pay the whole levy",
    ],
    answer: 1,
    why: "Inelastic demand means quantity barely responds — the tax passes into the pump price and the state collects. That's exactly why fuel is a favourite tax base.",
  },
};

export const FLUENCY_LEVELS = [
  { min: 0, label: "Tourist", color: "#8A8F88" },
  { min: 7, label: "Conversant", color: "#6FBDB4" },
  { min: 14, label: "Fluent", color: "#A99BF5" },
  { min: 20, label: "Native", color: "#7FB58A" },
];

// Surprising, true facts — the hooks that make someone want to dig deeper.
export const INSIGHTS = {
  speedLimit: "At a ~1.3% speed limit, pushing demand to 3% doesn't create growth — it creates inflation. The fix isn't the repo rate; it's raising the limit.",
  weights: "Agriculture can swing ±6% and barely dent GDP — it's 2.6% of the economy. Finance is 22.7%. Where you look matters as much as what you see.",
  investment: "SA invests ~14% of GDP against a 30% target. That single gap is most of the story behind a decade of stalled growth.",
  reforms: "No single reform reaches 3%. Energy, logistics, crime and state capacity only clear the target when fixed together — the constraints bind as a stack.",
};
