import { supabase, isSupabaseConfigured } from "./supabase.js";
import { NEWS, NEWS_GRAPH, IMPLICATIONS } from "../config/news.js";

// The data layer. When Supabase is configured AND has rows, the app reads LIVE
// from it (so the daily refresh job can update the feed with no rebuild). Until
// then it falls back to the built-in curated data — nothing ever breaks.

// Normalise a Supabase news row into the shape the News view expects, and
// return the matching graph/implications so the view is source-agnostic.
function fromRow(row) {
  return {
    story: {
      id: row.id,
      date: row.date_label ?? row.published_at,
      source: row.source,
      tone: row.tone,
      title: row.title,
      what: row.what,
      why: row.why ?? [],
      impact: row.impact,
      tags: row.tags ?? [],
    },
    graph: row.graph_origin ? { origin: row.graph_origin, dir: row.graph_dir ?? 1, verb: row.graph_verb ?? "Trace on the graph" } : null,
    implications: row.implications ?? [],
  };
}

// Built-in data reshaped to the same envelope, so the view has one code path.
function fromConfig() {
  return NEWS.map((story) => ({
    story,
    graph: NEWS_GRAPH[story.id] ?? null,
    implications: IMPLICATIONS[story.id] ?? [],
  }));
}

export async function fetchNews() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("sort", { ascending: false })
        .order("published_at", { ascending: false });
      if (!error && data && data.length) {
        return { items: data.map(fromRow), source: "supabase" };
      }
    } catch {
      /* fall through to built-in data */
    }
  }
  return { items: fromConfig(), source: "builtin" };
}

export async function fetchReleases() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("releases").select("*").order("release_at", { ascending: true });
      if (!error && data && data.length) return { items: data, source: "supabase" };
    } catch { /* fall back */ }
  }
  return { items: null, source: "builtin" };
}

// Live FX + commodity prices (populated by the every-30-min GitHub Action).
export async function fetchPrices() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("market_prices").select("*");
      if (!error && data) return data;
    } catch { /* no table yet / offline */ }
  }
  return [];
}

// Live status of the app's real data layer — for each Supabase-backed source,
// whether it's populated, its row count, and when it last updated. This is the
// brief's "observability / freshness" theme applied to the actual pipeline.
export async function fetchSourceStatus() {
  const defs = [
    { id: "news", table: "news", ts: "published_at", label: "Analysed news", feeds: "News · Analysis" },
    { id: "headlines", table: "headlines", ts: "published_at", label: "Live headlines wire", feeds: "News · Live wire" },
    { id: "market_prices", table: "market_prices", ts: "updated_at", label: "FX & commodity prices", feeds: "Overview · Live markets" },
    { id: "instrument_series", table: "instrument_series", ts: "updated_at", label: "Watchlist history", feeds: "Desk · charts, forecasts, regime" },
    { id: "releases", table: "releases", ts: "release_at", label: "Economic calendar", feeds: "Calendar" },
  ];
  if (!isSupabaseConfigured || !supabase) return defs.map((d) => ({ ...d, live: false, count: 0, latest: null }));
  const out = [];
  for (const d of defs) {
    try {
      const { count } = await supabase.from(d.table).select("*", { count: "exact", head: true });
      let latest = null;
      const { data } = await supabase.from(d.table).select(d.ts).order(d.ts, { ascending: false }).limit(1);
      if (data && data[0]) latest = data[0][d.ts];
      out.push({ ...d, live: (count ?? 0) > 0, count: count ?? 0, latest });
    } catch { out.push({ ...d, live: false, count: 0, latest: null }); }
  }
  return out;
}

// Watchlist price history for the Trading Desk (every-30-min GitHub Action).
// Returns a map { id: { label, type, series:[[date,close]], last, prev } } or {}.
export async function fetchInstruments() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("instrument_series").select("*");
      if (!error && data) return Object.fromEntries(data.map((r) => [r.id, r]));
    } catch { /* no table yet / offline */ }
  }
  return {};
}

// The free live headlines wire (populated by the every-30-min GitHub Action).
export async function fetchHeadlines(limit = 12) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("headlines")
        .select("title,link,source,published_at")
        .order("published_at", { ascending: false })
        .limit(limit);
      if (!error && data) return data;
    } catch { /* no table yet / offline */ }
  }
  return [];
}
