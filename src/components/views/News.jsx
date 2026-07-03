import { useState, useEffect } from "react";
import { Newspaper, ArrowRight, Radio, Share2, ChevronDown, Zap, TrendingUp, TrendingDown, ShieldAlert, Database } from "lucide-react";
import { NEWS_AS_OF, TONES, IMPLICATIONS_DISCLAIMER } from "../../config/news.js";
import { propagate, nodeById, lagLabel } from "../../config/graph.js";
import { fetchNews } from "../../lib/dataApi.js";
import { tint } from "../../config/palette.js";
import Insight from "../ui/Insight.jsx";

const UP = "#7FB58A", DOWN = "#D8735E";

export default function News({ onOpenGraph }) {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [items, setItems] = useState([]);       // [{ story, graph, implications }]
  const [source, setSource] = useState("builtin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchNews().then((r) => { if (alive) { setItems(r.items); setSource(r.source); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const shown = filter === "all" ? items : items.filter((it) => it.story.tone === filter);
  const live = source === "supabase";

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 animate-fade-up">
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-sky">
          <Newspaper className="h-3.5 w-3.5" /> News desk · Current affairs → the economy
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[26px] font-normal tracking-tight text-ink">What's moving the numbers</h1>
          <span className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
            style={live ? { borderColor: tint(UP, 0.5), color: UP, background: tint(UP, 0.08) } : { borderColor: "#262B27", color: "#6B7068" }}>
            {live ? <Radio className="h-2.5 w-2.5" /> : <Database className="h-2.5 w-2.5" />}
            {live ? "live · supabase" : "built-in"}
          </span>
        </div>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          Not headlines — transmission. Open any story to see <span className="text-ink">exactly what follows</span>: the full
          cascade through the economy with size and timing, and who's exposed. {live ? "Updating live from the backend." : `Curated ${NEWS_AS_OF}.`}
        </p>
      </div>

      <Insight color="#4FB8F0" label="Read news like an analyst" icon={Radio}>
        Amateurs read the event; analysts read the channel. Every story below fires a real shock through the economic brain —
        you see precisely which indicators move, by how much, and when.
      </Insight>

      {/* Tone filter */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
          style={filter === "all" ? { background: "rgba(236,234,227,0.1)", borderColor: "rgba(236,234,227,0.4)", color: "#ECEAE3" } : { background: "rgba(19,22,20,0.6)", borderColor: "rgba(35,40,35,1)", color: "#8A8F88" }}>
          All ({items.length})
        </button>
        {Object.entries(TONES).map(([key, t]) => {
          const n = items.filter((it) => it.story.tone === key).length;
          const on = filter === key;
          return (
            <button key={key} onClick={() => setFilter(on ? "all" : key)} className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
              style={on ? { background: tint(t.color, 0.15), borderColor: tint(t.color, 0.6), color: t.color } : { background: "rgba(19,22,20,0.6)", borderColor: "rgba(35,40,35,1)", color: "#8A8F88" }}>
              {t.label}s ({n})
            </button>
          );
        })}
      </div>

      {loading && <div className="mt-6 text-center font-mono text-[11px]" style={{ color: "#565B54" }}>loading feed…</div>}

      {/* Stories */}
      <div className="mt-4 space-y-3">
        {shown.map(({ story: s, graph: g, implications }) => {
          const t = TONES[s.tone] ?? TONES.watch;
          const open = openId === s.id;
          return (
            <article key={s.id} className="rounded-xl border border-line p-4"
              style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)", borderLeft: `3px solid ${t.color}` }}>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-2">
                <span className="rounded-md px-1.5 py-0.5 font-semibold uppercase tracking-wider" style={{ background: tint(t.color, 0.12), color: t.color }}>{t.label}</span>
                <span>{s.date}</span><span>·</span><span>{s.source}</span>
                <span className="ml-auto flex gap-1.5">
                  {(s.tags ?? []).map((tag) => <span key={tag} className="rounded border border-line px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-muted">{tag}</span>)}
                </span>
              </div>

              <h2 className="mt-2 text-[15px] font-semibold leading-snug text-ink">{s.title}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{s.what}</p>

              {(s.why ?? []).length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: "rgba(12,14,13,0.6)", border: "1px solid rgba(35,40,35,0.7)" }}>
                  <span className="mr-1 font-mono text-[8px] uppercase tracking-wider text-muted-2">Chain</span>
                  {s.why.map((step, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px]" style={{ color: t.color }}>{step}</span>
                      {i < s.why.length - 1 && <ArrowRight className="h-3 w-3 text-muted-2" />}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-2 text-[11.5px] leading-snug text-ink/80">
                <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: t.color }}>So what · </span>{s.impact}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {g && (
                  <button onClick={() => setOpenId(open ? null : s.id)}
                    className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors"
                    style={{ borderColor: open ? tint(t.color, 0.5) : "#262B27", color: open ? t.color : "#8A8F88" }}>
                    <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} /> {open ? "Hide impact" : "Exactly what follows"}
                  </button>
                )}
                {onOpenGraph && g && (
                  <button onClick={() => onOpenGraph(g.origin, g.dir)}
                    className="group flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-all"
                    style={{ borderColor: tint("#A99BF5", 0.35), color: "#A99BF5", background: tint("#A99BF5", 0.06) }}>
                    <Share2 className="h-3 w-3" /> {g.verb}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>

              {open && g && <ImpactPanel origin={g.origin} dir={g.dir} tone={t.color} implications={implications} />}
            </article>
          );
        })}
      </div>

      <footer className="mt-7 border-t border-line/60 pt-5 font-mono text-[11px] leading-relaxed text-muted-2">
        News desk · {live ? "served live from Supabase" : `built-in feed, curated ${NEWS_AS_OF}`}. Cascades are propagated
        through the Intelligence graph — qualitative size and timing, not forecasts. Implications are general economic
        exposure, not financial advice.
      </footer>
    </div>
  );
}

