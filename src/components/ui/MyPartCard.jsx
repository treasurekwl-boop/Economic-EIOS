import { useRef, useState } from "react";
import { Download, Share2, Copy, Check } from "lucide-react";

// A shareable "My Part" card. The on-screen preview IS an SVG, so downloading a
// PNG is just rasterising the same node — no html2canvas, no external fetch,
// nothing that can taint the canvas. Turns a private pledge into a quiet nudge
// for the next person.
export default function MyPartCard({ provinceName, actions, upliftFull }) {
  const svgRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const names = actions.map((a) => a.name);
  const shareText =
    `My part in South Africa's growth 🇿🇦\n` +
    `${provinceName} · I've pledged: ${names.join(", ")}.\n` +
    `If every South African did the same, potential growth rises +${upliftFull.toFixed(2)}pp.\n` +
    `The repo rate isn't ours to set — but the speed limit partly is. Find your part.`;

  const downloadPng = () => {
    const svg = svgRef.current;
    if (!svg) return;
    setBusy(true);
    try {
      const xml = new XMLSerializer().serializeToString(svg);
      const src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 1080, 1080);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "my-part-growth-engine.png";
        a.click();
        setBusy(false);
      };
      img.onerror = () => setBusy(false);
      img.src = src;
    } catch {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Part — Growth Engine", text: shareText });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  // Two-column action layout for the card
  const col1 = actions.slice(0, 5);
  const col2 = actions.slice(5, 9);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-line">
        <svg ref={svgRef} viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg" className="block w-full">
          <defs>
            <linearGradient id="mpc-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0C0E0D" />
              <stop offset="100%" stopColor="#101311" />
            </linearGradient>
            <radialGradient id="mpc-glow1" cx="20%" cy="0%" r="60%">
              <stop offset="0%" stopColor="#7FB58A" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#7FB58A" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mpc-glow2" cx="95%" cy="10%" r="50%">
              <stop offset="0%" stopColor="#C6A15B" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#C6A15B" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="1080" height="1080" fill="url(#mpc-bg)" />
          <rect width="1080" height="1080" fill="url(#mpc-glow1)" />
          <rect width="1080" height="1080" fill="url(#mpc-glow2)" />
          <rect x="6" y="6" width="1068" height="1068" rx="28" fill="none" stroke="#232823" strokeWidth="2" />

          {/* Brand mark */}
          <g transform="translate(80, 92)">
            <circle cx="0" cy="0" r="24" fill="none" stroke="#232823" strokeWidth="3" />
            <path d="M0 0 L0 -20" stroke="#C6A15B" strokeWidth="4" strokeLinecap="round" />
            <path d="M0 0 L14 9" stroke="#6FBDB4" strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="0" r="4" fill="#ECEAE3" />
          </g>
          <text x="124" y="84" fontFamily="'Space Grotesk', sans-serif" fontSize="30" fontWeight="700" letterSpacing="4" fill="#ECEAE3">GROWTH ENGINE</text>
          <text x="124" y="116" fontFamily="'IBM Plex Mono', monospace" fontSize="18" letterSpacing="3" fill="#8A8F88">THE PEOPLE SIDE · MY PART</text>

          {/* Province chip */}
          <rect x="700" y="64" width="300" height="48" rx="24" fill="#7FB58A" fillOpacity="0.12" stroke="#7FB58A" strokeOpacity="0.4" />
          <text x="850" y="95" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="22" fill="#7FB58A">{provinceName}</text>

          {/* Hero */}
          <text x="540" y="300" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="22" letterSpacing="3" fill="#8A8F88">IF EVERY SOUTH AFRICAN DID THE SAME</text>
          <text x="540" y="450" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontSize="170" fontWeight="700" fill="#7FB58A">+{upliftFull.toFixed(2)}</text>
          <text x="540" y="510" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="26" fill="#ECEAE3">percentage points of potential growth</text>

          <line x1="80" y1="580" x2="1000" y2="580" stroke="#232823" strokeWidth="2" />

          {/* Pledge list */}
          <text x="80" y="640" fontFamily="'IBM Plex Mono', monospace" fontSize="22" letterSpacing="3" fill="#8A8F88">MY PLEDGE — {actions.length} {actions.length === 1 ? "ACTION" : "ACTIONS"}</text>

          {col1.map((a, i) => (
            <g key={a.id ?? i} transform={`translate(90, ${700 + i * 56})`}>
              <circle cx="0" cy="-8" r="9" fill={a.color} />
              <text x="26" y="0" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fill="#ECEAE3">{a.name}</text>
            </g>
          ))}
          {col2.map((a, i) => (
            <g key={a.id ?? i} transform={`translate(580, ${700 + i * 56})`}>
              <circle cx="0" cy="-8" r="9" fill={a.color} />
              <text x="26" y="0" fontFamily="'Space Grotesk', sans-serif" fontSize="28" fill="#ECEAE3">{a.name}</text>
            </g>
          ))}

          {/* Tagline + footer */}
          <text x="540" y="978" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontSize="30" fontWeight="600" fill="#7FB58A">I'm pulling my weight for a 3% South Africa.</text>
          <text x="540" y="1022" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="18" fill="#6B7068">The repo rate isn't ours to set — but the speed limit partly is.</text>
        </svg>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={downloadPng}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold text-base transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #7FB58A, #2fa98a)", boxShadow: "0 0 16px rgba(127,181,138,0.3)" }}
        >
          <Download className="h-3.5 w-3.5" /> {busy ? "Rendering…" : "Download card"}
        </button>
        <button
          onClick={share}
          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[12px] text-muted transition-colors hover:border-mint/50 hover:text-mint"
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[12px] text-muted transition-colors hover:border-muted-2 hover:text-ink"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy text"}
        </button>
      </div>
    </div>
  );
}
