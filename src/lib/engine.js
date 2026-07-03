import { PARAMS, SETPOINT, LEVERS } from "../config/model.js";

// Run the connected engine for a set of levers + assumptions + the reform uplift
// flowing in from the Diagnosis. Returns growth, potential, inflation, jobs, and
// the expenditure breakdown.
export function runEngine(L, A, reformUplift = 0, overrides = {}) {
  const p = PARAMS;
  const s = overrides.shares ?? p.shares;

  const real = L.repo - p.PI_E;          // real repo rate
  const slack = A.neutral - real;        // >0 when policy is loose vs neutral

  const gI_eff = L.gI + A.thetaI * slack; // investment responds to the real rate
  const gC_eff = p.C_BASE + p.THETA_C * slack;
  const gM = gC_eff;                      // imports track consumption

  const gExp =
    s.C * gC_eff + s.I * gI_eff + s.G * L.gG + s.X * L.gX - s.M * gM;

  const structural = reformUplift;        // supply-side lift from resolved constraints
  const gTotal = gExp + structural;
  const gPot = p.POT_BASE + p.LAMBDA_I * (gI_eff - p.I_NORM) + structural;
  const gap = gTotal - gPot;

  const infl = p.PI_E + p.KAPPA * gap + A.shock;
  const empGrowth = gTotal - p.PROD_TREND;
  const djobs = p.EMPLOYED * (empGrowth / 100); // thousands

  const comps = [
    { name: "C", v: s.C * gC_eff },
    { name: "I", v: s.I * gI_eff },
    { name: "G", v: s.G * L.gG },
    { name: "X", v: s.X * L.gX },
    { name: "−M", v: -s.M * gM },
    { name: "Reform", v: structural },
  ];

  return { gTotal, gPot, gap, infl, djobs, gI_eff, gC_eff, comps, structural, real };
}

// Solve backwards: move the unlocked levers to reach the target, distributing the
// gap by each lever's numerical marginal effect (so repo moves down, others up).
// Returns a new lever object. Respects per-lever bounds; if bounds bind, it gets
// as close as it can.
export function solveToTarget(L, A, reformUplift, locked, overrides = {}) {
  const base = runEngine(L, A, reformUplift, overrides).gTotal;
  const need = SETPOINT - base;
  if (need <= 0.0001) return L;

  const eps = 0.01;
  const open = LEVERS.filter((l) => !locked[l.id]);
  if (open.length === 0) return L;

  const marg = open.map((l) => {
    const perturbed = { ...L, [l.id]: L[l.id] + eps };
    return { l, m: (runEngine(perturbed, A, reformUplift, overrides).gTotal - base) / eps };
  });
  const denom = marg.reduce((a, x) => a + Math.abs(x.m), 0);
  if (denom === 0) return L;

  const k = need / denom;
  const next = { ...L };
  marg.forEach(({ l, m }) => {
    const dir = Math.sign(m); // repo's marginal is negative → it moves down
    next[l.id] = +Math.min(l.max, Math.max(l.min, L[l.id] + dir * k)).toFixed(2);
  });
  return next;
}

// What repo rate would deliver the current shortfall purely through monetary
// policy, given the model — used to make the point that the rate can't carry it.
export function repoForGap(L, A, reformUplift) {
  const out = runEngine(L, A, reformUplift);
  const gap = SETPOINT - out.gTotal;
  if (gap <= 0) return { repoReq: L.repo, feasible: true, gap: 0 };
  // dGrowth/dRepo via finite difference
  const eps = 0.01;
  const dG = (runEngine({ ...L, repo: L.repo + eps }, A, reformUplift).gTotal - out.gTotal) / eps;
  if (dG === 0) return { repoReq: NaN, feasible: false, gap };
  const repoReq = L.repo + gap / dG; // dG is negative → repoReq < repo
  return { repoReq, feasible: repoReq >= 0, gap, delta: repoReq - L.repo };
}
