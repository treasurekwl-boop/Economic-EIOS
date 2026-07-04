// ─────────────────────────────────────────────────────────────────────────────
// MARKET MICROSTRUCTURE — a faithful transcription of the brief's structured
// tables (order types, liquidity measures, execution algorithms, transaction-cost
// components) at full column fidelity, plus its spread decomposition, execution-
// monitoring dashboard, design principles and implementation workflow. Reference,
// not live data or advice. Each table = { fields, rows } for a generic renderer.
// ─────────────────────────────────────────────────────────────────────────────

export const ORDER_TYPES = {
  fields: [
    { k: "instruction", label: "Instruction" }, { k: "displayed", label: "Displayed?" },
    { k: "queue", label: "Queue / priority" }, { k: "use", label: "Typical use" }, { k: "tradeoff", label: "Trade-off" },
  ],
  rows: [
    { name: "Market", instruction: "Execute immediately at the best available prices", displayed: "No resting display if fully filled", queue: "Consumes top-of-book, can walk the book", use: "Urgent execution, small risk transfers", tradeoff: "Highest certainty, highest spread/impact risk" },
    { name: "Limit", instruction: "Execute only at or better than the limit price", displayed: "Yes if resting", queue: "Gains priority by price then time (price/time venues)", use: "Passive provision, controlled entry/exit", tradeoff: "Lower explicit cost, non-execution risk" },
    { name: "IOC", instruction: "Fill any available amount now; cancel the rest", displayed: "No resting remainder", queue: "No queue-building", use: "Opportunistic taking without exposure", tradeoff: "Minimises signalling, accepts partial fills" },
    { name: "FOK", instruction: "Fill the full size immediately or cancel", displayed: "No", queue: "No queue-building", use: "All-or-nothing institutional child orders", tradeoff: "No partials, high non-execution risk" },
    { name: "Post-only", instruction: "Rest only; cancel or reprice if marketable", displayed: "Usually yes", queue: "Protects maker status / rebate eligibility", use: "Passive alpha capture, market making", tradeoff: "Lower fees, but loses time if it would cross" },
    { name: "Hidden", instruction: "Rest without display", displayed: "No", queue: "Venue-specific; often lower/different priority", use: "Reduce signalling, interact quietly", tradeoff: "Less leakage, lower fill probability/priority" },
    { name: "Reserve / iceberg", instruction: "Show only a peak, hide the remainder", displayed: "Partly", queue: "Hidden & refreshed slices follow venue rules", use: "Work a large order with controlled display", tradeoff: "Balances fill probability against leakage" },
    { name: "Pegged / midpoint", instruction: "Reference the quote/midpoint with dynamic pricing", displayed: "Sometimes no/partial", queue: "Priority/display depend on venue & variant", use: "Dark or low-footprint execution", tradeoff: "Better pricing potential, more routing/model risk" },
    { name: "Stop / stop-limit", instruction: "Activate only after a trigger condition", displayed: "Not active until triggered", queue: "Becomes market/limit when triggered", use: "Risk management, breakout execution", tradeoff: "Gap risk, trigger-quality risk" },
  ],
};

export const LIQUIDITY_MEASURES = {
  fields: [
    { k: "captures", label: "Captures" }, { k: "def", label: "Definition" }, { k: "strength", label: "Strength" }, { k: "limit", label: "Limitation" },
  ],
  rows: [
    { name: "Quoted spread", captures: "Cost of immediacy at the inside", def: "Ask − Bid, or (A−B)/mid", strength: "Easy, venue-comparable", limit: "Ignores hidden liquidity & depth beyond L1" },
    { name: "Effective spread", captures: "Actual cost paid vs the midpoint", def: "2·d·(price − mid)", strength: "Execution-relevant, trade-level", limit: "Midpoint can misstate cost in tick-constrained names" },
    { name: "Realised spread", captures: "Revenue kept after a markout", def: "2·d·(price − mid at t+τ)", strength: "Separates immediacy revenue from information loss", limit: "Horizon-sensitive; needs post-trade quotes" },
    { name: "Market impact", captures: "Price response to your trade", def: "Short-horizon markout or implementation shortfall", strength: "Closest to execution planning", limit: "Endogenous to schedule, regime, signalling" },
    { name: "Depth", captures: "Size available at/near quoted prices", def: "Visible size at L1 or cumulative over N levels", strength: "Essential for large-order planning", limit: "Book can be non-addressable / cancelled" },
    { name: "Resilience", captures: "Speed of liquidity replenishment", def: "Reversion of spread / depth / impact", strength: "Captures fragility vs robustness", limit: "Harder to estimate; horizon-dependent" },
    { name: "Amihud illiquidity", captures: "Return move per unit of traded value", def: "|r| / $volume, aggregated", strength: "Useful for low-frequency cross-sections", limit: "Coarse for intraday execution" },
    { name: "Kyle's λ", captures: "Price sensitivity to signed order flow", def: "Slope of price change on signed volume", strength: "Deep theoretical link to impact", limit: "Needs signed flow; model-dependent" },
  ],
};

