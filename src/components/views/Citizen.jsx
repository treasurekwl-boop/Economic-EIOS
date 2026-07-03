import {
  Users, PiggyBank, GraduationCap, Store, ShoppingBag, Receipt,
  ShieldCheck, Sun, Droplets, Landmark, RotateCcw, Check, HandCoins, Sparkles,
  MapPin, ChevronDown, Plus,
} from "lucide-react";
import { useEngine } from "../../context/EngineContext.jsx";
import { PARAMS } from "../../config/model.js";
import {
  PEOPLE, CITIZEN_ROLES, CITIZEN_ACTIONS, PULL_WEIGHT, PROVINCES,
  CITIZEN_INSIGHT, participationLabel,
} from "../../config/citizen.js";
import { tint } from "../../config/palette.js";
import { CONCEPTS } from "../../config/learn.js";
import { tnum } from "../../lib/format.js";
import { usePersistedState } from "../../lib/usePersistedState.js";
import Stat from "../ui/Stat.jsx";
import InfoTip from "../ui/InfoTip.jsx";
import Insight from "../ui/Insight.jsx";
import MyPartCard from "../ui/MyPartCard.jsx";

const ICONS = { PiggyBank, GraduationCap, Store, ShoppingBag, Receipt, ShieldCheck, Sun, Droplets, Landmark };
const DEFAULT_COMMIT = { local: true, power: true, water: true };

