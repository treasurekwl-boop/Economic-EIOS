-- Live headlines wire — run once in the Supabase SQL Editor.
-- The GitHub Action (headlines.yml) writes here every 30 min; the app reads it.
create table if not exists public.headlines (
  id           text primary key,     -- the article link (dedup key)
  title        text not null,
  link         text,
  source       text,
  published_at timestamptz,
  fetched_at   timestamptz default now()
);

alter table public.headlines enable row level security;
drop policy if exists "public read headlines" on public.headlines;
create policy "public read headlines" on public.headlines for select using (true);
-- Writes require the service_role key (used by the GitHub Action), never anon.
