// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL MARKETS, EXPLAINED — the asset-class markets a South African actually
// touches (the rand, the JSE, government bonds, the money market, commodities,
// crypto), in plain language. No live microstructure feeds and no fake metrics:
// the point is to teach WHAT each market is, HOW its price forms, WHO trades it,
// and — the part that matters here — HOW it loops back to the economy you live in.
// Each market that maps onto the causal brain carries a `node` so you can trace it.
// ─────────────────────────────────────────────────────────────────────────────

export const FIN_MARKETS = [
  {
    id: "fx", name: "The rand (FX)", icon: "Banknote", color: "#6FBDB4", node: "rand",
    tagline: "The price of one currency in another — SA's daily mood ring.",
    whatItIs: "The market where rand is swapped for dollars, euros and other currencies. There's no single building: it's a 24-hour global network of banks trading over the counter.",
    howPriced: "Supply and demand for rand set the rate second by second — exporters and foreigners buying SA assets create demand; importers and capital leaving create supply. Interest-rate gaps and global risk appetite swing it hardest.",
    whoTrades: "Global banks, the SARB, exporters and importers, foreign funds buying SA bonds and shares, and speculators. The rand is one of the most-traded emerging-market currencies.",
    scale: "Foreign exchange is the largest financial market on earth — trillions of dollars a day globally. The rand is a small but very liquid slice, which is why it moves so violently on world news.",
    loop: "The rand sits upstream of your grocery bill. A weaker rand makes imported oil, wheat and electronics dearer → inflation rises → the SARB hikes the repo rate → your bond and car repayments go up. It's the fastest channel between the world and your wallet.",
  },
  {
    id: "jse", name: "JSE (shares)", icon: "TrendingUp", color: "#7FB58A", node: "finance",
    tagline: "Ownership of listed companies, priced live by the crowd.",
    whatItIs: "The Johannesburg Stock Exchange — where shares in listed companies (Naspers, the banks, the miners, Shoprite) are bought and sold. A share is a slice of ownership.",
    howPriced: "Prices form continuously in an electronic order book that matches buyers and sellers, with opening and closing auctions setting the official daily price. A share price is the market's live vote on a company's future profits.",
    whoTrades: "Pension and retirement funds — which hold most South Africans' long-term savings — plus asset managers, foreign investors, and retail investors through apps. Over a third of the JSE is foreign-owned.",
    scale: "The JSE is the largest exchange in Africa. Because so much is foreign-held, global risk-off days pull money out fast — shares and the rand often fall together.",
    loop: "If you have a pension, retirement annuity or provident fund, you already own a slice of the JSE. When listed firms raise money here to build and expand, that becomes real investment and jobs in the economy.",
  },
  {
    id: "bonds", name: "Govt bonds", icon: "Landmark", color: "#E08B70", node: "debt",
    tagline: "How the state borrows — and what the world charges it.",
    whatItIs: "The market where government borrows by selling bonds (IOUs): the buyer lends now and gets fixed interest plus their money back later.",
    howPriced: "The 'price' is the yield — the interest rate government must pay. It rises when lenders see more risk (rising debt, downgrades, political noise) and falls when they're reassured. Dealers and auctions set it, not an exchange floor.",
    whoTrades: "Local banks, pension funds and insurers, the SARB, and foreign investors — who hold a large share of SA government bonds, making the yield sensitive to global sentiment.",
    scale: "This is how the state funds the gap between what it spends and what it taxes. The bigger and riskier the debt path, the higher the yield it must pay.",
    loop: "A higher yield means a bigger debt-service bill — the fastest-growing line in the budget, already crowding out schools, clinics and roads. Every extra bit of risk premium is money that never reaches a service.",
  },
  {
    id: "money", name: "Money market", icon: "Percent", color: "#A99BF5", node: "repo",
    tagline: "The price of money — and the SARB's main lever.",
    whatItIs: "The market for very short-term borrowing and lending — overnight to a year — between banks, and the home of the SARB's repo rate.",
    howPriced: "The SARB sets the repo rate to hit its inflation target; commercial 'prime' follows at repo + 3.5. Everything else — call accounts, money-market funds, short-term paper — prices off that anchor.",
    whoTrades: "Banks, money-market funds, big corporates parking cash, and the SARB. It's the plumbing that keeps the financial system funded day to day.",
    scale: "The fulcrum of the whole system: the price of money here flows into bond yields, loan rates, and how much leverage is safe to carry.",
    loop: "When the SARB moves the repo rate it ripples out within weeks — to your bond, car finance, credit card, and the interest your savings earn. The single most powerful price in the economy, and it's set by policy, not left to the market.",
  },
  {
    id: "commodities", name: "Commodities", icon: "Gem", color: "#D8AF6A", node: "mining",
    tagline: "Raw materials, priced by the world — SA's export lifeblood.",
    whatItIs: "The markets for raw materials — gold, platinum-group metals, coal, iron ore — priced globally, plus oil, which SA imports entirely.",
    howPriced: "Global futures markets lead price discovery, anchored to physical supply, inventories and demand. SA is a price-taker: gold and platinum are priced by world fear and technology trends, not in Johannesburg.",
    whoTrades: "Producers (SA's miners), global consumers, refiners, traders, and financial funds. Prices swing on geopolitics, central-bank gold buying, and the EV-vs-hydrogen race for platinum.",
    scale: "Mining is SA's core export earner. When commodity prices rise, export earnings and the current account improve — and the rand tends to firm.",
    loop: "A commodity rally is SA's counter-cyclical cushion: it lifts export earnings, firms the rand (cheaper imports, lower inflation) and funds the current account. A crash does the reverse — and shuts marginal shafts, costing mining-town jobs.",
  },
  {
    id: "crypto", name: "Crypto & stablecoins", icon: "Bitcoin", color: "#C6A15B", node: null,
    tagline: "Digital assets — mostly outside the formal economy.",
    whatItIs: "Digital assets — Bitcoin, Ethereum, and dollar-pegged 'stablecoins' — traded on exchanges and apps, increasingly used by South Africans for savings and cross-border payments.",
    howPriced: "Prices form across many fragmented exchanges at once, 24/7, with no single official rate. Benchmark providers aggregate the biggest venues into a reference price — the quality of exchange and benchmark is part of the risk.",
    whoTrades: "Retail investors, exchanges, market makers, hedge funds, and stablecoin issuers who hold reserves (often US Treasuries and cash) to back their coins.",
    scale: "Still small next to the JSE or bond market, and largely outside the formal economy — but growing, and linked to global money markets through stablecoin reserves.",
    loop: "Crypto sits mostly outside the causal graph of the real economy — it's a risk-sentiment asset, not a driver of jobs or inflation. Treat it as exposure to global risk appetite, not a hedge against local problems. (Educational, not financial advice.)",
  },
];

export const FIN_MARKETS_NOTE =
  "Plain-language explainers, not live trading data. Prices for these markets aren't in the app's free data feed, so this layer teaches how each market works and how it connects to the economy — it doesn't quote spreads, depth or live levels.";
