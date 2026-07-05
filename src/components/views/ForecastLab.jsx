import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, ChevronDown, BookOpen } from "lucide-react";
import { INSTRUMENTS } from "../../config/desk.js";
import {
  randomWalk, driftForecast, holt, arForecast, garch11, backtest, combine,
} from "../../lib/forecast.js";
import { tint } from "../../config/palette.js";

const instById = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i]));
const fmt = (inst, v) => {
  if (v == null || !isFinite(v)) return "—";
  if (inst?.fmt === "R") return `R${v.toFixed(inst.dp)}`;
  if (inst?.fmt === "$") return `$${Math.round(v).toLocaleString("en-US")}`;
  if (inst?.fmt === "ZAc") return `${Math.round(v).toLocaleString("en-ZA")}c`;
  return v.toLocaleString("en-ZA", { maximumFractionDigits: inst?.dp ?? 2 });
};

function compute(closes, h) {
  if (closes.length < 40) return null;
  const dr = driftForecast(closes, h), ho = holt(closes, h), ar = arForecast(closes, 5, 1, h);
  const comb = combine([dr, ho, ar]);
  const g = garch11(closes);
  let band = null;
  if (g) {
    const vp = g.forecastVar(h); let cum = 0;
    band = comb.map((p, k) => { cum += vp[k]; const sd = Math.sqrt(cum); return { lo: p * Math.exp(-1.645 * sd), hi: p * Math.exp(1.645 * sd) }; });
  }
  const methods = [
    ["Random walk", (c, H) => randomWalk(c, H)],
    ["Drift", (c, H) => driftForecast(c, H)],
    ["Holt smoothing", (c, H) => holt(c, H)],
    ["AR(5) · ARIMA(5,1,0)", (c, H) => arForecast(c, 5, 1, H)],
    ["Combination", (c, H) => combine([driftForecast(c, H), holt(c, H), arForecast(c, 5, 1, H)])],
  ];
  const bt = methods.map(([name, fn]) => ({ name, ...(backtest(closes, fn, 1) || {}) }));
  return { dr, ho, ar, comb, g, band, bt };
}