function ImpactPanel({ origin, dir, tone, implications }) {
  const map = propagate(origin, dir, 4);
  const impacts = [...map.entries()].filter(([id]) => id !== origin)
    .map(([id, v]) => ({ id, ...v })).sort((a, b) => Math.abs(b.impulse) - Math.abs(a.impulse)).slice(0, 8);
  const maxImp = Math.max(...impacts.map((i) => Math.abs(i.impulse)), 0.001);
  const gdp = map.get("gdp");
  const impl = implications ?? [];

  return (
    <div className="mt-3 space-y-3 rounded-lg border p-3.5" style={{ borderColor: "#1E231F", background: "rgba(12,14,13,0.5)" }}>
      <div>
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#A99BF5" }}>
          <Zap className="h-3 w-3" /> Exactly what follows — through the economy
        </div>
        <div className="space-y-1">
          {impacts.map((im) => {
            const n = nodeById(im.id); const up = im.impulse > 0; const c = up ? UP : DOWN;
            const width = Math.max(5, (Math.abs(im.impulse) / maxImp) * 100);
            return (
              <div key={im.id} className="flex items-center gap-2.5">
                <span className="w-3 shrink-0 text-center font-mono text-[11px]" style={{ color: c }}>{up ? "▲" : "▼"}</span>
                <span className="w-[120px] shrink-0 truncate text-[12px]" style={{ color: "#ECEAE3" }}>{n?.label ?? im.id}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(35,40,35,0.7)" }}>
                  <div className="h-full rounded-full" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${tint(c, 0.5)}, ${c})` }} />
                </div>
                <span className="w-[86px] shrink-0 text-right font-mono text-[9px]" style={{ color: "#6B7068" }}>{lagLabel(im.lagWeeks)}</span>
              </div>
            );
          })}
        </div>
        {gdp && (
          <div className="mt-2 font-mono text-[10.5px]" style={{ color: "#8A8F88" }}>
            Net on GDP: <span style={{ color: gdp.impulse > 0 ? UP : DOWN }}>{gdp.impulse > 0 ? "▲ supportive" : "▼ contractionary"}</span>
            <span style={{ color: "#565B54" }}> · felt {lagLabel(gdp.lagWeeks)}</span>
          </div>
        )}
      </div>

      {impl.length > 0 && (
        <div className="border-t pt-3" style={{ borderColor: "#1E231F" }}>
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: tone }}>
            <ShieldAlert className="h-3 w-3" /> Who's exposed
          </div>
          <div className="space-y-1.5">
            {impl.map((im, i) => {
              const up = im.dir === "up"; const c = up ? UP : DOWN; const Icon = up ? TrendingUp : TrendingDown;
              return (
                <div key={i} className="flex items-start gap-2">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: c }} />
                  <div>
                    <span className="text-[12px] font-medium" style={{ color: "#ECEAE3" }}>{im.theme}</span>
                    <span className="ml-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: c }}>{up ? "tends to benefit" : "tends to suffer"}</span>
                    {im.note && <p className="text-[11px] leading-snug text-muted">{im.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2.5 font-mono text-[9px] leading-relaxed" style={{ color: "#565B54" }}>⚠ {IMPLICATIONS_DISCLAIMER}</p>
        </div>
      )}
    </div>
  );
}
