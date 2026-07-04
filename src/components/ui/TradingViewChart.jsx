import { useEffect, useRef } from "react";

// Embeds TradingView's free Advanced Chart widget. This is a DISPLAY iframe —
// it shows real TradingView data (real-time where your account/exchange allows,
// delayed otherwise), but the app cannot read its values back out. Loads their
// script from s3.tradingview.com; nothing is sent to them beyond the symbol.
export default function TradingViewChart({ symbol, height = 380 }) {
  const ref = useRef(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      interval: "D",
      timezone: "Africa/Johannesburg",
      theme: "dark",
      style: "1",
      locale: "en",
      autosize: true,
      allow_symbol_change: true,
      hide_side_toolbar: false,
      backgroundColor: "rgba(16,19,17,1)",
      gridColor: "rgba(35,40,35,0.4)",
      support_host: "https://www.tradingview.com",
    });
    container.appendChild(script);
    return () => { container.innerHTML = ""; };
  }, [symbol]);

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#232823", height }}>
      <div className="tradingview-widget-container" ref={ref} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
