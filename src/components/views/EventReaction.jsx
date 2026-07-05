import { useState, useMemo } from "react";
import { Zap, ChevronDown, History, Info } from "lucide-react";
import { EVENT_TYPES, EVENT_BY_ID, CONF_COLOR, REACTION_NOTE } from "../../config/reactions.js";
import { scaleReaction } from "../../lib/eventStudy.js";
import { EPISODES } from "../../config/calendar.js";
import { tint } from "../../config/palette.js";

const signed = (v, u) => `${v >= 0 ? "+" : ""}${v}${u === "%" ? "%" : ` ${u}`}`;

// Plain-English read of a move, so the direction is never ambiguous.
function interpret(assetName, v) {
  if (v === 0) return "no clear move";
  if (assetName === "USD/ZAR") return v > 0 ? "rand weakens" : "rand firms";
  if (assetName.includes("yield")) return v > 0 ? "yield up · bond down" : "yield down · bond up";
  return v > 0 ? "up" : "down";
}

export default function EventReaction() {
  const [eventId, setEventId] = useState("fed");
  const ev = EVENT_BY_ID[eventId];
  const [surprise, setSurprise] = useState(ev.step);

  const onPick = (id) => { setEventId(id); setSurprise(EVENT_BY_ID[id].step); };
  const results = useMemo(() => ev.assets.map((a) => ({ a, r: scaleReaction(a, surprise, ev.step) })), [ev, surprise]);
  const surpriseLabel = surprise === 0 ? "in line with consensus" : `${Math.abs(surprise)}${ev.unit} ${surprise > 0 ? ev.posLabel : ev.negLabel}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 animate-fade-up">
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#C6A15B" }}>
          <Zap className="h-3.5 w-3.5" /> Event-reaction engine · If X, then Y
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">How the market reacts to a shock</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          Can't predict the surprise — but the <i>reaction to</i> it is far more knowable. Pick an event and a surprise size
          to see the typical move across the rand, bonds and the JSE, with how confident each one is.
        </p>
      </div>

      {/* Calculator */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {EVENT_TYPES.map((e) => (
          <button key={e.id} onClick={() => onPick(e.id)}
            className="rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors"
            style={{ borderColor: eventId === e.id ? tint("#C6A15B", 0.5) : "#232823", background: eventId === e.id ? "rgba(198,161,91,0.1)" : "transparent", color: eventId === e.id ? "#ECEAE3" : "#8A8F88" }}>
            {e.name}
          </button>
        ))}
      </div>

      <div className="mb-5 rounded-2xl border p-5" style={{ borderColor: tint("#C6A15B", 0.28), background: "linear-gradient(160deg, rgba(198,161,91,0.05), #101311 65%)" }}>
        <p className="mb-3 text-[12.5px] leading-relaxed text-muted">{ev.blurb}</p>

        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-2">Surprise size</span>
            <span className="font-display text-[16px] font-semibold text-ink">{surpriseLabel}</span>
          </div>
          <input type="range" min={ev.range[0]} max={ev.range[1]} step={ev.step} value={surprise}
            onChange={(e) => setSurprise(+e.target.value)} className="mt-1.5 block w-full accent-teal" />
          <div className="flex justify-between font-mono text-[8.5px]" style={{ color: "#565B54" }}>
            <span>{ev.negLabel}</span><span>in line</span><span>{ev.posLabel}</span>
          </div>
        </div>

        <div className="space-y-2">
          {results.map(({ a, r }) => (
            <div key={a.asset} className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-ink">{a.asset}</div>
                <div className="font-mono text-[9px]" style={{ color: "#6B7068" }}>{interpret(a.asset, r.value)}</div>
              </div>
              <span className="rounded-md border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider" style={{ borderColor: tint(CONF_COLOR[a.conf], 0.4), color: CONF_COLOR[a.conf] }}>{a.conf} conf</span>
              <span className="w-[84px] shrink-0 text-right font-display text-[17px] font-semibold tabular-nums" style={{ color: r.value > 0 ? "#C6A15B" : r.value < 0 ? "#6FBDB4" : "#6B7068" }}>
                {surprise === 0 ? "—" : signed(r.value, r.unit)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 font-mono text-[9px]" style={{ borderColor: "#1E231F", color: "#565B54" }}>
          <span>decay: {ev.decay}</span>
        </div>
      </div>

      {/* Reaction library */}
      <div className="mb-6">
        <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">Reaction library · direction is the high-confidence part</div>
        <div className="space-y-1.5">
          {EVENT_TYPES.map((e) => (
            <details key={e.id} className="group rounded-xl border" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5">
                <span className="flex-1 text-[13px] font-medium text-ink">{e.name}</span>
                <span className="font-mono text-[9px]" style={{ color: "#6B7068" }}>{e.assets.length} assets</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: "#565B54" }} />
              </summary>
              <div className="border-t px-4 py-2.5" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>
                {e.assets.map((a) => (
                  <div key={a.asset} className="flex items-start gap-2.5 py-1 text-[11.5px]">
                    <span className="w-[140px] shrink-0 font-medium text-ink">{a.asset}</span>
                    <span className="w-[52px] shrink-0 font-mono" style={{ color: a.sign > 0 ? "#C6A15B" : "#6FBDB4" }}>{a.sign > 0 ? "↑" : "↓"} {a.per}{a.u === "%" ? "%" : a.u}</span>
                    <span className="flex-1 leading-relaxed" style={{ color: "#9A978E" }}>{a.note}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Documented episodes */}
      <div className="mb-6">
        <div className="mb-2.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">
          <History className="h-3.5 w-3.5" /> Documented episodes · what actually happened
        </div>
        <div className="space-y-1.5">
          {EPISODES.map((ep) => (
            <div key={ep.id} className="rounded-xl border px-4 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-medium text-ink">{ep.title}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{ep.date}</span>
              </div>
              <div className="text-[11.5px] leading-relaxed" style={{ color: "#9A978E" }}>{ep.outcome}</div>
              <div className="mt-0.5 font-mono text-[8.5px]" style={{ color: "#565B54" }}>{ep.targets}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border px-4 py-3" style={{ borderColor: tint("#6FBDB4", 0.25), background: "rgba(111,189,180,0.05)" }}>
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#6FBDB4" }} />
          <div className="text-[12px] leading-relaxed text-muted">
            <b className="text-ink">Measured-from-your-feed</b> reactions will appear here as CPI/MPC events pass through the
            live price feed — the engine (<code className="font-mono text-[10px]" style={{ color: "#9A978E" }}>lib/eventStudy.js</code>) computes the
            real move around each event date. Next step: log the calculator's expected reaction into the Track record at each
            event, then score it against the actual move — so this gets graded like everything else.
          </div>
        </div>
      </div>

      <p className="mt-6 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>{REACTION_NOTE}</p>
    </div>
  );
}
