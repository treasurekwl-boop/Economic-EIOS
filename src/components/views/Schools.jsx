import { useState } from "react";
import { GraduationCap, Scale, ChevronDown, ArrowRight, Check, AlertTriangle, Sparkles } from "lucide-react";
import { LENSES, LENSES_DISCLAIMER } from "../../config/lenses.js";
import { FIELDS, FIELD_GROUPS, SCHOOL_REF, REFERENCE_INTRO } from "../../config/disciplines.js";
import { tint } from "../../config/palette.js";

const PRIORITY_COLOR = { High: "#7FB58A", Medium: "#C6A15B", Low: "#8A8F88" };

export default function Schools({ onOpenLens }) {
  const [openSchool, setOpenSchool] = useState("nk");
  const [openField, setOpenField] = useState(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 animate-fade-up">
      {/* Header */}
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#6FBDB4" }}>
          <GraduationCap className="h-3.5 w-3.5" /> Schools & fields · The thinking behind the model
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">How economists see the same economy</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">{REFERENCE_INTRO}</p>
      </div>

      {/* ── Schools of thought ── */}
      <div className="mb-3 flex items-center gap-2">
        <Scale className="h-4 w-4" style={{ color: "#6FBDB4" }} />
        <h2 className="font-display text-[18px] font-semibold text-ink">Six schools of thought</h2>
      </div>
      <p className="mb-3.5 max-w-2xl text-[12.5px] leading-relaxed text-muted-2">
        They don't disagree that the economy is connected — they disagree about which links are strong. Each is a lens you can
        run live: pick one and watch the same shock tell a different story in Intelligence.
      </p>

      <div className="space-y-2.5">
        {LENSES.map((l) => {
          const ref = SCHOOL_REF[l.id] ?? {};
          const open = openSchool === l.id;
          return (
            <div key={l.id} className="overflow-hidden rounded-2xl border transition-colors"
              style={{ borderColor: open ? tint("#6FBDB4", 0.4) : "#232823", background: "linear-gradient(150deg, #131614, #101311)" }}>
              <button onClick={() => setOpenSchool(open ? null : l.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "#6FBDB4", boxShadow: open ? "0 0 8px rgba(111,189,180,0.6)" : "none" }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[15px] font-medium text-ink">{l.label}</span>
                    <span className="font-mono text-[8.5px] uppercase tracking-wider" style={{ color: "#6FBDB4" }}>{l.short}</span>
                  </div>
                  <div className="truncate text-[12px] text-muted-2">{l.tagline}</div>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform" style={{ color: "#565B54", transform: open ? "rotate(180deg)" : "none" }} />
              </button>

              {open && (
                <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#C9C6BD" }}>{l.blurb}</p>

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-xl border p-3" style={{ borderColor: tint("#7FB58A", 0.25), background: "rgba(127,181,138,0.04)" }}>
                      <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: "#7FB58A" }}>
                        <Check className="h-3 w-3" /> What it gets right
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: "#C9C6BD" }}>{ref.gets_right}</p>
                    </div>
                    <div className="rounded-xl border p-3" style={{ borderColor: tint("#D8735E", 0.25), background: "rgba(216,115,94,0.04)" }}>
                      <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider" style={{ color: "#D8735E" }}>
                        <AlertTriangle className="h-3 w-3" /> Its blind spot
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: "#C9C6BD" }}>{ref.blind_spot}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {ref.figures && <span className="font-mono text-[10px]" style={{ color: "#6B7068" }}>Key thinkers: {ref.figures}</span>}
                    {onOpenLens && (
                      <button onClick={() => onOpenLens(l.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors"
                        style={{ borderColor: tint("#6FBDB4", 0.4), color: "#6FBDB4" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = tint("#6FBDB4", 0.08))}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        Run this lens in Intelligence <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[9px] leading-relaxed" style={{ color: "#565B54" }}>⚠ {LENSES_DISCLAIMER}</p>

      {/* ── Fields of economics ── */}
      <div className="mt-9 mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: "#C6A15B" }} />
        <h2 className="font-display text-[18px] font-semibold text-ink">Thirteen fields of economics</h2>
      </div>
      <p className="mb-4 max-w-2xl text-[12.5px] leading-relaxed text-muted-2">
        A real intelligence system leans on many fields at once — some to build and estimate the model, others to make it
        realistic about people, politics and the planet.
      </p>

      {FIELD_GROUPS.map((g) => (
        <div key={g.id} className="mb-6">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#8A8F88" }}>{g.label}</div>
          <p className="mb-2.5 text-[12px] text-muted-2">{g.blurb}</p>
          <div className="space-y-2">
            {FIELDS.filter((f) => f.group === g.id).map((f) => {
              const open = openField === f.id;
              return (
                <div key={f.id} className="overflow-hidden rounded-xl border transition-colors"
                  style={{ borderColor: open ? tint(f.color, 0.4) : "#232823", background: "linear-gradient(150deg, #131614, #101311)" }}>
                  <button onClick={() => setOpenField(open ? null : f.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: f.color }} />
                    <div className="min-w-0 flex-1">
                      <span className="text-[14px] font-medium text-ink">{f.name}</span>
                      {!open && <span className="ml-2 hidden truncate text-[11.5px] text-muted-2 sm:inline">{f.studies}</span>}
                    </div>
                    <span className="shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                      style={{ borderColor: tint(PRIORITY_COLOR[f.priority], 0.4), color: PRIORITY_COLOR[f.priority] }}>
                      {f.priority}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform" style={{ color: "#565B54", transform: open ? "rotate(180deg)" : "none" }} />
                  </button>

                  {open && (
                    <div className="border-t px-4 pb-3.5 pt-3" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>
                      <p className="text-[13px] leading-relaxed" style={{ color: "#C9C6BD" }}>{f.studies}</p>
                      <dl className="mt-2.5 space-y-1.5 text-[12px]">
                        <Row label="How it works" value={f.methods} />
                        <Row label="Data it uses" value={f.data} />
                        <Row label="Strength" value={f.strength} color="#7FB58A" />
                        <Row label="Limit" value={f.limit} color="#D8735E" />
                        <Row label="In this system" value={f.eios} color={f.color} />
                      </dl>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value, color = "#8A8F88" }) {
  return (
    <div className="flex gap-2.5">
      <dt className="w-[86px] shrink-0 font-mono text-[9px] uppercase tracking-wider" style={{ color }}>{label}</dt>
      <dd className="flex-1 leading-relaxed" style={{ color: "#C9C6BD" }}>{value}</dd>
    </div>
  );
}
