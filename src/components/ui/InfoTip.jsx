import { useState, useRef } from "react";
import { HelpCircle } from "lucide-react";

// A teachable term. Shows a dotted-underlined word with a small "?" that reveals
// a plain-language definition on hover, focus, or tap. Flips below the term when
// there isn't room above, so it never gets clipped by the scroll container.
export default function InfoTip({ children, concept, color = "#6FBDB4", align = "center" }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("top");
  const btnRef = useRef(null);
  const title = concept?.title;
  const body = concept?.body;

  // Decide above vs below based on room between the term and the top of the
  // nearest scroll container (the <main> with overflow-y-auto).
  const computePlacement = () => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scroller = el.closest("main");
    const topBound = scroller ? scroller.getBoundingClientRect().top : 0;
    setPlacement(rect.top - topBound < 180 ? "bottom" : "top");
  };

  const openTip = () => { computePlacement(); setOpen(true); };
  const closeTip = () => setOpen(false);
  const toggle = () => { if (open) setOpen(false); else openTip(); };

  const horiz =
    align === "left" ? "left-0"
    : align === "right" ? "right-0"
    : "left-1/2 -translate-x-1/2";
  const vert = placement === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <span className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        onMouseEnter={openTip}
        onMouseLeave={closeTip}
        onFocus={openTip}
        onBlur={closeTip}
        className="group inline-flex cursor-help items-center gap-0.5 align-baseline focus:outline-none"
        aria-label={title ? `What is ${title}?` : "More information"}
      >
        <span
          className="border-b border-dotted transition-colors"
          style={{ borderColor: `${color}80`, color: "inherit" }}
        >
          {children}
        </span>
        <HelpCircle
          className="mb-1.5 h-2.5 w-2.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
          style={{ color }}
        />
      </button>

      {open && (body || title) && (
        <span
          role="tooltip"
          className={`absolute z-50 block w-[min(16rem,calc(100vw-2rem))] rounded-lg p-3 text-left shadow-card-hover ${horiz} ${vert}`}
          style={{
            background: "rgba(20, 27, 35, 0.98)",
            border: `1px solid ${color}40`,
            backdropFilter: "blur(8px)",
            boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${color}15`,
          }}
        >
          {title && (
            <span className="mb-1 block font-display text-[12px] font-semibold" style={{ color }}>
              {title}
            </span>
          )}
          {body && <span className="block text-[11.5px] leading-relaxed text-muted">{body}</span>}

          {/* arrow — points toward the term, on the side facing it */}
          {placement === "top" ? (
            <span
              className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
              style={{ background: "rgba(20, 27, 35, 0.98)", borderRight: `1px solid ${color}40`, borderBottom: `1px solid ${color}40` }}
            />
          ) : (
            <span
              className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
              style={{ background: "rgba(20, 27, 35, 0.98)", borderLeft: `1px solid ${color}40`, borderTop: `1px solid ${color}40` }}
            />
          )}
        </span>
      )}
    </span>
  );
}
