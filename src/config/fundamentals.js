// ─────────────────────────────────────────────────────────────────────────────
// FUNDAMENTALS — the analyst board. Every indicator carries three readings,
// each explained: PREV (the last print and what it meant), NOW (the current
// print and its read), NEXT (the expected figure, why it's expected, and when
// it's due). Status feeds a composite grade.
//
// Verified as of 2 July 2026:
//   Growth   — GDP +1.9% y/y, +0.5% q/q (Stats SA Q1, 3 Jun); potential ~1.3%;
//              GFCF 13.7% of GDP vs NDP 30% (Q1 fixed investment −1.1%).
//   Prices   — CPI 4.5%, core 3.8%, services 4.6% (May); July fuel: petrol
//              −R2.01/l, diesel −R3.59/l after Brent fell ~$104 → ~$75 on the
//              US–Iran ceasefire (late June).
//   Monetary — repo 7.00% (28 May hike, prime 10.5%); next MPC 23 July.
//   Fiscal   — debt stabilises at 78.9% of GDP in 2025/26 (first time in 17
//              years), 76.5% by 2028/29; debt-service growth 3.7%/yr.
//   External — current account −0.5% of GDP (2025); rand ~R16.5/$ and firmer.
//   Labour   — unemployment 32.7%, youth 45.8% (QLFS Q1, 12 May); 16.8m employed.
// ─────────────────────────────────────────────────────────────────────────────

