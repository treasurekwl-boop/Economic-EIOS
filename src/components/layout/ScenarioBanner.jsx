import { Zap, Share2, X, TrendingUp, TrendingDown } from "lucide-react";
import { useScenario } from "../../context/ScenarioContext.jsx";
import { lagLabel } from "../../config/graph.js";
import { tint } from "../../config/palette.js";

// The persistent strip that proves a single event ripples through everything.
export default function ScenarioBanner({ onView }) {
  const { scenario, clearScenario } = useScenario();
  if (!scenario) return null;

  const up = scenario.dir > 0;
  const Dir = up ? TrendingUp : TrendingDown;
  const gdp = scenario.gdp;
  const violet = "#A99BF5";

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b px-4 py-2 sm:px-6"
      style={{ borderColor: tint(violet, 0.25), background: `linear-gradient(90deg, ${tint(violet, 0.1)}, ${tint(violet, 0.02)} 70%, transparent)` }}
    >
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: violet }}>
        <Zap className="h-3 w-3" /> Active scenario
      </span>

      <span className="flex items-center gap-1.5 text-[12px]">
        <span className="font-medium text-ink">{scenario.originLabel}</span>
        <Dir className="h-3.5 w-3.5" style={{ color: up ? "#7FB58A" : "#D8735E" }} />
        <span className="font-mono text-[11px]" style={{ color: up ? "#7FB58A" : "#D8735E" }}>{up ? "rises" : "falls"}</span>
      </span>

      {gdp && (
        <span className="font-mono text-[10.5px]" style={{ color: "#8A8F88" }}>
          → GDP <span style={{ color: gdp.impulse > 0 ? "#7FB58A" : "#D8735E" }}>{gdp.impulse > 0 ? "supportive" : "contractionary"}</span>
          <span style={{ color: "#565B54" }}> · {lagLabel(gdp.lagWeeks)}</span>
        </span>
      )}

      <span className="hidden font-mono text-[10px] sm:inline" style={{ color: "#565B54" }}>
        {Object.keys(scenario.impacts).length} nodes reached · ripples shown across every view
      </span>

      <div className="ml-auto flex items-center gap-2">
        {onView && (
          <button onClick={onView} className="flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors"
            style={{ borderColor: tint(violet, 0.4), color: violet }}>
            <Share2 className="h-3 w-3" /> View
          </button>
        )}
        <button onClick={clearScenario} className="rounded-md p-1 transition-colors hover:text-ink" style={{ color: "#6B7068" }} title="Clear scenario">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
