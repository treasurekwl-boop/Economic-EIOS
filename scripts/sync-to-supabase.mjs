// Pushes the curated news + calendar into Supabase (upsert), so the LIVE site
// updates with no rebuild. Server-side only — uses the SERVICE_ROLE key, which
// must live in .env.local (gitignored) and NEVER in the frontend or the repo.
//
//   node scripts/sync-to-supabase.mjs
//
// .env.local must contain:
//   VITE_SUPABASE_URL=https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<the service_role / secret key from Settings → API Keys>
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { NEWS, NEWS_GRAPH, IMPLICATIONS } from "../src/config/news.js";
import { RELEASES } from "../src/config/calendar.js";

function loadEnv() {
  const env = { ...process.env };
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (!m || line.trim().startsWith("#")) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[m[1]] = v;
    }
  } catch { /* no .env.local — rely on process.env */ }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || url.includes("YOUR-PROJECT") || !serviceKey) {
  console.error(
    "Missing Supabase credentials. Add to .env.local:\n" +
    "  VITE_SUPABASE_URL=https://<ref>.supabase.co\n" +
    "  SUPABASE_SERVICE_ROLE_KEY=<service_role/secret key from Supabase → Settings → API Keys>\n" +
    "(The service_role key is a SECRET — .env.local is gitignored; never commit or ship it.)"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const newsRows = NEWS.map((s, i) => {
  const g = NEWS_GRAPH[s.id] ?? {};
  return {
    id: s.id, date_label: s.date, source: s.source, tone: s.tone, title: s.title, what: s.what,
    why: s.why ?? [], impact: s.impact, tags: s.tags ?? [],
    graph_origin: g.origin ?? null, graph_dir: g.dir ?? 1, graph_verb: g.verb ?? null,
    implications: IMPLICATIONS[s.id] ?? [], sort: NEWS.length - i,
  };
});

const releaseRows = RELEASES.map((r) => ({
  id: r.id, name: r.name, agency: r.agency, release_at: r.iso, period: r.period,
  previous: r.previous, consensus: r.consensus, node: r.node, importance: r.importance,
  watch: r.watch, hi: r.hi ?? null, lo: r.lo ?? null,
}));

const n = await supabase.from("news").upsert(newsRows, { onConflict: "id" });
if (n.error) { console.error("news upsert failed:", n.error.message); process.exit(1); }
const r = await supabase.from("releases").upsert(releaseRows, { onConflict: "id" });
if (r.error) { console.error("releases upsert failed:", r.error.message); process.exit(1); }

console.log(`Synced to Supabase: ${newsRows.length} news, ${releaseRows.length} releases. Live site updates on next load — no rebuild.`);
