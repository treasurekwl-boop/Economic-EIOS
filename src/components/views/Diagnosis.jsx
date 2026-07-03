import {
  Stethoscope, RotateCcw, Check, TriangleAlert, TrendingDown, ArrowRight,
  Bolt, Train, ShieldAlert, Building2, GraduationCap, Droplets, Landmark,
} from "lucide-react";
import { useEngine } from "../../context/EngineContext.jsx";
import { CONSTRAINTS, BIG_FOUR, INVESTMENT, PARAMS, SETPOINT } from "../../config/model.js";
import { CONSTRAINT_COLORS, tint } from "../../config/palette.js";
import { CONCEPTS, INSIGHTS } from "../../config/learn.js";
import { tnum } from "../../lib/format.js";
import Gauge from "../ui/Gauge.jsx";
import InfoTip from "../ui/InfoTip.jsx";
import Insight from "../ui/Insight.jsx";

const ICONS = { Bolt, Train, ShieldAlert, Building2, GraduationCap, Droplets, Landmark };
const STATUS = {
  ok: "border-ok/40 text-ok bg-ok/[0.06]",
  warn: "border-signal/40 text-signal bg-signal/[0.06]",
  bad: "border-alert/40 text-alert bg-alert/[0.06]",
};

export default function Diagnosis() {
  const { reforms, setReforms, reformUplift, effective } = useEngine();
  const invNow = effective.investmentNow;
  const invYear = effective.years?.investment;

  const potential = PARAMS.POT_BASE + reformUplift;
  const reached = potential >= SETPOINT;
  const remaining = Math.max(0, SETPOINT - potential);

  const toggle = (id) => setReforms((p) => ({ ...p, [id]: !p[id] }));
  const reset = () => setReforms(Object.fromEntries(CONSTRAINTS.map((c) => [c.id, false])));
  const fixAll = () => setReforms(Object.fromEntries(CONSTRAINTS.map((c) => [c.id, true])));
  const fixBig4 = () => setReforms(Object.fromEntries(CONSTRAINTS.map((c) => [c.id, BIG_FOUR.includes(c.id)])));

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
          <Stethoscope className="h-3.5 w-3.5" /> Diagnosis &amp; Prescription
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">Why growth is stuck — and what must change</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          The problem isn't the repo rate — it's the{" "}
          <InfoTip concept={CONCEPTS.potential} color="#6FBDB4" align="left">speed limit</InfoTip>.
          Here's what's holding it down and the minimum set of fixes for a steady 3%. Tap a constraint to apply its{" "}
          <InfoTip concept={CONCEPTS.potentialLift} color="#C6A15B" align="left">reform uplift</InfoTip>.
        </p>
      </div>

      {/* Core finding */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl p-4" style={{ background: 'rgba(216,115,94,0.07)', border: '1px solid rgba(216,115,94,0.25)' }}>
          <div className="font-mono text-[10px] uppercase tracking-wider text-alert/80">The diagnosis</div>
          <div className="mt-1 text-[13px] font-semibold text-alert">A low speed limit</div>
          <p className="mt-1.5 text-[12px] leading-snug text-muted">Potential growth ~<span className="font-mono text-ink">1.3%</span>. Even at full use of current capacity it can't sustain 3% — so demand stimulus leaks into inflation.</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'rgba(198,161,91,0.07)', border: '1px solid rgba(198,161,91,0.25)' }}>
          <div className="font-mono text-[10px] uppercase tracking-wider text-signal/80">The root cause</div>
          <div className="mt-1 text-[13px] font-semibold text-signal">Chronic underinvestment</div>
          <div className="mt-2.5">
            <div className="flex items-end justify-between font-mono text-[11px]">
              <span className="text-muted">
                <InfoTip concept={CONCEPTS.gfcf} color="#C6A15B" align="left">GFCF</InfoTip>{invYear ? ` (${invYear})` : ""}
              </span>
              <span className="text-signal font-semibold">{invNow.toFixed(1)}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(35,40,35,0.8)' }}>
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.min(100, (invNow / INVESTMENT.target) * 100)}%`,
                  background: 'linear-gradient(90deg, rgba(198,161,91,0.5), #C6A15B)',
                  boxShadow: '0 0 8px rgba(198,161,91,0.4)',
                }}
              />
            </div>
            <div className="mt-1 text-right font-mono text-[10px] text-muted-2">NDP target {INVESTMENT.target}% of GDP</div>
          </div>
        </div>
        <div className="rounded-xl border border-line p-4" style={{ background: 'linear-gradient(145deg, #131614 0%, #101311 100%)' }}>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-2">Symptoms</div>
          <ul className="mt-2 space-y-1.5 text-[12px] text-muted">
            <li className="flex items-center gap-1.5"><TrendingDown className="h-3 w-3 shrink-0 text-alert" /> Construction: 9 years of decline</li>
            <li className="flex items-center gap-1.5"><TrendingDown className="h-3 w-3 shrink-0 text-alert" /> Manufacturing: 2 years negative</li>
            <li className="flex items-center gap-1.5"><TrendingDown className="h-3 w-3 shrink-0 text-alert" /> Investment still falling in 2026</li>
          </ul>
        </div>
      </div>

      {/* Prescription meter */}
      <div className="mt-5 rounded-xl border border-line p-5" style={{ background: 'linear-gradient(145deg, #131614 0%, #101311 100%)' }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-2">Potential growth after fixes</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`font-mono text-4xl font-bold ${reached ? "text-data" : "text-signal"}`}
                style={{ ...tnum, textShadow: reached ? '0 0 24px rgba(111,189,180,0.4)' : '0 0 24px rgba(198,161,91,0.4)' }}
              >
                {potential.toFixed(1)}%
              </span>
              <span className="font-mono text-sm text-muted-2">/ {SETPOINT.toFixed(1)}% target</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fixBig4} className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-data/40 hover:text-data">Fix the big 4</button>
            <button onClick={fixAll} className="rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-ok/40 hover:text-ok">Fix all</button>
            <button onClick={reset} className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-muted-2"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
          </div>
        </div>
        <div className="mt-4"><Gauge value={potential} setpoint={SETPOINT} min={0} max={4} reached={reached} labelRight="4%" /></div>
        <div
          className="mt-4 flex items-start gap-2.5 rounded-lg px-4 py-3 text-[12px]"
          style={reached
            ? { background: 'rgba(127,181,138,0.07)', border: '1px solid rgba(127,181,138,0.25)' }
            : { background: 'rgba(198,161,91,0.07)', border: '1px solid rgba(198,161,91,0.25)' }}
        >
          {reached
            ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
            : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-signal" />}
          <span className={reached ? "text-ok" : "text-signal"}>
            {reached
              ? `Steady 3% within reach — potential clears the target with ${(potential - SETPOINT).toFixed(1)}pp to spare. This is the durable kind, not borrowed.`
              : `Still ${remaining.toFixed(1)}pp short of a durable 3%. No single reform does it — the speed limit only rises when the stack is fixed together.`}
          </span>
        </div>
      </div>

      {/* Scorecard */}
      <div className="mt-5">
        <Insight color="#5B8DEF" label="The reforms bind as a stack">
          {INSIGHTS.reforms}
        </Insight>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-2">What's wrong — and what must change</h2>
          <span className="font-mono text-[11px] text-muted-2">tap to fix</span>
        </div>
        <div className="space-y-2.5">
          {CONSTRAINTS.map((c) => {
            const Icon = ICONS[c.icon];
            const on = reforms[c.id];
            const color = CONSTRAINT_COLORS[c.id];
            return (
              <div
                key={c.id}
                className="rounded-xl p-4 transition-all duration-200"
                style={on
                  ? { background: `linear-gradient(135deg, ${tint(color, 0.1)}, ${tint(color, 0.03)})`, border: `1px solid ${tint(color, 0.45)}`, boxShadow: `0 0 20px ${tint(color, 0.1)}`, borderLeftWidth: '3px' }
                  : { background: 'linear-gradient(145deg, #131614 0%, #101311 100%)', border: '1px solid rgba(35,40,35,1)', borderLeft: `3px solid ${tint(color, 0.55)}` }}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggle(c.id)}
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all"
                    style={on
                      ? { background: color, borderColor: color, color: '#0C0E0D', boxShadow: `0 0 8px ${tint(color, 0.5)}` }
                      : { borderColor: '#6B7068' }}
                  >
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </button>
                  {Icon && (
                    <div className="mt-0.5 shrink-0 rounded-lg p-1.5" style={{ background: tint(color, on ? 0.2 : 0.12) }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-ink">{c.name}</span>
                      <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${STATUS[c.status.tone]}`}>{c.status.tag}</span>
                      <span className="ml-auto font-mono text-[13px] font-bold" style={{ color }}>+{c.lift.toFixed(1)}pp</span>
                    </div>
                    <p className="mt-2 text-[12px] leading-snug text-muted"><span className="font-medium text-ink">Wrong: </span>{c.wrong}</p>
                    <p className="mt-1 flex items-start gap-1.5 text-[12px] leading-snug text-muted">
                      <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" style={{ color }} />
                      <span><span className="font-medium text-ink">Change: </span>{c.fix}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-line p-4 text-[11px] leading-relaxed text-muted-2" style={{ background: 'rgba(12,14,13,0.5)' }}>
        <span className="font-semibold text-muted">The order matters.</span> Fix binding constraints in sequence — energy and logistics first, because they gate the tradable economy. The two red tags, crime and the fiscal/wage-bill squeeze, are the biggest items sitting outside Operation Vulindlela, and the engine can't reach a comfortable 3% without them. The government has the right diagnosis and real wins; the weak link is delivery speed and the gaps the program doesn't cover. None of this is a job for the repo rate.
        <br /><br />
        Sources: Stats SA, National Treasury 2026 Budget, SARB, Operation Vulindlela progress reports. Potential-growth uplifts are illustrative estimates from published reform-impact ranges, not forecasts.
      </div>
    </div>
  );
}
