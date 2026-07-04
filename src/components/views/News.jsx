import { useState, useEffect } from "react";
import { Newspaper, ArrowRight, Radio, Share2, ChevronDown, Zap, TrendingUp, TrendingDown, ShieldAlert, Database, ExternalLink } from "lucide-react";
import { NEWS_AS_OF, TONES, IMPLICATIONS_DISCLAIMER } from "../../config/news.js";
import { propagate, nodeById, lagLabel, readImpact } from "../../config/graph.js";
import { fetchNews, fetchHeadlines } from "../../lib/dataApi.js";
import { tint } from "../../config/palette.js";
import Insight from "../ui/Insight.jsx";
import InfoTip from "../ui/InfoTip.jsx";
import CascadeRows from "../ui/CascadeRows.jsx";
import { TERMS } from "../../config/glossary.js";

const UP = "#7FB58A", DOWN = "#D8735E";

export default function News({ onOpenGraph }) {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [items, setItems] = useState([]);       // [{ story, graph, implications }]
  const [source, setSource] = useState("builtin");
  const [loading, setLoading] = useState(true);
  const [wire, setWire] = useState([]);          // live headlines (free 30-min feed)
  const [tab, setTab] = useState("analysis");    // "analysis" | "wire"

  useEffect(() => {
    let alive = true;
    fetchNews().then((r) => { if (alive) { setItems(r.items); setSource(r.source); setLoading(false); } });
    fetchHeadlines(24).then((h) => { if (alive) setWire(h); });
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

      {/* Tabs — deep analysis vs the fast live wire */}
      <div className="flex gap-1 border-b" style={{ borderColor: "#1A1F1C" }}>
        <TabButton label="Analysis" count={items.length} active={tab === "analysis"} onClick={() => setTab("analysis")} color="#4FB8F0" />
        <TabButton label="Live wire" count={wire.length} active={tab === "wire"} onClick={() => setTab("wire")} color="#7FB58A" live />
      </div>

      {tab === "wire" && <WireTab wire={wire} />}

      {tab === "analysis" && (<>
        <div className="mt-4">
          <Insight color="#4FB8F0" label="Read news like an analyst" icon={Radio}>
            Amateurs read the event; analysts read the channel. Every story fires a real shock through the economic brain — you see precisely which indicators move, by how much, and when.
          </Insight>
        </div>

        {/* Tone filter */}
        <div className="mt-4 flex flex-wrap gap-2">
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
      </>)}

      <footer className="mt-7 border-t border-line/60 pt-5 font-mono text-[11px] leading-relaxed text-muted-2">
        News desk · {live ? "served live from Supabase" : `built-in feed, curated ${NEWS_AS_OF}`}. Cascades are propagated
        through the Intelligence graph — qualitative size and timing, not forecasts. Implications are general economic
        exposure, not financial advice.
      </footer>
    </div>
  );
}

function ago(iso) {
  if (!iso) return "";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

function TabButton({ label, count, active, onClick, color, live }) {
  return (
    <button onClick={onClick} className="relative flex items-center gap-1.5 px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors"
      style={{ color: active ? "#F3F1EA" : "#6B7068" }}>
      {live && (active ? <span className="dot-live" /> : <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#3E433C" }} />)}
      {label}
      <span className="rounded-full px-1.5 font-mono text-[9px]" style={{ background: tint(active ? color : "#565B54", 0.15), color: active ? color : "#6B7068" }}>{count}</span>
      {active && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full" style={{ background: color, boxShadow: `0 0 8px ${tint(color, 0.6)}` }} />}
    </button>
  );
}

function WireTab({ wire }) {
  if (!wire.length) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-6 text-center" style={{ borderColor: "#232823", background: "rgba(19,22,20,0.4)" }}>
        <Radio className="mx-auto h-5 w-5" style={{ color: "#565B54" }} />
        <p className="mt-2 font-mono text-[11px]" style={{ color: "#565B54" }}>The live wire is warming up — fresh headlines land within 30 minutes.</p>
      </div>
    );
  }
  return (
    <div className="mt-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(79,184,240,0.06)", border: "1px solid rgba(79,184,240,0.2)" }}>
        <span className="dot-live" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#7FB58A" }}>Live wire</span>
        <span className="font-mono text-[10px]" style={{ color: "#8A8F88" }}>{wire.length} headlines · auto-updates every 30 min</span>
        <span className="ml-auto font-mono text-[9px]" style={{ color: "#565B54" }}>newest {ago(wire[0]?.published_at)} · Google News</span>
      </div>
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)" }}>
        {wire.map((h, i) => (
          <a key={i} href={h.link} target="_blank" rel="noreferrer"
            className="group flex items-start gap-3 border-b px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.02]" style={{ borderColor: "#1A1F1C" }}>
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#4FB8F0" }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] leading-snug text-ink group-hover:underline">{h.title}</div>
              <div className="mt-0.5 font-mono text-[10px]" style={{ color: "#565B54" }}>{h.source} · {ago(h.published_at)}</div>
            </div>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" style={{ color: "#4FB8F0" }} />
          </a>
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] leading-relaxed" style={{ color: "#565B54" }}>
        Raw headlines from a free public feed — not analysed or scored. For the graph cascades and exposure analysis, use the Analysis tab.
      </p>
    </div>
  );
}

function ImpactPanel({ origin, dir, tone, implications }) {
  const map = propagate(origin, dir);
  const impacts = [...map.entries()].filter(([id]) => id !== origin)
    .map(([id, v]) => ({ id, ...v, uncertain: Math.sign(v.lo) !== Math.sign(v.hi) }))
    .sort((a, b) => Math.abs(b.impulse) - Math.abs(a.impulse)).slice(0, 8);
  const maxImp = Math.max(...impacts.map((i) => Math.max(Math.abs(i.impulse), Math.abs(i.lo), Math.abs(i.hi))), 0.001);
  const gdp = map.get("gdp");
  const gdpRead = gdp ? readImpact(origin, "gdp", dir, Math.sign(gdp.lo) !== Math.sign(gdp.hi)) : null;
  const impl = implications ?? [];

  return (
    <div className="mt-3 space-y-3 rounded-lg border p-3.5" style={{ borderColor: "#1E231F", background: "rgba(12,14,13,0.5)" }}>
      <div>
        <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#A99BF5" }}>
          <Zap className="h-3 w-3" /> What this sets off — through the economy
        </div>
        <p className="mb-2 font-mono text-[9px]" style={{ color: "#565B54" }}>Tap any row to see what it is and why it moves.</p>
        <CascadeRows origin={origin} shockDir={dir} impacts={impacts} maxImp={maxImp} compact />
        {gdp && gdpRead && (
          <p className="mt-2.5 text-[11.5px] leading-relaxed" style={{ color: "#8A8F88" }}>
            For the whole economy (<InfoTip concept={TERMS.gdp} color="#6FBDB4">GDP</InfoTip>), the bottom line is{" "}
            {gdpRead.unclear
              ? <span style={{ color: gdpRead.color }}>it could go either way</span>
              : <><span style={{ color: gdpRead.color }}>GDP {gdpRead.dirWord}</span> — {gdpRead.sentiment === "good"
                  ? <span style={{ color: UP }}>the economy grows (<InfoTip concept={TERMS.supportive} color={UP}>supportive</InfoTip>)</span>
                  : <span style={{ color: DOWN }}>the economy slows (<InfoTip concept={TERMS.contractionary} color={DOWN}>contractionary</InfoTip>)</span>}</>}
            , felt {lagLabel(gdp.lagWeeks)}.
          </p>
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
