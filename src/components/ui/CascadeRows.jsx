import { useState } from "react";
import { ChevronDown, ArrowRight, CornerDownRight } from "lucide-react";
import { nodeById, NODE_TYPES, explainChain, lagLabel, readDirection } from "../../config/graph.js";
import { tint } from "../../config/palette.js";

// A ranked list of what a shock touches — written so someone who has never
// studied economics can read it. Each row says, in plain words, which way the
// thing MOVES and whether that's GOOD or BAD news — no ▲/▼ guesswork — and
// tapping it reveals what the thing is and the step-by-step chain of why.
//
// Props: origin (node id shocked), shockDir (+1 up / −1 down), impacts (array of
// {id, impulse, lo, hi, lagWeeks, uncertain}), maxImp, valueOf?, go?, compact?.
export default function CascadeRows({ origin, shockDir = 1, impacts, maxImp, valueOf, go, compact = false }) {
  const [openId, setOpenId] = useState(null);
  if (!impacts.length) {
    return <div className="py-4 text-center font-mono text-[11px]" style={{ color: "#565B54" }}>Nothing downstream — this is the end of the chain.</div>;
  }

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      {impacts.map((im) => {
        const n = nodeById(im.id);
        const meta = NODE_TYPES[n?.type] ?? { color: "#8A8F88" };
        const r = readDirection(im.id, im.impulse, im.uncertain);
        const c = r.color;
        // Plain reading — what happens, then whether that's good or bad.
        const verdict = r.unclear ? "could go either way" : r.sentiment === "good" ? "good news" : r.sentiment === "bad" ? "bad news" : null;

        const width = Math.max(3, (Math.abs(im.impulse) / maxImp) * 100);
        const bandLo = (Math.min(Math.abs(im.lo), Math.abs(im.hi)) / maxImp) * 100;
        const bandHi = (Math.max(Math.abs(im.lo), Math.abs(im.hi)) / maxImp) * 100;
        const open = openId === im.id;
        const chain = open ? explainChain(origin, im.id) : [];

        return (
          <div key={im.id} className="rounded-lg border overflow-hidden" style={{ borderColor: open ? tint(meta.color, 0.4) : "#1E231F", background: "rgba(12,14,13,0.4)" }}>
            <button
              onClick={() => setOpenId(open ? null : im.id)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors"
              onMouseEnter={(e) => !open && (e.currentTarget.parentElement.style.borderColor = tint(meta.color, 0.35))}
              onMouseLeave={(e) => !open && (e.currentTarget.parentElement.style.borderColor = "#1E231F")}
            >
              {/* Colour = good (green) / bad (red) / unclear (amber) / neutral (grey). */}
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${tint(c, 0.5)}` }} />
              <div className={compact ? "w-[128px] shrink-0" : "w-[150px] shrink-0"}>
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13px]" style={{ color: "#ECEAE3" }}>{n?.label ?? im.id}</span>
                </div>
                <span className="font-mono text-[9px]" style={{ color: c }}>
                  {r.dirWord}{verdict && r.sentiment ? ` · ${verdict}` : ""}
                </span>
              </div>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(35,40,35,0.7)" }}>
                <div className="absolute inset-y-0 rounded-full" style={{ left: `${bandLo}%`, width: `${Math.max(1, bandHi - bandLo)}%`, background: tint(c, 0.22) }} />
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${tint(c, 0.5)}, ${c})`, boxShadow: `0 0 8px ${tint(c, 0.4)}` }} />
              </div>
              <span className="w-[80px] shrink-0 text-right font-mono text-[9.5px]" style={{ color: "#6B7068" }}>felt {lagLabel(im.lagWeeks)}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform" style={{ color: "#565B54", transform: open ? "rotate(180deg)" : "none" }} />
            </button>

            {open && (
              <div className="border-t px-3.5 pb-3.5 pt-3" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>
                {/* What it is */}
                <div className="mb-3">
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7068" }}>What this is</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#C9C6BD" }}>
                    <span style={{ color: "#ECEAE3" }}>{n?.label}</span> — {n?.note ?? "part of the economy."}
                    {valueOf && valueOf(n) && <span className="font-mono text-[11px]" style={{ color: "#6B7068" }}> (now {valueOf(n)})</span>}
                  </p>
                </div>

                {/* Why it moves — the plain chain of dominoes */}
                <div className="mb-3">
                  <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#6B7068" }}>Why it moves — step by step</div>
                  {chain.length === 0 ? (
                    <p className="text-[12.5px] leading-relaxed" style={{ color: "#9A978E" }}>A direct link from the shock.</p>
                  ) : (
                    <ol className="space-y-1.5">
                      <li className="flex items-start gap-2 text-[12.5px] leading-relaxed">
                        <span className="mt-0.5 shrink-0 font-mono text-[10px]" style={{ color: "#6B7068" }}>Start</span>
                        <span style={{ color: "#C9C6BD" }}>{nodeById(origin)?.label} moves {shockDir > 0 ? "up" : "down"}.</span>
                      </li>
                      {chain.map((e, i) => {
                        const toneC = e.tone === "support" ? "#7FB58A" : e.tone === "pressure" ? "#D8735E" : "#C6A15B";
                        return (
                          <li key={i} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
                            <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: toneC }} />
                            <span style={{ color: "#C9C6BD" }}>
                              <span style={{ color: "#ECEAE3" }}>{nodeById(e.to)?.label}:</span> {e.mech}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>

                {/* Bottom line */}
                <p className="text-[12.5px] leading-relaxed" style={{ color: "#9A978E" }}>
                  <span className="font-medium" style={{ color: "#C9C6BD" }}>Bottom line: </span>
                  {r.unclear
                    ? "the model isn't sure which way this nets out — it depends on which channel wins. Treat it as a watch-item."
                    : (
                      <>
                        {n?.label} <span style={{ color: c }}>{r.dirWord}</span>
                        {r.sentiment === "good" && " — that's good news for people and the economy."}
                        {r.sentiment === "bad" && " — that's a strain on people and the economy."}
                        {!r.sentiment && "."}
                      </>
                    )}
                </p>

                {go && (
                  <button onClick={() => go(im.id)} className="mt-3 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[10px] transition-colors"
                    style={{ borderColor: tint(meta.color, 0.3), color: meta.color }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = tint(meta.color, 0.08))}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    Open {n?.label} on the graph <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
