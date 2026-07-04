-- Watchlist price history for the Trading Desk. Run once in the Supabase SQL Editor.
-- The GitHub Action (fetch-instruments.mjs) writes one row per instrument every
-- 30 min with ~6 months of daily closes; the Desk view reads it for charts + TA.
create table if not exists public.instrument_series (
  id         text primary key,   -- 'usdzar','gold','npn', … (matches src/config/desk.js)
  label      text,
  type       text,               -- 'fx' | 'commodity' | 'equity'
  series     jsonb,              -- [[ "2026-01-02", 18.31 ], …] oldest → newest
  last       numeric,            -- latest close
  prev       numeric,            -- prior close (for the daily % change)
  updated_at timestamptz default now()
);

alter table public.instrument_series enable row level security;
drop policy if exists "public read instrument_series" on public.instrument_series;
create policy "public read instrument_series" on public.instrument_series for select using (true);
-- Writes require the service_role key (used by the GitHub Action), never anon.
