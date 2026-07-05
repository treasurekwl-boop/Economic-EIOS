import { useState, useCallback } from "react";
import Header from "./components/layout/Header.jsx";
import Nav, { VIEWS } from "./components/layout/Nav.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import DataStatus from "./components/layout/DataStatus.jsx";
import ScenarioBanner from "./components/layout/ScenarioBanner.jsx";
import { ScenarioContext } from "./context/ScenarioContext.jsx";
import { propagate, nodeById } from "./config/graph.js";
import Overview from "./components/views/Overview.jsx";
import Solver from "./components/views/Solver.jsx";
import Sectors from "./components/views/Sectors.jsx";
import Diagnosis from "./components/views/Diagnosis.jsx";
import Citizen from "./components/views/Citizen.jsx";
import Fluency from "./components/views/Fluency.jsx";
import Fundamentals from "./components/views/Fundamentals.jsx";
import News from "./components/views/News.jsx";
import Markets from "./components/views/Markets.jsx";
import Network from "./components/views/Network.jsx";
import Calendar from "./components/views/Calendar.jsx";
import Schools from "./components/views/Schools.jsx";
import Desk from "./components/views/Desk.jsx";
import DataLayer from "./components/views/DataLayer.jsx";

export default function App() {
  const [view, setView] = useState("overview");
  const [graphLink, setGraphLink] = useState({ focus: "rand", dir: null, lens: "nk", token: 0 });
  const [scenario, setScenario] = useState(null);
  const label = VIEWS.find((v) => v.id === view)?.label ?? "Overview";

  // Fire a shock: propagate it through the graph and make it the app-wide scenario.
  const fireScenario = useCallback((origin, dir) => {
    if (dir == null) return;
    const map = propagate(origin, dir);
    const impacts = Object.fromEntries(map);
    const node = nodeById(origin);
    setScenario({ origin, dir, originLabel: node?.label ?? origin, impacts, gdp: impacts.gdp ?? null, ts: Date.now() });
  }, []);
  const clearScenario = useCallback(() => setScenario(null), []);

  // Any view can open the Intelligence graph on a node — and (with a dir) fire it,
  // optionally through a chosen school-of-thought lens.
  const openGraph = useCallback((focus, dir = null, lens = "nk") => {
    setGraphLink((g) => ({ focus, dir, lens, token: g.token + 1 }));
    if (dir != null) fireScenario(focus, dir);
    setView("network");
  }, [fireScenario]);

  // Jump straight into a lens comparison from the Schools reference.
  const openLens = useCallback((lens) => openGraph("G", 1, lens), [openGraph]);

  return (
    <ScenarioContext.Provider value={{ scenario, fireScenario, clearScenario }}>
      <div className="flex h-full">
        <Sidebar active={view} onChange={setView} />

        <div className="flex h-full min-w-0 flex-1 flex-col">
          <div className="lg:hidden">
            <Header />
            <Nav active={view} onChange={setView} />
          </div>

          <DataStatus crumb={label} />
          <ScenarioBanner onView={() => setView("network")} />

          <main className="min-h-0 flex-1 overflow-y-auto">
            {view === "overview" && <Overview onNavigate={setView} />}
            {view === "solver" && <Solver onNavigate={setView} onOpenGraph={openGraph} />}
            {view === "sectors" && <Sectors />}
            {view === "diagnosis" && <Diagnosis />}
            {view === "citizen" && <Citizen />}
            {view === "fluency" && <Fluency />}
            {view === "schools" && <Schools onOpenLens={openLens} />}
            {view === "desk" && <Desk onOpenGraph={openGraph} />}
            {view === "data" && <DataLayer />}
            {view === "fundamentals" && <Fundamentals onOpenGraph={openGraph} />}
            {view === "news" && <News onOpenGraph={openGraph} />}
            {view === "calendar" && <Calendar onOpenGraph={openGraph} />}
            {view === "markets" && <Markets onOpenGraph={openGraph} />}
            {view === "network" && (
              <Network
                initialFocus={graphLink.focus}
                initialShock={graphLink.dir != null ? { dir: graphLink.dir } : undefined}
                initialLens={graphLink.lens}
                linkToken={graphLink.token}
              />
            )}
          </main>
        </div>
      </div>
    </ScenarioContext.Provider>
  );
}
