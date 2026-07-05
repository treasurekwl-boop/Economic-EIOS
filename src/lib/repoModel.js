// ─────────────────────────────────────────────────────────────────────────────
// SARB REPO-RATE MODEL — a transparent, defensible probability distribution over
// the next MPC decision. Not a black box: it's a Taylor rule (the standard
// monetary-policy benchmark) + a rand-defence Fed-differential term + interest-
// rate SMOOTHING (central banks move gradually and hate surprising markets),
// turned into probabilities via a softmax over the discrete 25bp choices.
//
// Every term is exposed in `drivers` so you can see WHY it says what it says — and
// the constants are tunable, so as the scorecard accrues real outcomes we calibrate
// them to the app's actual hit rate rather than leaving them as guesses.
// ─────────────────────────────────────────────────────────────────────────────

export const REPO_DEFAULTS = {
  target: 4.5,          // CPI target: SARB band is 3–6%, midpoint 4.5%
  neutralReal: 2.7,     // SARB's own estimate of the neutral real policy rate
  taylorInflation: 1.5, // Taylor coefficient on the inflation gap (the classic 1.5)
  fedComfort: 3.0,      // a "comfortable" SA-minus-US policy spread (rand risk premium)
  fedWeight: 0.4,       // how hard a compressed spread pushes hawkish
  randWeight: 0.03,     // hawkish bias per 1% of recent rand depreciation (pass-through)
  cpiMomWeight: 0.5,    // bias per 1pp of CPI acceleration
  inertia: 1.8,         // smoothing: penalty per 25bp step of moving (higher = stickier)
  temperature: 0.4,     // softmax sharpness (lower = more decisive)
};

const STEPS = [
  ["cut50", -0.50], ["cut25", -0.25], ["hold", 0], ["hike25", 0.25], ["hike50", 0.50],
];

export const OUTCOME_LABELS = {
  cut50: "Cut 50bp", cut25: "Cut 25bp", hold: "Hold", hike25: "Hike 25bp", hike50: "Hike 50bp",
};

// Map an actual decision (change in repo, in percentage points) to an outcome key —
// used to resolve/score a logged forecast once the MPC has decided.
export function outcomeForDelta(deltaPct) {
  const bps = deltaPct * 100;
  if (bps <= -37.5) return "cut50";
  if (bps <= -12.5) return "cut25";
  if (bps < 12.5) return "hold";
  if (bps < 37.5) return "hike25";
  return "hike50";
}

// inp: { repo, cpi, fedFunds?, randTrend?, cpiMomentum?, ...overrides }
//   repo, cpi are required (%, e.g. 7.0 and 4.5). fedFunds/randTrend/cpiMomentum optional.
//   randTrend = % rand depreciation over the recent window (positive = weaker rand).
export function repoDecision(inp) {
  const c = { ...REPO_DEFAULTS, ...inp };
  const { repo, cpi } = inp;
  if (repo == null || cpi == null) return null;

  const neutralNominal = c.neutralReal + c.target;
  let rStar = neutralNominal + c.taylorInflation * (cpi - c.target);
  const drivers = [
    { label: `Taylor rule · CPI ${cpi.toFixed(1)}% vs ${c.target}% target`, effect: +(rStar - repo).toFixed(2), base: true },
  ];

  if (inp.fedFunds != null) {
    const spread = repo - inp.fedFunds;
    const bias = c.fedWeight * (c.fedComfort - spread); // spread below comfort → hawkish
    rStar += bias;
    drivers.push({ label: `Fed differential · SA-US spread ${spread.toFixed(1)}% vs ${c.fedComfort}% comfort`, effect: +bias.toFixed(2) });
  }
  if (inp.randTrend != null) {
    const bias = c.randWeight * inp.randTrend;
    rStar += bias;
    drivers.push({ label: `Rand pass-through · ${inp.randTrend >= 0 ? "weaker" : "firmer"} ${Math.abs(inp.randTrend).toFixed(1)}% recently`, effect: +bias.toFixed(2) });
  }
  if (inp.cpiMomentum != null) {
    const bias = c.cpiMomWeight * inp.cpiMomentum;
    rStar += bias;
    drivers.push({ label: `CPI momentum · ${inp.cpiMomentum >= 0 ? "accelerating" : "cooling"} ${Math.abs(inp.cpiMomentum).toFixed(1)}pp`, effect: +bias.toFixed(2) });
  }

  // Score each discrete choice: closeness to r* (quadratic) minus a smoothing penalty
  // for the size of the move. Softmax → probabilities.
  const scores = STEPS.map(([, d]) => {
    const miss = (repo + d - rStar) ** 2;
    const steps = Math.abs(d) / 0.25;
    return -miss / c.temperature - c.inertia * steps;
  });
  const mx = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - mx));
  const Z = exps.reduce((a, b) => a + b, 0);
  const dist = {};
  let modal = STEPS[0][0], mp = -1;
  STEPS.forEach(([k], i) => {
    const p = exps[i] / Z;
    dist[k] = +p.toFixed(4);
    if (p > mp) { mp = p; modal = k; }
  });

  return {
    rStar: +rStar.toFixed(2),
    neutralNominal: +neutralNominal.toFixed(2),
    gap: +(rStar - repo).toFixed(2),
    dist, modal, prob: +mp.toFixed(4),
    drivers,
  };
}