export default function ForecastLab({ data }) {
  const [instId, setInstId] = useState("usdzar");
  const [h, setH] = useState(10);
  const inst = instById[instId];
  const closes = data?.[instId]?.series?.map((s) => s[1]) ?? [];
  const F = useMemo(() => compute(closes, h), [instId, h, closes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const chart = useMemo(() => {
    if (!F) return [];
    const tail = 80;
    const hist = closes.slice(-tail);
    const rows = hist.map((p, i) => ({ x: i, hist: p }));
    const base = hist.length - 1;
    rows[base] = { ...rows[base], fc: closes[closes.length - 1], lo: closes[closes.length - 1], hi: closes[closes.length - 1] };
    F.comb.forEach((p, k) => rows.push({ x: base + 1 + k, fc: p, lo: F.band?.[k]?.lo, hi: F.band?.[k]?.hi }));
    return rows;
  }, [F, closes]);

  return (
    <div className="animate-fade-up">
      <div className="mb-4">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#7FB58A" }}>
          <TrendingUp className="h-3.5 w-3.5" /> Forecast lab
        </div>
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-muted">
          Classical forecasts on the instrument's own history — benchmarks, exponential smoothing, AR/ARIMA and a GARCH
          volatility band — each honestly backtested. Real methods on your EOD feed, not advice.
        </p>
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>Instrument</span>
          <select value={instId} onChange={(e) => setInstId(e.target.value)} className="mt-0.5 block rounded-md border px-2 py-1 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }}>
            {INSTRUMENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>Horizon · {h} days</span>
          <input type="range" min={5} max={30} value={h} onChange={(e) => setH(+e.target.value)} className="mt-1.5 block w-40 accent-teal" />
        </label>
      </div>

      {!F ? (
        <div className="rounded-xl border p-4 font-mono text-[11px]" style={{ borderColor: "#232823", color: "#565B54" }}>
          Not enough history for {inst?.label ?? "this instrument"} yet — the forecast lab needs the live feed (≥40 daily closes). Activate it in the Workbench tab.
        </div>
      ) : (
        <>
          <div className="rounded-xl border p-3" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-medium text-ink">{inst?.label} · {h}-day forecast</span>
              <div className="flex gap-3 font-mono text-[9px]">
                <span style={{ color: "#8A8F88" }}>— history</span>
                <span style={{ color: "#7FB58A" }}>— combined</span>
                <span style={{ color: "#6FBDB4" }}>· · 90% band</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chart} margin={{ left: 4, right: 12, top: 8, bottom: 2 }}>
                <XAxis dataKey="x" tick={false} stroke="#232823" height={2} />
                <YAxis tick={{ fill: "#6B7068", fontSize: 10 }} stroke="#232823" width={44} domain={["auto", "auto"]} />
                <ReferenceLine x={chart.length - h - 1} stroke="#3A403A" strokeDasharray="3 3" />
                <Line dataKey="hist" stroke="#8A8F88" strokeWidth={1.8} dot={false} isAnimationActive={false} connectNulls />
                <Line dataKey="hi" stroke="#6FBDB4" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls />
                <Line dataKey="lo" stroke="#6FBDB4" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} connectNulls />
                <Line dataKey="fc" stroke="#7FB58A" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-1 grid grid-cols-2 gap-2 border-t pt-2.5 sm:grid-cols-4" style={{ borderColor: "#1E231F" }}>
              <Stat label={`Point (${h}d)`} value={fmt(inst, F.comb[h - 1])} color="#7FB58A" />
              <Stat label="90% low" value={fmt(inst, F.band?.[h - 1]?.lo)} color="#D8735E" />
              <Stat label="90% high" value={fmt(inst, F.band?.[h - 1]?.hi)} color="#7FB58A" />
              {F.g && <Stat label="Daily vol (GARCH)" value={`${(F.g.dailyVol * 100).toFixed(2)}%`} color="#C6A15B" />}
            </div>
          </div>

          {/* Backtest track record */}
          <div className="mt-4 rounded-xl border p-3" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">Backtest · rolling 1-day-ahead</div>
            <p className="mb-2.5 text-[11.5px] leading-relaxed" style={{ color: "#9A978E" }}>
              MASE &lt; 1 means the method beat the naive random-walk benchmark on out-of-sample history. For prices this is genuinely hard — that's the honest signal, not a flaw.
            </p>
            <div className="space-y-1">
              {F.bt.map((b) => {
                const beats = b.mase != null && b.mase < 1;
                return (
                  <div key={b.name} className="flex items-center gap-2 text-[12px]">
                    <span className="w-[150px] shrink-0 truncate text-ink">{b.name}</span>
                    <span className="w-[86px] shrink-0 font-mono text-[10px]" style={{ color: "#6B7068" }}>RMSE {b.rmse != null ? b.rmse.toPrecision(3) : "—"}</span>
                    <span className="w-[86px] shrink-0 font-mono text-[10px]" style={{ color: "#6B7068" }}>MAE {b.mae != null ? b.mae.toPrecision(3) : "—"}</span>
                    <span className="ml-auto font-mono text-[11px]" style={{ color: b.mase == null ? "#565B54" : beats ? "#7FB58A" : "#D8735E" }}>
                      MASE {b.mase != null ? b.mase.toFixed(3) : "—"}{beats ? " ✓" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {F.g && (
            <p className="mt-3 font-mono text-[9.5px] leading-relaxed" style={{ color: "#565B54" }}>
              GARCH(1,1): α={F.g.alpha.toFixed(2)}, β={F.g.beta.toFixed(2)}, persistence {F.g.persistence.toFixed(3)} — vol mean-reverts toward {(F.g.uncondVol * 100).toFixed(2)}%/day. High persistence = shocks to volatility fade slowly.
            </p>
          )}

          <Playbook />

          <p className="mt-4 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>
            The brief's rule: price-return forecasts are low signal-to-noise (MASE near 1), volatility is more forecastable (the band), and combination + rolling backtests are the discipline. Heavier methods (BVAR, dynamic factor, MCMC, LSTM/Transformer) need multivariate panels or a compute backend the app doesn't have. Modelled estimates, not advice.
          </p>
        </>
      )}
    </div>
  );
}

function Playbook() {
  const [open, setOpen] = useState(false);
  const rows = [
    ["Asset-return (mean)", "Keep expectations low; benchmarks are hard to beat. Shrinkage + strict validation."],
    ["Volatility / risk", "The forecastable part — GARCH/EGARCH, regime-switching, realized-vol models."],
    ["Macro series", "ARIMA + small VAR/BVAR first; escalate to factor models with many indicators."],
    ["Nowcasting", "Mixed-frequency: dynamic factor models, MIDAS, bridge equations."],
    ["Yield curves", "Domain structure: dynamic Nelson–Siegel over maturities, not per-maturity ARIMA."],
    ["Always", "Transparent benchmark set, rolling-origin backtests, and keep forecast combination on the table."],
  ];
  return (
    <div className="mt-4 overflow-hidden rounded-xl border" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-2.5 text-left">
        <span className="flex items-center gap-2 text-[13px] font-medium text-ink"><BookOpen className="h-3.5 w-3.5" style={{ color: "#7FB58A" }} /> Forecasting playbook</span>
        <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "#565B54", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="border-t px-4 py-3" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>
          <div className="space-y-1.5">
            {rows.map(([a, b]) => (
              <div key={a} className="flex gap-2.5 text-[12px] leading-relaxed">
                <span className="w-[150px] shrink-0 font-medium text-ink">{a}</span>
                <span className="flex-1" style={{ color: "#9A978E" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{label}</div>
      <div className="font-display text-[16px]" style={{ color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
