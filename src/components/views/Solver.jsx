import {
  Target, Zap, RotateCcw, Lock, Unlock, Landmark, Factory, Globe,
  TrendingUp, AlertTriangle, CheckCircle2, Briefcase, ArrowUpRight, Share2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, ReferenceLine, Tooltip,
} from "recharts";
import { useEngine } from "../../context/EngineContext.jsx";
import { runEngine, solveToTarget } from "../../lib/engine.js";
import { LEVERS, LEVER_DEFAULTS, SOLVER_PRESETS, PARAMS } from "../../config/model.js";
import { CONCEPTS } from "../../config/learn.js";
import { tnum, signed, randOfPP } from "../../lib/format.js";
import Stat from "../ui/Stat.jsx";
import InfoTip from "../ui/InfoTip.jsx";

const GROUP_ICON = { repo: Landmark, gG: Landmark, gI: Factory, gX: Globe };
// Each lever is a node in the economic brain — moving it can fire the real cascade.
const LEVER_NODE = { repo: "repo", gG: "G", gI: "I", gX: "X" };
const LEVER_CONCEPT = { repo: CONCEPTS.repo };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 font-mono text-xs shadow-card-hover">
      <div className="text-muted-2 uppercase tracking-wider">{d.payload.name}</div>
      <div className={`mt-0.5 font-bold ${d.value < 0 ? "text-alert" : d.payload.name === "Reform" ? "text-signal" : "text-data"}`}>
        {d.value > 0 ? "+" : ""}{d.value.toFixed(2)}pp
      </div>
    </div>
  );
};

