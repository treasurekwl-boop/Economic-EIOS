import { useState } from "react";
import { Layers, Zap, RotateCcw, Lock, Unlock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, ReferenceLine, Tooltip,
} from "recharts";
import { useEngine } from "../../context/EngineContext.jsx";
import { useScenario, impactOf } from "../../context/ScenarioContext.jsx";
import { SECTORS, SECTOR_PRESETS } from "../../config/model.js";
import { SECTOR_COLORS, tint } from "../../config/palette.js";

// Which sectors map onto a node in the economic brain (for scenario ripples).
const SECTOR_NODE = { agri: "agri", mining: "mining", manuf: "manuf", util: "energy", constr: "constr", fin: "finance", govt: "G" };
import { CONCEPTS, INSIGHTS } from "../../config/learn.js";
import { tnum, signed, randOfPP } from "../../lib/format.js";
import Stat from "../ui/Stat.jsx";
import InfoTip from "../ui/InfoTip.jsx";
import Insight from "../ui/Insight.jsx";

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const color = SECTOR_COLORS[d.payload.id] ?? "#6FBDB4";
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 font-mono text-xs shadow-card-hover" style={{ borderColor: `${color}55` }}>
      <div className="flex items-center gap-1.5 uppercase tracking-wider text-muted-2">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {d.payload.name}
      </div>
      <div className="mt-0.5 font-bold" style={{ color: d.value < 0 ? "#D8735E" : color }}>
        {d.value > 0 ? "+" : ""}{d.value.toFixed(2)}pp to GDP
      </div>
    </div>
  );
};

