// The baseline figures in model.js are South Africa's. Other countries are
// selectable in the UI but currently reuse the SA structural baseline — wiring
// per-country data feeds is the next extension (a Sensor layer).

export const COUNTRIES = [
  { code: "ZAF", name: "South Africa" },
  { code: "NGA", name: "Nigeria" },
  { code: "KEN", name: "Kenya" },
  { code: "GHA", name: "Ghana" },
  { code: "EGY", name: "Egypt" },
  { code: "BWA", name: "Botswana" },
];

export const DEFAULT_COUNTRY = "ZAF";
