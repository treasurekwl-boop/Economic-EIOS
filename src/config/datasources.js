// The EIOS data-sources & storage brief, catalogued with an HONEST flag for what
// this app actually uses vs. what needs a paid feed or a real backend. The app's
// real data layer is Supabase (managed Postgres) fed by a free GitHub-Actions
// cron — the "small" end of the spectrum the brief describes.

// `state`: "live" (wired + running), "builtin" (bundled static data), or "no"
// (would need a paid feed / backend / processing the app doesn't have).
export const DATA_SOURCES = [
  { name: "Economic calendar", state: "builtin", via: "Bundled SA release schedule (SARB, Stats SA)", providers: "SARB, Fed, ECB, Trading Economics", latency: "Real-time on release", cost: "Free (gov) → $$ (vendor)", use: "Event-driven alerts, macro timing" },
  { name: "Financial market feeds", state: "live", via: "Yahoo Finance EOD via the 30-min GitHub Action (delayed, not tick)", providers: "Bloomberg, Refinitiv, Yahoo, Finnhub", latency: "Sub-ms (direct) → seconds (API)", cost: "$$$ exchange feeds → freemium APIs", use: "Watchlist, forecasts, shock-to-position" },
  { name: "Macroeconomic indicators", state: "builtin", via: "Bundled SA macro (repo, CPI, GDP, unemployment)", providers: "IMF, World Bank, FRED, OECD, SARB", latency: "Monthly / quarterly", cost: "Mostly free", use: "The causal engine, fundamentals" },
  { name: "News & media", state: "live", via: "Google News RSS → headlines table (every 30 min)", providers: "Reuters, Bloomberg, GDELT, RSS", latency: "Seconds → hours", cost: "Free (RSS) → $$$ (wires)", use: "News live-wire, sentiment context" },
  { name: "Government / open data", state: "builtin", via: "Bundled Stats SA-derived figures", providers: "Stats SA, data.gov, Eurostat", latency: "Monthly / annual", cost: "Free", use: "Provincial figures, baselines" },
  { name: "Company filings / XBRL", state: "no", via: "SEC EDGAR is free but US-focused; not wired", providers: "SEC EDGAR, CIPC", latency: "Daily", cost: "Free", use: "Fundamental analysis" },
  { name: "Alternative data", state: "no", via: "Needs enterprise licensing", providers: "Mastercard, SafeGraph, SimilarWeb", latency: "Daily → monthly", cost: "$$$", use: "Spending, footfall, web traffic" },
  { name: "Satellite imagery", state: "no", via: "Needs a feed + image-processing pipeline", providers: "Planet, Maxar, Sentinel, Landsat", latency: "Daily → weekly", cost: "Free (Sentinel) → $$$ (Planet)", use: "Crop yield, night-lights, ports" },
  { name: "Weather / climate", state: "no", via: "Free APIs (NOAA/OpenWeather) exist — not wired", providers: "NOAA, ECMWF, OpenWeatherMap", latency: "Minutes → hours", cost: "Mostly free", use: "Agri, energy demand, supply risk" },
  { name: "Shipping / AIS", state: "no", via: "Needs a subscription feed", providers: "MarineTraffic, exactEarth, Orbcomm", latency: "~1–5 min", cost: "$$ (credit-based)", use: "Trade flows, port congestion" },
  { name: "Social media", state: "no", via: "API restrictions + cost", providers: "X/Twitter, Reddit, CrowdTangle", latency: "Seconds → hours", cost: "Freemium → $$$", use: "Sentiment, emerging-risk monitoring" },
  { name: "Commercial vendors", state: "no", via: "Enterprise subscriptions", providers: "Platts, Panjiva, ICE, FactSet", latency: "Varies", cost: "$$$$", use: "Energy, trade, credit intelligence" },
];

export const SOURCE_STATE = {
  live:    { label: "Live", color: "#7FB58A" },
  builtin: { label: "Built-in", color: "#6FBDB4" },
  no:      { label: "Needs a feed", color: "#565B54" },
};

// The brief's storage-tech comparison, as reference. The lead row is what this
// app actually runs on; the rest are what a full-scale EIOS would reach for.
export const STORAGE_TECH = [
  { name: "Supabase (Postgres)", cat: "This app", strength: "Managed Postgres + row-level security + REST; free tier; simple", cost: "Free tier → usage", used: true },
  { name: "Snowflake", cat: "Cloud warehouse", strength: "Auto-scale compute, semi-structured, time-travel, sharing", cost: "~$2/credit + ~$23/TB-mo", used: false },
  { name: "BigQuery", cat: "Cloud warehouse", strength: "Serverless pay-per-byte, elastic, built-in ML", cost: "$6.25/TB scanned + ~$23/TB-mo", used: false },
  { name: "Delta Lake", cat: "Lakehouse", strength: "ACID on object storage, unified batch/stream, open format", cost: "Object storage + compute (DBUs)", used: false },
  { name: "ClickHouse", cat: "OLAP", strength: "Very fast analytical scans, vectorised, great compression", cost: "OSS (infra only) → Cloud", used: false },
  { name: "InfluxDB / TimescaleDB", cat: "Time-series", strength: "High-ingest timestamped data, retention, downsampling", cost: "$0.0025/MB in, $0.002/GB-hr", used: false },
  { name: "Pinecone / Milvus", cat: "Vector", strength: "Nearest-neighbour search for embeddings (HNSW)", cost: "~$0.33/GB-mo + read/write units", used: false },
  { name: "Neo4j", cat: "Graph", strength: "Native graph traversals, Cypher, relationship queries", cost: "~$65–146/GB-mo (Aura)", used: false },
];

export const DATA_NOTE =
  "The brief is a backend data-engineering blueprint (Kafka, warehouses, lakes, vector/graph DBs, CDC, satellite/AIS feeds). This app runs the small, honest end of it — Supabase + a free 30-min GitHub-Actions cron — and this page shows exactly what's live vs. what a full EIOS would add. Nothing here is faked infrastructure.";
