-- The forecast ledger — every prediction the app makes, and how it resolved.
-- Run once in the Supabase SQL Editor. This is the spine of the self-grading engine:
-- forecasts are WRITTEN server-side (cron/models with the service key) and LOCKED —
-- the claim + resolution rule never change, only the resolution fields get filled in
-- once the outcome is known. That immutability is what makes the scorecard un-fakeable.
create table if not exists public.forecasts (
  id                uuid primary key default gen_random_uuid(),
  kind              text not null,        -- 'repo_rate' | 'rand_range' | 'direction' | 'macro'
  target            text,                 -- what's forecast, e.g. 'usdzar', 'sa_repo'
  statement         text not null,        -- human-readable claim (locked at creation)

  -- probabilistic call (Brier-scored):
  prob              numeric,              -- probability assigned to predicted_outcome (0..1)
  dist              jsonb,                -- optional full distribution {hold:0.7, cut25:0.25, ...}
  predicted_outcome text,

  -- interval call (coverage-scored):
  lo                numeric,
  hi                numeric,
  conf              numeric,              -- nominal confidence of the band, e.g. 0.68

  -- reference level at forecast time (e.g. repo rate when a repo_rate call is logged,
  -- so the actual MPC move = new repo − ref_value can be scored later):
  ref_value         numeric,

  -- lifecycle (locked once set):
  made_at           timestamptz not null default now(),
  resolves_at       timestamptz not null, -- when it becomes scorable
  resolution_rule   text not null,        -- exactly how it resolves (e.g. 'usdzar close on/after resolves_at')

  -- resolution (filled in later, once — never re-opened):
  status            text not null default 'open',  -- 'open' | 'resolved' | 'void'
  actual_outcome    text,
  actual_value      numeric,
  correct           boolean,
  brier             numeric,
  resolved_at       timestamptz,
  updated_at        timestamptz default now()
);

-- Safe to re-run: add ref_value if this table predates that column.
alter table public.forecasts add column if not exists ref_value numeric;

create index if not exists forecasts_status_idx on public.forecasts (status, resolves_at);
create index if not exists forecasts_kind_idx   on public.forecasts (kind, made_at desc);

alter table public.forecasts enable row level security;
drop policy if exists "public read forecasts" on public.forecasts;
create policy "public read forecasts" on public.forecasts for select using (true);
-- Writes require the service_role key (cron/models) — never the anon key. The app
-- only ever READS this table; it cannot create or edit a forecast, by design.
