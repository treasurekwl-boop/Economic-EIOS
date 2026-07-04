import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { fetchPrices } from "../../lib/dataApi.js";

// A live-markets strip — FX + commodities, refreshed every 30 min by the free
// GitHub Action. Renders nothing until the table has data (graceful).
const ORDER = ["usdzar", "eurzar", "gbpzar", "gold", "brent", "platinum"];
const FMT = {
  usdzar: (v) => `R${v.toFixed(2)}`, eurzar: (v) => `R${v.toFixed(2)}`, gbpzar: (v) => `R${v.toFixed(2)}`,
  gold: (v) => `$${Math.round(v).toLocaleString("en-US")}`, platinum: (v) => `$${Math.round(v).toLocaleString("en-US")}`,
  brent: (v) => `$${v.toFixed(1)}`,
};

export default function LivePrices() {
  const [prices, setPrices] = useState([]);
  useEffect(() => { fetchPrices().then(setPrices); }, []);
  if (!prices.length) return null;

  const byId = Object.fromEntries(prices.map((p) => [p.id, p]));
  const list = ORDER.map((id) => byId[id]).filter(Boolean);
  if (!list.length) return null;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="dot-live" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "#7FB58A" }}>Live markets</span>
        <Activity className="h-3 w-3" style={{ color: "#565B54" }} />
        <span className="font-mono text-[9px]" style={{ color: "#565B54" }}>· FX &amp; commodities · updates every 30 min</span>
      </div>
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
        {list.map((p) => {
          const chg = p.change_pct;
          const up = (chg ?? 0) >= 0;
          const fmt = FMT[p.id] ?? ((v) => v);
          return (
            <div key={p.id} className="min-w-[128px] shrink-0 rounded-xl border p-3" style={{ borderColor: "#232823", background: "linear-gradient(160deg, #131614, #101311)" }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color: "#6B7068" }}>{p.label}</div>
              <div className="mt-1.5 font-display text-[20px]" style={{ color: "#ECEAE3", fontVariantNumeric: "tabular-nums" }}>{fmt(Number(p.value))}</div>
              <div className="font-mono text-[9px]" style={{ color: "#565B54" }}>
                {p.unit}
                {chg != null && <span className="ml-1.5" style={{ color: up ? "#7FB58A" : "#D8735E" }}>{up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
