import { useState, useEffect, useMemo } from "react";
import {
  Briefcase, Zap, NotebookPen, Trash2, TrendingUp, TrendingDown, Activity, Plus, Radio,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { INSTRUMENTS, INSTRUMENT_TYPES, DESK_SHOCKS, DESK_NOTE, TV_SYMBOL } from "../../config/desk.js";
import { fetchInstruments } from "../../lib/dataApi.js";
import { signals } from "../../lib/ta.js";
import { propagate, nodeById } from "../../config/graph.js";
import { usePersistedState } from "../../lib/usePersistedState.js";
import { tint } from "../../config/palette.js";
import QuantDesk from "./QuantDesk.jsx";
import ForecastLab from "./ForecastLab.jsx";
import TradingViewChart from "../ui/TradingViewChart.jsx";

const UP = "#7FB58A", DOWN = "#D8735E", FLAT = "#8A8F88";
const instById = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i]));

const fmtPrice = (inst, v) => {
  if (v == null || !inst) return "—";
  if (inst.fmt === "R") return `R${v.toFixed(inst.dp)}`;
  if (inst.fmt === "$") return `$${Math.round(v).toLocaleString("en-US")}`;
  if (inst.fmt === "ZAc") return `${Math.round(v).toLocaleString("en-ZA")}c`;
  return `${v.toLocaleString("en-ZA", { maximumFractionDigits: inst.dp })}`;
};

export default function Desk({ onOpenGraph }) {
  const [tab, setTab] = useState("workbench");   // "workbench" | "quant"
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { fetchInstruments().then((d) => { setData(d); setLoaded(true); }); }, []);
  const hasFeed = Object.keys(data).length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 animate-fade-up">
      <div className="mb-4">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#6FBDB4" }}>
          <Briefcase className="h-3.5 w-3.5" /> Desk · Your analysis workbench
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">Watch, model, journal</h1>
      </div>

      {/* Tab toggle */}
      <div className="mb-5 flex gap-1.5">
        {[["workbench", "Workbench"], ["forecast", "Forecast"], ["quant", "Quant tools"]].map(([key, lbl]) => (
          <button key={key} onClick={() => setTab(key)} className="rounded-lg border px-3.5 py-2 text-[12.5px] font-medium transition-all"
            style={tab === key ? { background: tint("#6FBDB4", 0.14), borderColor: tint("#6FBDB4", 0.55), color: "#6FBDB4" } : { background: "rgba(19,22,20,0.6)", borderColor: "rgba(35,40,35,1)", color: "#8A8F88" }}>
            {lbl}
          </button>
        ))}
      </div>

      {tab === "quant" ? (
        <QuantDesk data={data} />
      ) : tab === "forecast" ? (
        <ForecastLab data={data} />
      ) : (
        <>
          {loaded && !hasFeed && (
            <div className="mb-5 rounded-xl border p-4" style={{ borderColor: tint("#C6A15B", 0.35), background: tint("#C6A15B", 0.05) }}>
              <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider" style={{ color: "#C6A15B" }}>
                <Radio className="h-3.5 w-3.5" /> Price feed not active yet
              </div>
              <p className="text-[12.5px] leading-relaxed text-muted">
                Charts and signals need the watchlist feed. Run <span className="font-mono text-ink">supabase/instrument_series.sql</span> once
                in Supabase, then trigger the <span className="font-mono text-ink">Live data</span> GitHub Action. The shock-to-position tool
                and journal below work right now without it.
              </p>
            </div>
          )}

          <Watchlist data={data} />
          <LiveChart />
          <ShockToPositions data={data} onOpenGraph={onOpenGraph} />
          <Journal data={data} />

          <p className="mt-6 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>
            {DESK_NOTE}
          </p>
        </>
      )}
    </div>
  );
}

