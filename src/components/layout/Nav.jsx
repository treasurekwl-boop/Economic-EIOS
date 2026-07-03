import { LayoutDashboard, Share2, Microscope, Newspaper, CalendarClock, SlidersHorizontal, Layers, Scale, Stethoscope, Users, BookOpen } from "lucide-react";

export const VIEWS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "network", label: "Intelligence", icon: Share2 },
  { id: "fundamentals", label: "Fundamentals", icon: Microscope },
  { id: "news", label: "News", icon: Newspaper },
  { id: "calendar", label: "Calendar", icon: CalendarClock },
  { id: "solver", label: "Solver", icon: SlidersHorizontal },
  { id: "sectors", label: "Sectors", icon: Layers },
  { id: "markets", label: "Markets", icon: Scale },
  { id: "diagnosis", label: "Diagnosis", icon: Stethoscope },
  { id: "citizen", label: "Your Part", icon: Users },
  { id: "fluency", label: "Fluency", icon: BookOpen },
];

export default function Nav({ active, onChange }) {
  return (
    <nav
      className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 sm:px-5"
      style={{ background: 'linear-gradient(180deg, rgba(12,14,13,0.95) 0%, rgba(19,22,20,0.6) 100%)' }}
    >
      {VIEWS.map((v) => {
        const Icon = v.icon;
        const on = active === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
              on ? "text-ink" : "text-muted hover:text-ink/80"
            }`}
            aria-current={on ? "page" : undefined}
          >
            {/* Active background pill */}
            {on && (
              <span
                className="absolute inset-x-0 inset-y-1.5 rounded-lg"
                style={{
                  background: 'rgba(198,161,91,0.08)',
                  border: '1px solid rgba(198,161,91,0.12)',
                }}
              />
            )}
            {/* Active bottom line */}
            {on && (
              <span
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(198,161,91,0.8), rgba(198,161,91,0.4))',
                  boxShadow: '0 0 8px rgba(198,161,91,0.5)',
                }}
              />
            )}
            <Icon
              className={`relative h-3.5 w-3.5 transition-colors ${
                on ? "text-signal" : "text-muted-2"
              }`}
            />
            <span className="relative">{v.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