export default function Sectors() {
  const { setpoint, sectorGrowth, setSectorGrowth, effective } = useEngine();
  const { scenario } = useScenario();
  const [locked, setLocked] = useState(Object.fromEntries(SECTORS.map((s) => [s.id, false])));

  const rows = SECTORS.map((s) => ({ ...s, g: sectorGrowth[s.id], contrib: (s.weight / 100) * sectorGrowth[s.id] }));
  const gdp = rows.reduce((a, r) => a + r.contrib, 0);
  const shortfall = setpoint - gdp;
  const onTarget = shortfall <= 0.005;

  const unlockedWeight = SECTORS.reduce((a, s) => a + (locked[s.id] ? 0 : s.weight / 100), 0);
  const bump = unlockedWeight > 0 ? shortfall / unlockedWeight : Infinity;
  const soloNeed = (s) => sectorGrowth[s.id] + shortfall / (s.weight / 100);

  const setG = (id, v) => setSectorGrowth((p) => ({ ...p, [id]: v }));
  const reset = () => { setSectorGrowth({ ...SECTOR_PRESETS.baseline.g }); setLocked(Object.fromEntries(SECTORS.map((s) => [s.id, false]))); };
  const solve = () => {
    if (!isFinite(bump)) return;
    setSectorGrowth((prev) => {
      const next = { ...prev };
      SECTORS.forEach((s) => { if (!locked[s.id]) next[s.id] = +(prev[s.id] + bump).toFixed(2); });
      return next;
    });
  };

  const chartData = rows.map((r) => ({ id: r.id, name: r.short, contrib: +r.contrib.toFixed(3) }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
            <Layers className="h-3.5 w-3.5" /> Production side
          </div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">GDP is the weighted sum of its sectors</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted">
            Each sector has its own color and its own{" "}
            <InfoTip concept={CONCEPTS.gva} color="#A99BF5" align="left">weight</InfoTip>
            {" "}— drag the growth sliders and watch where 3% actually has to come from.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SECTOR_PRESETS).map(([k, p]) => (
            <button
              key={k}
              onClick={() => setSectorGrowth({ ...p.g })}
              className="rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[12px] text-muted transition-all hover:border-muted-2 hover:text-ink"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Setpoint" value={`≥${setpoint.toFixed(1)}%`} tone="amber" />
        <Stat label="GDP growth" value={`${gdp.toFixed(2)}%`} tone={onTarget ? "ok" : "data"} />
        <Stat label="Shortfall" value={onTarget ? "MET" : `${shortfall.toFixed(2)}pp`} tone={onTarget ? "ok" : "alert"} />
        <Stat label="Output gap (R)" value={onTarget ? "—" : randOfPP(shortfall, effective.gdpLevel)} tone={onTarget ? "muted" : "alert"} sub="≈ R73bn per pp" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Table */}
        <section className="lg:col-span-3">
          <div className="rounded-xl border border-line overflow-hidden" style={{ background: 'linear-gradient(145deg, #131614 0%, #101311 100%)' }}>
            <div className="grid grid-cols-[1fr_52px_116px_64px] items-center gap-2 border-b border-line px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-2" style={{ background: 'rgba(12,14,13,0.4)' }}>
              <span>Sector</span><span className="text-right">Weight</span><span className="text-center">Growth %</span><span className="text-right">→ pp</span>
            </div>
            {rows.map((r) => {
              const drag = r.contrib < 0;
              const isLocked = locked[r.id];
              const color = SECTOR_COLORS[r.id];
              const impact = impactOf(scenario, SECTOR_NODE[r.id]);
              return (
                <div
                  key={r.id}
                  className={`group grid grid-cols-[1fr_52px_116px_64px] items-center gap-2 border-b border-line/40 px-3 py-2.5 last:border-0 transition-colors hover:bg-white/[0.02] ${isLocked ? "opacity-60" : ""}`}
                  style={{ boxShadow: `inset 2px 0 0 ${color}`, background: impact ? tint(impact.color, 0.07) : "transparent" }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setLocked((p) => ({ ...p, [r.id]: !p[r.id] }))} className={`shrink-0 transition-colors ${isLocked ? "text-signal" : "text-muted-2 hover:text-muted"}`}>
                        {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      </button>
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
                      <span className="truncate text-[13px] text-ink">{r.name}</span>
                      {impact && (
                        <span className="shrink-0 font-mono text-[10px]" style={{ color: impact.color }} title="Affected by the active scenario">{impact.glyph}</span>
                      )}
                    </div>
                    <div className="pl-[26px] font-mono text-[10px] text-muted-2">solo to target: {soloNeed(r).toFixed(1)}%</div>
                  </div>
                  <span className="text-right font-mono text-[12px] text-muted" style={tnum}>{r.weight.toFixed(1)}%</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range" min={-10} max={12} step={0.1} value={r.g} disabled={isLocked}
                      onChange={(e) => setG(r.id, +e.target.value)}
                      className="w-full"
                      style={{ accentColor: color }}
                    />
                    <span className="w-9 shrink-0 text-right font-mono text-[12px] text-ink" style={tnum}>{r.g.toFixed(1)}</span>
                  </div>
                  <span className="text-right font-mono text-[12px] font-bold" style={{ ...tnum, color: drag ? "#D8735E" : color }}>{signed(r.contrib, 2)}</span>
                </div>
              );
            })}
            <div className="grid grid-cols-[1fr_52px_116px_64px] items-center gap-2 border-t border-line px-3 py-3" style={{ background: 'rgba(12,14,13,0.5)' }}>
              <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">GDP growth</span><span /><span />
              <span className={`text-right font-mono text-sm font-bold ${onTarget ? "text-data" : "text-signal"}`} style={tnum}>{gdp.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3" style={{ background: 'linear-gradient(145deg, #131614 0%, #101311 100%)' }}>
            <div className="text-[12px] text-muted">
              {onTarget ? <span className="text-data font-medium">Target met. This mix produces ≥3%.</span>
                : isFinite(bump) ? <>To close <span className="font-mono text-signal" style={tnum}>{shortfall.toFixed(2)}pp</span>, every unlocked sector must grow <span className="font-mono text-data" style={tnum}>{signed(bump)}pp</span> faster.</>
                : <span className="text-alert">All sectors locked — nothing to solve with.</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-muted-2"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
              <button
                onClick={solve}
                disabled={onTarget || !isFinite(bump)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-base transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #C6A15B, #CC8C00)', boxShadow: '0 0 16px rgba(198,161,91,0.3)' }}
              >
                <Zap className="h-3.5 w-3.5" /> Solve to 3%
              </button>
            </div>
          </div>
        </section>

        {/* Chart */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-line p-4" style={{ background: 'linear-gradient(145deg, #131614 0%, #101311 100%)' }}>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-2">Contribution to GDP growth (pp)</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 6, right: 14, top: 4, bottom: 4 }}>
                <XAxis type="number" tick={{ fill: "#6B7068", fontSize: 10 }} stroke="#232823" />
                <YAxis type="category" dataKey="name" tick={{ fill: "#8A8F88", fontSize: 10 }} stroke="#232823" width={54} />
                <ReferenceLine x={0} stroke="#2A2F2A" />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="contrib" radius={[0, 3, 3, 0]}>
                  {chartData.map((d, i) => (<Cell key={i} fill={d.contrib < 0 ? "#D8735E" : SECTOR_COLORS[d.id]} opacity={0.9} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 border-t border-line/60 pt-2.5 text-[11px] leading-snug text-muted-2">
              Same colors as the table. Bars left of zero are a <span className="text-alert">drag</span> on growth.
            </p>
          </div>

          <div className="mt-3">
            <Insight color="#A99BF5" label="Why weights matter">
              {INSIGHTS.weights}
            </Insight>
          </div>
        </section>
      </div>
    </div>
  );
}