// ── 1. Watchlist: price, daily change, sparkline, computed signals ──
function Watchlist({ data }) {
  const [filter, setFilter] = useState("all");
  const shown = INSTRUMENTS.filter((i) => filter === "all" || i.type === filter);

  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">
          <Activity className="h-3.5 w-3.5" /> Watchlist
        </div>
        <div className="flex gap-1.5">
          {["all", ...Object.keys(INSTRUMENT_TYPES)].map((t) => {
            const on = filter === t;
            const c = t === "all" ? "#8A8F88" : INSTRUMENT_TYPES[t].color;
            return (
              <button key={t} onClick={() => setFilter(t)}
                className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors"
                style={on ? { borderColor: tint(c, 0.55), color: c, background: tint(c, 0.12) } : { borderColor: "#242A29", color: "#6B7068" }}>
                {t === "all" ? "All" : INSTRUMENT_TYPES[t].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((inst) => <WatchCard key={inst.id} inst={inst} row={data[inst.id]} />)}
      </div>
    </div>
  );
}

function WatchCard({ inst, row }) {
  const meta = INSTRUMENT_TYPES[inst.type];
  const closes = row?.series?.map((s) => s[1]) ?? [];
  const sig = signals(closes);
  const chg = row?.prev ? ((row.last - row.prev) / row.prev) * 100 : null;
  const chgC = chg == null ? FLAT : chg >= 0 ? UP : DOWN;
  const spark = (row?.series ?? []).slice(-40).map(([t, p]) => ({ t, p }));
  const trendC = sig?.trend === "up" ? UP : sig?.trend === "down" ? DOWN : FLAT;

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
            <span className="text-[13px] font-medium text-ink">{inst.label}</span>
          </div>
          <div className="mt-0.5 font-display text-[18px]" style={{ color: "#ECEAE3", fontVariantNumeric: "tabular-nums" }}>
            {fmtPrice(inst, row?.last)}
          </div>
        </div>
        {chg != null && (
          <span className="font-mono text-[11px]" style={{ color: chgC }}>{chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%</span>
        )}
      </div>

      {spark.length > 3 ? (
        <div className="mt-1.5 h-9">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Line dataKey="p" stroke={trendC} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-1.5 flex h-9 items-center font-mono text-[9px]" style={{ color: "#565B54" }}>awaiting feed</div>
      )}

      {sig && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t pt-1.5 font-mono text-[9px]" style={{ borderColor: "#1E231F" }}>
          <span style={{ color: trendC }}>{sig.trend === "up" ? "▲ uptrend" : sig.trend === "down" ? "▼ downtrend" : "→ ranging"}</span>
          {sig.rsi != null && (
            <span style={{ color: sig.rsiTag === "overbought" ? DOWN : sig.rsiTag === "oversold" ? UP : "#6B7068" }}>
              RSI {Math.round(sig.rsi)}{sig.rsiTag !== "neutral" ? ` · ${sig.rsiTag}` : ""}
            </span>
          )}
          {sig.vol != null && <span style={{ color: "#6B7068" }}>vol {Math.round(sig.vol)}%</span>}
        </div>
      )}
    </div>
  );
}

// ── Live chart: real TradingView chart embedded for the selected instrument ──
function LiveChart() {
  const [instId, setInstId] = useState("usdzar");
  return (
    <div className="mb-5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">
          <Activity className="h-3.5 w-3.5" /> Live chart · TradingView
        </div>
        <select value={instId} onChange={(e) => setInstId(e.target.value)}
          className="rounded-md border px-2 py-1 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }}>
          {INSTRUMENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      </div>
      <TradingViewChart symbol={TV_SYMBOL[instId] ?? "FX_IDC:USDZAR"} />
      <p className="mt-1.5 font-mono text-[9px]" style={{ color: "#565B54" }}>
        Real TradingView data (real-time where your account/exchange allows, else delayed). Change the symbol on the chart if an exchange code differs on your plan. Display only — the app's models still use the EOD feed.
      </p>
    </div>
  );
}

// ── 2. Shock-to-positions: run a macro shock, see the modelled hit per instrument ──
function ShockToPositions({ data, onOpenGraph }) {
  const [shockId, setShockId] = useState("oil");
  const shock = DESK_SHOCKS.find((s) => s.id === shockId);
  const prop = useMemo(() => propagate(shock.node, shock.dir), [shock.node, shock.dir]);

  const rows = INSTRUMENTS.map((inst) => {
    const im = prop.get(inst.node);
    if (!im) return { inst, impulse: 0, lo: 0, hi: 0 };
    const s = inst.invert ? -1 : 1;
    // Flipping sign swaps the band ends, so re-order lo/hi.
    const lo = s * im.lo, hi = s * im.hi;
    return { inst, impulse: s * im.impulse, lo: Math.min(lo, hi), hi: Math.max(lo, hi) };
  }).filter((r) => Math.abs(r.impulse) > 0.02 || Math.abs(r.hi) > 0.02 || Math.abs(r.lo) > 0.02)
    .sort((a, b) => Math.abs(b.impulse) - Math.abs(a.impulse));

  const maxImp = Math.max(...rows.map((r) => Math.max(Math.abs(r.impulse), Math.abs(r.lo), Math.abs(r.hi))), 0.001);

  return (
    <div className="mb-5 rounded-2xl border p-4" style={{ borderColor: tint("#A99BF5", 0.25), background: "linear-gradient(160deg, rgba(169,155,245,0.05), #101311 60%)" }}>
      <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#A99BF5" }}>
        <Zap className="h-3.5 w-3.5" /> Shock → your positions
      </div>
      <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
        Pick a macro shock and see how the causal engine says it would move each instrument — direction, size, and the 90% range.
        Modelled, not a forecast.
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {DESK_SHOCKS.map((s) => {
          const on = s.id === shockId;
          return (
            <button key={s.id} onClick={() => setShockId(s.id)}
              className="rounded-lg border px-2.5 py-1.5 text-[11.5px] transition-colors"
              style={on ? { borderColor: tint("#A99BF5", 0.55), color: "#A99BF5", background: tint("#A99BF5", 0.12) } : { borderColor: "#242A29", color: "#8A8F88" }}>
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        {rows.map(({ inst, impulse, lo, hi }) => {
          const up = impulse > 0; const c = up ? UP : DOWN;
          const w = Math.max(3, (Math.abs(impulse) / maxImp) * 100);
          const bLo = (Math.min(Math.abs(lo), Math.abs(hi)) / maxImp) * 100;
          const bHi = (Math.max(Math.abs(lo), Math.abs(hi)) / maxImp) * 100;
          const uncertain = Math.sign(lo) !== Math.sign(hi);
          return (
            <div key={inst.id} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-center font-mono text-[12px]" style={{ color: uncertain ? "#C6A15B" : c }}>{uncertain ? "◇" : up ? "▲" : "▼"}</span>
              <span className="w-[104px] shrink-0 truncate text-[12.5px]" style={{ color: "#ECEAE3" }}>{inst.label}</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(35,40,35,0.7)" }}>
                <div className="absolute inset-y-0 rounded-full" style={{ left: `${bLo}%`, width: `${Math.max(1, bHi - bLo)}%`, background: tint(c, 0.22) }} />
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${tint(c, 0.5)}, ${c})` }} />
              </div>
              <span className="w-[64px] shrink-0 text-right font-mono text-[10px]" style={{ color: uncertain ? "#C6A15B" : "#8A8F88" }}>
                {uncertain ? "unclear" : up ? "likely up" : "likely down"}
              </span>
            </div>
          );
        })}
        {rows.length === 0 && <div className="py-3 text-center font-mono text-[11px]" style={{ color: "#565B54" }}>this shock doesn't reach your watchlist</div>}
      </div>

      {onOpenGraph && (
        <button onClick={() => onOpenGraph(shock.node, shock.dir)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors"
          style={{ borderColor: tint("#A99BF5", 0.35), color: "#A99BF5", background: tint("#A99BF5", 0.06) }}>
          See the full cascade in Intelligence
        </button>
      )}
    </div>
  );
}

// ── 3. Trade journal + P&L (local to this device) ──
const emptyForm = { instId: "usdzar", dir: "long", entry: "", size: "", note: "" };

function Journal({ data }) {
  const [trades, setTrades] = usePersistedState("ge.desk.trades", []);
  const [form, setForm] = useState(emptyForm);
  const [closing, setClosing] = useState({}); // { [tradeId]: exitPriceString }

  const add = () => {
    const entry = parseFloat(form.entry), size = parseFloat(form.size);
    if (!isFinite(entry) || !isFinite(size) || size <= 0) return;
    setTrades((p) => [{ id: `${Date.now()}`, instId: form.instId, dir: form.dir, entry, size, note: form.note.trim(), openedAt: new Date().toISOString().slice(0, 10), exit: null }, ...p]);
    setForm(emptyForm);
  };
  const close = (id) => {
    const px = parseFloat(closing[id]);
    if (!isFinite(px)) return;
    setTrades((p) => p.map((t) => t.id === id ? { ...t, exit: px, closedAt: new Date().toISOString().slice(0, 10) } : t));
    setClosing((c) => { const n = { ...c }; delete n[id]; return n; });
  };
  const remove = (id) => setTrades((p) => p.filter((t) => t.id !== id));

  const pnl = (t, mark) => {
    const ref = t.exit != null ? t.exit : mark;
    if (ref == null) return null;
    return (t.dir === "long" ? ref - t.entry : t.entry - ref) * t.size;
  };
  const realized = trades.filter((t) => t.exit != null).reduce((a, t) => a + (pnl(t) ?? 0), 0);
  const open = trades.filter((t) => t.exit == null);

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)" }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">
          <NotebookPen className="h-3.5 w-3.5" /> Trade journal
        </div>
        <div className="font-mono text-[10px]" style={{ color: "#6B7068" }}>
          realized <span style={{ color: realized >= 0 ? UP : DOWN }}>{realized >= 0 ? "+" : ""}{realized.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      {/* Add form */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
        <select value={form.instId} onChange={(e) => setForm((f) => ({ ...f, instId: e.target.value }))}
          className="col-span-2 rounded-lg border px-2 py-1.5 text-[12px] text-ink sm:col-span-2" style={{ borderColor: "#262B27", background: "#12150F" }}>
          {INSTRUMENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
        <select value={form.dir} onChange={(e) => setForm((f) => ({ ...f, dir: e.target.value }))}
          className="rounded-lg border px-2 py-1.5 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }}>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
        <input type="number" inputMode="decimal" placeholder="Entry" value={form.entry} onChange={(e) => setForm((f) => ({ ...f, entry: e.target.value }))}
          className="rounded-lg border px-2 py-1.5 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }} />
        <input type="number" inputMode="decimal" placeholder="Size" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
          className="rounded-lg border px-2 py-1.5 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }} />
        <button onClick={add} className="flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[12px] font-medium transition-colors"
          style={{ borderColor: tint("#7FB58A", 0.5), color: "#7FB58A", background: tint("#7FB58A", 0.1) }}>
          <Plus className="h-3.5 w-3.5" /> Log
        </button>
      </div>

      {trades.length === 0 ? (
        <div className="py-4 text-center font-mono text-[11px]" style={{ color: "#565B54" }}>No trades logged yet. Enter entry price and size in the instrument's quoted units.</div>
      ) : (
        <div className="space-y-1.5">
          {trades.map((t) => {
            const inst = instById[t.instId];
            const mark = data[t.instId]?.last ?? null;
            const p = pnl(t, mark);
            const isOpen = t.exit == null;
            const pc = p == null ? FLAT : p >= 0 ? UP : DOWN;
            return (
              <div key={t.id} className="rounded-lg border px-3 py-2" style={{ borderColor: "#1E231F", background: "rgba(12,14,13,0.4)" }}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: t.dir === "long" ? UP : DOWN }}>{t.dir}</span>
                  <span className="text-[12.5px] font-medium text-ink">{inst?.label ?? t.instId}</span>
                  <span className="font-mono text-[10px]" style={{ color: "#6B7068" }}>{t.size} @ {fmtPrice(inst, t.entry)}</span>
                  {t.exit != null && <span className="font-mono text-[10px]" style={{ color: "#6B7068" }}>→ {fmtPrice(inst, t.exit)}</span>}
                  <span className="ml-auto font-mono text-[11px]" style={{ color: pc }}>
                    {p == null ? "—" : `${p >= 0 ? "+" : ""}${p.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`}
                    {isOpen && p != null && <span style={{ color: "#565B54" }}> unreal.</span>}
                  </span>
                  <button onClick={() => remove(t.id)} className="shrink-0 opacity-50 transition-opacity hover:opacity-100"><Trash2 className="h-3.5 w-3.5" style={{ color: "#8A8F88" }} /></button>
                </div>
                {t.note && <div className="mt-1 text-[11px] leading-snug text-muted">{t.note}</div>}
                {isOpen && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <input type="number" inputMode="decimal" placeholder="Exit price" value={closing[t.id] ?? ""} onChange={(e) => setClosing((c) => ({ ...c, [t.id]: e.target.value }))}
                      className="w-28 rounded-md border px-2 py-1 text-[11px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }} />
                    <button onClick={() => close(t.id)} className="rounded-md border px-2 py-1 font-mono text-[10px] transition-colors" style={{ borderColor: "#2C332F", color: "#8A8F88" }}>Close</button>
                    {mark != null && <span className="font-mono text-[9px]" style={{ color: "#565B54" }}>mark {fmtPrice(inst, mark)}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {open.length > 0 && (
        <p className="mt-2.5 font-mono text-[9px]" style={{ color: "#565B54" }}>
          Open P&amp;L uses the latest feed price where available. Enter your note/thesis when logging — reviewing it later is where the edge compounds.
        </p>
      )}
    </div>
  );
}
