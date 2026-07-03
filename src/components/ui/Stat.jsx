import { tnum } from "../../lib/format.js";

const TONE_CONFIG = {
  amber: {
    text: "text-signal",
    glow: "rgba(198,161,91,0.2)",
    border: "rgba(198,161,91,0.2)",
    bg: "rgba(198,161,91,0.04)",
    dot: "#C6A15B",
  },
  ok: {
    text: "text-ok",
    glow: "rgba(127,181,138,0.2)",
    border: "rgba(127,181,138,0.2)",
    bg: "rgba(127,181,138,0.04)",
    dot: "#7FB58A",
  },
  data: {
    text: "text-data",
    glow: "rgba(111,189,180,0.2)",
    border: "rgba(111,189,180,0.2)",
    bg: "rgba(111,189,180,0.04)",
    dot: "#6FBDB4",
  },
  alert: {
    text: "text-alert",
    glow: "rgba(216,115,94,0.2)",
    border: "rgba(216,115,94,0.2)",
    bg: "rgba(216,115,94,0.04)",
    dot: "#D8735E",
  },
  muted: {
    text: "text-muted",
    glow: "transparent",
    border: "rgba(35,40,35,1)",
    bg: "transparent",
    dot: "#6B7068",
  },
};

export default function Stat({ label, value, tone = "muted", sub }) {
  const cfg = TONE_CONFIG[tone] ?? TONE_CONFIG.muted;

  return (
    <div
      className="relative overflow-hidden rounded-xl px-4 py-3 transition-shadow duration-200"
      style={{
        background: `linear-gradient(145deg, #131614 0%, #101311 100%)`,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 1px 3px rgba(0,0,0,0.4), inset 0 0 0 1px ${cfg.bg}`,
      }}
    >
      {/* Subtle top glow line */}
      {tone !== "muted" && (
        <div
          className="absolute left-0 top-0 h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${cfg.dot}40, transparent)` }}
        />
      )}

      <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-2">{label}</div>
      <div
        className={`mt-1.5 font-display text-[26px] font-normal leading-none tracking-[-0.01em] ${cfg.text}`}
        style={{ ...tnum, textShadow: tone !== "muted" ? `0 0 20px ${cfg.glow}` : "none" }}
      >
        {value}
      </div>
      {sub && <div className="mt-1 font-mono text-[9px] text-muted-2">{sub}</div>}
    </div>
  );
}
