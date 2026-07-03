// ─────────────────────────────────────────────────────────────────────────────
// EVENT CALENDAR & REGIME WINDOWS — Phase-1 "Foundation" of the event-driven
// prediction architecture (Designing an Event-Driven Prediction Architecture for
// SA Economic & Market Responses). The scheduled-event module: official releases
// with previous/consensus so a surprise = (actual − consensus) can be read, and
// each release can pre-play its reaction through the causal graph. Plus the
// historical regime windows the design uses for event-window stress testing.
//
// Consensus figures are illustrative expectations, clearly labelled — not a feed.
// `node` is the graph node the release maps to; `hi`/`lo` fire that node up/down.
// ─────────────────────────────────────────────────────────────────────────────

export const RELEASES = [
  {
    id: "prod-may", name: "Mining & manufacturing production", agency: "Stats SA",
    iso: "2026-07-14", period: "May 2026", previous: "−0.8% m/m", consensus: "≈ flat",
    node: "manuf", importance: "med",
    watch: "Manufacturing has been the drag on the recovery — a rebound would change the tone.",
    hi: { label: "Stronger", dir: 1, note: "A production rebound lifts manufacturing and GDP." },
    lo: { label: "Weaker", dir: -1, note: "Further contraction confirms the factory slump." },
  },
  {
    id: "cpi-jun", name: "CPI inflation", agency: "Stats SA",
    iso: "2026-07-22", period: "June 2026", previous: "4.5%", consensus: "≈ 4.4%",
    node: "cpi", importance: "high",
    watch: "June still carries the petrol hike; the July fuel cut only shows up in next month's print.",
    hi: { label: "Hotter", dir: 1, note: "An upside surprise revives the hawkish rate case." },
    lo: { label: "Cooler", dir: -1, note: "Disinflation resumes — room for an easier SARB." },
  },
  {
    id: "mpc-jul", name: "SARB MPC rate decision", agency: "SARB",
    iso: "2026-07-23", period: "July 2026", previous: "7.00%", consensus: "hold 7.00%",
    node: "repo", importance: "high",
    watch: "Oil's collapse killed the hike case, but services inflation at 4.6% keeps the tone hawkish.",
    hi: { label: "Surprise hike", dir: 1, note: "Tighter policy: firmer rand, weaker demand." },
    lo: { label: "Surprise cut", dir: -1, note: "Easier policy: relief for borrowers and growth." },
  },
  {
    id: "trade-jun", name: "Trade balance", agency: "SARS",
    iso: "2026-07-31", period: "June 2026", previous: "R +24bn", consensus: "R +20bn",
    node: "X", importance: "med",
    watch: "Gold and PGM prices are doing the heavy lifting on the export side.",
    hi: { label: "Bigger surplus", dir: 1, note: "Strong exports support the rand and current account." },
    lo: { label: "Smaller / deficit", dir: -1, note: "Weaker trade pressures the external balance." },
  },
  {
    id: "pmi-jul", name: "Manufacturing PMI", agency: "Absa / BER",
    iso: "2026-08-01", period: "July 2026", previous: "50.8", consensus: "≈ 50",
    node: "manuf", importance: "med",
    watch: "The production sub-index at 43.5 is the real concern beneath the headline.",
    hi: { label: "Expansion", dir: 1, note: "Above 50 signals factory orders recovering." },
    lo: { label: "Contraction", dir: -1, note: "Below 50 deepens the manufacturing worry." },
  },
  {
    id: "qlfs-q2", name: "Unemployment (QLFS)", agency: "Stats SA",
    iso: "2026-08-12", period: "Q2 2026", previous: "32.7%", consensus: "≈ 32.4%",
    node: "unemp", importance: "high",
    watch: "Q1 lost 345k jobs; Q2 is seasonally kinder, so a smaller rise is expected.",
    hi: { label: "Higher jobless", dir: 1, note: "A worse print deepens the demand and fiscal strain." },
    lo: { label: "Lower jobless", dir: -1, note: "Seasonal re-hiring pulls the rate back down." },
  },
  {
    id: "gdp-q2", name: "GDP growth", agency: "Stats SA",
    iso: "2026-09-08", period: "Q2 2026", previous: "+0.5% q/q", consensus: "≈ +0.4%",
    node: "gdp", importance: "high",
    watch: "Composition matters more than the headline — watch whether fixed investment turns.",
    hi: { label: "Stronger", dir: 1, note: "Momentum builds toward the 3% target." },
    lo: { label: "Weaker", dir: -1, note: "The recovery stalls; investment still the missing piece." },
  },
  {
    id: "mtbps", name: "Medium-Term Budget (MTBPS)", agency: "National Treasury",
    iso: "2026-10-29", period: "2026", previous: "debt 78.9%", consensus: "stay the course",
    node: "debt", importance: "high",
    watch: "The market wants proof the first debt stabilisation in 17 years actually holds.",
    hi: { label: "Debt slips", dir: 1, note: "Fiscal slippage lifts the risk premium and pressures the rand." },
    lo: { label: "On track", dir: -1, note: "Consolidation holding supports bonds and the rand." },
  },
];

// Historical regime windows — the event-window stress library the architecture
// recommends for backtesting. Each replays as a shock through the causal graph.
export const EPISODES = [
  { id: "nene", date: "Dec 2015", title: "Nene dismissal", node: "rand", dir: -1,
    outcome: "The rand fell more than 5% to a record low and banking stocks sold off hard.",
    targets: "ZAR · bank equities · bond yields" },
  { id: "covid", date: "Q2 2020", title: "COVID collapse", node: "gdp", dir: -1,
    outcome: "GDP fell ~16% q/q (about −51% annualised) — the deepest shock on record.",
    targets: "GDP · equities · rates · FX" },
  { id: "unrest", date: "Jul 2021", title: "July unrest", node: "gdp", dir: -1,
    outcome: "S&P estimated ~0.7pp shaved off 2021 GDP; retail and logistics were hit hardest.",
    targets: "Equities · retail / transport · GDP" },
  { id: "fatf", date: "Feb 2023", title: "FATF grey-listing", node: "rand", dir: -1,
    outcome: "A reputational shock with real local asset-price implications for the rand and bonds.",
    targets: "Rand · bonds · sovereign risk" },
  { id: "eskom", date: "Mar 2025", title: "Renewed Eskom cuts", node: "energy", dir: 1,
    outcome: "A sharp operational-energy shock with direct growth and inflation consequences.",
    targets: "Rand · bonds · resource equities · macro" },
];

// Days until an ISO date, from the browser's current date (live countdown).
export function daysUntil(iso) {
  const d = new Date(iso + "T09:00:00");
  return Math.round((d - new Date()) / 86400000);
}
