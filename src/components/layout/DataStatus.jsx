import { RefreshCw, ExternalLink, Loader2, Wifi, WifiOff } from "lucide-react";
import { useEngine } from "../../context/EngineContext.jsx";
import { REPO_AS_OF, SARB_URL, LATEST } from "../../config/model.js";

export default function DataStatus({ crumb }) {
  const { dataStatus, effective, refreshData, country, fx } = useEngine();

  const isLive = dataStatus === "live";
  const isLoading = dataStatus === "loading";

  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line/60 px-5 py-1.5 font-mono text-[11px]"
      style={{ background: 'rgba(12,14,13,0.7)', backdropFilter: 'blur(8px)' }}
    >
      {/* Breadcrumb — desktop topbar per premium design */}
      {crumb && (
        <span className="hidden items-center gap-2 lg:flex">
          <span style={{ color: "#8A8F88" }}>South Africa</span>
          <span style={{ color: "#3E433C" }}>/</span>
          <span className="text-ink">{crumb}</span>
        </span>
      )}

      {/* Status indicator */}
      <span className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin text-signal" />
        ) : isLive ? (
          <span className="dot-live" />
        ) : (
          <WifiOff className="h-3 w-3 text-muted-2" />
        )}
        <span className={
          isLive ? "text-ok" :
          isLoading ? "text-signal" :
          "text-muted-2"
        }>
          {isLive ? "Live data" : isLoading ? "Fetching…" : "Offline — built-in baseline"}
        </span>
      </span>

      {isLive && effective.asOf && (
        <span className="text-muted-2">
          World Bank · <span className="text-muted">{country.name}</span> · data to {effective.asOf}
        </span>
      )}

      {!isLive && !isLoading && (
        <span className="text-muted-2">World Bank unreachable — figures are the June 2026 baseline</span>
      )}

      {fx && (
        <span className="flex items-center gap-1">
          <span className="text-data font-semibold">R{fx.usdZar.toFixed(2)}/$</span>
          <span className="text-muted-2">live</span>
        </span>
      )}

      <span className="hidden sm:inline text-muted-2">
        SARB repo <span className="text-muted">{LATEST.repo.value.toFixed(2)}%</span>
        {" · "}CPI <span className="text-muted">{LATEST.cpi.value.toFixed(1)}%</span>
        {" "}({REPO_AS_OF})
        {" · "}GDP <span className="text-muted">+{LATEST.gdp.yoy.toFixed(1)}% y/y</span>
        {" · "}unemp <span className="text-muted">{LATEST.unemployment.value.toFixed(1)}%</span>
        {" "}({LATEST.gdp.asOf})
        {" · "}
        <a
          href={SARB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-0.5 text-data/80 transition-colors hover:text-data"
        >
          SARB <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </span>

      <button
        onClick={refreshData}
        disabled={isLoading}
        className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-muted-2 transition-all hover:border-data/40 hover:text-data disabled:opacity-30"
      >
        <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
        <span>Refresh</span>
      </button>
    </div>
  );
}