export default function Solver({ onNavigate, onOpenGraph }) {
  const {
    setpoint, levers, setLevers, assumptions, setAssumptions,
    locked, setLocked, reformUplift, effective,
  } = useEngine();

  const out = runEngine(levers, assumptions, reformUplift, { shares: effective.shares });
  const shortfall = setpoint - out.gTotal;
  const onTarget = shortfall <= 0.005;
  const inflOK = out.infl <= 4.5;
  const durable = out.gPot >= 2.8;

  const verdict = !onTarget
    ? { tone: "warn", title: `Below target by ${shortfall.toFixed(2)}pp`, msg: `${randOfPP(shortfall, effective.gdpLevel)} of output is missing at these settings.` }
    : durable && inflOK
    ? { tone: "ok", title: "On target — and durable", msg: `Potential (${out.gPot.toFixed(2)}%) supports it; inflation stays near target.` }
    : { tone: "bad", title: "On target — but borrowed", msg: `Potential is only ${out.gPot.toFixed(2)}% and inflation runs ${out.infl.toFixed(1)}%. Overheating.` };

  const verdictStyle = {
    ok:   { border: 'rgba(127,181,138,0.25)', bg: 'rgba(127,181,138,0.07)' },
    bad:  { border: 'rgba(216,115,94,0.25)',  bg: 'rgba(216,115,94,0.07)'  },
    warn: { border: 'rgba(198,161,91,0.25)',  bg: 'rgba(198,161,91,0.07)' },
  }[verdict.tone];

  const setLever = (id, v) => setLevers((p) => ({ ...p, [id]: v }));
  const toggleLock = (id) => setLocked((p) => ({ ...p, [id]: !p[id] }));
  const solve = () => setLevers(solveToTarget(levers, assumptions, reformUplift, locked, { shares: effective.shares }));

  const groups = ["Policy", "Investment & trade"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
            <Target className="h-3.5 w-3.5" /> Connected Solver
          </div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">Set levers, solve the inputs</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SOLVER_PRESETS).map(([k, p]) => (
            <button
              key={k}
              onClick={() => setLevers({ ...p.v })}
              className="rounded-lg border border-line bg-surface/60 px-3 py-1.5 text-[12px] text-muted transition-all hover:border-muted-2 hover:text-ink"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Setpoint" value={`≥${setpoint.toFixed(1)}%`} tone="amber" />
        <Stat label="GDP growth" value={`${out.gTotal.toFixed(2)}%`} tone={onTarget ? "ok" : "alert"} sub={`potential ${out.gPot.toFixed(2)}%`} />
        <Stat label="Inflation" value={`${out.infl.toFixed(1)}%`} tone={inflOK ? "ok" : "alert"} sub={inflOK ? "near target" : "above band"} />
        <Stat label="Net jobs" value={`${out.djobs >= 0 ? "+" : ""}${Math.round(out.djobs)}k`} tone={out.djobs >= PARAMS.NEW_ENTRANTS ? "ok" : "alert"} />
      </div>

      {/* Verdict */}
      <div
        className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: verdictStyle.bg, border: `1px solid ${verdictStyle.border}` }}
      >
        {verdict.tone === "ok"
          ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
          : <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${verdict.tone === "bad" ? "text-alert" : "text-signal"}`} />}
        <div>
          <div className={`text-[13px] font-semibold ${verdict.tone === "ok" ? "text-ok" : verdict.tone === "bad" ? "text-alert" : "text-signal"}`}>{verdict.title}</div>
          <div className="text-[12px] leading-snug text-muted">{verdict.msg}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Levers panel */}
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-2">Levers — what you set</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setLevers({ ...LEVER_DEFAULTS })}
                className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-muted-2 hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
              <button
                onClick={solve}
                disabled={onTarget}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-base transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #C6A15B, #CC8C00)', boxShadow: '0 0 16px rgba(198,161,91,0.3)' }}
              >
                <Zap className="h-3.5 w-3.5" /> Solve to 3%
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-line p-5 space-y-5" style={{ background: 'linear-gradient(145deg, #131614 0%, #101311 100%)' }}>
            {groups.map((g) => (
              <div key={g}>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-2">{g}</div>
                <div className="space-y-4">
                  {LEVERS.filter((l) => l.group === g).map((l) => {
                    const Icon = GROUP_ICON[l.id];
                    const isLocked = locked[l.id];
                    return (
                      <div key={l.id} className={`transition-opacity ${isLocked ? "opacity-60" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleLock(l.id)}
                              className={`rounded transition-colors ${isLocked ? "text-signal" : "text-muted-2 hover:text-muted"}`}
                            >
                              {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                            </button>
                            <Icon className="h-3.5 w-3.5 text-muted-2" />
                            <span className="text-[13px] text-ink">
                              {LEVER_CONCEPT[l.id]
                                ? <InfoTip concept={LEVER_CONCEPT[l.id]} color={l.invert ? "#C6A15B" : "#6FBDB4"} align="left">{l.name}</InfoTip>
                                : l.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono text-[13px] font-semibold ${l.invert ? "text-signal" : "text-data"}`}
                              style={tnum}
                            >
                              {levers[l.id].toFixed(2)}{l.unit}
                            </span>
                            {onOpenGraph && LEVER_NODE[l.id] && (
                              <button
                                onClick={() => onOpenGraph(LEVER_NODE[l.id], levers[l.id] > LEVER_DEFAULTS[l.id] ? 1 : levers[l.id] < LEVER_DEFAULTS[l.id] ? -1 : 1)}
                                title="Trace this lever's cascade on the Intelligence graph"
                                className="text-muted-2 transition-colors hover:text-purple"
                              >
                                <Share2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="range"
                          min={l.min} max={l.max} step={l.step}
                          value={levers[l.id]}
                          disabled={isLocked}
                          onChange={(e) => setLever(l.id, +e.target.value)}
                          className={`mt-1.5 w-full ${l.invert ? "accent-amber" : "accent-teal"}`}
                        />
                        <div className="mt-0.5 pl-5 font-mono text-[10px] text-muted-2">{l.note}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Structural lever */}
            <button
              onClick={() => onNavigate("diagnosis")}
              className="flex w-full items-center justify-between rounded-lg border border-line/60 bg-base/40 px-3 py-3 text-left transition-all hover:border-data/30"
            >
              <div>
                <div className="flex items-center gap-2 text-[13px] text-ink">
                  <TrendingUp className="h-3.5 w-3.5 text-data" /> Structural / reform
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-2">set in the Diagnosis tab</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[14px] font-bold text-data">+{reformUplift.toFixed(1)}pp</span>
                <ArrowUpRight className="h-4 w-4 text-muted-2" />
              </div>
            </button>

            {/* Assumptions */}
            <div className="border-t border-line/60 pt-4">
              <div className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-signal/70">
                Model assumptions <span className="text-muted-2">— the numbers doing the work</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Mini label="Neutral real rate" value={assumptions.neutral} set={(v) => setAssumptions((p) => ({ ...p, neutral: v }))} min={1} max={5} step={0.25} unit="%" />
                <Mini label="Invest. sensitivity β" value={assumptions.thetaI} set={(v) => setAssumptions((p) => ({ ...p, thetaI: v }))} min={0.2} max={1.5} step={0.1} unit="" />
                <Mini label="Supply price shock" value={assumptions.shock} set={(v) => setAssumptions((p) => ({ ...p, shock: v }))} min={-1} max={2} step={0.1} unit="pp" />
              </div>
            </div>
          </div>
        </section>

        {/* Results panel */}
        <section className="space-y-4">
          <div className="rounded-xl border border-line p-4" style={{ background: 'linear-gradient(145deg, #131614 0%, #101311 100%)' }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-2">
                <InfoTip concept={CONCEPTS.identity} color="#6FBDB4" align="left">GDP = C + I + G + X − M</InfoTip>
              </h2>
              <span className="rounded-md border border-ok/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ok">exact</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={out.comps} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#8A8F88", fontSize: 11 }} stroke="#232823" />
                <YAxis tick={{ fill: "#6B7068", fontSize: 10 }} stroke="#232823" width={28} />
                <ReferenceLine y={0} stroke="#2A2F2A" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                  {out.comps.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.v < 0 ? "#D8735E" : d.name === "Reform" ? "#C6A15B" : "#6FBDB4"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-between border-t border-line/60 pt-2.5 text-[12px]">
              <span className="text-muted">contributions sum to</span>
              <span className="font-mono font-bold text-signal" style={tnum}>{out.gTotal.toFixed(2)}% GDP growth</span>
            </div>
          </div>

          <div className="rounded-xl border border-line p-4" style={{ background: 'linear-gradient(145deg, #131614 0%, #101311 100%)' }}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-2">What falls out</h2>
              <span className="rounded-md border border-signal/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-signal">model</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Out icon={TrendingUp} label="Potential growth" concept={CONCEPTS.potential} value={`${out.gPot.toFixed(2)}%`} note="the speed limit — lifted by investment + reform" tone={out.gPot >= 2.8 ? "ok" : "muted"} />
              <Out icon={AlertTriangle} label="Output gap" concept={CONCEPTS.outputGap} value={`${signed(out.gap)}pp`} note={out.gap > 0.6 ? "running hot" : "contained"} tone={out.gap > 0.6 ? "alert" : "ok"} />
              <Out icon={Landmark} label="Inflation" concept={CONCEPTS.phillips} value={`${out.infl.toFixed(1)}%`} note={inflOK ? "within reach of 3% target" : "breaks the target band"} tone={inflOK ? "ok" : "alert"} />
              <Out icon={Briefcase} label="Net jobs" concept={CONCEPTS.netJobs} value={`${out.djobs >= 0 ? "+" : ""}${Math.round(out.djobs)}k`} note={out.djobs >= PARAMS.NEW_ENTRANTS ? "absorbs new entrants" : "too few for entrants"} tone={out.djobs >= PARAMS.NEW_ENTRANTS ? "ok" : "alert"} />
            </div>
            <p className="mt-3 border-t border-line/60 pt-3 text-[11px] leading-snug text-muted-2">
              The chain: <span className="text-muted">repo</span> → real rate → investment &amp; consumption → <span className="text-muted">growth</span> → output gap → <span className="text-muted">inflation</span> &amp; <span className="text-muted">jobs</span>. Investment and reform also raise <span className="text-muted">potential</span> — the only way 3% becomes durable.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Out({ icon: Icon, label, value, note, tone, concept }) {
  const config = {
    ok:   { text: "text-ok",    bg: "rgba(127,181,138,0.06)",  border: "rgba(127,181,138,0.15)", tip: "#7FB58A" },
    alert:{ text: "text-alert", bg: "rgba(216,115,94,0.06)",   border: "rgba(216,115,94,0.15)",  tip: "#D8735E" },
    muted:{ text: "text-ink",   bg: "rgba(12,14,13,0.5)",     border: "rgba(35,40,35,0.8)",    tip: "#6FBDB4" },
  }[tone];
  return (
    <div className="rounded-lg px-3 py-2.5 transition-colors" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-2">
        <Icon className="h-3 w-3" />
        {concept ? <InfoTip concept={concept} color={config.tip} align="left">{label}</InfoTip> : label}
      </div>
      <div className={`mt-1 font-mono text-lg font-bold ${config.text}`} style={tnum}>{value}</div>
      <div className="text-[10px] leading-tight text-muted-2">{note}</div>
    </div>
  );
}

function Mini({ label, value, set, min, max, step, unit }) {
  return (
    <div className="rounded-lg border border-line/60 bg-base/50 px-2.5 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted">{label}</span>
        <span className="font-mono text-[12px] font-semibold text-signal" style={tnum}>{value.toFixed(2)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} className="mt-1.5 w-full accent-amber" />
    </div>
  );
}
