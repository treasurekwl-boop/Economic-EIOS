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
