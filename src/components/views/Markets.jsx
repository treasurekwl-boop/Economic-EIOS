import { useState } from "react";
import {
  Scale, Fuel, Wheat, Bolt, Drumstick, Home, HardHat, RotateCcw, TriangleAlert,
  Sandwich, Beef, Egg, Candy, Droplets, Mountain, Building2, Factory, Car, Bus,
  Plane, CreditCard, HeartPulse, Smartphone, Shield, GraduationCap, Briefcase,
  Coins, Gem, Citrus, Share2, ArrowRight, History,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, ReferenceDot, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { MARKETS, CATEGORIES, MARKETS_AS_OF, MARKET_HISTORY } from "../../config/markets.js";
import { CONCEPTS } from "../../config/learn.js";
import { tint } from "../../config/palette.js";
import { tnum } from "../../lib/format.js";
import InfoTip from "../ui/InfoTip.jsx";
import Insight from "../ui/Insight.jsx";

const ICONS = {
  Fuel, Wheat, Bolt, Drumstick, Home, HardHat, Sandwich, Beef, Egg, Candy,
  Droplets, Mountain, Building2, Factory, Car, Bus, Plane, CreditCard,
  HeartPulse, Smartphone, Shield, GraduationCap, Briefcase, Coins, Gem, Citrus,
};
const D_COLOR = "#6FBDB4";   // demand — always teal, app-wide
const S_COLOR = "#C6A15B";   // supply — always amber, app-wide

// Markets that map cleanly onto a node in the economic brain, so a price move
// here can propagate through the whole economy (drought → food → CPI → repo).
const MARKET_NODE = {
  maize: "maize", bread: "food", poultry: "food", beef: "food", eggs: "food", sugar: "food",
  petrol: "fuel", electricity: "energy", water: "water", coal: "mining",
  credit: "credit", labour: "unemp", skilled: "skills",
  gold: "gold", platinum: "platinum", citrus: "agri",
};

// Annotated price history — what happened when, not just today's number.
function PriceHistory({ m }) {
  const h = MARKET_HISTORY[m.id];
  if (!h) return null;
  const data = h.series.map(([t, p]) => ({ t, p }));
  const pAt = (at) => { const f = h.series.find(([t]) => t === at); return f ? f[1] : null; };
  return (
    <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)" }}>
      <div className="mb-2 flex items-center gap-2">
        <History className="h-3.5 w-3.5" style={{ color: m.color }} />
        <span className="font-display text-[15px] text-ink">Price history</span>
        <span className="font-mono text-[10px] text-muted-2">{h.unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 2 }}>
          <XAxis dataKey="t" tick={{ fill: "#6B7068", fontSize: 9 }} stroke="#232823" />
          <YAxis tick={{ fill: "#565B54", fontSize: 9 }} stroke="#232823" width={38} domain={["auto", "auto"]} />
          <Line dataKey="p" stroke={m.color} strokeWidth={2} dot={{ r: 2, fill: m.color }} isAnimationActive={false} />
          {h.events.map((e, i) => (
            <ReferenceDot key={i} x={e.at} y={pAt(e.at)} r={5} fill="#101311" stroke={m.color} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 space-y-1.5 border-t pt-2.5" style={{ borderColor: "#1E231F" }}>
        <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#565B54" }}>What happened, when</div>
        {h.events.map((e, i) => (
          <div key={i} className="flex items-start gap-2 text-[11.5px] leading-snug">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: m.color }} />
            <span className="w-14 shrink-0 font-mono text-[10px]" style={{ color: m.color }}>{e.at}</span>
            <span className="text-muted"><span className="font-medium text-ink">{e.title}</span> — {e.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Markets({ onOpenGraph }) {
  const [cat, setCat] = useState("food");
  const [id, setId] = useState("maize");
  const [dD, setDD] = useState(0);
  const [dS, setDS] = useState(0);
  const [active, setActive] = useState([]);
  const [controlOn, setControlOn] = useState(true);

  const m = MARKETS.find((x) => x.id === id);
  const catMarkets = MARKETS.filter((x) => x.cat === cat);

  const switchMarket = (nid) => { setId(nid); setDD(0); setDS(0); setActive([]); setControlOn(true); };
  const switchCat = (ncat) => {
    setCat(ncat);
    const first = MARKETS.find((x) => x.cat === ncat);
    if (first) switchMarket(first.id);
  };
  const toggleShifter = (sid) => setActive((p) => p.includes(sid) ? p.filter((x) => x !== sid) : [...p, sid]);
  const reset = () => { setDD(0); setDS(0); setActive([]); };

  // Effective intercepts: manual sliders + active scenario shifters
  const shifts = m.shifters.filter((s) => active.includes(s.id));
  const totD = dD + shifts.reduce((a, s) => a + s.dD, 0);
  const totS = dS + shifts.reduce((a, s) => a + s.dS, 0);
  const aD = m.d.a + totD, bD = m.d.b;
  const aS = m.s.a + totS, bS = m.s.b;

  // Equilibrium (current and baseline)
  const qStar = Math.max(0, Math.min(100, (aD - aS) / (bD + bS)));
  const pStar = aD - bD * qStar;
  const q0 = Math.max(0, Math.min(100, (m.d.a - m.s.a) / (bD + bS)));
  const p0 = m.d.a - bD * q0;
  const shifted = totD !== 0 || totS !== 0;

  // Price control analysis
  const ctrl = m.control;
  const ctrlActive = ctrl && controlOn;
  const binding = ctrlActive && (ctrl.type === "ceiling" ? ctrl.value < pStar : ctrl.value > pStar);
  let qd = 0, qs = 0, gap = 0;
  if (binding) {
    qd = Math.max(0, Math.min(100, (aD - ctrl.value) / bD));
    qs = Math.max(0, Math.min(100, (ctrl.value - aS) / bS));
    gap = Math.abs(qd - qs);
  }

  const data = [];
  for (let q = 0; q <= 100; q += 2) {
    const D = aD - bD * q;
    const S = aS + bS * q;
    data.push({ q, D: D >= 0 ? +D.toFixed(2) : null, S: S >= 0 ? +S.toFixed(2) : null });
  }
  const yMax = Math.ceil(Math.max(aD, m.d.a) * 1.05);
  const fmtP = (v) => (v >= 1000 ? Math.round(v).toLocaleString("en-ZA") : v < 100 ? v.toFixed(1) : `${Math.round(v)}`);
  const GAP_NAME = { electricity: "= load-shedding", water: "= outages & restrictions", labour: "= unemployment", credit: "= borrowing rationed" };

  const Icon = ICONS[m.icon];

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 animate-fade-up">
      {/* Header */}
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-pink">
          <Scale className="h-3.5 w-3.5" /> Micro markets · Supply &amp; demand
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">Every price is a crossing point</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          Interactive{" "}
          <InfoTip concept={CONCEPTS.supplyDemand} color="#D98BB6" align="left">supply &amp; demand</InfoTip>
          {" "}models for <span className="font-mono text-pink">{MARKETS.length} SA markets</span> across{" "}
          {CATEGORIES.length} categories, {MARKETS_AS_OF}. Fire a scenario and watch the price move — this is the
          microeconomics underneath every macro number on the board.
        </p>
      </div>

      {/* Category tabs */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => {
          const on = c.id === cat;
          const n = MARKETS.filter((x) => x.cat === c.id).length;
          return (
            <button key={c.id} onClick={() => switchCat(c.id)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all"
              style={on
                ? { background: tint(c.color, 0.14), borderColor: tint(c.color, 0.55), color: c.color }
                : { background: "rgba(19,22,20,0.6)", borderColor: "rgba(35,40,35,1)", color: "#8A8F88" }}>
              {c.label}
              <span className="rounded-full px-1.5 font-mono text-[9px]" style={{ background: tint(on ? c.color : "#6B7068", 0.15) }}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* Market chips within category */}
      <div className="mt-2.5 flex flex-wrap gap-2">
        {catMarkets.map((mk) => {
          const MIcon = ICONS[mk.icon];
          const on = mk.id === id;
          return (
            <button key={mk.id} onClick={() => switchMarket(mk.id)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
              style={on
                ? { background: tint(mk.color, 0.15), borderColor: tint(mk.color, 0.6), color: mk.color }
                : { background: "rgba(19,22,20,0.6)", borderColor: "rgba(35,40,35,1)", color: "#8A8F88" }}>
              <MIcon className="h-3.5 w-3.5" /> {mk.name}
              {mk.control && <span className="font-mono text-[8px] uppercase tracking-wider opacity-70">· {mk.control.type}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Chart */}
        <section className="lg:col-span-3">
          <div className="rounded-xl border border-line p-4" style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: m.color }} />
                <span className="text-[14px] font-semibold text-ink">{m.name}</span>
                <span className="font-mono text-[10px] text-muted-2">{m.unitP}</span>
              </div>
              <div className="flex gap-3 font-mono text-[10px]">
                <span style={{ color: D_COLOR }}>— Demand</span>
                <span style={{ color: S_COLOR }}>— Supply</span>
                {ctrlActive && <span className="text-alert">- - {ctrl.label}</span>}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ left: 4, right: 16, top: 10, bottom: 4 }}>
                <XAxis dataKey="q" type="number" domain={[0, 100]} tick={{ fill: "#6B7068", fontSize: 10 }} stroke="#232823"
                  label={{ value: m.unitQ, fill: "#6B7068", fontSize: 10, position: "insideBottomRight", dy: 8 }} />
                <YAxis domain={[0, yMax]} tick={{ fill: "#6B7068", fontSize: 10 }} stroke="#232823" width={36} />
                <Line dataKey="D" stroke={D_COLOR} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line dataKey="S" stroke={S_COLOR} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                {shifted && <ReferenceDot x={q0} y={p0} r={4} fill="#6B7068" stroke="none" />}
                <ReferenceDot x={qStar} y={pStar} r={6} fill="#ECEAE3" stroke={m.color} strokeWidth={2} />
                {ctrlActive && (
                  <ReferenceLine y={ctrl.value} stroke="#D8735E" strokeDasharray="6 4"
                    label={{ value: ctrl.label, fill: "#D8735E", fontSize: 10, position: "insideTopRight" }} />
                )}
                {binding && (
                  <ReferenceLine segment={[{ x: Math.min(qd, qs), y: ctrl.value }, { x: Math.max(qd, qs), y: ctrl.value }]}
                    stroke="#D8735E" strokeWidth={4} opacity={0.65} />
                )}
              </LineChart>
            </ResponsiveContainer>

            {/* Readout */}
            <div className="mt-2 grid grid-cols-2 gap-2.5 border-t border-line/60 pt-3 sm:grid-cols-3">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-2">
                  <InfoTip concept={CONCEPTS.equilibrium} color={m.color} align="left">Equilibrium price</InfoTip>
                </div>
                <div className="font-mono text-lg font-bold" style={{ ...tnum, color: m.color }}>{fmtP(pStar)}</div>
                {shifted && (
                  <div className={`font-mono text-[10px] ${pStar > p0 ? "text-alert" : pStar < p0 ? "text-ok" : "text-muted-2"}`}>
                    {pStar > p0 ? "▲" : pStar < p0 ? "▼" : "—"} from {fmtP(p0)}
                  </div>
                )}
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-2">Equilibrium quantity</div>
                <div className="font-mono text-lg font-bold text-ink" style={tnum}>{qStar.toFixed(0)}</div>
                {shifted && (
                  <div className={`font-mono text-[10px] ${qStar < q0 ? "text-alert" : qStar > q0 ? "text-ok" : "text-muted-2"}`}>
                    {qStar > q0 ? "▲" : qStar < q0 ? "▼" : "—"} from {q0.toFixed(0)}
                  </div>
                )}
              </div>
              {binding ? (
                <div className="col-span-2 sm:col-span-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-alert">
                    {ctrl.type === "ceiling" ? "Shortage" : "Surplus"}
                  </div>
                  <div className="font-mono text-lg font-bold text-alert" style={tnum}>{gap.toFixed(0)}</div>
                  <div className="font-mono text-[10px] text-muted-2">
                    {GAP_NAME[m.id] ?? "unmet at this price"}
                  </div>
                </div>
              ) : ctrlActive ? (
                <div className="col-span-2 sm:col-span-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-muted-2">Control</div>
                  <div className="font-mono text-[12px] text-ok">not binding</div>
                  <div className="font-mono text-[10px] text-muted-2">market clears on its own</div>
                </div>
              ) : null}
            </div>

            {binding && (
              <div className="mt-3 flex items-start gap-2.5 rounded-lg px-3.5 py-2.5 text-[12px]"
                style={{ background: "rgba(216,115,94,0.07)", border: "1px solid rgba(216,115,94,0.25)" }}>
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-alert" />
                <span className="leading-snug text-muted">
                  <InfoTip concept={CONCEPTS.priceControl} color="#D8735E" align="left">
                    <span className="font-semibold text-alert">{ctrl.type === "ceiling" ? "Price ceiling binding" : "Price floor binding"}
                    </span>
                  </InfoTip>
                  {" — "}{ctrl.explain}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Controls & story */}
        <section className="space-y-3 lg:col-span-2">
          {/* Scenarios */}
          <div className="rounded-xl border border-line p-4" style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-2">Fire a scenario</span>
              <button onClick={reset} className="flex items-center gap-1 rounded-md border border-line px-2 py-1 font-mono text-[10px] text-muted hover:border-muted-2">
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.shifters.map((s) => {
                const on = active.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleShifter(s.id)}
                    className="rounded-lg border px-2.5 py-1.5 text-[11.5px] transition-all"
                    style={on
                      ? { background: tint(m.color, 0.14), borderColor: tint(m.color, 0.55), color: m.color }
                      : { background: "rgba(19,22,20,0.6)", borderColor: "rgba(35,40,35,1)", color: "#8A8F88" }}>
                    {s.label}
                  </button>
                );
              })}
            </div>
            {shifts.length > 0 && (
              <div className="mt-2.5 space-y-1.5 border-t border-line/50 pt-2.5">
                {shifts.map((s) => (
                  <p key={s.id} className="text-[11px] leading-snug text-muted">
                    <span className="font-semibold" style={{ color: m.color }}>{s.label}: </span>{s.explain}
                  </p>
                ))}
              </div>
            )}

            {/* Manual nudges */}
            <div className="mt-3 space-y-2.5 border-t border-line/50 pt-3">
              <div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span style={{ color: D_COLOR }}>Demand shift (manual)</span>
                  <span className="text-muted" style={tnum}>{dD >= 0 ? "+" : ""}{dD.toFixed(1)}</span>
                </div>
                <input type="range" min={-m.slider.d} max={m.slider.d} step={m.slider.d / 20} value={dD}
                  onChange={(e) => setDD(+e.target.value)} className="w-full accent-teal" />
              </div>
              <div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span style={{ color: S_COLOR }}>Supply shift (manual)</span>
                  <span className="text-muted" style={tnum}>{dS >= 0 ? "+" : ""}{dS.toFixed(1)}</span>
                </div>
                <input type="range" min={-m.slider.s} max={m.slider.s} step={m.slider.s / 20} value={dS}
                  onChange={(e) => setDS(+e.target.value)} className="w-full accent-amber" />
                <div className="font-mono text-[9px] text-muted-2">+ = costs rise (supply shifts up/left) · − = costs fall</div>
              </div>
              {ctrl && (
                <label className="flex cursor-pointer items-center justify-between border-t border-line/50 pt-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{ctrl.label} ({ctrl.type})</span>
                  <button onClick={() => setControlOn(!controlOn)}
                    className="rounded-full border px-2.5 py-1 font-mono text-[10px] transition-all"
                    style={controlOn
                      ? { background: "rgba(216,115,94,0.12)", borderColor: "rgba(216,115,94,0.5)", color: "#D8735E" }
                      : { borderColor: "rgba(35,40,35,1)", color: "#6B7068" }}>
                    {controlOn ? "ON" : "OFF"}
                  </button>
                </label>
              )}
            </div>
          </div>

          {/* Story */}
          <div className="rounded-xl border border-line p-4" style={{ background: "linear-gradient(145deg, #131614 0%, #101311 100%)" }}>
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider" style={{ color: m.color }}>This market</div>
            <p className="text-[12px] leading-relaxed text-muted">{m.story}</p>
            {onOpenGraph && MARKET_NODE[m.id] && (
              <button
                onClick={() => onOpenGraph(MARKET_NODE[m.id], pStar > p0 ? 1 : pStar < p0 ? -1 : 1)}
                className="group mt-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-all"
                style={{ borderColor: tint("#A99BF5", 0.35), color: "#A99BF5", background: tint("#A99BF5", 0.06) }}
              >
                <Share2 className="h-3 w-3" /> {pStar > p0 ? "Trace this price rise" : pStar < p0 ? "Trace this price fall" : "Trace on the graph"}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          <Insight color={m.color} label="The lesson">{m.lesson}</Insight>
        </section>
      </div>

      {/* Annotated price history */}
      {MARKET_HISTORY[m.id] && <PriceHistory m={m} />}

      <footer className="mt-7 border-t border-line/60 pt-5 font-mono text-[11px] leading-relaxed text-muted-2">
        Market atlas · {MARKETS.length} linear teaching models across {CATEGORIES.length} categories, each calibrated so the
        unshifted equilibrium sits near actual 2026 SA price levels. They demonstrate mechanics — shifts, controls,
        shortages — not forecasts. Four markets carry their real-world price controls (electricity, water, low-skill labour,
        credit) so you can see load-shedding, water restrictions, unemployment and restrictive monetary policy as what they
        are in micro terms: rationing at a blocked price.
      </footer>
    </div>
  );
}
