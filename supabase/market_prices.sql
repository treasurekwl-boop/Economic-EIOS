-- Live market prices (FX + commodities). Run once in the Supabase SQL Editor.
-- The GitHub Action (live-data.yml) writes here every 30 min; the app reads it.
create table if not exists public.market_prices (
  id         text primary key,   -- 'usdzar','eurzar','gbpzar','gold','brent','platinum'
  label      text,
  value      numeric,
  unit       text,               -- 'R', '$/oz', '$/bbl'
  change_pct numeric,            -- daily % change (null if source has none)
  updated_at timestamptz default now()
);

alter table public.market_prices enable row level security;
drop policy if exists "public read market_prices" on public.market_prices;
create policy "public read market_prices" on public.market_prices for select using (true);
-- Writes require the service_role key (used by the GitHub Action), never anon.
