import { Lightbulb } from "lucide-react";
import { tint } from "../../config/palette.js";

// A colorful "aha" card — surfaces a surprising, true fact to pull the reader in.
// The educational hook that makes someone want to keep poking at the model.
export default function Insight({ children, color = "#A99BF5", label = "Insight", icon: Icon = Lightbulb }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4"
      style={{
        background: `linear-gradient(135deg, ${tint(color, 0.12)}, ${tint(color, 0.03)})`,
        border: `1px solid ${tint(color, 0.3)}`,
      }}
    >
      {/* glow accent */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
        style={{ background: tint(color, 0.18) }}
      />
      <div className="relative flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-lg p-1.5" style={{ background: tint(color, 0.16) }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div>
          <div
            className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color }}
          >
            {label}
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink/90">{children}</p>
        </div>
      </div>
    </div>
  );
}
