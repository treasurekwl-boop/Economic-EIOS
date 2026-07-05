-- Macro driver series for the forecasting models (rate differential, risk regime,
-- fair-value inputs). Run once in the Supabase SQL Editor. The GitHub Action
-- (fetch-macro.mjs) writes the auto-fetchable rows every 30 min; the SA-specific
-- rows (repo rate, CPI) are manual inputs the user updates on release/MPC dates —
-- they are seeded null here and set later (no free live source, so we DON'T fake them).
create table if not exists public.macro_series (
  id         text primary key,   -- 'us10y','us2y','us3m','fedfunds','vix','usd_twi','brent','sa10y','sa_repo','sa_cpi_yoy'
  label      text,
  category   text,               -- 'us_rates' | 'risk' | 'commodity' | 'sa_macro'
  value      numeric,            -- latest observation
  prev       numeric,            -- previous observation (for delta / direction)
  unit       text,               -- '%', 'index', '$/bbl'
  as_of      date,               -- date of the latest observation (HONESTY about lag)
  series     jsonb,              -- [[date, value], ...] recent history for charts/regime
  source     text,               -- provenance, e.g. 'FRED:DGS10' or 'manual'
  updated_at timestamptz default now()
);

alter table public.macro_series enable row level security;
drop policy if exists "public read macro_series" on public.macro_series;
create policy "public read macro_series" on public.macro_series for select using (true);
-- Writes require the service_role key (GitHub Action) — never the anon key.

-- Seed the two manual SA inputs so the app can show "awaiting your input" rather
-- than inventing a number. Update these on the Stats SA CPI release / SARB MPC dates.
insert into public.macro_series (id, label, category, unit, source) values
  ('sa_repo',    'SARB repo rate',   'sa_macro', '%', 'manual'),
  ('sa_cpi_yoy', 'SA CPI (YoY)',     'sa_macro', '%', 'manual')
on conflict (id) do nothing;
