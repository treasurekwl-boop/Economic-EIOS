import { CheckCircle2, AlertTriangle, ArrowRight, SlidersHorizontal, Stethoscope, Layers, Users, Gauge as GaugeIcon } from "lucide-react";
import { useEngine } from "../../context/EngineContext.jsx";
import { runEngine } from "../../lib/engine.js";
import { CONSTRAINTS, PARAMS } from "../../config/model.js";
import { CONCEPTS } from "../../config/learn.js";
import { tint } from "../../config/palette.js";
import { tnum, randOfPP } from "../../lib/format.js";
import Stat from "../ui/Stat.jsx";
import Gauge from "../ui/Gauge.jsx";
import InfoTip from "../ui/InfoTip.jsx";
import LivePrices from "../ui/LivePrices.jsx";

const GOLD = "#C6A15B", TEAL = "#6FBDB4", SAGE = "#7FB58A", CLAY = "#D8735E", VIOLET = "#A99BF5";

export default function Overview({ onNavigate }) {
  const { setpoint, levers, assumptions, reformUplift, reforms, country, effective, dataStatus, fx } = useEngine();
  const out = runEngine(levers, assumptions, reformUplift, { shares: effective.shares });
  const shortfall = setpoint - out.gTotal;
  const onTarget = shortfall <= 0.005;
  const inflOK = out.infl <= 4.5;
  const durable = out.gPot >= 2.8;
  const fixedCount = CONSTRAINTS.filter((c) => reforms[c.id]).length;

  const verdict = !onTarget
    ? { tone: "warn", title: `Below target by ${shortfall.toFixed(2)}pp.`, msg: `At current settings output grows ${out.gTotal.toFixed(2)}% — roughly ${randOfPP(shortfall, effective.gdpLevel)} of GDP left on the table.` }
    : durable && inflOK
    ? { tone: "ok", title: "On target — and durable.", msg: `Potential of ${out.gPot.toFixed(2)}% supports it and inflation stays near target. This 3% can be held.` }
    : { tone: "bad", title: "On target — but borrowed.", msg: `Growth reaches 3% on demand, but potential is only ${out.gPot.toFixed(2)}% and inflation runs ${out.infl.toFixed(1)}%. It won't last.` };
  const vColor = verdict.tone === "ok" ? SAGE : verdict.tone === "bad" ? CLAY : GOLD;

  const cards = [
    { id: "solver", icon: SlidersHorizontal, title: "Solver", tag: "Pull the levers", color: GOLD,
      desc: "What every lever — repo rate, spending, investment, exports — must be to hit 3%, and the inflation and jobs that fall out." },
    { id: "sectors", icon: Layers, title: "Sectors", tag: "Follow the money", color: TEAL,
      desc: "GDP is the weighted sum of ten sectors. See which ones actually carry the economy, and what a drought would cost." },
    { id: "diagnosis", icon: Stethoscope, title: "Diagnosis", tag: `${fixedCount} / ${CONSTRAINTS.length} fixed · +${reformUplift.toFixed(1)}pp`, color: VIOLET,
      desc: "The binding constraints on potential growth, and the minimum set of reforms for a durable three percent." },
  ];

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10 animate-fade-up">
      {/* Hero */}
      <div className="max-w-[660px]">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: GOLD }}>Engine Status</div>
        <h1 className="mt-3 font-display text-[32px] font-normal leading-[1.08] tracking-[-0.02em] sm:text-[42px]" style={{ color: "#F3F1EA" }}>
          The economy, solved <em className="not-italic" style={{ fontStyle: "italic", color: GOLD }}>backwards</em> from three percent.
        </h1>
        <p className="mt-4 text-[14.5px] leading-[1.7] text-muted">
          Rather than forecast where growth drifts, the engine fixes the{" "}
          <InfoTip concept={CONCEPTS.setpoint} color={GOLD} align="left"><span className="text-ink">{setpoint.toFixed(1)}% target</span></InfoTip>
          {" "}and solves for the levers that would reach it — maximising the probability of{" "}
          <span className="font-display italic text-ink">durable</span> growth, not a single good year.
        </p>
      </div>

      {/* Primary readout */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
        {/* Gauge card */}
        <div className="relative overflow-hidden rounded-2xl border p-6" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #141814 0%, #131614 40%, #101311)" }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-[70px]" style={{ background: "rgba(198,161,91,0.10)" }} />
          <div className="relative flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Output vs setpoint</span>
            <span className="rounded-md px-2 py-0.5 font-mono text-[9px] tracking-[0.06em]" style={{ border: "1px solid #2E241A", color: GOLD, background: "rgba(198,161,91,0.07)" }}>solved</span>
          </div>
          <div className="relative mt-5 flex items-end gap-4">
            <div className="font-display text-[64px] font-normal leading-[0.9] tracking-[-0.02em] sm:text-[76px]" style={{ ...tnum, color: onTarget ? SAGE : CLAY }}>
              {out.gTotal.toFixed(2)}<span className="text-[32px]" style={{ color: "#6B7068" }}>%</span>
            </div>
            <div className="pb-2">
              <div className="font-mono text-[11px]" style={{ color: "#6B7068" }}>setpoint</div>
              <div className="font-display text-[26px]" style={{ ...tnum, color: GOLD }}>≥ {setpoint.toFixed(1)}%</div>
            </div>
          </div>
          <div className="relative mt-6">
            <Gauge value={out.gTotal} setpoint={setpoint} min={-1} max={5} reached={onTarget} />
          </div>
          <div className="relative mt-5 flex items-start gap-3 border-t pt-4" style={{ borderColor: "#1E231F" }}>
            {verdict.tone === "ok"
              ? <CheckCircle2 className="mt-0.5 h-[15px] w-[15px] shrink-0" style={{ color: vColor }} strokeWidth={1.9} />
              : <AlertTriangle className="mt-0.5 h-[15px] w-[15px] shrink-0" style={{ color: vColor }} strokeWidth={1.9} />}
            <div className="text-[12.5px] leading-[1.55] text-muted">
              <span className="font-medium" style={{ color: vColor }}>{verdict.title}</span> {verdict.msg}
            </div>
          </div>
        </div>

        {/* Core idea card */}
        <div className="flex flex-col rounded-2xl border p-6" style={{ borderColor: "#232823", background: "linear-gradient(155deg, rgba(111,189,180,0.06), rgba(111,189,180,0.01) 55%, #101311)" }}>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEAL }}>
            <GaugeIcon className="h-[13px] w-[13px]" strokeWidth={2} /> The core idea
          </div>
          <p className="mt-4 font-display text-[21px] font-normal leading-[1.4] tracking-[-0.01em] text-ink">
            Every economy has a{" "}
            <InfoTip concept={CONCEPTS.potential} color={TEAL} align="left">
              <span style={{ fontStyle: "italic", color: TEAL }}>speed limit</span>
            </InfoTip>
            {" "}— its potential growth, near {PARAMS.POT_BASE.toFixed(1)}%.
          </p>
          <p className="mt-3.5 text-[13px] leading-[1.65] text-muted">
            Force output past it with a cheap repo rate and you buy one year of 3%, repaid in inflation. Raise the limit itself through reform, and 3% holds on its own.
          </p>
          <div className="mt-auto flex gap-5 pt-5">
            <div>
              <div className="font-display text-[24px] text-ink" style={tnum}>{out.gPot.toFixed(1)}%</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em]" style={{ color: "#565B54" }}>potential</div>
            </div>
            <div className="w-px" style={{ background: "#1E231F" }} />
            <div>
              <div className="font-display text-[24px]" style={{ ...tnum, color: TEAL }}>+{reformUplift.toFixed(1)}pp</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em]" style={{ color: "#565B54" }}>reforms so far</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Setpoint" value={`≥${setpoint.toFixed(1)}%`} tone="amber" />
        <Stat label="GDP growth (solved)" value={`${out.gTotal.toFixed(2)}%`} tone={onTarget ? "ok" : "alert"} sub={`potential ${out.gPot.toFixed(2)}%`} />
        <Stat label="Inflation" value={`${out.infl.toFixed(1)}%`} tone={inflOK ? "ok" : "alert"} sub={inflOK ? "near 3% target" : "above target band"} />
        <Stat label="Net jobs" value={`${out.djobs >= 0 ? "+" : ""}${Math.round(out.djobs)}k`} tone={out.djobs >= PARAMS.NEW_ENTRANTS ? "ok" : "alert"} sub={out.djobs >= PARAMS.NEW_ENTRANTS ? "unemployment falls" : "too few for entrants"} />
      </div>

      {/* Live markets — free 30-min FX + commodity feed */}
      <LivePrices />

      {/* Live rand — mobile only (the sidebar pins it on desktop) */}
      {fx && (
        <div className="panel mt-4 p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="dot-live" />
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: SAGE }}>Live · The Rand</span>
            </div>
            <span className="font-mono text-[10px]" style={{ color: "#565B54" }}>updates daily · {fx.source}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-3xl" style={{ ...tnum, color: TEAL }}>R{fx.usdZar.toFixed(2)}</span>
            <span className="font-mono text-sm" style={{ color: "#6B7068" }}>/ USD</span>
            {typeof fx.change30 === "number" && (
              <span className="ml-auto font-mono text-[11px]" style={{ color: fx.change30 > 0 ? CLAY : SAGE }}>
                {fx.change30 > 0 ? "▾" : "▴"} {Math.abs(fx.change30).toFixed(1)}% · 30d
              </span>
            )}
          </div>
        </div>
      )}

      {/* Latest actuals */}
      {dataStatus === "live" && effective.actuals && (
        <div className="mt-4 rounded-2xl border p-6" style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)" }}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-[17px] text-ink">Latest actuals</span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.08em]" style={{ color: "#565B54" }}>World Bank · data to {effective.asOf}</span>
            </div>
            <span className="rounded-md px-2 py-0.5 font-mono text-[9px] tracking-[0.06em]" style={{ border: "1px solid #262B27", color: "#6B7068" }}>measured, not solved</span>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[11px] border sm:grid-cols-4" style={{ background: "#1E231F", borderColor: "#1E231F" }}>
            <Actual label="GDP growth" value={effective.actuals.gdpGrowth} unit="%" />
            <Actual label="Inflation" value={effective.actuals.inflation} unit="%" />
            <Actual label="Investment / GDP" value={effective.actuals.investment} unit="%" />
            <Actual label="Unemployment" value={effective.actuals.unemployment} unit="%" />
          </div>
          <p className="mt-4 text-[12px] leading-[1.6]" style={{ color: "#565B54" }}>
            The measured figures. The engine solves a hypothetical — what the levers would have to produce. The distance between the two is precisely the work to be done.
          </p>
        </div>
      )}

      {/* Exploration */}
      <div className="mt-8">
        <div className="mb-3.5 flex items-baseline justify-between">
          <h2 className="font-display text-[20px] font-normal text-ink">Read the economy — three ways in</h2>
          <span className="hidden font-mono text-[10px] sm:inline" style={{ color: "#565B54" }}>levers · sectors · constraints</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => onNavigate(c.id)}
                className="group relative overflow-hidden rounded-[15px] border p-5 text-left transition-all duration-200"
                style={{ borderColor: tint(c.color, 0.28), background: "linear-gradient(160deg, #131614, #101311)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = tint(c.color, 0.55); e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = tint(c.color, 0.28); e.currentTarget.style.transform = ""; }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex rounded-[10px] p-2" style={{ background: tint(c.color, 0.13) }}>
                    <Icon className="h-[19px] w-[19px]" style={{ color: c.color }} strokeWidth={1.9} />
                  </div>
                  <ArrowRight className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-x-1" style={{ color: c.color }} strokeWidth={2} />
                </div>
                <div className="mt-4 font-display text-[19px] text-ink">{c.title}</div>
                <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.06em]" style={{ color: c.color }}>{c.tag}</div>
                <p className="mt-2.5 text-[12.5px] leading-[1.6] text-muted">{c.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Your Part */}
      <button
        onClick={() => onNavigate("citizen")}
        className="group relative mt-4 block w-full overflow-hidden rounded-2xl border p-6 text-left transition-all duration-200"
        style={{ borderColor: "rgba(127,181,138,0.32)", background: "linear-gradient(120deg, rgba(127,181,138,0.10), rgba(111,189,180,0.03) 55%, #101311)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(127,181,138,0.6)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(127,181,138,0.32)"; }}
      >
        <div className="pointer-events-none absolute -top-12 right-0 h-36 w-36 rounded-full blur-[60px]" style={{ background: "rgba(127,181,138,0.16)" }} />
        <div className="relative flex items-center gap-4">
          <div className="flex shrink-0 rounded-xl p-3" style={{ background: "rgba(127,181,138,0.14)" }}>
            <Users className="h-6 w-6" style={{ color: SAGE }} strokeWidth={1.9} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="font-display text-[20px]" style={{ color: "#F3F1EA" }}>Your Part</span>
              <span className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em]" style={{ background: "rgba(127,181,138,0.14)", color: SAGE }}>the people side</span>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.65]" style={{ color: "rgba(236,234,227,0.82)" }}>
              Government can't reach 3% alone, and neither can the markets. Close to a full point of potential lives in the choices ordinary citizens make.{" "}
              <span style={{ color: SAGE }}>See where you fit — and what it's worth when we all pull.</span>
            </p>
          </div>
          <ArrowRight className="hidden h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 sm:block" style={{ color: SAGE }} strokeWidth={2} />
        </div>
      </button>

      <footer className="mt-8 border-t pt-5 font-mono text-[10.5px] leading-[1.7]" style={{ borderColor: "#1A1F1C", color: "#4E534B" }}>
        Growth Engine · v2.0 · {country.name} baseline, June 2026 — Stats SA · National Treasury · SARB · Operation Vulindlela.
        Reform uplifts set in Diagnosis feed this engine's potential and output.
      </footer>
    </div>
  );
}

function Actual({ label, value, unit }) {
  const has = typeof value === "number";
  return (
    <div className="p-4" style={{ background: "#101311" }}>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.08em]" style={{ color: "#6B7068" }}>{label}</div>
      <div className="mt-1.5 font-display text-[26px]" style={{ ...tnum, color: "#6FBDB4" }}>
        {has ? value.toFixed(1) + unit : "—"}
      </div>
    </div>
  );
}
