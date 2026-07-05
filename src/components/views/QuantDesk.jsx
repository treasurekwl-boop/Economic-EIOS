import { useState, useMemo } from "react";
import { Calculator, Gauge, Layers3, BookOpen, ChevronDown, Zap } from "lucide-react";
import {
  fairForwardPrice, fxForward, couponBond, premiumDiscount, unsmoothReturn,
  executionPlan, rollSpread, pnlWithFunding, spreadDecomp,
} from "../../lib/quant.js";
import { INSTRUMENTS, DESK_SHOCKS } from "../../config/desk.js";
import {
  ORDER_TYPES, LIQUIDITY_MEASURES, EXEC_ALGOS, COST_COMPONENTS,
  SPREAD_FORCES, MONITOR_ITEMS, DESIGN_PRINCIPLES, IMPL_WORKFLOW, MICRO_NOTE,
} from "../../config/microstructure.js";
import { propagate } from "../../config/graph.js";
import { predictability } from "../../lib/complexity.js";
import { usePersistedState } from "../../lib/usePersistedState.js";
import { tint } from "../../config/palette.js";

const instById = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i]));
const dailyVolPct = (closes) => {
  if (!closes || closes.length < 10) return null;
  const r = [];
  for (let i = 1; i < closes.length; i++) if (closes[i - 1] > 0) r.push(Math.log(closes[i] / closes[i - 1]));
  const m = r.reduce((a, b) => a + b, 0) / r.length;
  const v = r.reduce((a, b) => a + (b - m) ** 2, 0) / (r.length - 1);
  return Math.sqrt(v) * 100;
};

export default function QuantDesk({ data }) {
  return (
    <div className="animate-fade-up">
      <div className="mb-4">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#C6A15B" }}>
          <Calculator className="h-3.5 w-3.5" /> Quant · Models &amp; execution math
        </div>
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-muted">
          The algorithms the financial-markets and microstructure briefs specify — real math over the numbers you enter.
          No live feeds, no advice.
        </p>
      </div>

      <ExecutionPlanner data={data} />
      <Predictability data={data} />

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Calc title="Forward price (cost-of-carry)" color="#6FBDB4"
          note="F = S · e^((carry + storage − income − conv)·t)"
          fields={[
            { k: "spot", label: "Spot", def: 4187 }, { k: "carry", label: "Carry rate %", def: 5 },
            { k: "income", label: "Income yld %", def: 0 }, { k: "storage", label: "Storage %", def: 0.5 },
            { k: "conv", label: "Conv. yld %", def: 0 }, { k: "t", label: "Years", def: 0.5, step: 0.25 },
          ]}
          compute={(v) => ({ label: "Fair forward", value: fairForwardPrice(v.spot, v.carry / 100, v.income / 100, v.storage / 100, v.conv / 100, v.t).toFixed(2) })} />

        <Calc title="FX forward (covered interest parity)" color="#6FBDB4"
          note="F = S · e^((r_dom − r_for + basis)·t)"
          fields={[
            { k: "spot", label: "Spot (e.g. USDZAR)", def: 16.22, step: 0.01 }, { k: "rDom", label: "Dom rate %", def: 7.5 },
            { k: "rFor", label: "Foreign rate %", def: 4.5 }, { k: "basis", label: "Basis %", def: 0, step: 0.1 },
            { k: "t", label: "Years", def: 1, step: 0.25 },
          ]}
          compute={(v) => ({ label: "Forward rate", value: fxForward(v.spot, v.rDom / 100, v.rFor / 100, v.basis / 100, v.t).toFixed(4) })} />

        <Calc title="Bond price (coupon bond)" color="#E08B70"
          note="PV of coupons + face, discounted at yield + spread"
          fields={[
            { k: "face", label: "Face", def: 100 }, { k: "coupon", label: "Coupon %", def: 8 },
            { k: "years", label: "Years", def: 5, step: 1 }, { k: "freq", label: "Coupons/yr", def: 2, step: 1 },
            { k: "y", label: "Yield %", def: 9 }, { k: "spread", label: "Spread %", def: 1 },
          ]}
          compute={(v) => ({ label: "Price", value: couponBond(v.face, v.coupon / 100, v.years, v.freq, v.y / 100, v.spread / 100).toFixed(3) })} />

        <Calc title="ETF premium / discount" color="#7FB58A"
          note="(price / NAV) − 1"
          fields={[{ k: "price", label: "ETF price", def: 101.2, step: 0.01 }, { k: "nav", label: "NAV estimate", def: 100, step: 0.01 }]}
          compute={(v) => { const pd = premiumDiscount(v.price, v.nav); return { label: pd >= 0 ? "Premium" : "Discount", value: pd == null ? "—" : `${(pd * 100).toFixed(2)}%`, color: pd >= 0 ? "#7FB58A" : "#D8735E" }; }} />

        <Calc title="Private-asset NAV unsmoothing (Geltner)" color="#A99BF5"
          note="Recovers the true return hidden by smoothed marks"
          fields={[{ k: "rT", label: "Reported r %", def: 2, step: 0.1 }, { k: "rPrev", label: "Prior r %", def: 1.5, step: 0.1 }, { k: "rho", label: "Smoothing ρ", def: 0.7, step: 0.05 }]}
          compute={(v) => ({ label: "True (unsmoothed) return", value: `${(unsmoothReturn(v.rT / 100, v.rPrev / 100, v.rho) * 100).toFixed(2)}%` })} />

        <Calc title="Spread decomposition (effective / realised)" color="#D98BB6"
          note="eff = 2·d·(price − mid); realised uses the mid after; the gap = adverse selection"
          fields={[
            { k: "price", label: "Trade price", def: 16.25, step: 0.01 }, { k: "mid", label: "Mid at trade", def: 16.24, step: 0.01 },
            { k: "dir", label: "Side +1 buy / −1 sell", def: 1, step: 1 }, { k: "midAfter", label: "Mid after (markout)", def: 16.26, step: 0.01 },
          ]}
          compute={(v) => { const s = spreadDecomp(v.price, v.mid, v.dir, v.midAfter); return { rows: [
            { label: "Effective spread", value: `${s.effBps.toFixed(1)} bps`, color: "#ECEAE3" },
            { label: "Realised spread", value: `${s.realBps.toFixed(1)} bps`, color: "#7FB58A" },
            { label: "Adverse selection", value: `${s.adverseBps.toFixed(1)} bps`, color: "#D8735E" },
          ] }; }} />
      </div>

      <PortfolioStress data={data} />
      <Reference />

      <p className="mt-5 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>{MICRO_NOTE}</p>
    </div>
  );
}

