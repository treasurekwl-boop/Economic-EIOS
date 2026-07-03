export default function Gauge({ value, setpoint, min = 0, max = 6, reached, labelLeft, labelRight }) {
  const pos = (v) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const fillPct = pos(value);
  const targetPct = pos(setpoint);

  return (
    <div>
      {/* Track */}
      <div
        className="relative h-[10px] overflow-hidden rounded-full"
        style={{
          background: '#0B0D0C',
          border: '1px solid #232823',
        }}
      >
        {/* Fill — design: solid gold gradient bar, sage when target reached */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${fillPct}%`,
            background: reached
              ? 'linear-gradient(90deg, #5F9A6F, #7FB58A)'
              : 'linear-gradient(90deg, #B0864A, #D8AF6A)',
            boxShadow: reached
              ? '0 0 16px rgba(127,181,138,0.35)'
              : '0 0 16px rgba(198,161,91,0.35)',
          }}
        />

        {/* Shimmer overlay on fill */}
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
          style={{
            width: `${fillPct}%`,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
        />

        {/* Setpoint marker */}
        <div
          className="absolute inset-y-0 w-0.5 -translate-x-1/2"
          style={{
            left: `${targetPct}%`,
            background: '#6FBDB4',
            boxShadow: '0 0 10px rgba(111,189,180,0.9), 0 0 3px rgba(111,189,180,1)',
            zIndex: 10,
          }}
        />
      </div>

      {/* Labels */}
      <div className="relative mt-2 h-4 font-mono text-[10px] text-muted-2">
        <span className="absolute left-0">{labelLeft ?? `${min}%`}</span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${targetPct}%`, color: '#6FBDB4' }}
        >
          setpoint {setpoint.toFixed(1)}%
        </span>
        <span className="absolute right-0">{labelRight ?? `${max}%`}</span>
      </div>
    </div>
  );
}
