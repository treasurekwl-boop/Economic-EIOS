import { useState, useEffect, useMemo } from "react";
import { Landmark, CalendarClock, Info } from "lucide-react";
import { fetchMacro } from "../../lib/dataApi.js";
import { repoDecision, OUTCOME_LABELS } from "../../lib/repoModel.js";
import { RELEASES, daysUntil } from "../../config/calendar.js";
import { tint } from "../../config/palette.js";

const nextMPC = () => RELEASES.filter((r) => r.node === "repo" && daysUntil(r.iso) >= -1).sort((a, b) => a.iso.localeCompare(b.iso))[0];
const barColor = (k) => (k.startsWith("cut") ? "#6FBDB4" : k === "hold" ? "#7FB58A" : "#C6A15B");

export default function RepoRate() {
  const [macro, setMacro] = useState(null);
  const [repo, setRepo] = useState(7.0);
  const [cpi, setCpi] = useState(4.5);
  const [randTrend, setRandTrend] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    fetchMacro().then((m) => {
      setMacro(m);
      if (!touched) {
        if (m.byId?.sa_repo?.value != null) setRepo(Number(m.byId.sa_repo.value));
        if (m.byId?.sa_cpi_yoy?.value != null) setCpi(Number(m.byId.sa_cpi_yoy.value));
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fed = macro?.byId?.fedfunds?.value != null ? Number(macro.byId.fedfunds.value) : null;
  const inputsLive = macro?.byId?.sa_repo?.value != null && macro?.byId?.sa_cpi_yoy?.value != null;
  const mpc = nextMPC();

  const R = useMemo(
    () => repoDecision({ repo, cpi, fedFunds: fed ?? undefined, randTrend: randTrend || undefined }),
    [repo, cpi, fed, randTrend]
  );
  const order = ["cut50", "cut25", "hold", "hike25", "hike50"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 animate-fade-up">
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#C6A15B" }}>
          <Landmark className="h-3.5 w-3.5" /> Repo-rate model · Next MPC decision
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">What the SARB is likely to do</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          A transparent Taylor rule + rand-defence + rate-smoothing model, turned into probabilities. The most
          forecastable call in the app — because the SARB telegraphs. Every term is shown; nothing is a black box.
        </p>
      </div>

      {/* Next MPC */}
      {mpc && (
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border px-4 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
          <span className="flex items-center gap-2 text-[13px] font-medium text-ink"><CalendarClock className="h-4 w-4" style={{ color: "#6FBDB4" }} /> Next MPC · {new Date(mpc.iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" })}</span>
          <span className="font-mono text-[11px]" style={{ color: daysUntil(mpc.iso) <= 7 ? "#C6A15B" : "#6B7068" }}>{daysUntil(mpc.iso) <= 0 ? "decision imminent" : `in ${daysUntil(mpc.iso)} days`}</span>
          <span className="font-mono text-[11px]" style={{ color: "#565B54" }}>consensus: {mpc.consensus}</span>
        </div>
      )}

      {/* The distribution — the hero */}
      <div className="mb-5 rounded-2xl border p-5" style={{ borderColor: tint("#C6A15B", 0.28), background: "linear-gradient(160deg, rgba(198,161,91,0.05), #101311 65%)" }}>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">Model call</span>
          <span className="font-display text-[15px] font-semibold" style={{ color: barColor(R.modal) }}>
            {OUTCOME_LABELS[R.modal]} · {Math.round(R.prob * 100)}%
          </span>
        </div>
        <div className="space-y-2">
          {order.map((k) => {
            const p = R.dist[k];
            const isModal = k === R.modal;
            return (
              <div key={k} className="flex items-center gap-3">
                <span className="w-[68px] shrink-0 text-right font-mono text-[11px]" style={{ color: isModal ? "#ECEAE3" : "#8A8F88" }}>{OUTCOME_LABELS[k]}</span>
                <div className="h-5 flex-1 overflow-hidden rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="h-full rounded transition-all duration-300" style={{ width: `${Math.max(p * 100, 0.6)}%`, background: barColor(k), opacity: isModal ? 1 : 0.5 }} />
                </div>
                <span className="w-[42px] shrink-0 font-mono text-[11px] tabular-nums" style={{ color: isModal ? "#ECEAE3" : "#6B7068" }}>{Math.round(p * 100)}%</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1 border-t pt-3 font-mono text-[10px]" style={{ borderColor: "#1E231F", color: "#6B7068" }}>
          <span>model-implied rate r* = <b style={{ color: "#ECEAE3" }}>{R.rStar.toFixed(2)}%</b></span>
          <span>current repo = <b style={{ color: "#ECEAE3" }}>{repo.toFixed(2)}%</b></span>
          <span>gap = <b style={{ color: R.gap > 0.15 ? "#C6A15B" : R.gap < -0.15 ? "#6FBDB4" : "#7FB58A" }}>{R.gap >= 0 ? "+" : ""}{R.gap.toFixed(2)}%</b></span>
        </div>
      </div>

      {/* Inputs */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <Slider label="Current repo rate" value={repo} min={5} max={10} step={0.25} unit="%" onChange={(v) => { setRepo(v); setTouched(true); }} />
        <Slider label="CPI inflation (YoY)" value={cpi} min={0} max={12} step={0.1} unit="%" onChange={(v) => { setCpi(v); setTouched(true); }} />
        <Slider label="Recent rand move" value={randTrend} min={-10} max={10} step={0.5} unit="%" hint={randTrend >= 0 ? "weaker (hawkish)" : "firmer (dovish)"} onChange={(v) => { setRandTrend(v); setTouched(true); }} />
        <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-2">US Fed funds (from feed)</div>
          <div className="mt-0.5 font-display text-[20px] font-semibold tabular-nums" style={{ color: fed != null ? "#6FBDB4" : "#565B54" }}>{fed != null ? `${fed.toFixed(2)}%` : "—"}</div>
          <div className="font-mono text-[8.5px]" style={{ color: "#565B54" }}>{fed != null ? "live · defends the rand spread" : "activate macro feed"}</div>
        </div>
      </div>

      {/* Drivers */}
      <div className="mb-5">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">Why · what's pushing r*</div>
        <div className="space-y-1.5">
          {R.drivers.map((d, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
              <span className="flex-1 text-[12.5px] text-ink">{d.label}</span>
              <span className="font-mono text-[11px]" style={{ color: d.effect > 0.02 ? "#C6A15B" : d.effect < -0.02 ? "#6FBDB4" : "#6B7068" }}>
                {d.base ? "→ r* " : d.effect >= 0 ? "+" : ""}{d.base ? "" : `${d.effect.toFixed(2)}%`}
                {d.base ? `${(R.neutralNominal + 0).toFixed(2)}% base` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logging status — honest */}
      <div className="rounded-xl border px-4 py-3" style={{ borderColor: inputsLive ? tint("#7FB58A", 0.3) : tint("#C6A15B", 0.3), background: inputsLive ? "rgba(127,181,138,0.06)" : "rgba(198,161,91,0.05)" }}>
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: inputsLive ? "#7FB58A" : "#C6A15B" }} />
          <div className="text-[12px] leading-relaxed text-muted">
            {inputsLive ? (
              <>Your live repo &amp; CPI are set, so around each MPC this call is <b className="text-ink">logged to the Track record</b> and scored after the decision. The sliders above are for exploration — the logged call uses your saved data.</>
            ) : (
              <>This is running on <b className="text-ink">default values</b> ({repo.toFixed(2)}% repo, {cpi.toFixed(1)}% CPI). To have real calls <b className="text-ink">logged and graded</b> in Track record, set your live numbers once in Supabase:
                <code className="mt-1.5 block rounded bg-black/40 px-2 py-1 font-mono text-[10px]" style={{ color: "#9A978E" }}>update macro_series set value=7.00, as_of=current_date where id='sa_repo';<br />update macro_series set value=4.5, as_of=current_date where id='sa_cpi_yoy';</code>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>
        Method: r* = neutral nominal ({R.neutralNominal.toFixed(1)}%) + 1.5·(CPI − target), adjusted for the Fed spread and rand,
        then a softmax over the 25bp choices with a smoothing penalty (central banks move gradually). No FRA/market-implied
        curve (no free source), so this is a model view, not the market's — the disagreement is itself informative. Calibration
        improves as the scorecard accrues real MPC outcomes. Modelled estimate, not advice.
      </p>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, hint, onChange }) {
  return (
    <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-2">{label}</span>
        <span className="font-display text-[18px] font-semibold tabular-nums text-ink">{value.toFixed(step < 1 ? (step < 0.25 ? 1 : 2) : 0)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-1.5 block w-full accent-teal" />
      {hint && <div className="font-mono text-[8.5px]" style={{ color: "#565B54" }}>{hint}</div>}
    </div>
  );
}
