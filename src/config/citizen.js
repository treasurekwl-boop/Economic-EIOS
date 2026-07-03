// ─────────────────────────────────────────────────────────────────────────────
// THE PEOPLE SIDE — microeconomics of growth.
// The macro engine's aggregates (C, I, the binding constraints) are nothing but
// the sum of millions of household-level decisions. This file maps everyday
// citizen actions onto the SAME levers the macro model already uses, so an
// individual can see their slice of the 3% problem — and that it's real.
//
// Every number here is illustrative and deliberately conservative, in the spirit
// of the rest of the app: enough to show the shape of the thing, not a forecast.
// Sources for the backdrop figures: Stats SA (QLFS, GDP), SARB, SARS, National
// Treasury, World Bank (gross savings).
// ─────────────────────────────────────────────────────────────────────────────

// Population scale (thousands), approx 2026
export const PEOPLE = {
  population: 63000,   // ~63m
  households: 18500,   // ~18.5m
  workingAge: 40500,   // ~40.5m (15–64)
  employed: 16800,     // ~16.8m (matches the macro model's EMPLOYED)
};

// The roles almost everyone wears at once. Selecting them just personalises the
// board — it doesn't gate anything. You are most of these simultaneously.
export const CITIZEN_ROLES = [
  { id: "consumer",     label: "Consumer",     color: "#6FBDB4" },
  { id: "saver",        label: "Saver",        color: "#A99BF5" },
  { id: "worker",       label: "Worker",       color: "#7FB58A" },
  { id: "builder",      label: "Builder",      color: "#D8AF6A" },
  { id: "ratepayer",    label: "Ratepayer",    color: "#C77DFF" },
  { id: "civic",        label: "Civic actor",  color: "#E08B70" },
];

// Each action carries a `slice`: the maximum lift to POTENTIAL growth (pp) that
// this behaviour can unlock at FULL national participation. They sum to ~1pp —
// the honest message: citizens alone can't reach 3%, but they're a real chunk of
// it, and the government can't get there without them either.
export const CITIZEN_ACTIONS = [
  {
    id: "save", role: "saver", icon: "PiggyBank", color: "#A99BF5",
    name: "Save & invest at home",
    channel: "Investment → potential",
    slice: 0.18,
    why: "SA saves ~15% of GDP; fast-growing peers save 30%+. Household savings are the pool that funds the investment which raises the speed limit.",
    act: "Bank a fixed slice of every rand earned. Hold SA retirement funds, bonds and equities — not offshore-only.",
  },
  {
    id: "skills", role: "worker", icon: "GraduationCap", color: "#7FB58A",
    name: "Build your skills",
    channel: "Productivity → potential",
    slice: 0.15,
    why: "Output per worker is the deepest driver of the speed limit. A more skilled workforce is literally a faster economy.",
    act: "Finish the qualification, learn the trade, take the certification. Teach someone else what you know.",
  },
  {
    id: "build", role: "builder", icon: "Store", color: "#D8AF6A",
    name: "Start something",
    channel: "Jobs + investment",
    slice: 0.15,
    why: "The economy needs ~360k new jobs a year just to stand still. Small firms are the biggest untapped job engine in the country.",
    act: "Start the side hustle, formalise it, hire your first person, buy from other small SA firms.",
  },
  {
    id: "local", role: "consumer", icon: "ShoppingBag", color: "#6FBDB4",
    name: "Choose local & SA-made",
    channel: "Sectors − imports",
    slice: 0.10,
    why: "Every rand spent on local goods keeps demand — and jobs — inside the country instead of leaking out as imports.",
    act: "Buy SA-made, eat at local spots, back township and small-town businesses over imported equivalents.",
  },
  {
    id: "pay", role: "ratepayer", icon: "Receipt", color: "#C77DFF",
    name: "Pay for what you use",
    channel: "State capacity constraint",
    slice: 0.12,
    why: "Municipal collapse is a binding constraint. Utilities that are actually paid for can be run as accountable services instead of failing ones.",
    act: "Pay your rates and service bills; insist the money is accounted for and the lights, water and roads work.",
  },
  {
    id: "honesty", role: "civic", icon: "ShieldCheck", color: "#E08B70",
    name: "Refuse corruption",
    channel: "Crime & corruption constraint",
    slice: 0.10,
    why: "Corruption is a top deterrent to fixed investment. It only works when enough people go along with it.",
    act: "Don't pay the bribe, don't take it. Report it. Hold the tender and the official to account.",
  },
  {
    id: "power", role: "ratepayer", icon: "Sun", color: "#C6A15B",
    name: "Ease the grid",
    channel: "Energy constraint",
    slice: 0.10,
    why: "Every rooftop panel and efficient appliance is load the strained grid doesn't have to carry — freeing power for factories and mines.",
    act: "Add solar where you can, shift heavy use off-peak, cut waste. Small loads, multiplied by millions.",
  },
  {
    id: "water", role: "civic", icon: "Droplets", color: "#4FB8F0",
    name: "Guard the water",
    channel: "Water security constraint",
    slice: 0.06,
    why: "Water is becoming the next binding constraint, especially in Gauteng. Leaks and waste threaten the investment pipeline.",
    act: "Fix leaks fast, report burst mains, use less in drought. Protect the catchment.",
  },
  {
    id: "tax", role: "civic", icon: "Landmark", color: "#D9799B",
    name: "Carry your share",
    channel: "Fiscal space constraint",
    slice: 0.08,
    why: "A narrow tax base and a heavy debt bill crowd out public investment. A broader, compliant base buys room to build.",
    act: "File and pay honestly; back a wider, fairer base over a heavier one on the few.",
  },
];