// Generic calculator card.
function Calc({ title, note, fields, compute, color }) {
  const [v, setV] = useState(() => Object.fromEntries(fields.map((f) => [f.k, String(f.def)])));
  const nums = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, parseFloat(x)]));
  let res = null; try { res = compute(nums); } catch { res = null; }
  return (
    <div className="rounded-xl border p-3.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
      <div className="text-[13px] font-medium text-ink">{title}</div>
      {note && <div className="mt-0.5 font-mono text-[9px]" style={{ color: "#565B54" }}>{note}</div>}
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {fields.map((f) => (
          <label key={f.k} className="block">
            <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{f.label}</span>
            <input type="number" inputMode="decimal" step={f.step ?? "any"} value={v[f.k]} onChange={(e) => setV((p) => ({ ...p, [f.k]: e.target.value }))}
              className="mt-0.5 w-full rounded-md border px-2 py-1 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }} />
          </label>
        ))}
      </div>
      {res && res.rows && (
        <div className="mt-3 space-y-1.5 border-t pt-2.5" style={{ borderColor: "#1E231F" }}>
          {res.rows.map((r, i) => (
            <div key={i} className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{r.label}</span>
              <span className="font-display text-[16px]" style={{ color: r.color ?? color, fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {res && !res.rows && (
        <div className="mt-3 flex items-baseline justify-between border-t pt-2.5" style={{ borderColor: "#1E231F" }}>
          <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{res.label}</span>
          <span className="font-display text-[20px]" style={{ color: res.color ?? color, fontVariantNumeric: "tabular-nums" }}>{res.value}</span>
        </div>
      )}
    </div>
  );
}

// Complexity diagnostics: how forecastable is this series RIGHT NOW? Hurst (regime
// of persistence), permutation entropy (ordinal randomness), rough Lyapunov. The
// buildable slice of the complexity-science brief — pure math on the EOD feed.
const TONE = { revert: "#6FBDB4", trend: "#C6A15B", flat: "#8A8F88", struct: "#7FB58A", some: "#C6A15B", chaos: "#D8735E", stable: "#7FB58A" };

function readText(P) {
  if (P.hurst == null) return null;
  const h = P.hurstLabel.tone, pe = P.peLabel.tone;
  let base = h === "revert" ? "Mean-reverting — stretched moves have tended to snap back, so fading extremes beats chasing."
    : h === "trend" ? "Trending — momentum has persisted, so pullbacks have tended to get bought."
    : "Close to a random walk — little directional edge; trust the forecast's uncertainty band, not its point, and size small.";
  const mod = pe === "struct" ? " There's also more short-term structure than usual — slightly higher predictability."
    : pe === "flat" ? " And the ordinal signal is near-random, so keep expectations modest."
    : "";
  return base + mod;
}

function Predictability({ data }) {
  const [instId, setInstId] = useState("usdzar");
  const closes = data?.[instId]?.series?.map((s) => s[1]) ?? [];
  const P = useMemo(() => (closes.length >= 40 ? predictability(closes) : null), [instId, closes.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const read = P ? readText(P) : null;

  return (
    <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: tint("#6FBDB4", 0.25), background: "linear-gradient(160deg, rgba(111,189,180,0.05), #101311 60%)" }}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#6FBDB4" }}>
          <Zap className="h-3.5 w-3.5" /> Predictability · complexity diagnostics
        </div>
        <select value={instId} onChange={(e) => setInstId(e.target.value)} className="rounded-md border px-2 py-1 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }}>
          {INSTRUMENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
        </select>
      </div>
      <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
        How forecastable is this series right now — is it mean-reverting, a random walk, or trending? Pure time-series
        complexity measures on the EOD feed. Diagnostics, not signals.
      </p>

      {!P ? (
        <div className="rounded-xl border px-4 py-3 font-mono text-[11px]" style={{ borderColor: "#232823", color: "#565B54" }}>
          Needs ~40+ daily closes for {instById[instId]?.label ?? "this instrument"} — activate the feed in the Workbench tab.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Diag label="Hurst exponent" value={P.hurst?.toFixed(2) ?? "—"} sub={P.hurstLabel.text} color={TONE[P.hurstLabel.tone]} />
            <Diag label="Permutation entropy" value={P.pe?.toFixed(2) ?? "—"} sub={P.peLabel.text} color={TONE[P.peLabel.tone]} />
            <Diag label="Lyapunov (rough)" value={(P.lyap >= 0 ? "+" : "") + (P.lyap?.toFixed(2) ?? "—")} sub={P.lyapLabel.text} color={TONE[P.lyapLabel.tone]} />
          </div>
          {read && (
            <div className="mt-3 rounded-xl border px-4 py-2.5 text-[12.5px] leading-relaxed" style={{ borderColor: "#232823", background: "rgba(8,10,9,0.5)", color: "#C9C6BD" }}>
              <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>Read · </span>{read}
            </div>
          )}
        </>
      )}

      <p className="mt-2.5 font-mono text-[9px] leading-relaxed" style={{ color: "#565B54" }}>
        Hurst: &lt;0.5 mean-reverting, ~0.5 random walk, &gt;0.5 trending (Anis–Lloyd bias-corrected). Permutation entropy: 1 = maximally
        random. Lyapunov is a rough small-sample estimate — treat as directional only. On ~months of daily data these are noisy;
        read them as a regime hint, not a precise number.
      </p>
    </div>
  );
}

function Diag({ label, value, sub, color }) {
  return (
    <div className="rounded-xl border px-3 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
      <div className="font-mono text-[8.5px] uppercase tracking-wider text-muted-2">{label}</div>
      <div className="mt-0.5 font-display text-[20px] font-semibold tabular-nums" style={{ color }}>{value}</div>
      <div className="font-mono text-[8.5px] leading-tight" style={{ color: "#6B7068" }}>{sub}</div>
    </div>
  );
}

// Execution / market-impact planner (square-root law + Almgren–Chriss trade-off).
function ExecutionPlanner({ data }) {
  const [instId, setInstId] = useState("usdzar");
  const [pctADV, setPctADV] = useState("10");
  const [days, setDays] = useState("1");
  const [spreadBps, setSpreadBps] = useState("2");
  const [manualVol, setManualVol] = useState("");

  const closes = data?.[instId]?.series?.map((s) => s[1]) ?? [];
  const feedVol = dailyVolPct(closes);
  const roll = rollSpread(closes);
  const sigma = (manualVol !== "" ? parseFloat(manualVol) : feedVol) / 100;

  const plan = useMemo(() => {
    const frac = Math.max(0, parseFloat(pctADV) / 100);
    const d = Math.max(0.01, parseFloat(days));
    if (!isFinite(sigma) || sigma <= 0) return null;
    return executionPlan({ sigma, frac, spread: parseFloat(spreadBps) / 1e4, days: d, permanentFrac: 0.5 });
  }, [sigma, pctADV, days, spreadBps]);

  const bps = (x) => (x * 1e4).toFixed(1);

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: tint("#C6A15B", 0.25), background: "linear-gradient(160deg, rgba(198,161,91,0.05), #101311 60%)" }}>
      <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#C6A15B" }}>
        <Gauge className="h-3.5 w-3.5" /> Execution &amp; impact planner
      </div>
      <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
        The square-root impact law and the Almgren–Chriss cost-vs-timing trade-off. Volatility comes from the instrument's own
        history; you set the size and horizon. Trade faster → less timing risk, more impact.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <label className="col-span-2 block sm:col-span-1">
          <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>Instrument</span>
          <select value={instId} onChange={(e) => { setInstId(e.target.value); setManualVol(""); }} className="mt-0.5 w-full rounded-md border px-2 py-1 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }}>
            {INSTRUMENTS.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </label>
        <Field label="Size (% ADV)" val={pctADV} set={setPctADV} />
        <Field label="Horizon (days)" val={days} set={setDays} />
        <Field label="Spread (bps)" val={spreadBps} set={setSpreadBps} />
        <Field label={`Daily vol %${feedVol ? "" : " (enter)"}`} val={manualVol !== "" ? manualVol : (feedVol ? feedVol.toFixed(2) : "")} set={setManualVol} placeholder={feedVol ? feedVol.toFixed(2) : "1.50"} />
      </div>

      {plan ? (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 sm:grid-cols-4" style={{ borderColor: "#1E231F" }}>
          <Stat label="Impact (√-law)" value={`${bps(plan.impact)} bps`} color="#D8735E" />
          <Stat label="Timing risk (1σ)" value={`${bps(plan.timingRisk)} bps`} color="#C6A15B" />
          <Stat label="Half-spread" value={`${bps(plan.halfSpread)} bps`} color="#8A8F88" />
          <Stat label="Est. total cost" value={`${bps(plan.expectedCost)} bps`} color="#ECEAE3" />
        </div>
      ) : (
        <div className="mt-3 border-t pt-3 font-mono text-[11px]" style={{ borderColor: "#1E231F", color: "#565B54" }}>Enter a daily volatility % (no feed history for this instrument yet).</div>
      )}
      {roll?.spread != null && (
        <p className="mt-2.5 font-mono text-[9px]" style={{ color: "#565B54" }}>
          Roll implied spread (EOD proxy): ~{roll.relBps.toFixed(1)} bps — a coarse read of round-trip cost from daily mean-reversion.
        </p>
      )}
    </div>
  );
}

// Portfolio stress: market-price + funding layers applied to your OPEN journal
// positions, with the scenario shape seeded from a macro shock via the graph.
function PortfolioStress({ data }) {
  const [trades] = usePersistedState("ge.desk.trades", []);
  const open = trades.filter((t) => t.exit == null);
  const [shockId, setShockId] = useState("randweak");
  const [severity, setSeverity] = useState("5");     // % move on the most-affected instrument
  const [fundingBps, setFundingBps] = useState("50");
  const [fundDays, setFundDays] = useState("30");

  const shock = DESK_SHOCKS.find((s) => s.id === shockId);
  const result = useMemo(() => {
    if (!open.length) return null;
    const prop = propagate(shock.node, shock.dir);
    const raw = open.map((t) => {
      const inst = instById[t.instId];
      const im = inst ? prop.get(inst.node) : null;
      const imp = im ? im.impulse * (inst.invert ? -1 : 1) : 0;
      return { t, inst, imp };
    });
    const maxAbs = Math.max(...raw.map((r) => Math.abs(r.imp)), 1e-9);
    const sev = Math.max(0, parseFloat(severity)) / 100;
    const fSpread = Math.max(0, parseFloat(fundingBps)) / 1e4;
    const days = Math.max(0, parseFloat(fundDays));
    let mtm = 0, funding = 0;
    const rows = raw.map((r) => {
      const move = (r.imp / maxAbs) * sev;                         // fractional price move
      const notional = r.t.size * r.t.entry;
      const p = pnlWithFunding({ delta: notional, marketMove: move * (r.t.dir === "long" ? 1 : -1), notional, fundingSpread: fSpread, days });
      mtm += p.mtm; funding += p.funding;
      return { ...r, move, notional, pnl: p.total, mtm: p.mtm };
    });
    return { rows, mtm, funding, total: mtm - funding };
  }, [open, shockId, severity, fundingBps, fundDays]);

  return (
    <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: tint("#A99BF5", 0.25), background: "linear-gradient(160deg, rgba(169,155,245,0.05), #101311 60%)" }}>
      <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#A99BF5" }}>
        <Layers3 className="h-3.5 w-3.5" /> Portfolio stress (your open positions)
      </div>
      <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
        Two of the brief's three stress layers on your live journal: <span style={{ color: "#C9C6BD" }}>market-price</span> (shape from a macro
        shock × your severity) and <span style={{ color: "#C9C6BD" }}>funding/collateral</span>. Infrastructure stress (venue/settlement) is a checklist, not a number.
      </p>

      {!open.length ? (
        <div className="py-3 text-center font-mono text-[11px]" style={{ color: "#565B54" }}>No open positions in the journal. Log a trade in the Workbench tab first.</div>
      ) : (
        <>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {DESK_SHOCKS.map((s) => (
              <button key={s.id} onClick={() => setShockId(s.id)} className="rounded-lg border px-2.5 py-1 text-[11px] transition-colors"
                style={s.id === shockId ? { borderColor: tint("#A99BF5", 0.55), color: "#A99BF5", background: tint("#A99BF5", 0.12) } : { borderColor: "#242A29", color: "#8A8F88" }}>{s.label}</button>
            ))}
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <Field label="Severity (% move)" val={severity} set={setSeverity} />
            <Field label="Funding (bps/yr)" val={fundingBps} set={setFundingBps} />
            <Field label="Hold (days)" val={fundDays} set={setFundDays} />
          </div>

          <div className="space-y-1 border-t pt-2.5" style={{ borderColor: "#1E231F" }}>
            {result.rows.map((r) => (
              <div key={r.t.id} className="flex items-center gap-2 text-[12px]">
                <span className="font-mono text-[9px] uppercase" style={{ color: r.t.dir === "long" ? "#7FB58A" : "#D8735E" }}>{r.t.dir}</span>
                <span className="w-[92px] shrink-0 truncate text-ink">{r.inst?.label ?? r.t.instId}</span>
                <span className="font-mono text-[10px]" style={{ color: "#6B7068" }}>{(r.move * 100).toFixed(1)}%</span>
                <span className="ml-auto font-mono text-[11px]" style={{ color: r.pnl >= 0 ? "#7FB58A" : "#D8735E" }}>
                  {r.pnl >= 0 ? "+" : ""}{r.pnl.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2 border-t pt-2.5" style={{ borderColor: "#1E231F" }}>
            <Stat label="Market P&L" value={`${result.mtm >= 0 ? "+" : ""}${result.mtm.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`} color={result.mtm >= 0 ? "#7FB58A" : "#D8735E"} />
            <Stat label="Funding drag" value={`−${result.funding.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`} color="#C6A15B" />
            <Stat label="Net" value={`${result.total >= 0 ? "+" : ""}${result.total.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`} color={result.total >= 0 ? "#7FB58A" : "#D8735E"} />
          </div>
        </>
      )}
    </div>
  );
}

// Full-fidelity reference tables + guidance blocks from the microstructure brief.
function RefBlock({ id, open, setOpen, title, children }) {
  const on = open === id;
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
      <button onClick={() => setOpen(on ? null : id)} className="flex w-full items-center justify-between px-4 py-2.5 text-left">
        <span className="text-[13px] font-medium text-ink">{title}</span>
        <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "#565B54", transform: on ? "rotate(180deg)" : "none" }} />
      </button>
      {on && <div className="border-t px-4 py-3" style={{ borderColor: "#1E231F", background: "rgba(8,10,9,0.5)" }}>{children}</div>}
    </div>
  );
}

function Reference() {
  const [open, setOpen] = useState(null);
  const tables = [
    { id: "orders", title: "Order types", data: ORDER_TYPES },
    { id: "algos", title: "Execution algorithms", data: EXEC_ALGOS },
    { id: "liq", title: "Liquidity measures", data: LIQUIDITY_MEASURES },
    { id: "cost", title: "Transaction-cost components", data: COST_COMPONENTS },
  ];
  const pairList = (arr) => (
    <div className="space-y-2">
      {arr.map((p) => (
        <div key={p.name} className="flex gap-2.5 text-[12px] leading-relaxed">
          <span className="w-[128px] shrink-0 font-medium text-ink">{p.name}</span>
          <span className="flex-1" style={{ color: "#9A978E" }}>{p.desc}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">
        <BookOpen className="h-3.5 w-3.5" /> Microstructure reference
      </div>
      <div className="space-y-2">
        {tables.map((t) => (
          <RefBlock key={t.id} id={t.id} open={open} setOpen={setOpen} title={t.title}>
            <div className="space-y-2">
              {t.data.rows.map((r, i) => (
                <div key={i} className="rounded-lg border px-3 py-2" style={{ borderColor: "#1E231F", background: "rgba(12,14,13,0.4)" }}>
                  <div className="mb-1 text-[12.5px] font-medium text-ink">{r.name}</div>
                  <dl className="space-y-1">
                    {t.data.fields.map((f) => (
                      <div key={f.k} className="flex gap-2.5 text-[11.5px] leading-relaxed">
                        <dt className="w-[104px] shrink-0 font-mono text-[8.5px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{f.label}</dt>
                        <dd className="flex-1" style={{ color: "#9A978E" }}>{r[f.k]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </RefBlock>
        ))}

        <RefBlock id="forces" open={open} setOpen={setOpen} title="What the spread pays for">{pairList(SPREAD_FORCES)}</RefBlock>

        <RefBlock id="monitor" open={open} setOpen={setOpen} title="Execution-monitoring dashboard">
          <p className="mb-2 text-[11.5px] leading-relaxed" style={{ color: "#9A978E" }}>Monitor state (what the market looked like) separately from output (what your trade did):</p>
          <div className="flex flex-wrap gap-1.5">
            {MONITOR_ITEMS.map((m) => <span key={m} className="rounded-full border px-2.5 py-1 text-[11px]" style={{ borderColor: "#242A29", color: "#9A978E" }}>{m}</span>)}
          </div>
        </RefBlock>

        <RefBlock id="principles" open={open} setOpen={setOpen} title="Algorithm design principles">{pairList(DESIGN_PRINCIPLES)}</RefBlock>

        <RefBlock id="workflow" open={open} setOpen={setOpen} title="Implementation workflow">
          <p className="text-[12.5px] leading-relaxed" style={{ color: "#C9C6BD" }}>{IMPL_WORKFLOW}</p>
        </RefBlock>
      </div>
    </div>
  );
}

function Field({ label, val, set, placeholder }) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{label}</span>
      <input type="number" inputMode="decimal" step="any" value={val} placeholder={placeholder} onChange={(e) => set(e.target.value)}
        className="mt-0.5 w-full rounded-md border px-2 py-1 text-[12px] text-ink" style={{ borderColor: "#262B27", background: "#12150F" }} />
    </label>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#6B7068" }}>{label}</div>
      <div className="font-display text-[17px]" style={{ color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}
