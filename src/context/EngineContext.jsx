import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY } from "../config/countries.js";
import {
  SETPOINT, GDP_LEVEL, PARAMS, INVESTMENT,
  LEVER_DEFAULTS, ASSUMPTION_DEFAULTS, SECTORS, CONSTRAINTS,
} from "../config/model.js";
import { fetchCountryData, normalise, fetchFX } from "../lib/dataService.js";

const EngineContext = createContext(null);

export function EngineProvider({ children }) {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);

  // Solver state
  const [levers, setLevers] = useState({ ...LEVER_DEFAULTS });
  const [assumptions, setAssumptions] = useState({ ...ASSUMPTION_DEFAULTS });
  const [locked, setLocked] = useState(Object.fromEntries(Object.keys(LEVER_DEFAULTS).map((k) => [k, false])));

  // Sector state
  const [sectorGrowth, setSectorGrowth] = useState(Object.fromEntries(SECTORS.map((s) => [s.id, s.g])));

  // Diagnosis state
  const [reforms, setReforms] = useState(Object.fromEntries(CONSTRAINTS.map((c) => [c.id, false])));

  // Live data state
  const [live, setLive] = useState(null);                 // normalised World Bank data, or null
  const [dataStatus, setDataStatus] = useState("loading"); // 'loading' | 'live' | 'offline'
  const [fx, setFx] = useState(null);                     // live exchange rate, or null
  const cache = useRef({});                                // per-country session cache
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    delete cache.current[countryCode];
    setRefreshKey((k) => k + 1);
  };

  // Exchange rate — global, refetched on load and on refresh
  useEffect(() => {
    let cancelled = false;
    fetchFX().then((r) => {
      if (cancelled) return;
      setFx(r.status === "live" ? r : null);
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;
    const code = countryCode;

    if (cache.current[code]) {
      setLive(cache.current[code]);
      setDataStatus("live");
      return;
    }

    setDataStatus("loading");
    setLive(null);
    fetchCountryData(code).then((result) => {
      if (cancelled) return;
      const norm = normalise(result);
      if (norm) {
        cache.current[code] = norm;
        setLive(norm);
        setDataStatus("live");
      } else {
        setLive(null);
        setDataStatus("offline");
      }
    });

    return () => { cancelled = true; };
  }, [countryCode, refreshKey]);

  const reformUplift = useMemo(
    () => CONSTRAINTS.reduce((a, c) => a + (reforms[c.id] ? c.lift : 0), 0),
    [reforms]
  );

  // Effective values: live where available, baseline otherwise.
  const effective = useMemo(() => {
    const shares = { ...PARAMS.shares, ...(live?.shares ?? {}) };
    return {
      shares,
      gdpLevel: live?.gdpLevelBn ?? GDP_LEVEL,
      investmentNow: live?.actuals?.investment ?? INVESTMENT.now,
      actuals: live?.actuals ?? null,
      years: live?.years ?? null,
      asOf: live?.asOf ?? null,
    };
  }, [live]);

  const value = useMemo(() => {
    const country = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];
    return {
      setpoint: SETPOINT,
      country, countries: COUNTRIES, setCountryCode,
      levers, setLevers, assumptions, setAssumptions, locked, setLocked,
      sectorGrowth, setSectorGrowth,
      reforms, setReforms, reformUplift,
      dataStatus, effective, refreshData, fx,
    };
  }, [countryCode, levers, assumptions, locked, sectorGrowth, reforms, reformUplift, dataStatus, effective, fx]);

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>;
}

export function useEngine() {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used within an EngineProvider");
  return ctx;
}
