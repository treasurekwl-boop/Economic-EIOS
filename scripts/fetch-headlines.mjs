// Free live headlines wire. Pulls SA-economy news from Google News RSS (no key,
// no cost) and upserts the latest into Supabase. Runs in GitHub Actions every
// 30 min (unlimited/free on public repos). Uses only global fetch — no deps, so
// the Action needs no `npm install`. Writes with the service_role key from a
// GitHub Secret (server-side, never shipped to the browser).
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env.");
  process.exit(1);
}

const QUERY = "South Africa economy OR rand OR SARB OR inflation OR Eskom OR GDP OR JSE";
const RSS = `https://news.google.com/rss/search?q=${encodeURIComponent(QUERY)}&hl=en-ZA&gl=ZA&ceid=ZA:en`;

const decode = (s) =>
  (s || "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ")
    .trim();

const pick = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? decode(m[1]) : null;
};

async function main() {
  const res = await fetch(RSS, { headers: { "User-Agent": "Mozilla/5.0 GrowthEngineBot" } });
  if (!res.ok) { console.error("RSS fetch failed:", res.status); process.exit(1); }
  const xml = await res.text();

  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const rows = items.slice(0, 25).map((it) => {
    let title = pick(it, "title");
    const link = pick(it, "link");
    const source = pick(it, "source");
    const pub = pick(it, "pubDate");
    // Google News titles are "Headline - Publisher" — trim the trailing source.
    if (source && title && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3)).trim();
    return {
      id: link, title, link, source: source ?? "Google News",
      published_at: pub ? new Date(pub).toISOString() : new Date().toISOString(),
    };
  }).filter((r) => r.id && r.title);

  if (!rows.length) { console.error("No items parsed."); process.exit(1); }

  // Upsert (merge on the link id)
  const up = await fetch(`${SUPABASE_URL}/rest/v1/headlines?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!up.ok) { console.error("Upsert failed:", up.status, await up.text()); process.exit(1); }

  // Keep the table tidy: drop anything older than 7 days
  const cutoff = new Date(Date.now() - 7 * 864e5).toISOString();
  await fetch(`${SUPABASE_URL}/rest/v1/headlines?published_at=lt.${cutoff}`, {
    method: "DELETE", headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Prefer: "return=minimal" },
  });

  console.log(`Headlines wire: upserted ${rows.length} items.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