export const PILLARS = [
  {
    id: "growth", label: "Growth", color: "#6FBDB4",
    indicators: [
      { id: "gdp", name: "Real GDP growth", value: 1.9, unit: "% y/y", asOf: "Q1 2026", status: "warn",
        concept: "setpoint",
        scale: { min: -2, max: 6, band: [3, 6] },
        prev: { value: "0.8%", asOf: "Q4 2025", note: "A weak crawl — positive, but far too slow to absorb job-seekers." },
        read: "Sixth straight quarter of expansion and accelerating — but still under the 3% jobs threshold. Finance led; manufacturing dragged.",
        expected: { value: "~1.5%", asOf: "Q2 print · due ~8 Sep", why: "Q1's pace was flattered by agriculture (+3.9%); SARB still sees just 1.2% for 2026 as a whole. Cheaper fuel helps H2." } },
      { id: "potential", name: "Potential growth", value: 1.3, unit: "%", asOf: "est. 2026", status: "bad",
        concept: "potential",
        scale: { min: 0, max: 4, band: [2.8, 4] },
        prev: { value: "~1.0%", asOf: "2020–23 est.", note: "Load-shedding at its worst was shaving up to 1.5pp off the speed limit." },
        read: "The binding problem. Steadier power has lifted it slightly, but every recovery still hits this ceiling.",
        expected: { value: "~1.8%", asOf: "by 2027–28", why: "Only if the reform stack delivers — energy, rail and ports are the levers that move this number. Set them in Diagnosis." } },
      { id: "gfcf", name: "Investment (GFCF)", value: 13.7, unit: "% of GDP", asOf: "2025", status: "bad",
        concept: "gfcf",
        scale: { min: 0, max: 35, band: [25, 35] },
        prev: { value: "14.1%", asOf: "2024", note: "Already less than half the NDP target — and it fell further." },
        read: "The root cause behind the low speed limit. Q1 2026 fixed investment fell another 1.1%.",
        expected: { value: "~14%", asOf: "2026", why: "Rates near their peak, power steadier and debt stabilising should slowly revive private capex — but the Q1 decline says not yet." } },
    ],
  },
  {
    id: "prices", label: "Prices & Money", color: "#C6A15B",
    indicators: [
      { id: "cpi", name: "Headline CPI", value: 4.5, unit: "%", asOf: "May 2026", status: "warn",
        concept: "inflation",
        scale: { min: 0, max: 8, band: [2, 4] },
        prev: { value: "4.0%", asOf: "Apr 2026", note: "Sitting exactly on the band's ceiling before the fuel spike hit." },
        read: "Above the 3%±1pp band — but the spike is imported (oil, electricity tariffs), not demand-driven. Transport ran 9.4%.",
        expected: { value: "~4.6%", asOf: "Jun print · due 22 Jul", why: "June's petrol hike (+R1.43/l) is still in the data. The relief lands in the July print (due Aug): Brent crashed to ~$75 and pump prices fell ~R2/l." } },
      { id: "core", name: "Core inflation", value: 3.8, unit: "%", asOf: "May 2026", status: "ok",
        concept: "coreInflation",
        scale: { min: 0, max: 8, band: [2, 4] },
        prev: { value: "3.6%", asOf: "Apr 2026", note: "Comfortably in-band — the anchor holding the 'temporary shock' story together." },
        read: "Still inside the band, but drifting up — services inflation at 4.6% is what SARB is watching.",
        expected: { value: "~3.9%", asOf: "Jun print · due 22 Jul", why: "Second-round pass-through (insurance, wage settlements) pushes core up slowly even as the fuel shock fades." } },
      { id: "repo", name: "Policy stance (real repo)", value: 3.5, unit: "% real", asOf: "May 2026", status: "warn",
        concept: "realRate",
        scale: { min: -2, max: 6, band: [1, 3] },
        prev: { value: "6.75%", asOf: "repo, pre-May", note: "On hold through early 2026, anchoring the new 3% target." },
        read: "Restrictive after the May hike to 7.00% — a pre-emptive strike at the oil shock's second-round effects.",
        expected: { value: "hold 7.00%", asOf: "MPC · 23 Jul", why: "The ceasefire collapsed Brent and the rand firmed — the case for another hike faded. But services at 4.6% keeps the tone hawkish; a surprise June CPI could revive it." } },
    ],
  },
  {
    id: "fiscal", label: "Fiscal", color: "#E08B70",
    indicators: [
      { id: "debt", name: "Gross debt", value: 78.9, unit: "% of GDP", asOf: "2025/26", status: "bad",
        concept: "debt",
        scale: { min: 20, max: 100, band: [20, 60] },
        prev: { value: "77.0%", asOf: "2024/25", note: "The 17th consecutive year of a rising ratio — the long deterioration." },
        read: "High but finally turning: this is the peak. The stabilisation is the biggest fiscal win in a generation.",
        expected: { value: "78.3%", asOf: "2026/27 · Budget path", why: "Primary surpluses plus cheaper borrowing bend the curve down — Treasury projects 76.5% by 2028/29. The risk is any new SOE bailout." } },
      { id: "debtsvc", name: "Debt-service costs", value: 17, unit: "% of spending", asOf: "2026 Budget", status: "bad",
        concept: "debtService",
        scale: { min: 0, max: 25, band: [0, 10] },
        prev: { value: "~16%", asOf: "2024/25", note: "Growing 7.4%/yr — the fastest-rising line item in the budget." },
        read: "Interest eats roughly R1 in every R6 of spending — paid before a single school or clinic.",
        expected: { value: "~17%", asOf: "plateau, then easing", why: "Cost growth has slowed to ~3.7%/yr on improved market confidence — the ratio flattens, then falls with the debt path." } },
      { id: "savings", name: "Gross savings", value: 15, unit: "% of GDP", asOf: "2025", status: "bad",
        scale: { min: 0, max: 35, band: [25, 35] },
        prev: { value: "14.5%", asOf: "2024", note: "A decade stuck near 15% — half of what fast-growing peers save." },
        read: "The domestic pool that should fund investment isn't there — which is why capital must be imported.",
        expected: { value: "~15%", asOf: "2026", why: "Squeezed household incomes and two-pot retirement withdrawals keep the savings rate pinned." } },
    ],
  },
  {
    id: "external", label: "External", color: "#4FB8F0",
    indicators: [
      { id: "ca", name: "Current account", value: -0.5, unit: "% of GDP", asOf: "2025", status: "ok",
        concept: "currentAccount",
        scale: { min: -6, max: 3, band: [-2.5, 3] },
        prev: { value: "−0.7%", asOf: "2024", note: "Narrowing — Q4 2025 even swung to a +0.6% surplus on strong exports." },
        read: "Contained and easily fundable. Gold and PGM prices are doing quiet, heavy lifting here.",
        expected: { value: "~−1.4%", asOf: "2026 · SARB projection", why: "As investment recovers, imports (machinery, fuel) outpace exports — a widening deficit for the 'right' reason, but worth watching." } },
      { id: "rand", name: "The rand", live: true, unit: "R/USD", asOf: "live", status: "warn",
        scale: null,
        prev: { value: "R16.65", asOf: "May avg", note: "Weakened through the oil shock as import costs and risk-off bit." },
        read: "The economy's daily mood ring — weakness feeds fuel and food inflation within weeks.",
        expected: { value: "R16.2–16.8", asOf: "H2 2026 range", why: "The ceasefire and firm gold/PGM terms of trade support it; the SARB-Fed rate gap is the swing factor. It firmed to ~R16.5 as oil collapsed." } },
    ],
  },
  {
    id: "labour", label: "Labour", color: "#7FB58A",
    indicators: [
      { id: "unemp", name: "Unemployment", value: 32.7, unit: "%", asOf: "Q1 2026", status: "bad",
        concept: "netJobs",
        scale: { min: 0, max: 50, band: [0, 15] },
        prev: { value: "31.4%", asOf: "Q4 2025", note: "Already crisis-level before 345k jobs vanished in a single quarter." },
        read: "The headline failure: 8.1m people want work the economy isn't creating. Only KZN added jobs.",
        expected: { value: "~32.4%", asOf: "Q2 QLFS · due ~11 Aug", why: "Q1 is seasonally the worst quarter (post-festive layoffs); expect partial re-hiring — but growth this weak can't absorb ~360k new entrants a year." } },
      { id: "youth", name: "Youth unemployment", value: 45.8, unit: "% (15–34)", asOf: "Q1 2026", status: "bad",
        scale: { min: 0, max: 70, band: [0, 20] },
        prev: { value: "43.8%", asOf: "Q4 2025", note: "Rising twice as fast as the headline rate." },
        read: "Nearly one in two young people locked out — the constraint on the next decade's potential.",
        expected: { value: "~46%", asOf: "Q2 QLFS · due ~11 Aug", why: "First-time work-seekers land hardest in a shrinking market; nothing in the pipeline changes this before growth does." } },
    ],
  },
];