// The nine provinces (plus a national default).
//   unemployment = official (narrow) unemployment rate, Stats SA QLFS Q1 2026
//                  (released 12 May 2026). National 32.7%, Eastern Cape 44.6%
//                  (highest), Western Cape ~20% (lowest, only province under 20%)
//                  are the reported anchors; the rest are from the same release,
//                  where the rate rose in eight of nine provinces (biggest jumps
//                  Mpumalanga +4.0pp, Limpopo +3.5pp, Northern Cape +3.3pp) and
//                  only KwaZulu-Natal fell (−1.1pp).
//   collection = municipal revenue collected vs billed. National is the official
//                Treasury Section 71 aggregate for 2024/25 (72.9% actual vs 94.8%
//                budgeted); provincial splits indicative of municipal-finance health.
// Each province carries a `lead` — the constraint that bites hardest there.
export const PROVINCES = [
  { id: "national", name: "South Africa", short: "RSA", gdpShare: 100, unemployment: 32.7, collection: 73, informal: 18,
    leadAction: "save",
    lead: "Across the country the thin end of the wedge is savings and jobs — the pool that funds investment and the work that absorbs it." },
  { id: "gp", name: "Gauteng", short: "GP", gdpShare: 33, unemployment: 34.0, collection: 75, informal: 16,
    leadAction: "water",
    lead: "Water stress is Gauteng's fastest-rising risk — leaks and over-use threaten the country's investment hub." },
  { id: "wc", name: "Western Cape", short: "WC", gdpShare: 14, unemployment: 20.0, collection: 88, informal: 13,
    leadAction: "power",
    lead: "The lowest jobless rate in the country and the best-run metros — the test is keeping water and power ahead of fast in-migration." },
  { id: "kzn", name: "KwaZulu-Natal", short: "KZN", gdpShare: 16, unemployment: 30.0, collection: 70, informal: 20,
    leadAction: "local",
    lead: "The only province to add jobs this quarter. Durban's port gates the nation's trade — backing local production lifts every exporter." },
  { id: "ec", name: "Eastern Cape", short: "EC", gdpShare: 7, unemployment: 44.6, collection: 64, informal: 24,
    leadAction: "build",
    lead: "The highest jobless rate in the country at 44.6% — here every new small firm and skilled worker counts double." },
  { id: "mp", name: "Mpumalanga", short: "MP", gdpShare: 8, unemployment: 37.0, collection: 66, informal: 19,
    leadAction: "power",
    lead: "Joblessness jumped most here this quarter. The power heartland — a steady, just shift to a cleaner grid runs through it." },
  { id: "lp", name: "Limpopo", short: "LP", gdpShare: 7, unemployment: 33.0, collection: 60, informal: 26,
    leadAction: "skills",
    lead: "A sharp rise in joblessness this quarter. Mining wealth but thin formal work — skills and enterprise turn resources into jobs." },
  { id: "nw", name: "North West", short: "NW", gdpShare: 6, unemployment: 40.0, collection: 62, informal: 22,
    leadAction: "pay",
    lead: "Lost the most jobs this quarter. Platinum country with fragile municipalities — paying for and running services is the unlock." },
  { id: "fs", name: "Free State", short: "FS", gdpShare: 5, unemployment: 36.0, collection: 61, informal: 20,
    leadAction: "skills",
    lead: "Agriculture and mining under strain — guarding water and building skills keeps the province in the game." },
  { id: "nc", name: "Northern Cape", short: "NC", gdpShare: 2, unemployment: 35.0, collection: 67, informal: 17,
    leadAction: "power",
    lead: "Joblessness rose sharply this quarter. Tiny economy, huge renewable-energy upside — easing the grid is its gift to the country." },
];

// Where we're visibly NOT pulling our weight — the micro gaps that add up to the
// macro problem. `scope: "province"` items read live from the selected province.
// `dir: "lower"` means lower is better (the bar then fills toward the target as
// the number falls); otherwise higher is better. Framed as headroom, not blame.
export const PULL_WEIGHT = [
  { id: "jobs",     label: "Unemployment rate",   scope: "province", field: "unemployment", dir: "lower", target: 15, unit: "% jobless · QLFS Q1 2026", color: "#E08B70",
    note: "Official rate. Nationally 32.7% (Q1 2026), from 20% in the Western Cape to 44.6% in the Eastern Cape — the country's biggest reserve of growth." },
  { id: "payment",  label: "Municipal bills paid", scope: "province", field: "collection", target: 95, unit: "% collected", color: "#C77DFF",
    note: "Nationally 73% of billed revenue is collected against a 95% budget (Treasury Section 71, 2024/25). Unpaid services starve local utilities." },
  { id: "savings",  label: "Gross savings",       scope: "national", value: 15, target: 30, unit: "% of GDP", color: "#A99BF5",
    note: "Around half the rate of fast-growing peers — the thin end of the investment problem." },
  { id: "taxbase",  label: "Personal income-tax base", scope: "national", value: 12, target: 30, unit: "% carry most PIT", color: "#D9799B",
    note: "A narrow base strains fiscal space and the services everyone relies on." },
];

export const CITIZEN_INSIGHT =
  "The repo rate isn't yours to set — but the speed limit partly is. The macro engine is the sum of 63 million small decisions, and roughly a full point of potential growth is sitting in choices ordinary people make.";

// Qualitative label for a participation level (0..1) — turns a cold percentage
// into the felt difference between "just you" and "the nation pulling together".
export function participationLabel(p) {
  if (p <= 0.0001) return "Just you";
  if (p < 0.03) return "A handful";
  if (p < 0.15) return "A movement";
  if (p < 0.4) return "A wave";
  if (p < 0.7) return "Half the country";
  return "The nation, pulling together";
}