export const EXEC_ALGOS = {
  fields: [
    { k: "objective", label: "Objective" }, { k: "schedule", label: "Schedule logic" }, { k: "strength", label: "Strengths" }, { k: "weak", label: "Weaknesses" }, { k: "best", label: "Best use" },
  ],
  rows: [
    { name: "TWAP", objective: "Distribute evenly over time", schedule: "Fixed shares per clock interval", strength: "Simple, predictable, auditable", weak: "Ignores the liquidity curve & impact state", best: "Low urgency, stable-volume names" },
    { name: "VWAP", objective: "Track the market's volume curve", schedule: "Trade in proportion to expected intraday volume", strength: "Aligns with a common benchmark; low footprint when accurate", weak: "Hurt by bad volume forecasts; can chase the close", best: "Agency flow benchmarked to VWAP" },
    { name: "POV", objective: "Hold a steady participation rate", schedule: "Trade as a fixed % of market volume", strength: "Scales to liquidity; guards footprint", weak: "Completion time uncertain; stalls in quiet markets", best: "Large but non-urgent orders" },
    { name: "Implementation shortfall", objective: "Minimise cost vs the decision price", schedule: "Front-load when alpha is perishable; slow when impact dominates", strength: "Decision-relevant; integrates alpha & risk", weak: "Needs good impact/volatility parameters", best: "Alpha-sensitive or urgent flow" },
    { name: "Smart order routing", objective: "Optimise venue choice, not the schedule", schedule: "Route slices to best all-in venue (price, fee, fill odds, latency)", strength: "Exploits fragmentation & hidden/away liquidity", weak: "Fill-probability model risk; routing conflicts; latency races", best: "Fragmented markets, lit/dark selection" },
    { name: "Adaptive / signal-driven", objective: "Blend schedule with live book state", schedule: "Use spread, depth, imbalance, markouts, fill models", strength: "Best practical performance when calibrated", weak: "Most complex; heavy governance burden", best: "Sophisticated systematic desks" },
  ],
};

export const COST_COMPONENTS = {
  fields: [
    { k: "meaning", label: "Meaning" }, { k: "benchmark", label: "Benchmark / estimator" }, { k: "monitor", label: "What desks monitor" },
  ],
  rows: [
    { name: "Spread cost", meaning: "Crossing the bid/ask (or part of it)", benchmark: "Effective spread, price improvement vs mid/NBBO", monitor: "Effective spread, price-improvement rate" },
    { name: "Temporary impact", meaning: "Short-lived concession from your own trading", benchmark: "Markout over a short horizon, schedule model", monitor: "Child-order markouts, impact curve by participation" },
    { name: "Permanent impact", meaning: "Lasting move tied to your trade's information", benchmark: "Longer-horizon markout, realised-vs-effective gap", monitor: "5s / 1m / 5m markouts, realised spread" },
    { name: "Delay cost", meaning: "Drift between decision and first fill", benchmark: "Arrival price vs first fill", monitor: "Time-to-first-fill, drift before execution" },
    { name: "Opportunity cost", meaning: "Cost of size you never filled as price ran", benchmark: "Remaining quantity marked to benchmark", monitor: "Completion rate, residual-risk cost" },
    { name: "Fees & rebates", meaning: "Explicit exchange / ATS cost", benchmark: "Net fee schedule by route & order flag", monitor: "All-in bps net of rebates" },
    { name: "Routing / leakage", meaning: "Cost of exposing children to venues/counterparties", benchmark: "Parent-order implementation shortfall by route mix", monitor: "IS by venue mix, fill rate, adverse-selection markout" },
  ],
};

// The three forces the spread compensates for.
export const SPREAD_FORCES = [
  { name: "Adverse selection", desc: "Compensation for trading against better-informed counterparties (Glosten–Milgrom)." },
  { name: "Inventory risk", desc: "Compensation for the position risk a liquidity supplier accumulates (Ho–Stoll)." },
  { name: "Order-processing cost", desc: "Trading frictions, technology and the operating cost of making a market." },
];

// The execution-monitoring dashboard: separate what the market looked like
// (state) from what your trade did (output).
export const MONITOR_ITEMS = [
  "Quoted spread", "Effective spread", "Realised spread", "Multi-horizon markouts (5s / 1m / 5m)",
  "Displayed & cumulative depth", "Fill rate", "Queue position / queue-age", "Participation rate",
  "Venue mix", "Resilience half-life after each aggressive slice", "Non-addressable liquidity risk",
];

export const DESIGN_PRINCIPLES = [
  { name: "Use event time", desc: "Signals decay after a number of book events, not a fixed number of milliseconds — event clocks often beat wall-clock buckets." },
  { name: "Simulate queue & latency", desc: "Fill probability is a first-order input to the market-vs-limit decision, and can be modelled directly from book state." },
  { name: "Optimise all-in economics", desc: "Fees, rebates, protection, co-location, access-fee caps all matter — best displayed price ≠ best all-in price conditional on a fill." },
];

export const IMPL_WORKFLOW =
  "Estimate a symbol- and regime-specific impact curve → estimate venue-specific fill probabilities for passive children → measure post-trade markouts by venue and order type → feed those into a schedule controller that chooses between aggression, passivity, dark routing and block negotiation. In stressed regimes, down-weight historical depth and up-weight resilience.";

export const MICRO_NOTE =
  "Microstructure lives in tick and order-book data (spreads, depth, queues, markouts) this app doesn't have — these are the concepts, tables and impact math applied to your delayed/EOD data. Estimates and reference, not a live execution terminal.";