export const GRADES = [
  { min: 80, letter: "A", color: "#7FB58A", verdict: "Strong fundamentals" },
  { min: 62, letter: "B", color: "#7FB58A", verdict: "Sound, with soft spots" },
  { min: 45, letter: "C", color: "#C6A15B", verdict: "Mixed — repair underway" },
  { min: 28, letter: "D", color: "#E08B70", verdict: "Fragile — early signs of repair" },
  { min: 0,  letter: "E", color: "#D8735E", verdict: "Distressed fundamentals" },
];

export const STRENGTHS = [
  "Debt stabilising for the first time in 17 years (78.9% → 76.5% by 2028/29)",
  "Oil collapsed ~$104 → ~$75 on the ceasefire — July fuel down ~R2/l, inflation relief incoming",
  "Core inflation inside the 3%±1pp band; six straight quarters of GDP expansion",
  "Current account contained near −0.5% of GDP; rand firming toward R16.5",
];

export const WEAKNESSES = [
  "Unemployment 32.7% and rising — 345k jobs lost in Q1 2026 alone",
  "Investment at 13.7% of GDP, less than half the 30% target, and still falling",
  "Potential growth ~1.3% — the speed limit under everything else",
  "Debt-service eats ~17% of spending; services inflation at 4.6% keeps SARB hawkish",
];

