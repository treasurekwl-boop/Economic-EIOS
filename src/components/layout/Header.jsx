import { ChevronDown, Activity } from "lucide-react";
import { useEngine } from "../../context/EngineContext.jsx";

function EngineMark() {
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-signal/10 blur-md" />
      <svg viewBox="0 0 32 32" className="relative h-8 w-8" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(198,161,91,0.15)" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="11" fill="none" stroke="#232823" strokeWidth="1.5" />
        <path d="M16 16 L16 5.5" stroke="#C6A15B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 16 L23.5 20.5" stroke="#6FBDB4" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2.5" fill="#1A1F1C" stroke="#ECEAE3" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="1" fill="#C6A15B" />
      </svg>
    </div>
  );
}

export default function Header() {
  const { country, countries, setCountryCode, setpoint } = useEngine();

  return (
    <header
      className="relative flex items-center justify-between gap-4 border-b border-line px-5 py-3"
      style={{
        background: 'linear-gradient(180deg, rgba(18,24,32,0.98) 0%, rgba(12,14,13,0.95) 100%)',
        boxShadow: '0 1px 0 rgba(198,161,91,0.06), 0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* Subtle amber glow top-left */}
      <div className="pointer-events-none absolute left-0 top-0 h-px w-40 bg-gradient-to-r from-signal/40 via-signal/10 to-transparent" />

      <div className="flex items-center gap-3">
        <EngineMark />
        <div className="leading-none">
          <div className="font-display text-[18px] font-medium tracking-[-0.01em] text-ink">
            Growth Engine
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <Activity className="h-2.5 w-2.5 text-data" />
            <span>Target ≥ {setpoint.toFixed(1)}% · self-calibrating</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Setpoint badge */}
        <div className="hidden items-center gap-2 sm:flex">
          <div
            className="rounded-full px-3 py-1 font-mono text-sm font-bold"
            style={{
              background: 'rgba(198,161,91,0.1)',
              border: '1px solid rgba(198,161,91,0.25)',
              color: '#C6A15B',
              boxShadow: '0 0 12px rgba(198,161,91,0.15)',
            }}
          >
            ≥{setpoint.toFixed(1)}% target
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-line sm:block" />

        {/* Country selector */}
        <label className="relative flex items-center">
          <span className="sr-only">Economy</span>
          <select
            value={country.code}
            onChange={(e) => setCountryCode(e.target.value)}
            className="appearance-none rounded-lg border border-line bg-surface/80 py-1.5 pl-3 pr-8 font-mono text-[12px] text-ink transition-colors hover:border-muted-2 focus:border-signal"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted" />
        </label>
      </div>
    </header>
  );
}
