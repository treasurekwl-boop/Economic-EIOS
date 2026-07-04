import { useState, useEffect } from "react";
import { Share2, ArrowRight, ArrowLeft, Zap, Radio, TrendingUp, TrendingDown, Compass, Activity } from "lucide-react";
import { useEngine } from "../../context/EngineContext.jsx";
import { useScenario } from "../../context/ScenarioContext.jsx";
import { LATEST } from "../../config/model.js";
import {
  NODES, EDGES, NODE_TYPES, driversOf, effectsOf, nodeById, tracePath, propagate, lagLabel,
} from "../../config/graph.js";
import { tint } from "../../config/palette.js";
import Insight from "../ui/Insight.jsx";

const TONE = { support: "#7FB58A", pressure: "#D8735E", mixed: "#C6A15B" };
const UP = "#7FB58A", DOWN = "#D8735E";

export default function Network({ initialFocus, initialShock, linkToken }) {
  const { fx } = useEngine();
  const { fireScenario } = useScenario();
  const [focusId, setFocusId] = useState(initialFocus || "rand");
  const [trail, setTrail] = useState([initialFocus || "rand"]);
  const [mode, setMode] = useState(initialShock ? "simulate" : "explore");
  const [shockDir, setShockDir] = useState(initialShock?.dir ?? 1);

  // Deep-link from News: jump to a node and (optionally) fire its shock.
  useEffect(() => {
    if (!initialFocus) return;
    setFocusId(initialFocus);
    setTrail([initialFocus]);
    if (initialShock) { setMode("simulate"); setShockDir(initialShock.dir ?? 1); }
    else setMode("explore");
  }, [linkToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulating in the graph updates the app-wide scenario, so it rides every view.
  useEffect(() => {
    if (mode === "simulate") fireScenario(focusId, shockDir);
  }, [mode, focusId, shockDir, fireScenario]);

  const focus = nodeById(focusId);
  const fType = NODE_TYPES[focus.type];
  const drivers = driversOf(focusId);
  const effects = effectsOf(focusId);

  const go = (id) => {
    if (id === focusId) return;
    setFocusId(id);
    setTrail((t) => (t[t.length - 1] === id ? t : [...t.slice(-6), id]));
  };
  const back = () => {
    if (trail.length < 2) return;
    const t = trail.slice(0, -1);
    setTrail(t); setFocusId(t[t.length - 1]);
  };

  const valueOf = (n) => {
    if (!n) return "";
    switch (n.live) {
      case "rand": return fx ? `R${fx.usdZar.toFixed(2)}` : (n.val ?? "—");
      case "cpi": return `${LATEST.cpi.value.toFixed(1)}%`;
      case "repo": return `${LATEST.repo.value.toFixed(2)}%`;
      case "gdp": return `+${LATEST.gdp.yoy.toFixed(1)}%`;
      case "unemp": return `${LATEST.unemployment.value.toFixed(1)}%`;
      default: return n.val ?? "";
    }
  };

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10 animate-fade-up">
      {/* Header */}
      <div className="mb-4 max-w-2xl">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "#A99BF5" }}>
          <Share2 className="h-3.5 w-3.5" /> Intelligence · The economic brain
        </div>
        <h1 className="font-display text-[30px] font-normal leading-[1.08] tracking-[-0.02em] sm:text-[38px]" style={{ color: "#F3F1EA" }}>
          See the economy <em style={{ fontStyle: "italic", color: "#A99BF5" }}>think</em>.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.7] text-muted">
          Every metric, sector, commodity and constraint is a node that knows what moves it and what it moves.{" "}
          <span className="text-ink">Explore</span> the relationships, or <span className="text-ink">simulate</span> a shock and
          watch it cascade through the whole economy with size and timing.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-4 inline-flex rounded-lg border p-0.5" style={{ borderColor: "#262B27", background: "#101311" }}>
        {[["explore", "Explore", Compass], ["simulate", "Simulate", Activity]].map(([m, label, Icon]) => (
          <button key={m} onClick={() => setMode(m)}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors"
            style={mode === m ? { background: tint("#A99BF5", 0.16), color: "#A99BF5" } : { color: "#6B7068" }}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Trail */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
        <button onClick={back} disabled={trail.length < 2}
          className="mr-1 flex items-center gap-1 rounded-md border px-2 py-1 transition-colors disabled:opacity-30"
          style={{ borderColor: "#262B27", color: "#8A8F88" }}>
          <ArrowLeft className="h-3 w-3" /> back
        </button>
        {trail.map((id, i) => {
          const n = nodeById(id);
          return (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span style={{ color: "#3E433C" }}>›</span>}
              <button onClick={() => go(id)} style={{ color: id === focusId ? NODE_TYPES[n.type].color : "#6B7068" }}>{n.label}</button>
            </span>
          );
        })}
      </div>

      {/* Focus card */}
      <div className="rounded-2xl border p-5" style={{ borderColor: tint(fType.color, 0.3), background: `linear-gradient(155deg, ${tint(fType.color, 0.07)}, #101311 60%)` }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: fType.color, boxShadow: `0 0 8px ${tint(fType.color, 0.6)}` }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: fType.color }}>{fType.label}</span>
              {focus.live && <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: UP }}><Radio className="h-2.5 w-2.5" /> live</span>}
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-normal text-ink">{focus.label}</h2>
            <p className="mt-1 max-w-lg text-[13px] leading-[1.6] text-muted">{focus.note}</p>
          </div>
          {valueOf(focus) && (
            <div className="text-right">
              <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#565B54" }}>current</div>
              <div className="font-display text-[30px]" style={{ color: fType.color, fontVariantNumeric: "tabular-nums" }}>{valueOf(focus)}</div>
            </div>
          )}
        </div>

        {mode === "simulate" && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3.5" style={{ borderColor: "#1E231F" }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: "#8A8F88" }}>Shock this node:</span>
            <button onClick={() => setShockDir(1)} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all"
              style={shockDir === 1 ? { background: tint(UP, 0.16), borderColor: tint(UP, 0.6), color: UP } : { borderColor: "#262B27", color: "#6B7068" }}>
              <TrendingUp className="h-3.5 w-3.5" /> Rises
            </button>
            <button onClick={() => setShockDir(-1)} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all"
              style={shockDir === -1 ? { background: tint(DOWN, 0.16), borderColor: tint(DOWN, 0.6), color: DOWN } : { borderColor: "#262B27", color: "#6B7068" }}>
              <TrendingDown className="h-3.5 w-3.5" /> Falls
            </button>
          </div>
        )}
      </div>

      {mode === "explore" ? (
        <ExploreView focus={focus} fType={fType} drivers={drivers} effects={effects} valueOf={valueOf} go={go} />
      ) : (
        <SimulateView focus={focus} shockDir={shockDir} valueOf={valueOf} go={go} />
      )}

      <div className="mt-5">
        <Insight color="#A99BF5" label="Why a graph, not pages">
          Model the relationships instead of isolated screens and a shock stops being a headline — it becomes a cascade you
          can watch move. This is the spine; every other view is a window into it.
        </Insight>
      </div>

      {/* Node directory */}
      <div className="mt-6">
        <h3 className="mb-3 font-display text-[18px] text-ink">Stand on any node</h3>
        <div className="space-y-3">
          {Object.entries(NODE_TYPES).map(([type, meta]) => {
            const ns = NODES.filter((n) => n.type === type);
            if (!ns.length) return null;
            return (
              <div key={type}>
                <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: meta.color }}>{meta.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {ns.map((n) => {
                    const on = n.id === focusId;
                    return (
                      <button key={n.id} onClick={() => go(n.id)} className="rounded-full border px-2.5 py-1 text-[12px] transition-all"
                        style={on ? { background: tint(meta.color, 0.16), borderColor: tint(meta.color, 0.6), color: meta.color } : { background: "rgba(19,22,20,0.6)", borderColor: "#262B27", color: "#8A8F88" }}>
                        {n.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="mt-7 border-t pt-5 font-mono text-[10.5px] leading-[1.7]" style={{ borderColor: "#1A1F1C", color: "#4E534B" }}>
        Intelligence · a curated causal graph of {NODES.length} nodes and {EDGES.length} links. Tone is the usual direction
        of influence (green supports, red pressures, gold swings); Simulate propagates a shock along those links with
        plausible size and lag — qualitative, not a forecast. The first module of the economic operating system.
      </footer>
    </div>
  );
}

// ── Explore: ego-map + mechanism lists ──
function ExploreView({ focus, fType, drivers, effects, valueOf, go }) {
  const path = tracePath(focus.id, 5);
  const capped = (arr) => arr.slice(0, 7);
  const dNodes = capped(drivers), eNodes = capped(effects);
  const rows = Math.max(dNodes.length, eNodes.length, 1);
  const H = Math.max(300, rows * 46 + 56);
  const W = 920, cx = 460, cy = H / 2, BW = 150, BH = 30;
  const yAt = (i, n) => 40 + ((i + 0.5) * (H - 80)) / n;
  const firstHopTo = path.length > 1 ? path[1] : null;

  return (
    <>
      {path.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2.5" style={{ background: "rgba(12,14,13,0.5)", borderColor: "#1E231F" }}>
          <span className="mr-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "#A99BF5" }}><Zap className="h-3 w-3" /> ripple</span>
          {path.map((id, i) => (
            <span key={id} className="flex items-center gap-1.5">
              {i > 0 && <ArrowRight className="h-3 w-3" style={{ color: "#3E433C" }} />}
              <button onClick={() => go(id)} className="font-mono text-[11px] hover:underline" style={{ color: i === 0 ? fType.color : "#8A8F88" }}>{nodeById(id).label}</button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border p-2" style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 760, display: "block" }}>
          <defs>
            {Object.entries(TONE).map(([k, c]) => (
              <marker key={k} id={`arw-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill={c} />
              </marker>
            ))}
          </defs>
          <text x={140} y={22} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="9" letterSpacing="1.5" fill="#565B54">WHAT MOVES IT</text>
          <text x={cx} y={22} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="9" letterSpacing="1.5" fill="#565B54">FOCUS</text>
          <text x={780} y={22} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize="9" letterSpacing="1.5" fill="#565B54">WHAT IT MOVES</text>
          {dNodes.map((e, i) => { const y = yAt(i, dNodes.length); return <path key={`de${i}`} d={`M215 ${y} C 300 ${y}, 300 ${cy}, 385 ${cy}`} fill="none" stroke={TONE[e.tone]} strokeWidth="1.4" opacity="0.55" markerEnd={`url(#arw-${e.tone})`} />; })}
          {eNodes.map((e, i) => { const y = yAt(i, eNodes.length); const hot = e.to === firstHopTo; return <path key={`ee${i}`} d={`M535 ${cy} C 620 ${cy}, 620 ${y}, 705 ${y}`} fill="none" stroke={TONE[e.tone]} strokeWidth={hot ? 2.4 : 1.4} opacity={hot ? 0.95 : 0.55} markerEnd={`url(#arw-${e.tone})`} />; })}
          {dNodes.map((e, i) => { const n = nodeById(e.from); const t = NODE_TYPES[n.type]; return <GNode key={n.id} x={140} y={yAt(i, dNodes.length)} w={BW} h={BH} node={n} color={t.color} onClick={() => go(n.id)} />; })}
          {eNodes.map((e, i) => { const n = nodeById(e.to); const t = NODE_TYPES[n.type]; return <GNode key={n.id} x={780} y={yAt(i, eNodes.length)} w={BW} h={BH} node={n} color={t.color} onClick={() => go(n.id)} />; })}
          <GNode x={cx} y={cy} w={168} h={40} node={focus} color={fType.color} focus onClick={() => {}} />
        </svg>
      </div>
      {(drivers.length > 7 || effects.length > 7) && (
        <div className="mt-2 text-center font-mono text-[10px]" style={{ color: "#565B54" }}>map shows first 7 per side · full lists below</div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MechList title="What moves it" dir="in" edges={drivers} valueOf={valueOf} onGo={go} />
        <MechList title="What it moves" dir="out" edges={effects} valueOf={valueOf} onGo={go} />
      </div>
    </>
  );
}

// ── Simulate: shock cascade ──
function SimulateView({ focus, shockDir, valueOf, go }) {
  const prop = propagate(focus.id, shockDir);
  const impacts = [...prop.entries()].filter(([id]) => id !== focus.id)
    .map(([id, v]) => ({ id, ...v, uncertain: Math.sign(v.lo) !== Math.sign(v.hi) }))
    .sort((a, b) => Math.abs(b.impulse) - Math.abs(a.impulse));
  // Scale bars off the widest thing on screen — median OR band edge — so the
  // uncertainty ranges never overflow their track.
  const maxImp = Math.max(...impacts.map((i) => Math.max(Math.abs(i.impulse), Math.abs(i.lo), Math.abs(i.hi))), 0.001);
  const gdp = prop.get("gdp");

  const verb = (v) => (v > 0 ? "lifts" : "drags");
  const top3 = impacts.slice(0, 3);
  const narrative = top3.length
    ? `A shock ${shockDir > 0 ? "upward" : "downward"} in ${focus.label} ${top3.map((t) => `${verb(t.impulse)} ${nodeById(t.id).label.toLowerCase()}`).join(", ")}`
      + (gdp ? ` — net ${gdp.impulse > 0 ? "positive" : "negative"} for GDP, ${lagLabel(gdp.lagWeeks)}.` : ".")
    : `${focus.label} has no modelled downstream effects — it's a leaf of the graph.`;

  return (
    <>
      <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: tint("#A99BF5", 0.25), background: "linear-gradient(155deg, rgba(169,155,245,0.06), #101311 60%)" }}>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#A99BF5" }}>
          <Zap className="h-3.5 w-3.5" /> The cascade
        </div>
        <p className="mt-2.5 font-display text-[19px] font-normal leading-[1.45] text-ink">{narrative}</p>
        {gdp && (
          <div className="mt-3 flex items-center gap-2 font-mono text-[11px]">
            <span style={{ color: "#8A8F88" }}>Net effect on GDP:</span>
            <span style={{ color: gdp.impulse > 0 ? UP : DOWN }}>{gdp.impulse > 0 ? "▲ supportive" : "▼ contractionary"}</span>
            <span style={{ color: "#565B54" }}>· felt {lagLabel(gdp.lagWeeks)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)" }}>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">Ranked impact · {impacts.length} nodes reached</span>
          <span className="font-mono text-[10px]" style={{ color: "#565B54" }}>median · 90% range</span>
        </div>
        <div className="space-y-1.5">
          {impacts.map((im) => {
            const n = nodeById(im.id); const meta = NODE_TYPES[n.type];
            const up = im.impulse > 0; const c = up ? UP : DOWN;
            const width = Math.max(3, (Math.abs(im.impulse) / maxImp) * 100);
            // Faint band spans the 5th→95th percentile of the Monte-Carlo draws.
            const bandLo = (Math.min(Math.abs(im.lo), Math.abs(im.hi)) / maxImp) * 100;
            const bandHi = (Math.max(Math.abs(im.lo), Math.abs(im.hi)) / maxImp) * 100;
            return (
              <button key={im.id} onClick={() => go(im.id)} className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors"
                style={{ borderColor: "#1E231F", background: "rgba(12,14,13,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = tint(meta.color, 0.4))}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1E231F")}>
                <span className="w-4 shrink-0 text-center font-mono text-[13px]" style={{ color: im.uncertain ? "#8A8F88" : c }}>{im.uncertain ? "◇" : up ? "▲" : "▼"}</span>
                <div className="w-[130px] shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                    <span className="truncate text-[13px]" style={{ color: "#ECEAE3" }}>{n.label}</span>
                  </div>
                  {im.uncertain
                    ? <span className="ml-3 font-mono text-[9px]" style={{ color: "#B79154" }}>direction uncertain</span>
                    : valueOf(n) && <span className="ml-3 font-mono text-[9px]" style={{ color: "#6B7068" }}>now {valueOf(n)}</span>}
                </div>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(35,40,35,0.7)" }}>
                  {/* 90% Monte-Carlo band */}
                  <div className="absolute inset-y-0 rounded-full" style={{ left: `${bandLo}%`, width: `${Math.max(1, bandHi - bandLo)}%`, background: tint(c, 0.22) }} />
                  {/* median */}
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${tint(c, 0.5)}, ${c})`, boxShadow: `0 0 8px ${tint(c, 0.4)}` }} />
                </div>
                <span className="w-[92px] shrink-0 text-right font-mono text-[9.5px]" style={{ color: "#6B7068" }}>{lagLabel(im.lagWeeks)}</span>
              </button>
            );
          })}
          {impacts.length === 0 && <div className="py-4 text-center font-mono text-[11px]" style={{ color: "#565B54" }}>no downstream effects — this is a leaf node</div>}
        </div>
        {impacts.length > 0 && (
          <p className="mt-3 border-t pt-2.5 font-mono text-[9px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>
            Linear input-output model · 160 Monte-Carlo draws · solid bar = median effect, faint band = 90% range. ◇ marks nodes whose direction is uncertain (the band straddles zero). Modelled estimates, not forecasts.
          </p>
        )}
      </div>
    </>
  );
}

function GNode({ x, y, w, h, node, color, focus, onClick }) {
  const label = node.label.length > 18 ? node.label.slice(0, 17) + "…" : node.label;
  return (
    <g style={{ cursor: "pointer" }} onClick={onClick}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={9} fill={focus ? tint(color, 0.14) : "#12150F"} stroke={color} strokeWidth={focus ? 1.8 : 1} opacity={focus ? 1 : 0.92} />
      <circle cx={x - w / 2 + 13} cy={y} r={3.5} fill={color} />
      <text x={x - w / 2 + 23} y={y + 4} fontFamily="'IBM Plex Sans',sans-serif" fontSize={focus ? 14 : 12} fontWeight={focus ? 600 : 500} fill={focus ? "#F3F1EA" : "#ECEAE3"}>{label}</text>
    </g>
  );
}

function MechList({ title, dir, edges, valueOf, onGo }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)" }}>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">{title}</span>
        <span className="font-mono text-[10px]" style={{ color: "#565B54" }}>{edges.length}</span>
      </div>
      {edges.length === 0 && <div className="py-3 text-center font-mono text-[11px]" style={{ color: "#565B54" }}>a root node — nothing {dir === "in" ? "upstream" : "downstream"}</div>}
      <div className="space-y-1.5">
        {edges.map((e, i) => {
          const nId = dir === "in" ? e.from : e.to;
          const n = nodeById(nId); const meta = NODE_TYPES[n.type]; const tc = TONE[e.tone];
          return (
            <button key={i} onClick={() => onGo(nId)} className="flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors"
              style={{ borderColor: "#1E231F", background: "rgba(12,14,13,0.4)" }}
              onMouseEnter={(ev) => (ev.currentTarget.style.borderColor = tint(meta.color, 0.4))}
              onMouseLeave={(ev) => (ev.currentTarget.style.borderColor = "#1E231F")}>
              <span className="mt-0.5 w-0.5 shrink-0 self-stretch rounded" style={{ background: tc }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {dir === "out" && <ArrowRight className="h-3 w-3 shrink-0" style={{ color: tc }} />}
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                  <span className="text-[13px] font-medium" style={{ color: "#ECEAE3" }}>{n.label}</span>
                  {valueOf(n) && <span className="font-mono text-[10px]" style={{ color: "#6B7068" }}>{valueOf(n)}</span>}
                  <span className="ml-auto font-mono text-[8px] uppercase tracking-wider" style={{ color: tc }}>{e.tone}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-[1.5] text-muted">{e.mech}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