export const FUNDAMENTALS_AS_OF = "2 July 2026";

// ── Drill-downs ─────────────────────────────────────────────────────────────
// Each indicator can open into composition, history and methodology — and links
// back into the Intelligence graph (`node`). Composition `type`: "share" stacks
// to 100%; "level" shows each part as its own bar out of `max`. Histories are
// illustrative-but-directional recent paths. This is the data-warehouse layer:
// every figure becomes something you investigate, not just read.
export const INDICATOR_DETAIL = {
  gdp: {
    node: "gdp",
    composition: { type: "share", label: "Expenditure shares of GDP", parts: [
      { label: "Consumption", value: 60.4, color: "#C6A15B" },
      { label: "Government", value: 20.8, color: "#A99BF5" },
      { label: "Investment", value: 13.7, color: "#6FBDB4" },
      { label: "Net exports", value: 5.1, color: "#7FB58A" },
    ] },
    history: { label: "Real GDP, % y/y", unit: "%", series: [0.3, 0.6, 0.5, 0.8, 0.8, 1.9], marks: ["Q4′24", "Q1′25", "Q2′25", "Q3′25", "Q4′25", "Q1′26"] },
    method: "Stats SA reconciles the production and expenditure measures. 'Real' strips out inflation; quarterly figures are seasonally adjusted and annualised.",
  },
  potential: {
    node: "potential",
    composition: { type: "share", label: "What sets the speed limit (growth accounting)", parts: [
      { label: "Capital", value: 40, color: "#6FBDB4" },
      { label: "Labour", value: 35, color: "#D98BB6" },
      { label: "Productivity", value: 25, color: "#C6A15B" },
    ] },
    history: { label: "Estimated potential, %", unit: "%", series: [1.9, 1.5, 1.2, 1.0, 1.1, 1.3], marks: ["2018", "2020", "2021", "2022", "2024", "2026"] },
    method: "Not observed directly — inferred from trend labour supply, the capital stock and total-factor productivity.",
  },
  gfcf: {
    node: "I",
    composition: { type: "share", label: "Investment by source", parts: [
      { label: "Private", value: 64, color: "#6FBDB4" },
      { label: "General govt", value: 23, color: "#A99BF5" },
      { label: "SOEs", value: 13, color: "#E08B70" },
    ] },
    history: { label: "GFCF, % of GDP", unit: "%", series: [17.5, 15.9, 15.0, 14.6, 14.1, 13.7], marks: ["2015", "2019", "2022", "2023", "2024", "2025"] },
    method: "Gross Fixed Capital Formation is spending on fixed assets — plant, machinery, buildings, infrastructure. The investment rate is GFCF ÷ GDP.",
  },
  cpi: {
    node: "cpi",
    composition: { type: "level", label: "CPI by category, % y/y (May 2026)", max: 10, parts: [
      { label: "Transport", value: 9.4, color: "#D8735E" },
      { label: "Housing & utilities", value: 5.3, color: "#C6A15B" },
      { label: "Core", value: 3.8, color: "#6FBDB4" },
      { label: "Food & NAB", value: 1.9, color: "#7FB58A" },
    ] },
    history: { label: "Headline CPI, % y/y", unit: "%", series: [4.6, 3.2, 2.8, 3.2, 4.0, 4.5], marks: ["Jul′24", "Nov′24", "Feb′25", "Dec′25", "Apr′26", "May′26"] },
    method: "A weighted basket, reweighted periodically. Headline is all items; core excludes food, fuel and energy to reveal underlying pressure.",
  },
  core: {
    node: "core",
    history: { label: "Core inflation, % y/y", unit: "%", series: [3.4, 3.3, 3.4, 3.6, 3.6, 3.8], marks: ["Dec′25", "Jan′26", "Feb′26", "Mar′26", "Apr′26", "May′26"] },
    method: "CPI excluding food, non-alcoholic beverages, fuel and energy — the slow-moving, home-grown component SARB watches most.",
  },
  repo: {
    node: "repo",
    composition: { type: "level", label: "The rate structure, %", max: 12, parts: [
      { label: "Prime (repo + 3.5)", value: 10.5, color: "#A99BF5" },
      { label: "Repo rate", value: 7.0, color: "#C6A15B" },
      { label: "Real repo", value: 3.5, color: "#6FBDB4" },
    ] },
    history: { label: "Repo rate, %", unit: "%", series: [8.25, 8.25, 7.75, 7.25, 6.75, 7.00], marks: ["2023", "Jan′25", "Mar′25", "Nov′25", "Jan′26", "May′26"] },
    method: "Set by the 6-member Monetary Policy Committee to hold inflation at 3% ±1pp. Prime = repo + 3.5pp; the real repo subtracts expected inflation.",
  },
  debt: {
    node: "debt",
    composition: { type: "share", label: "How the debt is held", parts: [
      { label: "Domestic", value: 88, color: "#6FBDB4" },
      { label: "Foreign", value: 12, color: "#E08B70" },
    ] },
    history: { label: "Gross loan debt, % of GDP", unit: "%", series: [63.3, 70.7, 73.1, 75.5, 77.0, 78.9], marks: ["2020", "2021", "2023", "2024", "2025", "2025/26"] },
    method: "Gross loan debt ÷ GDP. Mostly rand-denominated and domestically held — a resilience most emerging markets lack.",
  },
  debtsvc: {
    node: "debtsvc",
    history: { label: "Debt-service, % of spending", unit: "%", series: [11, 13, 15, 16, 17, 17], marks: ["2019", "2021", "2023", "2024", "2025", "2026"] },
    method: "Interest on government debt as a share of total spending — paid before any service is delivered.",
  },
  savings: {
    node: "savings",
    history: { label: "Gross savings, % of GDP", unit: "%", series: [16.4, 15.9, 15.5, 15.1, 14.8, 15.0], marks: ["2019", "2021", "2022", "2023", "2024", "2025"] },
    method: "Gross national saving ÷ GDP — the domestic pool that, with foreign inflows, funds investment.",
  },
  ca: {
    node: "M",
    history: { label: "Current account, % of GDP", unit: "%", series: [-2.6, -1.6, -0.7, -0.5, 0.6, -0.5], marks: ["2022", "2023", "2024", "2025", "Q4′25", "2026e"] },
    method: "The balance with the rest of the world — trade plus income flows. Negative means SA must attract foreign capital to cover the gap.",
  },
  rand: { node: "rand" },
  unemp: {
    node: "unemp",
    composition: { type: "level", label: "Measures of joblessness, % (Q1 2026)", max: 50, parts: [
      { label: "Youth (15–34)", value: 45.8, color: "#E08B70" },
      { label: "Expanded rate", value: 43.7, color: "#D8735E" },
      { label: "Official (narrow)", value: 32.7, color: "#C6A15B" },
    ] },
    history: { label: "Official unemployment, %", unit: "%", series: [32.1, 32.9, 33.5, 31.9, 31.4, 32.7], marks: ["Q4′24", "Q1′25", "Q2′25", "Q3′25", "Q4′25", "Q1′26"] },
    method: "QLFS surveys ~30,000 households. Official (narrow) counts those actively seeking work; expanded adds discouraged work-seekers.",
  },
  youth: {
    node: "unemp",
    history: { label: "Youth unemployment, %", unit: "%", series: [43.1, 44.3, 45.5, 43.4, 43.8, 45.8], marks: ["Q4′24", "Q1′25", "Q2′25", "Q3′25", "Q4′25", "Q1′26"] },
    method: "Unemployment among 15–34 year-olds — the cohort hit hardest by a shrinking labour market.",
  },
};
