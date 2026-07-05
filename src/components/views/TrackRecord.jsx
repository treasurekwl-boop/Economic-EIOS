import { useState, useEffect } from "react";
import { Target, Gauge, CheckCircle2, XCircle, Clock, Lock } from "lucide-react";
import { fetchForecasts } from "../../lib/dataApi.js";
import { trackRecord } from "../../lib/scoring.js";
import { tint } from "../../config/palette.js";

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" }) : "—");
const daysTo = (iso) => Math.round((new Date(iso).getTime() - Date.now()) / 864e5);

export default function TrackRecord() {
  const [forecasts, setForecasts] = useState(null);
  useEffect(() => { fetchForecasts().then(setForecasts); }, []);

  const tr = forecasts ? trackRecord(forecasts) : null;
  const open = (forecasts ?? []).filter((f) => f.status === "open");
  const resolved = (forecasts ?? []).filter((f) => f.status === "resolved").slice(0, 12);

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 animate-fade-up">
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "#C6A15B" }}>
          <Target className="h-3.5 w-3.5" /> Track record · The scorecard
        </div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">It grades its own homework</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          Every call this app makes is logged and locked, then scored against what actually happened — misses included.
          Forecasts are written server-side and can't be edited after the fact, so these numbers can't be gamed.
        </p>
      </div>

      {forecasts == null && (
        <div className="rounded-xl border px-4 py-3 font-mono text-[11px]" style={{ borderColor: "#232823", color: "#565B54" }}>Loading the ledger…</div>
      )}

      {tr && tr.resolvedCount === 0 && (
        <div className="mb-6 rounded-2xl border p-6 text-center" style={{ borderColor: tint("#C6A15B", 0.35), background: "linear-gradient(160deg, rgba(198,161,91,0.07), #101311)" }}>
          <Lock className="mx-auto mb-2 h-5 w-5" style={{ color: "#C6A15B" }} />
          <div className="font-display text-[18px] font-semibold text-ink">The scorecard is empty — and that's the point.</div>
          <p className="mx-auto mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted">
            A track record you could pre-fill would be worthless. This one starts at zero and earns every number as live
            forecasts mature. {open.length > 0
              ? <>It's already on the hook for <b className="text-ink">{open.length}</b> open call{open.length === 1 ? "" : "s"} below — the first resolve within a day or so.</>
              : <>Once the data feed is live, it starts logging calls automatically.</>}
          </p>
        </div>
      )}

      {tr && tr.resolvedCount > 0 && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Metric label="Resolved" value={tr.resolvedCount} sub="calls scored" color="#6FBDB4" />
            <Metric label="Brier score" value={tr.brier ?? "—"} sub={tr.brier != null ? (tr.brier < 0.25 ? "beating a coin flip" : "worse than a coin flip") : "no prob. calls yet"} color={tr.brier != null && tr.brier < 0.25 ? "#7FB58A" : "#C6A15B"} />
            <Metric label="Hit rate" value={tr.hitRate != null ? `${Math.round(tr.hitRate * 100)}%` : "—"} sub="probabilistic calls" color="#7FB58A" />
            <Metric label="Band coverage" value={tr.coverage != null ? `${Math.round(tr.coverage * 100)}%` : "—"} sub={tr.nominal != null ? `vs ${Math.round(tr.nominal * 100)}% claimed` : "range calls"} color="#6FBDB4" />
          </div>

          {tr.calibration.length > 0 && <Reliability cal={tr.calibration} />}

          {tr.byKind.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">By forecast type</div>
              <div className="space-y-1.5">
                {tr.byKind.map((k) => (
                  <div key={k.kind} className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
                    <span className="flex-1 text-[13px] font-medium text-ink">{prettyKind(k.kind)}</span>
                    <span className="font-mono text-[11px] text-muted">{k.n} scored</span>
                    <span className="font-mono text-[11px]" style={{ color: "#7FB58A" }}>
                      {k.ranges > 0 ? `${k.inBand}/${k.ranges} in band` : `${k.correct}/${k.n} correct`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Open calls — the app's live skin in the game (shown even when nothing's resolved). */}
      {open.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">
            <Clock className="h-3.5 w-3.5" /> Open calls · on the hook
          </div>
          <div className="space-y-1.5">
            {open.slice(0, 10).map((f) => (
              <div key={f.id} className="rounded-xl border px-4 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
                <div className="text-[12.5px] leading-relaxed text-ink">{f.statement}</div>
                <div className="mt-1 flex items-center gap-3 font-mono text-[9px]" style={{ color: "#565B54" }}>
                  <span>logged {fmtDate(f.made_at)}</span>
                  <span style={{ color: "#6FBDB4" }}>resolves {fmtDate(f.resolves_at)} ({daysTo(f.resolves_at) <= 0 ? "due" : `in ${daysTo(f.resolves_at)}d`})</span>
                  <span className="uppercase tracking-wider">{prettyKind(f.kind)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved history */}
      {resolved.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">Resolved · graded</div>
          <div className="space-y-1.5">
            {resolved.map((f) => {
              const ok = f.correct === true;
              return (
                <div key={f.id} className="flex items-start gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
                  {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#7FB58A" }} /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#C77B6B" }} />}
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] leading-relaxed text-ink">{f.statement}</div>
                    <div className="mt-0.5 font-mono text-[9px]" style={{ color: "#565B54" }}>
                      actual {f.actual_value ?? f.actual_outcome ?? "—"} · {fmtDate(f.made_at)} → {fmtDate(f.resolved_at)}
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[10px]" style={{ color: ok ? "#7FB58A" : "#C77B6B" }}>{ok ? "hit" : "miss"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-6 border-t pt-4 font-mono text-[10px] leading-relaxed" style={{ borderColor: "#1E231F", color: "#565B54" }}>
        Brier score: 0 = perfect, 0.25 = a coin flip on a yes/no call, 1 = confidently wrong. Coverage: a 68% band should
        contain the truth ~68% of the time — much higher means the bands are too wide, much lower means overconfident.
      </p>
    </div>
  );
}

function Metric({ label, value, sub, color }) {
  return (
    <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-2">{label}</div>
      <div className="mt-0.5 font-display text-[22px] font-semibold tabular-nums" style={{ color }}>{value}</div>
      <div className="font-mono text-[8.5px]" style={{ color: "#565B54" }}>{sub}</div>
    </div>
  );
}

// Reliability diagram: predicted probability (x) vs actual hit rate (y). A calibrated
// forecaster sits on the diagonal. Points sized by how many calls fell in each bucket.
function Reliability({ cal }) {
  const S = 168, pad = 22, plot = S - pad * 2;
  const X = (p) => pad + p * plot;
  const Y = (p) => S - pad - p * plot;
  const maxN = Math.max(...cal.map((c) => c.n));
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-2">
        <Gauge className="h-3.5 w-3.5" /> Calibration · predicted vs actual
      </div>
      <div className="flex flex-wrap items-center gap-5 rounded-xl border px-4 py-4" style={{ borderColor: "#232823", background: "linear-gradient(155deg, #131614, #101311)" }}>
        <svg width={S} height={S} className="shrink-0">
          <rect x={pad} y={pad} width={plot} height={plot} fill="none" stroke="#232823" />
          <line x1={pad} y1={S - pad} x2={S - pad} y2={pad} stroke="#3A403A" strokeDasharray="3 3" />
          {cal.map((c, i) => (
            <circle key={i} cx={X(c.predicted)} cy={Y(c.actual)} r={3 + 6 * (c.n / maxN)} fill={tint("#6FBDB4", 0.5)} stroke="#6FBDB4" />
          ))}
          <text x={pad} y={S - 6} fill="#565B54" fontSize="8" fontFamily="monospace">0</text>
          <text x={S - pad - 6} y={S - 6} fill="#565B54" fontSize="8" fontFamily="monospace">100%</text>
          <text x={4} y={pad + 4} fill="#565B54" fontSize="8" fontFamily="monospace">actual</text>
        </svg>
        <div className="text-[11.5px] leading-relaxed text-muted">
          Each dot is a bucket of calls that were assigned a similar probability. On the dashed line = perfectly calibrated
          (when it says 70%, it's right 70% of the time). Above the line = under-confident; below = over-confident. Bigger
          dots = more calls.
        </div>
      </div>
    </div>
  );
}

function prettyKind(k) {
  return { repo_rate: "Repo rate", rand_range: "Rand range", direction: "Direction", macro: "Macro" }[k] || k;
}
