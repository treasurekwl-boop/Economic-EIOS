import { ChevronDown, TrendingUp } from "lucide-react";
import { useEngine } from "../../context/EngineContext.jsx";
import { CONSTRAINTS } from "../../config/model.js";
import { VIEWS } from "./Nav.jsx";

// Premium sidebar (desktop) — brand, country, grouped nav (Engine / Context),
// and the live rand pinned at the bottom. Mobile keeps the top tab bar.
const ENGINE_IDS = ["overview", "network", "solver", "sectors", "diagnosis"];
const CONTEXT_IDS = ["fundamentals", "news", "calendar", "markets", "citizen", "fluency"];

function BrandMark() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
      style={{
        background: "radial-gradient(circle at 30% 25%, rgba(198,161,91,0.35), rgba(198,161,91,0.08))",
        border: "1px solid rgba(198,161,91,0.4)",
        boxShadow: "0 0 0 1px rgba(12,14,13,1), 0 4px 16px rgba(198,161,91,0.12)",
      }}
    >
      <TrendingUp className="h-[19px] w-[19px]" style={{ color: "#C6A15B" }} strokeWidth={1.9} />
    </div>
  );
}

function NavGroup({ title, ids, active, onChange, badges }) {
  return (
    <>
      <div className="px-2.5 pb-2 pt-4 font-mono text-[9px] uppercase tracking-[0.16em] first:pt-0" style={{ color: "#4E534B" }}>
        {title}
      </div>
      {ids.map((id) => {
        const v = VIEWS.find((x) => x.id === id);
        if (!v) return null;
        const Icon = v.icon;
        const on = active === id;
        const badge = badges?.[id];
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="mb-0.5 flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] transition-colors"
            style={on
              ? { color: "#F3F1EA", fontWeight: 600, background: "linear-gradient(90deg, rgba(198,161,91,0.12), rgba(198,161,91,0.02))", boxShadow: "inset 2px 0 0 #C6A15B" }
              : { color: "#8A8F88", fontWeight: 500 }}
          >
            <span className="flex w-[17px] justify-center">
              <Icon className="h-[15px] w-[15px]" style={{ color: on ? "#C6A15B" : "#7B8077" }} strokeWidth={1.9} />
            </span>
            <span className="flex-1 text-left">{v.label}</span>
            {badge && (
              <span className="rounded-[5px] px-1.5 py-px font-mono text-[9px]" style={{ background: "rgba(169,155,245,0.14)", color: "#A99BF5" }}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </>
  );
}

export default function Sidebar({ active, onChange }) {
  const { country, countries, setCountryCode, reforms, fx } = useEngine();
  const fixedCount = CONSTRAINTS.filter((c) => reforms[c.id]).length;
  const flag = country.code === "ZA" ? "🇿🇦" : "🌍";

  return (
    <aside
      className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col lg:flex"
      style={{ borderRight: "1px solid #1E2320", background: "linear-gradient(180deg, #0E110F, #0B0D0C)" }}
    >
      {/* brand + country */}
      <div className="border-b px-[22px] pb-[18px] pt-[22px]" style={{ borderColor: "#1A1F1C" }}>
        <div className="flex items-center gap-[11px]">
          <BrandMark />
          <div>
            <div className="font-display text-[19px] font-medium leading-none tracking-[-0.01em] text-ink">Growth Engine</div>
            <div className="mt-[5px] font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: "#5A5F58" }}>
              Self-calibrating model
            </div>
          </div>
        </div>
        <label className="relative mt-4 flex w-full items-center">
          <span className="pointer-events-none absolute left-[11px] text-[15px] leading-none">{flag}</span>
          <span className="sr-only">Economy</span>
          <select
            value={country.code}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full appearance-none rounded-[9px] py-2 pl-9 pr-8 text-[13px] font-medium text-ink"
            style={{ border: "1px solid #262B27", background: "#12150F" }}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 h-3 w-3" style={{ color: "#6B7068" }} />
        </label>
      </div>

      {/* nav */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-3.5">
        <NavGroup title="Engine" ids={ENGINE_IDS} active={active} onChange={onChange}
          badges={{ diagnosis: `${fixedCount}/${CONSTRAINTS.length}` }} />
        <NavGroup title="Context" ids={CONTEXT_IDS} active={active} onChange={onChange} />
      </nav>

      {/* live rand pinned */}
      <div className="border-t px-4 py-3.5" style={{ borderColor: "#1A1F1C", background: "linear-gradient(180deg, transparent, rgba(111,189,180,0.04))" }}>
        <div className="flex items-center gap-[7px]">
          <span className="h-[7px] w-[7px] rounded-full" style={{ background: "#7FB58A", boxShadow: "0 0 7px rgba(127,181,138,0.8)" }} />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "#7FB58A" }}>Live · The Rand</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-display text-[26px] font-medium" style={{ color: "#6FBDB4", fontVariantNumeric: "tabular-nums" }}>
            {fx ? `R${fx.usdZar.toFixed(2)}` : "—"}
          </span>
          <span className="font-mono text-[11px]" style={{ color: "#6B7068" }}>/ USD</span>
        </div>
        {fx && typeof fx.change30 === "number" && (
          <div className="mt-[3px] font-mono text-[10px]" style={{ color: fx.change30 > 0 ? "#D8735E" : "#7FB58A" }}>
            {fx.change30 > 0 ? "▾" : "▴"} {Math.abs(fx.change30).toFixed(1)}% {fx.change30 > 0 ? "weaker" : "stronger"} · 30d
          </div>
        )}
      </div>
    </aside>
  );
}
