/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Instrument-panel palette — deep slate base, amber signal, teal data
        base: '#0C0E0D',        // panel background
        surface: '#131614',     // raised card surface
        'surface-2': '#1A1F1C', // higher surface / hover
        line: '#232823',        // hairline borders
        ink: '#ECEAE3',         // primary readout text
        muted: '#8A8F88',       // secondary text
        'muted-2': '#6B7068',   // tertiary / offline labels
        signal: '#C6A15B',      // amber — running / active / setpoint
        'signal-dim': '#2E241A',
        data: '#6FBDB4',        // teal — live readings / charts
        'data-dim': '#1C4D4A',
        alert: '#D8735E',       // below target
        ok: '#7FB58A',          // above target / healthy
        // Vibrant categorical accents — color carries meaning (sectors, constraints, domains)
        violet: '#A99BF5',
        purple: '#C77DFF',
        blue: '#5B8DEF',
        sky: '#4FB8F0',
        green: '#7FB58A',
        mint: '#7FB58A',
        gold: '#D8AF6A',
        coral: '#E08B70',
        pink: '#D98BB6',
        rose: '#D9799B',
      },
      fontFamily: {
        display: ['"Newsreader"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        readout: '0.02em',
      },
      keyframes: {
        'panel-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        'panel-in': 'panel-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'status-pulse': 'pulse 2s ease-in-out infinite',
        sweep: 'sweep 2.8s ease-in-out infinite',
        'fade-up': 'panel-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-amber': '0 0 16px rgba(198,161,91,0.25)',
        'glow-teal': '0 0 16px rgba(111,189,180,0.25)',
        'glow-ok': '0 0 16px rgba(127,181,138,0.25)',
        'glow-alert': '0 0 16px rgba(216,115,94,0.25)',
        'glow-sm-amber': '0 0 8px rgba(198,161,91,0.35)',
        'glow-sm-teal': '0 0 8px rgba(111,189,180,0.35)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-surface': 'linear-gradient(135deg, #131614 0%, #161A16 100%)',
        'gradient-amber': 'linear-gradient(135deg, rgba(198,161,91,0.15), rgba(198,161,91,0.05))',
        'gradient-teal': 'linear-gradient(135deg, rgba(111,189,180,0.15), rgba(111,189,180,0.05))',
      },
    },
  },
  plugins: [],
}
