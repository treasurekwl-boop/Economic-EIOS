import { GDP_LEVEL } from "../config/model.js";

export const tnum = { fontVariantNumeric: "tabular-nums" };

export const signed = (n, d = 2) => (n >= 0 ? "+" : "") + n.toFixed(d);

// Convert percentage points of GDP into a rand magnitude.
export function randOfPP(pp, gdpLevel = GDP_LEVEL) {
  const v = Math.abs(pp) * (gdpLevel / 100);
  const s = v >= 1000 ? (v / 1000).toFixed(2) + "tn" : v.toFixed(0) + "bn";
  return (pp < 0 ? "−R" : "R") + s;
}
