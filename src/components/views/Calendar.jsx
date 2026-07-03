import { CalendarClock, TrendingUp, TrendingDown, History, ArrowRight, Zap } from "lucide-react";
import { RELEASES, EPISODES, daysUntil } from "../../config/calendar.js";
import { tint } from "../../config/palette.js";
import Insight from "../ui/Insight.jsx";

const UP = "#7FB58A", DOWN = "#D8735E", GOLD = "#C6A15B", VIOLET = "#A99BF5";
const IMP = { high: { label: "High impact", color: GOLD }, med: { label: "Medium", color: "#8A8F88" } };

function countdown(iso) {
  const d = daysUntil(iso);
  if (d < -1) return { text: "released", tone: "#565B54", past: true };
  if (d <= 0) return { text: "today", tone: UP };
  if (d === 1) return { text: "tomorrow", tone: GOLD };
  if (d <= 14) return { text: `in ${d} days`, tone: GOLD };
  return { text: `in ${d} days`, tone: "#8A8F88" };
}

export default function Calendar({ onOpenGraph }) {
  const sorted = [...RELEASES].sort((a, b) => new Date(a.iso) - new Date(b.iso));

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10 animate-fade-up">
      {/* Header */}
      <div className="mb-4 max-w-2xl">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: GOLD }}>
          <CalendarClock className="h-3.5 w-3.5" /> Calendar · The event-driven layer
        </div>
        <h1 className="font-display text-[30px] font-normal leading-[1.08] tracking-[-0.02em] sm:text-[38px]" style={{ color: "#F3F1EA" }}>
          What's coming — and how the economy <em style={{ fontStyle: "italic", color: GOLD }}>reacts</em>.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.7] text-muted">
          The scheduled releases that move markets, with the previous print and the consensus, so you can read the{" "}
          <span className="text-ink">surprise</span> when it lands. Pre-play either side through the causal graph before the number drops.
        </p>
      </div>

      <Insight color={VIOLET} label="How prediction actually starts" icon={Zap}>
        Real forecasting is event-conditioned, not just chronological: you model the reaction to a <em>surprise</em>
        (actual vs consensus), not the calendar. This is that foundation — the release schedule, the expectation, and the
        graph that turns either outcome into a cascade. The statistical models come after this scaffolding exists.
      </Insight>

      {/* Upcoming releases */}
      <div className="mt-6">
        <h2 className="mb-3 font-display text-[20px] font-normal text-ink">Scheduled releases</h2>
        <div className="space-y-3">
          {sorted.map((r) => {
            const cd = countdown(r.iso);
            const imp = IMP[r.importance];
            return (
              <div key={r.id} className="rounded-2xl border p-4"
                style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)", opacity: cd.past ? 0.7 : 1 }}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: imp.color }} />
                      <span className="font-display text-[16px] text-ink">{r.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{r.agency}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px]">
                      <span style={{ color: "#8A8F88" }}>{r.period}</span>
                      <span style={{ color: "#565B54" }}>prev <span className="text-muted">{r.previous}</span></span>
                      <span style={{ color: "#565B54" }}>cons <span style={{ color: GOLD }}>{r.consensus}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[12px]" style={{ color: cd.tone }}>{cd.text}</div>
                    <div className="font-mono text-[10px]" style={{ color: "#565B54" }}>{new Date(r.iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</div>
                  </div>
                </div>

                <p className="mt-2 text-[11.5px] leading-snug text-muted">{r.watch}</p>

                {onOpenGraph && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t pt-2.5" style={{ borderColor: "#1E231F" }}>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#565B54" }}>Pre-play →</span>
                    <button onClick={() => onOpenGraph(r.node, r.hi.dir)}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[10px] transition-all"
                      style={{ borderColor: tint(UP, 0.4), color: UP }} title={r.hi.note}>
                      <TrendingUp className="h-3 w-3" /> {r.hi.label}
                    </button>
                    <button onClick={() => onOpenGraph(r.node, r.lo.dir)}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[10px] transition-all"
                      style={{ borderColor: tint(DOWN, 0.4), color: DOWN }} title={r.lo.note}>
                      <TrendingDown className="h-3 w-3" /> {r.lo.label}
                    </button>
                    <span className="ml-auto rounded-md px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider" style={{ color: imp.color, background: tint(imp.color, 0.1) }}>{imp.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regime windows / stress library */}
      <div className="mt-8">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: DOWN }}>
          <History className="h-3.5 w-3.5" /> Regime windows · stress library
        </div>
        <h2 className="font-display text-[20px] font-normal text-ink">The shocks that tested the economy</h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          The historical episodes the architecture uses to stress-test any model — the moments the distribution shifted.
          Replay each one through the graph to see the cascade it set off.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EPISODES.map((e) => (
            <div key={e.id} className="rounded-2xl border p-4" style={{ borderColor: tint(DOWN, 0.22), background: "linear-gradient(160deg, #131614, #101311)" }}>
              <div className="flex items-center justify-between">
                <span className="font-display text-[16px] text-ink">{e.title}</span>
                <span className="font-mono text-[10px]" style={{ color: "#6B7068" }}>{e.date}</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-muted">{e.outcome}</p>
              <div className="mt-2 font-mono text-[9.5px] uppercase tracking-wider" style={{ color: "#565B54" }}>{e.targets}</div>
              {onOpenGraph && (
                <button onClick={() => onOpenGraph(e.node, e.dir)}
                  className="group mt-2.5 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-all"
                  style={{ borderColor: tint(VIOLET, 0.35), color: VIOLET, background: tint(VIOLET, 0.06) }}>
                  <Zap className="h-3 w-3" /> Replay this shock
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-8 border-t pt-5 font-mono text-[10.5px] leading-[1.7]" style={{ borderColor: "#1A1F1C", color: "#4E534B" }}>
        Calendar · release dates are the official SA schedule; consensus figures are illustrative expectations, not a live feed.
        This is the event-driven foundation from the prediction architecture (scheduled-event module + regime-window stress
        library) — the scaffolding a statistical/ML nowcasting layer would train on. That layer needs a data backend; this
        does not. Reactions are graph propagations, not forecasts.
      </footer>
    </div>
  );
}
