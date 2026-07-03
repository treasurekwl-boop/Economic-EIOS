// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC COLOR — each sector and constraint owns a hue, so color encodes
// *which thing* you're looking at, not just good/bad. This makes the charts and
// tables instantly readable: the same sector is the same color everywhere.
// ─────────────────────────────────────────────────────────────────────────────

// 10 production sectors → 10 distinguishable hues (readable on the dark base)
export const SECTOR_COLORS = {
  agri:   "#7FB58A", // green   — crops & nature
  mining: "#D8AF6A", // gold    — minerals
  manuf:  "#5B8DEF", // blue    — industry
  util:   "#C6A15B", // amber   — electricity
  constr: "#E08B70", // coral   — building
  trade:  "#6FBDB4", // teal    — commerce
  transp: "#7FB58A", // mint    — movement
  fin:    "#A99BF5", // violet  — finance (the biggest sector)
  govt:   "#C77DFF", // purple  — the state
  pers:   "#D98BB6", // pink    — services to people
};

// 7 binding constraints → a hue per domain (matches the icon's meaning)
export const CONSTRAINT_COLORS = {
  energy:    "#C6A15B", // amber  — power
  logistics: "#5B8DEF", // blue   — rail & ports
  crime:     "#D8735E", // red    — security
  state:     "#A99BF5", // violet — institutions
  skills:    "#7FB58A", // green  — people & education
  water:     "#4FB8F0", // sky    — water
  fiscal:    "#E08B70", // coral  — money & debt
};

// helper: a translucent tint of any hex, for soft card backgrounds
export const tint = (hex, alpha = 0.1) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
