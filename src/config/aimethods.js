// The AI-forecasting brief's technique catalogue, with an HONEST flag for what's
// actually implemented in this browser-only app vs. what needs a Python+GPU
// backend and a governed data platform. This is the boundary, stated plainly.
export const AI_METHODS = [
  { name: "Unsupervised clustering / regime detection", here: true, note: "k-means on volatility + momentum — the regime panel above." },
  { name: "Anomaly detection", here: true, note: "robust MAD z-scores over daily returns — the anomaly panel above." },
  { name: "GARCH volatility", here: true, note: "the forecast lab's uncertainty band." },
  { name: "Ensembles / forecast combination", here: true, note: "equal-weight combination in the forecast lab." },
  { name: "Technical signals (trend, RSI, vol)", here: true, note: "the watchlist and quant tools." },
  { name: "Supervised trees / gradient boosting", here: false, note: "LightGBM / XGBoost — need a Python backend." },
  { name: "RNN / LSTM / GRU / CNN-TCN", here: false, note: "sequence nets need training infra + GPU." },
  { name: "Transformers / foundation models", here: false, note: "long-context attention needs GPU; TimeGPT/Chronos are external services." },
  { name: "Graph neural networks", here: false, note: "message-passing over relation graphs — backend + graph store." },
  { name: "Full Bayesian ML (BVAR / BSTS / MCMC)", here: false, note: "GARCH is here; full posterior sampling needs a backend." },
  { name: "Reinforcement learning", here: false, note: "needs a validated simulator + offline-RL pipeline." },
  { name: "Representation / self-supervised learning", here: false, note: "embedding pretraining needs GPU + large corpora." },
];

// The brief's governance principles, condensed — the ones that apply even here.
export const AI_GOVERNANCE = [
  "Keep a transparent benchmark set and challenger models.",
  "Time-aware validation (rolling / expanding) — never random splits.",
  "Uncertainty is a first-class output, not an afterthought.",
  "Human-in-command for consequential actions; no autonomous execution.",
  "Monitor for drift; retrain on a schedule, not on a hunch.",
];

export const AI_NOTE =
  "This app implements only the transparent, in-browser slice of the AI-forecasting brief. The deep-learning, GNN, RL and foundation-model methods it catalogues need a Python+GPU backend and a governed data platform — described here, not faked.";
