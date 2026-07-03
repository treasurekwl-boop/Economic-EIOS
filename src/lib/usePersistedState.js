import { useState, useEffect } from "react";

// Tiny localStorage-backed state. Lets a citizen's pledge survive a refresh —
// the difference between a toy and something that remembers you showed up.
export function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored != null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode / quota — fail quietly */
    }
  }, [key, value]);

  return [value, setValue];
}
