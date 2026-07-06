// Network-science metrics on the causal graph — the buildable "network fragility"
// slice of the complexity brief. Which economic nodes are the most SYSTEMIC: they
// sit on the most causal paths (betweenness) and drive the most other nodes
// (out-degree). A shock to a high-centrality node propagates furthest. Pure graph
// algorithm on the graph the app already has — no external data needed.
import { NODES, EDGES, NODE_TYPES } from "../config/graph.js";

// Brandes' algorithm for betweenness centrality on the directed, unweighted graph,
// plus in/out degree. Returns rows sorted by a systemic score (betweenness-led).
export function centrality() {
  const ids = NODES.map((n) => n.id);
  const idx = Object.fromEntries(ids.map((id, i) => [id, i]));
  const n = ids.length;
  const adj = ids.map(() => []);
  const indeg = new Array(n).fill(0), outdeg = new Array(n).fill(0);
  for (const e of EDGES) {
    if (idx[e.from] == null || idx[e.to] == null) continue;
    adj[idx[e.from]].push(idx[e.to]);
    outdeg[idx[e.from]]++; indeg[idx[e.to]]++;
  }

  const bet = new Array(n).fill(0);
  for (let s = 0; s < n; s++) {
    const S = [], P = ids.map(() => []), sigma = new Array(n).fill(0), dist = new Array(n).fill(-1);
    sigma[s] = 1; dist[s] = 0;
    const Q = [s];
    while (Q.length) {
      const v = Q.shift(); S.push(v);
      for (const w of adj[v]) {
        if (dist[w] < 0) { dist[w] = dist[v] + 1; Q.push(w); }
        if (dist[w] === dist[v] + 1) { sigma[w] += sigma[v]; P[w].push(v); }
      }
    }
    const delta = new Array(n).fill(0);
    while (S.length) {
      const w = S.pop();
      for (const v of P[w]) delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      if (w !== s) bet[w] += delta[w];
    }
  }

  const norm = (n - 1) * (n - 2) || 1;   // directed normalisation
  const maxBet = Math.max(...bet, 1e-9);
  const rows = ids.map((id, i) => ({
    id, label: NODES[i].label, type: NODES[i].type, color: NODE_TYPES[NODES[i].type]?.color ?? "#8A8F88",
    indeg: indeg[i], outdeg: outdeg[i],
    betweenness: +(bet[i] / norm).toFixed(3),
    betRel: bet[i] / maxBet,                 // 0..1 for bar widths
  }));
  // Systemic score: betweenness-led, out-degree as tiebreak (drives many things).
  return rows.sort((a, b) => b.betweenness - a.betweenness || b.outdeg - a.outdeg);
}
