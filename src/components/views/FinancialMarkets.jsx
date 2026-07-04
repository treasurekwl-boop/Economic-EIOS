import { useState } from "react";
import {
  Landmark, Banknote, TrendingUp, Percent, Gem, Bitcoin, ChevronDown, Share2, ArrowRight, Repeat, Grid3x3, Boxes,
} from "lucide-react";
import { FIN_MARKETS, FIN_MARKETS_NOTE } from "../../config/finmarkets.js";
import { EIOS_MARKETS, CMP_COLUMNS, EIOS_NOTE } from "../../config/eios.js";
import { nodeById } from "../../config/graph.js";
import { tint } from "../../config/palette.js";

const ICONS = { Banknote, TrendingUp, Landmark, Percent, Gem, Bitcoin };

// The "Financial markets, explained" layer — plain-language dossiers for the
// asset-class markets a South African touches. Each loops back to the economy.
export default function FinancialMarkets({ onOpenGraph }) {
  const [openId, setOpenId] = useState("fx");

  return (
    <div className="animate-fade-up">
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#6FBDB4" }}>
          <Landmark className="h-3.5 w-3.5" /> Financial markets · Explained
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">The markets that move your money</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          The rand, the JSE, government bonds, the money market, commodities and crypto — what each one actually is, how its
          price is set, who trades it, and how it loops right back to the economy you live in.
        </p>
      </div>

      <div className="space-y-2.5">
        {FIN_MARKETS.map((mk) => {
          const Icon = ICONS[mk.icon] ?? Landmark;
          const open = openId === mk.id;
          const node = mk.node ? nodeById(mk.node) : null;
          return (
            <div key={mk.id} className="overflow-hidden rounded-2xl border transition-colors"
              style={{ borderColor: open ? tint(mk.color, 0.45) : "#232823", background: "linear-gradient(150deg, #131614, #101311)" }}>
              <button onClick={() => setOpenId(open ? null : mk.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: tint(mk.color, 0.14), border: `1px solid ${tint(mk.color, 0.3)}` }}>
                  <Icon className="h-4 w-4" style={{ color: mk.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium text-ink">{mk.name}</div>
                  <div className="truncate text-[12px] text-muted-2">{mk.tagline}</div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform" style={{ color: "#565B54", transform: open ? "rotate(180deg)" : "none" }} />
              </button>

              {open && (
                <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>
                  <dl className="space-y-2.5 text-[12.5px]">
                    <Field label="What it is" value={mk.whatItIs} color={mk.color} />
                    <Field label="How prices form" value={mk.howPriced} color={mk.color} />
                    <Field label="Who trades it" value={mk.whoTrades} color={mk.color} />
                    <Field label="Its scale & role" value={mk.scale} color={mk.color} />
                  </dl>

                  {/* The punchline — how it loops back to the economy */}
                  <div className="mt-3 rounded-xl border p-3" style={{ borderColor: tint(mk.color, 0.3), background: tint(mk.color, 0.05) }}>
                    <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: mk.color }}>
                      <Repeat className="h-3 w-3" /> How it loops back to you
                    </div>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: "#C9C6BD" }}>{mk.loop}</p>
                  </div>

                  {onOpenGraph && node && (
                    <button onClick={() => onOpenGraph(mk.node)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors"
                      style={{ borderColor: tint("#A99BF5", 0.35), color: "#A99BF5", background: tint("#A99BF5", 0.06) }}>
                      <Share2 className="h-3 w-3" /> Trace {node.label} on the graph <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>
        {FIN_MARKETS_NOTE}
      </p>

      <ComparisonMatrix />
      <Blueprint />

      <p className="mt-5 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>
        {EIOS_NOTE}
      </p>
    </div>
  );
}

// The brief's cross-market comparison — all ten markets at a glance.
function ComparisonMatrix() {
  return (
    <div className="mt-9">
      <div className="mb-2 flex items-center gap-2">
        <Grid3x3 className="h-4 w-4" style={{ color: "#6FBDB4" }} />
        <h2 className="font-display text-[18px] font-semibold text-ink">Every market at a glance</h2>
      </div>
      <p className="mb-3 max-w-2xl text-[12.5px] leading-relaxed text-muted-2">
        The cross-market comparison the brief specifies — how the ten market types differ on the axes that decide how you model
        and risk-manage them.
      </p>
      <div className="no-scrollbar overflow-x-auto rounded-xl border" style={{ borderColor: "#232823" }}>
        <table className="w-full border-collapse text-[11.5px]">
          <thead>
            <tr style={{ background: "rgba(111,189,180,0.06)" }}>
              <th className="sticky left-0 px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6FBDB4", background: "#12150F" }}>Market</th>
              {CMP_COLUMNS.map((c) => (
                <th key={c.k} className="whitespace-nowrap px-3 py-2 text-left font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EIOS_MARKETS.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 ? "rgba(19,22,20,0.4)" : "transparent" }}>
                <th className="sticky left-0 whitespace-nowrap px-3 py-2 text-left text-[12px] font-medium text-ink" style={{ background: i % 2 ? "#111412" : "#101311" }}>{m.name}</th>
                {CMP_COLUMNS.map((c) => (
                  <td key={c.k} className="px-3 py-2 align-top" style={{ color: "#9A978E", minWidth: 118 }}>{m.cmp[c.k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Per-market structure (overview matrix) + EIOS modelling blueprint.
function Blueprint() {
  const [open, setOpen] = useState(null);
  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center gap-2">
        <Boxes className="h-4 w-4" style={{ color: "#C6A15B" }} />
        <h2 className="font-display text-[18px] font-semibold text-ink">Market structure &amp; modelling blueprint</h2>
      </div>
      <p className="mb-3 max-w-2xl text-[12.5px] leading-relaxed text-muted-2">
        For each market: how it's structured and who's in it, then the brief's modelling blueprint — the models, state variables,
        data, stress design and model-risk controls a real EIOS would use.
      </p>
      <div className="space-y-2">
        {EIOS_MARKETS.map((m) => {
          const on = open === m.id;
          return (
            <div key={m.id} className="overflow-hidden rounded-xl border" style={{ borderColor: on ? tint("#C6A15B", 0.4) : "#232823", background: "linear-gradient(150deg, #131614, #101311)" }}>
              <button onClick={() => setOpen(on ? null : m.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#C6A15B" }} />
                <div className="min-w-0 flex-1">
                  <span className="text-[14px] font-medium text-ink">{m.name}</span>
                  {!on && <span className="ml-2 hidden truncate text-[11.5px] text-muted-2 sm:inline">{m.summary}</span>}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform" style={{ color: "#565B54", transform: on ? "rotate(180deg)" : "none" }} />
              </button>
              {on && (
                <div className="border-t px-4 pb-3.5 pt-3" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>
                  <p className="mb-2.5 text-[12.5px] leading-relaxed" style={{ color: "#C9C6BD" }}>{m.summary}</p>
                  <dl className="space-y-1.5 text-[12px]">
                    <BRow label="Structure" value={m.structure} color="#6FBDB4" />
                    <BRow label="Liquidity" value={m.liquidity} color="#6FBDB4" />
                    <BRow label="Participants" value={m.participants} color="#6FBDB4" />
                    <BRow label="Linkages" value={m.linkages} color="#6FBDB4" />
                  </dl>
                  <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "#1E231F", background: "rgba(198,161,91,0.04)" }}>
                    <div className="mb-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: "#C6A15B" }}>EIOS modelling blueprint</div>
                    <dl className="space-y-1.5 text-[12px]">
                      <BRow label="Models" value={m.bp.models} color="#C6A15B" />
                      <BRow label="State vars" value={m.bp.state} color="#C6A15B" />
                      <BRow label="Process" value={m.bp.process} color="#C6A15B" />
                      <BRow label="Data / horizon" value={m.bp.data} color="#C6A15B" />
                      <BRow label="Stress design" value={m.bp.stress} color="#D8735E" />
                      <BRow label="Model-risk controls" value={m.bp.controls} color="#7FB58A" />
                    </dl>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BRow({ label, value, color }) {
  return (
    <div className="flex gap-2.5">
      <dt className="w-[112px] shrink-0 font-mono text-[9px] uppercase tracking-wider" style={{ color }}>{label}</dt>
      <dd className="flex-1 leading-relaxed" style={{ color: "#C9C6BD" }}>{value}</dd>
    </div>
  );
}

function Field({ label, value, color }) {
  return (
    <div className="flex gap-2.5">
      <dt className="w-[92px] shrink-0 font-mono text-[9px] uppercase tracking-wider" style={{ color }}>{label}</dt>
      <dd className="flex-1 leading-relaxed" style={{ color: "#C9C6BD" }}>{value}</dd>
    </div>
  );
}
