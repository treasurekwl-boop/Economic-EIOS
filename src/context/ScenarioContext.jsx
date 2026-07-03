import { createContext, useContext } from "react";

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

// Read one node's scenario impact → a chip descriptor, or null.
export function impactOf(scenario, nodeId) {
  if (!scenario || !nodeId) return null;
  const im = scenario.impacts?.[nodeId];
  if (!im || Math.abs(im.impulse) < 0.03) return null;
  const up = im.impulse > 0;
  return {
    up,
    color: up ? "#7FB58A" : "#D8735E",
    glyph: up ? "▲" : "▼",
    strength: Math.min(1, Math.abs(im.impulse)),
    lagWeeks: im.lagWeeks,
  };
}
