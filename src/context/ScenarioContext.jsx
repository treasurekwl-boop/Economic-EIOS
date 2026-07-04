import { createContext, useContext } from "react";
import { NODE_GOOD } from "../config/graph.js";

// A single active shock, shared across every view. Fire it anywhere (News, the
// Solver, a Market, the graph) and it rides the whole app: a banner on top, and
// ▲▼ scenario chips lighting up the affected nodes on the Fundamentals board,
// the Sectors table, and beyond. The digital twin, visibly alive.
export const ScenarioContext = createContext({
  scenario: null,        // { origin, dir, originLabel, impacts: {id:{impulse,lagWeeks}}, gdp, ts }
  fireScenario: () => {},
  clearScenario: () => {},
});

export const useScenario = () => useContext(ScenarioContext);

// Read one node's scenario impact → a chip descriptor, or null. The impulse sign
// is now the true value direction (rises/falls); colour reflects whether that's
// GOOD or BAD for this node (via its polarity), so a rising cost shows red.
export function impactOf(scenario, nodeId) {
  if (!scenario || !nodeId) return null;
  const im = scenario.impacts?.[nodeId];
  if (!im || Math.abs(im.impulse) < 0.03) return null;
  const rises = im.impulse > 0;
  const good = NODE_GOOD[nodeId];               // true / false / undefined (neutral)
  const sentiment = good == null ? null : (rises === good ? "good" : "bad");
  const color = sentiment === "good" ? "#7FB58A" : sentiment === "bad" ? "#D8735E" : "#8A8F88";
  return {
    up: rises,
    rises,
    sentiment,
    color,
    glyph: rises ? "▲" : "▼",
    strength: Math.min(1, Math.abs(im.impulse)),
    lagWeeks: im.lagWeeks,
  };
}
