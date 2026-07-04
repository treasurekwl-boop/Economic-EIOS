// Reference content distilled from the Market Microstructure brief — order types,
// liquidity measures, execution algorithms and transaction-cost components. Plain
// language, so a non-specialist can use it. Reference, not live data or advice.

export const ORDER_TYPES = [
  { name: "Market", use: "Urgent, small risk transfers", tradeoff: "Fills now, but pays the spread and can walk the book." },
  { name: "Limit", use: "Controlled entry/exit, providing liquidity", tradeoff: "Cheaper (earns queue priority), but may never fill." },
  { name: "IOC (immediate-or-cancel)", use: "Take what's there, cancel the rest", tradeoff: "Minimal signalling; accepts partial fills." },
  { name: "FOK (fill-or-kill)", use: "All-or-nothing size", tradeoff: "No partials; high chance of no fill." },
  { name: "Post-only", use: "Passive alpha, market making", tradeoff: "Guarantees maker status/rebate; loses out if it would cross." },
  { name: "Hidden / non-displayed", use: "Reduce signalling", tradeoff: "Less leakage, but lower fill probability and priority." },
  { name: "Reserve / iceberg", use: "Work a large order quietly", tradeoff: "Shows a small peak, hides the rest; balances fills vs. leakage." },
  { name: "Pegged / midpoint", use: "Low-footprint / dark execution", tradeoff: "Better pricing potential, more routing/model risk." },
  { name: "Stop / stop-limit", use: "Risk management, breakouts", tradeoff: "Inactive until triggered; exposed to gap and trigger-quality risk." },
];

export const LIQUIDITY_MEASURES = [
  { name: "Quoted spread", what: "The cost of immediacy at the inside market (ask − bid).", limit: "Says nothing about depth or hidden size." },
  { name: "Effective spread", what: "What you actually paid vs. the midpoint: 2·d·(price − mid).", limit: "The midpoint can mislead in tick-constrained names." },
  { name: "Realised spread", what: "What the liquidity supplier keeps after a markout: 2·d·(price − mid later).", limit: "Depends on the horizon you measure." },
  { name: "Market impact", what: "How much your own trade moves the price.", limit: "Endogenous to your schedule and the regime." },
  { name: "Depth", what: "Size available at/near the best prices.", limit: "The book can be cancelled before you hit it." },
  { name: "Resilience", what: "How fast liquidity refills after a shock.", limit: "Hard to estimate; very horizon-dependent." },
  { name: "Amihud illiquidity", what: "Return move per unit of traded value: |r| / $volume.", limit: "Coarse — better for cross-sections than intraday." },
  { name: "Kyle's λ", what: "Price sensitivity to signed order flow.", limit: "Needs signed trade data; model-dependent." },
];

export const EXEC_ALGOS = [
  { name: "TWAP", goal: "Spread evenly over time", best: "Low urgency, stable names", weak: "Ignores the liquidity curve and impact state." },
  { name: "VWAP", goal: "Track the market's volume curve", best: "Flow benchmarked to VWAP", weak: "Hurt by bad volume forecasts; can chase the close." },
  { name: "POV (% of volume)", goal: "Hold a steady participation rate", best: "Large but non-urgent orders", weak: "Completion time is uncertain; can stall in quiet markets." },
  { name: "Implementation shortfall", goal: "Minimise cost vs. the decision price", best: "Alpha-sensitive or urgent flow", weak: "Needs good impact/volatility parameters." },
  { name: "Smart order routing", goal: "Pick the best all-in venue, not the schedule", best: "Fragmented markets, lit/dark choice", weak: "Fill-probability model risk; routing conflicts." },
  { name: "Adaptive / signal-driven", goal: "Blend schedule with live book state", best: "Sophisticated systematic desks", weak: "Most complex; heavy governance burden." },
];

export const COST_COMPONENTS = [
  { name: "Spread cost", what: "Crossing the bid/ask (or part of it)." },
  { name: "Temporary impact", what: "The short-lived price concession from your own trading." },
  { name: "Permanent impact", what: "The lasting move associated with the information in your trade." },
  { name: "Delay cost", what: "Price drift between your decision and your first fill." },
  { name: "Opportunity cost", what: "The cost of the size you never filled when price ran away." },
  { name: "Fees & rebates", what: "Explicit venue costs — the maker/taker economics." },
];

export const MICRO_NOTE =
  "Microstructure lives in tick and order-book data (spreads, depth, queues, markouts) this app doesn't have — these are the concepts and the impact math, applied to your delayed/EOD data. Estimates, not a live execution terminal.";
