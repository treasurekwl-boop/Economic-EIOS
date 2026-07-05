// Repo-rate model → the scorecard, server-side. Around each SARB MPC it logs the
// model's probabilistic call, and after the decision it resolves & scores it. Uses
// the SAME model the app shows (src/lib/repoModel.js) and the same Brier scoring
// (src/lib/scoring.js) — no duplicated logic, so the graded call is exactly the one
// the user saw. Runs in the 30-min Action.
//
// HONESTY: it only logs when the SA inputs are real (sa_repo + sa_cpi_yoy set in
// macro_series). It never invents a repo/CPI to make a call. And it only resolves
// once the user has updated sa_repo after the meeting (as_of ≥ meeting date).
import { repoDecision, outcomeForDelta, OUTCOME_LABELS } from "../src/lib/repoModel.js";
import { brierMulti } from "../src/lib/scoring.js";
import { RELEASES } from "../src/config/calendar.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing Supabase env."); process.exit(1); }

const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };
const rest = (p, o = {}) => fetch(`${SUPABASE_URL}/rest/v1/${p}`, { ...o, headers: { ...H, ...(o.headers || {}) } });
const nowIso = new Date().toISOString();
const dayOf = (iso) => String(iso).slice(0, 10);

// current SA inputs from macro_series
let byId = {};
try {
  const r = await rest(`macro_series?id=in.(sa_repo,sa_cpi_yoy,fedfunds)&select=id,value,as_of`);
  if (r.ok) for (const row of await r.json()) byId[row.id] = row;
} catch (e) { console.error("macro read failed:", e.message); }

const repoNow = byId.sa_repo?.value != null ? Number(byId.sa_repo.value) : null;
const repoAsOf = byId.sa_repo?.as_of || null;
const cpiNow = byId.sa_cpi_yoy?.value != null ? Number(byId.sa_cpi_yoy.value) : null;
const fedNow = byId.fedfunds?.value != null ? Number(byId.fedfunds.value) : null;

// ============ 1) RESOLVE due repo calls ============
let resolved = 0;
try {
  const r = await rest(`forecasts?status=eq.open&kind=eq.repo_rate&resolves_at=lte.${nowIso}&select=*`);
  const due = r.ok ? await r.json() : [];
  for (const f of due) {
    if (repoNow == null || f.ref_value == null) continue;          // can't score without the rate
    if (!repoAsOf || repoAsOf < dayOf(f.resolves_at)) continue;    // user hasn't posted the decision yet
    const delta = repoNow - Number(f.ref_value);
    const outcome = outcomeForDelta(delta);
    const patch = {
      status: "resolved", actual_outcome: outcome, actual_value: repoNow,
      correct: outcome === f.predicted_outcome,
      brier: f.dist ? +brierMulti(f.dist, outcome).toFixed(4) : null,
      resolved_at: nowIso, updated_at: nowIso,
    };
    const up = await rest(`forecasts?id=eq.${f.id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(patch) });
    if (up.ok) resolved++; else console.error("repo resolve failed", f.id, up.status);
  }
} catch (e) { console.error("repo resolve pass failed:", e.message); }

// ============ 2) LOG the call for the next MPC (within 21 days) ============
let logged = 0;
if (repoNow != null && cpiNow != null) {
  const today = dayOf(nowIso);
  const mpc = RELEASES
    .filter((x) => x.node === "repo" && x.iso >= today)
    .sort((a, b) => a.iso.localeCompare(b.iso))[0];
  const daysUntil = mpc ? Math.round((new Date(mpc.iso + "T12:00:00Z") - Date.now()) / 864e5) : 999;

  if (mpc && daysUntil <= 21) {
    const rule = `SARB MPC ${mpc.iso}: actual = change in sa_repo vs ref_value`;
    // idempotent: skip if a call for this meeting already exists
    const exRes = await rest(`forecasts?kind=eq.repo_rate&resolution_rule=eq.${encodeURIComponent(rule)}&select=id`);
    const exists = exRes.ok && (await exRes.json()).length > 0;
    if (!exists) {
      const m = repoDecision({ repo: repoNow, cpi: cpiNow, fedFunds: fedNow ?? undefined });
      if (m) {
        const row = {
          kind: "repo_rate", target: "sa_repo", ref_value: repoNow,
          statement: `SARB MPC (${mpc.iso}): model call ${OUTCOME_LABELS[m.modal]} ${Math.round(m.prob * 100)}% — r* ${m.rStar.toFixed(2)}% vs repo ${repoNow.toFixed(2)}% (CPI ${cpiNow.toFixed(1)}%).`,
          prob: m.prob, dist: m.dist, predicted_outcome: m.modal,
          resolves_at: new Date(mpc.iso + "T12:00:00Z").toISOString(),
          resolution_rule: rule, status: "open",
        };
        const ins = await rest(`forecasts`, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify([row]) });
        if (ins.ok) logged++; else console.error("repo log failed", ins.status, await ins.text());
      }
    }
  }
}

console.log(`Repo model: resolved ${resolved}, logged ${logged}.${repoNow == null || cpiNow == null ? " (SA inputs not set — logging skipped)" : ""}`);
