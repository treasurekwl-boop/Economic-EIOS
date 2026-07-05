import { useState, useEffect } from "react";
import { Database, ChevronDown, Boxes, Check } from "lucide-react";
import { fetchSourceStatus } from "../../lib/dataApi.js";
import { DATA_SOURCES, SOURCE_STATE, STORAGE_TECH, DATA_NOTE } from "../../config/datasources.js";
import { tint } from "../../config/palette.js";

const ago = (iso) => {
  if (!iso) return "never";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 90) return "just now";
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  if (s < 172800) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};
const stale = (iso, maxH) => iso && (Date.now() - new Date(iso).getTime()) / 3.6e6 > maxH;

export default function DataLayer() {
  const [status, setStatus] = useState(null);
  useEffect(() => { fetchSourceStatus().then(setStatus); }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 animate-fade-up">
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#6FBDB4" }}>
          <Database className="h-3.5 w-3.5" /> Data layer · Sources &amp; freshness
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">What's feeding the engine</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          The app's real data pipeline — Supabase + a free 30-minute GitHub-Actions cron — with live freshness, then the
          full EIOS source and storage catalogue flagged for what's here vs. what needs a paid feed or a backend.
        </p>
      </div>

      {/* Live pipeline status */}
      <div className="mb-6">
        <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">Live pipeline · your Supabase feeds</div>
        <div className="space-y-2">
          {(status ?? []).map((s) => {
            const maxH = s.id === "market_prices" || s.id === "instrument_series" || s.id === "headlines" ? 3 : 24 * 40;
            const isStale = s.live && stale(s.latest, maxH);
            const c = !s.live ? "#565B54" : isStale ? "#C6A15B" : "#7FB58A";
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c, boxShadow: s.live && !isStale ? `0 0 7px ${tint(c, 0.7)}` : "none" }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-ink">{s.label}</div>
                  <div className="font-mono text-[9px]" style={{ color: "#6B7068" }}>feeds {s.feeds}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-[11px]" style={{ color: c }}>{s.live ? (isStale ? "stale" : "live") : "inactive"}</div>
                  <div className="font-mono text-[9px]" style={{ color: "#565B54" }}>{s.live ? `${s.count.toLocaleString()} rows · ${ago(s.latest)}` : "not populated"}</div>
                </div>
              </div>
            );
          })}
          {status == null && <div className="rounded-xl border px-4 py-3 font-mono text-[11px]" style={{ borderColor: "#232823", color: "#565B54" }}>Checking feeds…</div>}
        </div>
        <p className="mt-2 font-mono text-[9px] leading-relaxed" style={{ color: "#565B54" }}>
          Amber = populated but older than expected (prices/instruments refresh every 30 min; a stale mark usually means the GitHub Action hasn't run). Inactive = the table isn't created or populated yet.
        </p>
      </div>

      {/* Data source catalogue */}
      <div className="mb-6">
        <div className="mb-2.5 flex items-center gap-2">
          <Boxes className="h-4 w-4" style={{ color: "#C6A15B" }} />
          <h2 className="font-display text-[17px] font-semibold text-ink">Full EIOS source catalogue</h2>
        </div>
        <div className="space-y-1.5">
          {DATA_SOURCES.map((d) => {
            const st = SOURCE_STATE[d.state];
            return (
              <details key={d.name} className="group rounded-xl border" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5">
                  <span className="w-[74px] shrink-0 rounded-md border px-1.5 py-0.5 text-center font-mono text-[8px] uppercase tracking-wider" style={{ borderColor: tint(st.color, 0.4), color: st.color }}>{st.label}</span>
                  <span className="flex-1 text-[13px] font-medium text-ink">{d.name}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: "#565B54" }} />
                </summary>
                <div className="border-t px-4 py-2.5" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>
                  <dl className="space-y-1 text-[11.5px]">
                    <Row k="In this app" v={d.via} c={st.color} />
                    <Row k="Providers" v={d.providers} />
                    <Row k="Latency" v={d.latency} />
                    <Row k="Cost" v={d.cost} />
                    <Row k="Use" v={d.use} />
                  </dl>
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {/* Storage tech */}
      <div>
        <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">Storage tech · what a full-scale EIOS reaches for</div>
        <div className="space-y-1.5">
          {STORAGE_TECH.map((t) => (
            <div key={t.name} className="flex items-start gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: t.used ? tint("#6FBDB4", 0.4) : "#232823", background: t.used ? "rgba(111,189,180,0.06)" : "linear-gradient(155deg, #131614, #101311)" }}>
              {t.used ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#6FBDB4" }} /> : <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border" style={{ borderColor: "#3A403A" }} />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[13px] font-medium" style={{ color: t.used ? "#ECEAE3" : "#C9C6BD" }}>{t.name}</span>
                  <span className="font-mono text-[8.5px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{t.cat}</span>
                </div>
                <div className="text-[11.5px] leading-relaxed" style={{ color: "#9A978E" }}>{t.strength}</div>
              </div>
              <div className="shrink-0 text-right font-mono text-[9px]" style={{ color: "#6B7068" }}>{t.cost}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>{DATA_NOTE}</p>
    </div>
  );
}

function Row({ k, v, c }) {
  return (
    <div className="flex gap-2.5">
      <dt className="w-[74px] shrink-0 font-mono text-[8.5px] uppercase tracking-wider" style={{ color: c ?? "#6B7068" }}>{k}</dt>
      <dd className="flex-1 leading-relaxed" style={{ color: "#9A978E" }}>{v}</dd>
    </div>
  );
}
