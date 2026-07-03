import { useState } from "react";
import {
  Microscope, CircleCheck, TriangleAlert, CircleX, ThumbsUp, ThumbsDown,
  ChevronDown, Share2, LayoutGrid, LineChart, BookText,
} from "lucide-react";
import { useEngine } from "../../context/EngineContext.jsx";
import { useScenario, impactOf } from "../../context/ScenarioContext.jsx";
import { lagLabel } from "../../config/graph.js";
import { PILLARS, GRADES, STRENGTHS, WEAKNESSES, FUNDAMENTALS_AS_OF, INDICATOR_DETAIL } from "../../config/fundamentals.js";
import { CONCEPTS } from "../../config/learn.js";
import { tint } from "../../config/palette.js";
import { tnum } from "../../lib/format.js";
import InfoTip from "../ui/InfoTip.jsx";
import Insight from "../ui/Insight.jsx";

const STATUS = {
  ok:   { label: "Healthy",  color: "#7FB58A", icon: CircleCheck },
  warn: { label: "Watch",    color: "#C6A15B", icon: TriangleAlert },
  bad:  { label: "Weak",     color: "#D8735E", icon: CircleX },
};
const SCORE = { ok: 1, warn: 0.5, bad: 0 };

function Band({ scale, value, color }) {
  if (!scale) return null;
  const { min, max, band } = scale;
  const pos = (v) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  return (
    <div className="mt-2.5">
      <div className="relative h-1.5 rounded-full" style={{ background: "rgba(35,40,35,0.9)" }}>
        <div className="absolute inset-y-0 rounded-full" style={{ left: `${pos(band[0])}%`, width: `${pos(band[1]) - pos(band[0])}%`, background: "rgba(127,181,138,0.25)" }} />
        <div className="absolute -top-[3px] h-3 w-[3px] -translate-x-1/2 rounded-full" style={{ left: `${pos(value)}%`, background: color, boxShadow: `0 0 6px ${tint(color, 0.7)}` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[8px] text-muted-2">
        <span>{min}</span>
        <span className="text-ok/60">healthy {band[0]}–{band[1]}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// The terminal signature: three readings per indicator — where it was, where it
// is, where it's heading — each with the reasoning, not just the number.
function Reading({ tag, color, value, asOf, text, highlight }) {
  return (
    <div className="flex gap-2 rounded-md px-2 py-1.5" style={highlight ? { background: tint(color, 0.06) } : {}}>
      <span className="mt-px w-8 shrink-0 font-mono text-[8px] font-semibold uppercase tracking-wider" style={{ color }}>{tag}</span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[12px] font-bold" style={{ ...tnum, color: highlight ? color : "#ECEAE3" }}>{value}</span>
          <span className="font-mono text-[9px] text-muted-2">{asOf}</span>
        </div>
        <p className="text-[10.5px] leading-snug text-muted">{text}</p>
      </div>
    </div>
  );
}

export default function Fundamentals({ onOpenGraph }) {
  const { fx } = useEngine();
  const { scenario } = useScenario();
  const [openId, setOpenId] = useState(null);

  const all = PILLARS.flatMap((p) => p.indicators).filter((i) => !i.live);
  const score = Math.round((all.reduce((s, i) => s + SCORE[i.status], 0) / all.length) * 100);
  const grade = GRADES.find((g) => score >= g.min);

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 animate-fade-up">
      {/* Header */}
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-coral">
          <Microscope className="h-3.5 w-3.5" /> Fundamentals · Analyst board
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">South Africa — fundamental analysis</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          Every indicator carries three readings — <span className="text-muted-2">where it was</span>,{" "}
          <span className="text-ink">where it is</span>, <span className="text-purple">where it's heading</span> — each
          explained. Figures as of {FUNDAMENTALS_AS_OF}.
        </p>
      </div>

      {/* Composite grade */}
      <div className="rounded-xl border border-line p-5" style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl font-display text-5xl font-bold"
              style={{ color: grade.color, background: tint(grade.color, 0.1), border: `2px solid ${tint(grade.color, 0.4)}`, textShadow: `0 0 24px ${tint(grade.color, 0.5)}` }}>
              {grade.letter}
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-2">Composite fundamentals</div>
              <div className="font-display text-lg font-semibold text-ink">{grade.verdict}</div>
              <div className="font-mono text-[12px] text-muted" style={tnum}>{score}/100 · {all.length} indicators</div>
            </div>
          </div>
          <div className="min-w-[200px] flex-1">
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(35,40,35,0.8)" }}>
              <div className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${score}%`, background: `linear-gradient(90deg, ${tint(grade.color, 0.5)}, ${grade.color})`, boxShadow: `0 0 10px ${tint(grade.color, 0.4)}` }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-wider text-muted-2">
              <span>E</span><span>D</span><span>C</span><span>B</span><span>A</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-line/60 pt-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ok">
              <ThumbsUp className="h-3 w-3" /> What's working
            </div>
            <ul className="space-y-1 text-[12px] leading-snug text-muted">
              {STRENGTHS.map((s, i) => <li key={i} className="flex gap-1.5"><span className="text-ok">·</span>{s}</li>)}
            </ul>
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-alert">
              <ThumbsDown className="h-3 w-3" /> What's broken
            </div>
            <ul className="space-y-1 text-[12px] leading-snug text-muted">
              {WEAKNESSES.map((s, i) => <li key={i} className="flex gap-1.5"><span className="text-alert">·</span>{s}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Insight color="#E08B70" label="How to read this board">
          A country's fundamentals rarely move together. SA's paradox right now: the <em>fiscal</em> story is turning
          (debt stabilising for the first time in 17 years) and the <em>oil shock is reversing</em> — while the{" "}
          <em>labour</em> story deteriorates. The grade is the average; the analysis is in the tension.
        </Insight>
      </div>

      {/* Pillars */}
      <div className="mt-6 space-y-6">
        {PILLARS.map((p) => (
          <div key={p.id}>
            <h2 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider" style={{ color: p.color }}>
              <span className="h-2 w-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 6px ${tint(p.color, 0.6)}` }} /> {p.label}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {p.indicators.map((ind) => {
                const st = STATUS[ind.status];
                const StIcon = st.icon;
                const isLiveRand = ind.live;
                const nowValue = isLiveRand ? (fx ? `R${fx.usdZar.toFixed(2)}` : "—") : `${ind.value}`;
                const detail = INDICATOR_DETAIL[ind.id];
                const open = openId === ind.id;
                const canDrill = detail && (detail.composition || detail.history);
                const impact = impactOf(scenario, detail?.node);
                return (
                  <div key={ind.id} className="rounded-xl border p-4 transition-shadow"
                    style={{
                      borderColor: impact ? tint(impact.color, 0.5) : tint(st.color, 0.25),
                      background: "linear-gradient(145deg, #131614 0%, #101311 100%)",
                      borderLeft: `3px solid ${tint(p.color, 0.6)}`,
                      boxShadow: impact ? `0 0 18px ${tint(impact.color, 0.12)}` : "none",
                    }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[12px] font-medium text-ink">
                        {ind.concept && CONCEPTS[ind.concept]
                          ? <InfoTip concept={CONCEPTS[ind.concept]} color={p.color} align="left">{ind.name}</InfoTip>
                          : ind.name}
                      </div>
                      {impact ? (
                        <span className="flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                          style={{ borderColor: tint(impact.color, 0.5), color: impact.color, background: tint(impact.color, 0.1) }}
                          title={`Scenario impact · felt ${lagLabel(impact.lagWeeks)}`}>
                          {impact.glyph} scenario
                        </span>
                      ) : (
                        <span className="flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                          style={{ borderColor: tint(st.color, 0.4), color: st.color, background: tint(st.color, 0.07) }}>
                          <StIcon className="h-2.5 w-2.5" /> {st.label}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="font-mono text-2xl font-bold" style={{ ...tnum, color: p.color }}>{nowValue}</span>
                      <span className="font-mono text-[11px] text-muted-2">{ind.unit}</span>
                      <span className="ml-auto font-mono text-[9px] text-muted-2">{ind.asOf}</span>
                    </div>

                    {isLiveRand && fx && typeof fx.change30 === "number" && (
                      <div className={`mt-1 font-mono text-[10px] ${fx.change30 > 0 ? "text-alert" : "text-ok"}`}>
                        30-day: rand {fx.change30 > 0 ? "weaker" : "stronger"} {Math.abs(fx.change30).toFixed(1)}%
                      </div>
                    )}

                    <Band scale={ind.scale} value={ind.value} color={st.color} />

                    {/* Prev → Now → Next, each explained */}
                    <div className="mt-2.5 space-y-1 border-t border-line/50 pt-2.5">
                      <Reading tag="Prev" color="#6B7068" value={ind.prev.value} asOf={ind.prev.asOf} text={ind.prev.note} />
                      <Reading tag="Now" color={p.color} value={nowValue !== "—" ? `${nowValue}${isLiveRand ? "" : ""}` : nowValue} asOf={ind.asOf} text={ind.read} highlight />
                      <Reading tag="Next" color="#C77DFF" value={ind.expected.value} asOf={ind.expected.asOf} text={ind.expected.why} />
                    </div>

                    {/* Drill-down + graph link */}
                    {(canDrill || (detail?.node && onOpenGraph)) && (
                      <div className="mt-2.5 flex items-center gap-2 border-t border-line/50 pt-2.5">
                        {canDrill && (
                          <button onClick={() => setOpenId(open ? null : ind.id)}
                            className="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors"
                            style={{ color: open ? p.color : "#6B7068" }}>
                            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} /> {open ? "less" : "drill down"}
                          </button>
                        )}
                        {detail?.node && onOpenGraph && (
                          <button onClick={() => onOpenGraph(detail.node)}
                            className="ml-auto flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors"
                            style={{ color: "#A99BF5" }}>
                            <Share2 className="h-3 w-3" /> graph
                          </button>
                        )}
                      </div>
                    )}

                    {open && canDrill && <DrillPanel detail={detail} color={p.color} />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-7 border-t border-line/60 pt-5 font-mono text-[11px] leading-relaxed text-muted-2">
        Fundamentals board · sources: Stats SA (GDP Q1 2026, CPI May 2026, QLFS Q1 2026), SARB (MPC May 2026, current
        account), National Treasury 2026 Budget Review (debt path), fuel/oil moves per late-June 2026 reporting. "Next"
        readings are consensus/model expectations with the reasoning shown — they update as releases land (June CPI 22 Jul,
        MPC 23 Jul, Q2 QLFS ~11 Aug, Q2 GDP ~8 Sep). Healthy bands are analyst rules of thumb, not official targets. The
        rand updates live; other figures update with each official release.
      </footer>
    </div>
  );
}

// ── Drill-down panel: composition + history + methodology ──
function DrillPanel({ detail, color }) {
  return (
    <div className="mt-3 space-y-3 rounded-lg border p-3" style={{ borderColor: "#1E231F", background: "rgba(12,14,13,0.5)" }}>
      {detail.composition && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#8A8F88" }}>
            <LayoutGrid className="h-3 w-3" /> {detail.composition.label}
          </div>
          <Composition comp={detail.composition} />
        </div>
      )}
      {detail.history && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#8A8F88" }}>
            <LineChart className="h-3 w-3" /> {detail.history.label}
          </div>
          <Sparkline hist={detail.history} color={color} />
        </div>
      )}
      {detail.method && (
        <div>
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#8A8F88" }}>
            <BookText className="h-3 w-3" /> Methodology
          </div>
          <p className="text-[11px] leading-[1.55] text-muted">{detail.method}</p>
        </div>
      )}
    </div>
  );
}

function Composition({ comp }) {
  if (comp.type === "level") {
    const max = comp.max ?? Math.max(...comp.parts.map((p) => p.value));
    return (
      <div className="space-y-1.5">
        {comp.parts.map((p) => (
          <div key={p.label}>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span style={{ color: "#ECEAE3" }}>{p.label}</span>
              <span style={{ color: p.color }}>{p.value}%</span>
            </div>
            <div className="mt-0.5 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(35,40,35,0.7)" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (p.value / max) * 100)}%`, background: `linear-gradient(90deg, ${tint(p.color, 0.5)}, ${p.color})` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  const sum = comp.parts.reduce((a, p) => a + p.value, 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full" style={{ border: "1px solid #232823" }}>
        {comp.parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / sum) * 100}%`, background: p.color }} title={`${p.label} ${p.value}`} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9.5px]">
        {comp.parts.map((p) => (
          <span key={p.label} className="flex items-center gap-1" style={{ color: "#8A8F88" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} /> {p.label} <span style={{ color: "#ECEAE3" }}>{p.value}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ hist, color }) {
  const s = hist.series;
  const min = Math.min(...s), max = Math.max(...s);
  const range = max - min || 1;
  const W = 100, H = 28;
  const pts = s.map((v, i) => `${(i / (s.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`).join(" ");
  const last = s[s.length - 1], first = s[0];
  const up = last >= first;
  return (
    <div>
      <div className="flex items-end gap-3">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-9 flex-1">
          <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" vectorEffect="non-scaling-stroke" />
          {s.map((v, i) => (
            <circle key={i} cx={(i / (s.length - 1)) * W} cy={H - ((v - min) / range) * (H - 4) - 2} r={i === s.length - 1 ? 2 : 0} fill={color} />
          ))}
        </svg>
        <div className="text-right">
          <div className="font-display text-[18px]" style={{ ...tnum, color }}>{last}{hist.unit}</div>
          <div className="font-mono text-[9px]" style={{ color: up ? "#7FB58A" : "#D8735E" }}>{up ? "▲" : "▼"} from {first}{hist.unit}</div>
        </div>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[8px]" style={{ color: "#565B54" }}>
        <span>{hist.marks[0]}</span>
        <span>{hist.marks[hist.marks.length - 1]}</span>
      </div>
    </div>
  );
}