export default function Citizen() {
  const { setpoint, reformUplift } = useEngine();

  // Persisted: a pledge that survives a refresh is the whole point of "real".
  const [provinceId, setProvinceId] = usePersistedState("ge.yourpart.province", "national");
  const [committed, setCommitted] = usePersistedState("ge.yourpart.committed", DEFAULT_COMMIT);
  const [participation, setParticipation] = usePersistedState("ge.yourpart.participation", 0.25);
  const [roles, setRoles] = usePersistedState("ge.yourpart.roles", {});

  const province = PROVINCES.find((p) => p.id === provinceId) ?? PROVINCES[0];
  const anyRole = Object.values(roles).some(Boolean);

  const toggleRole = (id) => setRoles((p) => ({ ...p, [id]: !p[id] }));
  const toggleCommit = (id) => setCommitted((p) => ({ ...p, [id]: !p[id] }));
  const reset = () => { setCommitted(DEFAULT_COMMIT); setParticipation(0.25); setRoles({}); };

  const committedActions = CITIZEN_ACTIONS.filter((a) => committed[a.id]);
  const pledgeCount = committedActions.length;
  const upliftFull = committedActions.reduce((s, a) => s + a.slice, 0); // everyone pledges like you, 100%
  const citizenUplift = upliftFull * participation;

  const base = PARAMS.POT_BASE;
  const potential = base + reformUplift + citizenUplift;
  const reached = potential >= setpoint;
  const peoplePulling = (participation * PEOPLE.workingAge) / 1000; // millions

  const max = 4;
  const seg = (v) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;

  const recAction = CITIZEN_ACTIONS.find((a) => a.id === province.leadAction);

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 animate-fade-up">
      {/* Header + province selector */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-mint">
            <Users className="h-3.5 w-3.5" /> The People Side · Microeconomics
          </div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">Every citizen is a coefficient</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
            The macro engine's big letters — <span className="text-data">C</span>, <span className="text-violet">I</span>, the{" "}
            <InfoTip concept={CONCEPTS.potential} color="#7FB58A" align="left">speed limit</InfoTip>
            {" "}— are just the sum of millions of household choices. Pick your corner, make your pledge, see what it's worth.
          </p>
        </div>
        <label className="relative flex shrink-0 items-center">
          <MapPin className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-mint" />
          <span className="sr-only">Province</span>
          <select
            value={provinceId}
            onChange={(e) => setProvinceId(e.target.value)}
            className="appearance-none rounded-lg border border-line bg-surface/80 py-2 pl-8 pr-8 font-mono text-[12px] text-ink transition-colors hover:border-mint/50 focus:border-mint"
          >
            {PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted" />
        </label>
      </div>

      {/* Hook */}
      <Insight color="#7FB58A" label="Your role in this" icon={Sparkles}>
        {CITIZEN_INSIGHT}
      </Insight>

      {/* This is you */}
      <div className="mt-5">
        <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-2">
          <HandCoins className="h-3.5 w-3.5" /> This is you — tap the hats you wear
        </div>
        <div className="flex flex-wrap gap-2">
          {CITIZEN_ROLES.map((r) => {
            const sel = roles[r.id];
            return (
              <button
                key={r.id}
                onClick={() => toggleRole(r.id)}
                className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
                style={sel
                  ? { background: tint(r.color, 0.16), borderColor: tint(r.color, 0.6), color: r.color }
                  : { background: "rgba(19,22,20,0.6)", borderColor: "rgba(35,40,35,1)", color: "#8A8F88" }}
              >
                {r.label}
              </button>
            );
          })}
          {anyRole && (
            <button onClick={() => setRoles({})} className="rounded-full px-2.5 py-1.5 text-[12px] text-muted-2 hover:text-ink">clear</button>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="My pledge" value={`${pledgeCount}/${CITIZEN_ACTIONS.length}`} tone="mint" sub="saved on this device" />
        <Stat label="Citizen uplift" value={`+${citizenUplift.toFixed(2)}pp`} tone="data" sub={`at ${Math.round(participation * 100)}% taking part`} />
        <Stat label="Combined potential" value={`${potential.toFixed(2)}%`} tone={reached ? "ok" : "amber"} sub={`base ${base} + gov ${reformUplift.toFixed(1)} + you ${citizenUplift.toFixed(2)}`} />
        <Stat label="People pulling" value={`${peoplePulling.toFixed(1)}m`} tone="muted" sub={participationLabel(participation)} />
      </div>

      {/* Centerpiece: the combined speed-limit gauge */}
      <div className="mt-4 rounded-xl border border-line p-5" style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-2">Potential growth — raised from above and below</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`font-mono text-4xl font-bold ${reached ? "text-ok" : "text-mint"}`}
                style={{ ...tnum, textShadow: reached ? "0 0 24px rgba(127,181,138,0.4)" : "0 0 24px rgba(127,181,138,0.4)" }}
              >
                {potential.toFixed(2)}%
              </span>
              <span className="font-mono text-sm text-muted-2">/ {setpoint.toFixed(1)}% target</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-2">{participationLabel(participation)}</div>
            <div className="font-mono text-sm text-mint">{peoplePulling.toFixed(1)}m of {(PEOPLE.workingAge / 1000).toFixed(0)}m taking part</div>
          </div>
        </div>

        {/* stacked contribution bar */}
        <div className="mt-4">
          <div className="relative flex h-5 w-full overflow-hidden rounded-full" style={{ background: "rgba(12,14,13,0.8)", border: "1px solid rgba(35,40,35,0.8)" }}>
            <div className="h-full transition-all duration-300" style={{ width: seg(base), background: "rgba(138,143,136,0.35)" }} title="base potential" />
            <div className="h-full transition-all duration-300" style={{ width: seg(reformUplift), background: "linear-gradient(90deg, rgba(198,161,91,0.5), #C6A15B)" }} title="government reforms" />
            <div className="h-full transition-all duration-300" style={{ width: seg(citizenUplift), background: "linear-gradient(90deg, rgba(127,181,138,0.6), #7FB58A)", boxShadow: "0 0 12px rgba(127,181,138,0.5)" }} title="citizens" />
            <div className="absolute inset-y-0 w-0.5 -translate-x-1/2" style={{ left: seg(setpoint), background: "#ECEAE3", boxShadow: "0 0 8px rgba(236,234,227,0.8)" }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px]">
            <Legend color="rgba(138,143,136,0.6)" label={`base ${base.toFixed(1)}`} />
            <Legend color="#C6A15B" label={`government reforms +${reformUplift.toFixed(1)}`} />
            <Legend color="#7FB58A" label={`citizens +${citizenUplift.toFixed(2)}`} />
            <span className="ml-auto text-muted-2">target {setpoint.toFixed(1)}%</span>
          </div>
        </div>

        {/* participation slider */}
        <div className="mt-5 border-t border-line/60 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] text-muted">Now imagine how many do what <span className="text-mint">you</span> just pledged</span>
            <span className="font-mono text-[13px] font-semibold text-mint">{Math.round(participation * 100)}%</span>
          </div>
          <input
            type="range" min={0} max={1} step={0.01} value={participation}
            onChange={(e) => setParticipation(+e.target.value)}
            className="w-full" style={{ accentColor: "#7FB58A" }}
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-2">
            <span>Just you</span><span>A movement</span><span>The whole country</span>
          </div>
        </div>

        <div
          className="mt-4 flex items-start gap-2.5 rounded-lg px-4 py-3 text-[12px]"
          style={reached
            ? { background: "rgba(127,181,138,0.07)", border: "1px solid rgba(127,181,138,0.25)" }
            : { background: "rgba(127,181,138,0.06)", border: "1px solid rgba(127,181,138,0.22)" }}
        >
          {reached ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> : <Users className="mt-0.5 h-4 w-4 shrink-0 text-mint" />}
          <span className={reached ? "text-ok" : "text-mint"}>
            {reached
              ? "Together it clears the line. Government reforms from above and citizens from below put durable 3% within reach — neither half gets there alone."
              : pledgeCount === 0
              ? "You haven't pledged yet. Commit to a few actions below and watch the citizen band grow."
              : `If every working-age South African made your pledge, citizens alone add +${upliftFull.toFixed(2)}pp. Set government reforms in Diagnosis and turn up participation to close the gap.`}
          </span>
        </div>
      </div>

      {/* Local highlight */}
      {recAction && (
        <div
          className="mt-4 flex flex-wrap items-center gap-3 rounded-xl p-4"
          style={{ background: `linear-gradient(120deg, ${tint(recAction.color, 0.1)}, #101311)`, border: `1px solid ${tint(recAction.color, 0.35)}` }}
        >
          <div className="shrink-0 rounded-lg p-2" style={{ background: tint(recAction.color, 0.16) }}>
            <MapPin className="h-4 w-4" style={{ color: recAction.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: recAction.color }}>
              What {province.name} most needs
            </div>
            <p className="mt-0.5 text-[12.5px] leading-snug text-ink/90">{province.lead}</p>
          </div>
          <button
            onClick={() => toggleCommit(recAction.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-all"
            style={committed[recAction.id]
              ? { background: tint(recAction.color, 0.15), color: recAction.color, border: `1px solid ${tint(recAction.color, 0.5)}` }
              : { background: recAction.color, color: "#0C0E0D", boxShadow: `0 0 14px ${tint(recAction.color, 0.4)}` }}
          >
            {committed[recAction.id] ? <><Check className="h-3.5 w-3.5" /> In your pledge</> : <><Plus className="h-3.5 w-3.5" /> Add {recAction.name}</>}
          </button>
        </div>
      )}

      {/* Action grid — the pledge */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-muted-2">Your pledge — commit to what you'll actually do</h2>
          <button onClick={reset} className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-muted-2">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CITIZEN_ACTIONS.map((a) => {
            const Icon = ICONS[a.icon];
            const active = committed[a.id];
            const dim = anyRole && !roles[a.role];
            const isRec = a.id === province.leadAction;
            return (
              <button
                key={a.id}
                onClick={() => toggleCommit(a.id)}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${dim ? "opacity-45" : ""}`}
                style={active
                  ? { background: `linear-gradient(145deg, ${tint(a.color, 0.08)}, #101311)`, borderColor: tint(a.color, 0.5) }
                  : { background: "linear-gradient(145deg, #131614 0%, #101311 100%)", borderColor: "rgba(35,40,35,1)" }}
              >
                {isRec && (
                  <span className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider" style={{ background: tint(a.color, 0.16), color: a.color }}>
                    {province.short} pick
                  </span>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg p-2" style={{ background: tint(a.color, active ? 0.18 : 0.08) }}>
                      <Icon style={{ color: active ? a.color : "#6B7068", width: 18, height: 18 }} />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink">{a.name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: active ? a.color : "#6B7068" }}>{a.channel}</div>
                    </div>
                  </div>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all"
                    style={active ? { background: a.color, borderColor: a.color, color: "#0C0E0D" } : { borderColor: "#6B7068" }}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                </div>

                <p className="mt-3 text-[11.5px] leading-snug text-muted">{a.why}</p>
                <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-snug text-ink/80">
                  <span className="mt-px font-mono text-[10px] uppercase" style={{ color: a.color }}>Do</span>
                  <span>{a.act}</span>
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-2.5">
                  <span className="font-mono text-[10px] text-muted-2">at full national uptake</span>
                  <span className="font-mono text-[13px] font-bold" style={{ color: active ? a.color : "#6B7068" }}>+{a.slice.toFixed(2)}pp</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shareable card */}
      <div className="mt-6">
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-2">Your card — make it count, pass it on</h2>
        {pledgeCount > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <MyPartCard
              provinceName={province.name}
              actions={committedActions.map((a) => ({ id: a.id, name: a.name, color: a.color }))}
              upliftFull={upliftFull}
            />
            <div className="rounded-xl border border-line p-4" style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
              <div className="font-mono text-[10px] uppercase tracking-wider text-mint">Why share it</div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                The whole model turns on participation. One pledge is a rounding error; a movement is{" "}
                <span className="font-mono text-mint">+{upliftFull.toFixed(2)}pp</span> of potential growth. Your card is the nudge that turns one into many — download it, post it, dare the next person to find their part.
              </p>
              <p className="mt-3 border-t border-line/60 pt-3 text-[11px] leading-snug text-muted-2">
                Saved to this device, so your pledge is here when you come back. Nothing leaves your browser.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line p-6 text-center" style={{ background: "rgba(19,22,20,0.4)" }}>
            <Users className="mx-auto h-6 w-6 text-muted-2" />
            <p className="mt-2 text-[13px] text-muted">Commit to at least one action above to build your shareable card.</p>
          </div>
        )}
      </div>

      {/* Where we must pull weight — localized */}
      <div className="mt-6">
        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-2">
          Where {province.name} isn't yet pulling its weight
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PULL_WEIGHT.map((m) => {
            const value = m.scope === "province" ? province[m.field] : m.value;
            const lower = m.dir === "lower";
            // Bar fills toward the goal: higher-is-better fills as value rises to
            // target; lower-is-better fills as value falls to target.
            const pct = lower
              ? Math.min(100, (m.target / value) * 100)
              : Math.min(100, (value / m.target) * 100);
            return (
              <div key={m.id} className="rounded-xl border border-line p-4" style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
                <div className="flex items-end justify-between">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    {m.label}
                    <span className="rounded border border-line px-1 py-px font-mono text-[8px] uppercase tracking-wider text-muted-2">
                      {m.scope === "province" ? province.short : "national"}
                    </span>
                  </span>
                  <span className="font-mono text-[12px]">
                    <span style={{ color: m.color }}>{value}%</span>
                    <span className="text-muted-2"> · goal {lower ? "≤" : "≥"}{m.target}%</span>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: "rgba(35,40,35,0.8)" }}>
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tint(m.color, 0.5)}, ${m.color})`, boxShadow: `0 0 8px ${tint(m.color, 0.4)}` }} />
                </div>
                <p className="mt-2 text-[11px] leading-snug text-muted-2">{m.note}</p>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-7 border-t border-line/60 pt-5 font-mono text-[11px] leading-relaxed text-muted-2">
        The People Side · provincial figures are the official unemployment rate from Stats SA QLFS Q1 2026 (released 12 May
        2026): national 32.7%, Western Cape 20.0% (lowest), Eastern Cape 44.6% (highest). National municipal collection is the
        Treasury Section 71 aggregate (2024/25, 72.9% actual vs 94.8% budgeted) with indicative provincial splits. Citizen
        uplifts are illustrative, conservative estimates that map everyday behaviour onto the same constraints and investment
        channels the macro engine uses — not forecasts. Government reform uplift carries over from the Diagnosis tab. Your
        pledge is stored only in this browser.
      </footer>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-2">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
