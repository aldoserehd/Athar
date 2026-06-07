-- Athar · Mosque Wiki schema (Phase 3 backend)
-- Run in the Supabase SQL editor. Designed for the App Store UGC rules
-- (Guideline 1.2): only *approved* rows are publicly readable, submissions land
-- as *pending* for moderation, and anyone can flag a listing for review.

create extension if not exists "pgcrypto";

create table if not exists mosques (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  area             text not null,
  latitude         double precision not null,
  longitude        double precision not null,
  verified         boolean not null default false,
  jumuah_language  text,
  -- { fajr, dhuhr, asr, maghrib, isha, jumuah } as "HH:MM" strings
  jamaah           jsonb not null default '{}'::jsonb,
  -- subset of: sisters, wudu, wheelchair, parking, quran, funeral
  facilities       text[] not null default '{}',
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  reported_count   integer not null default 0,
  submitted_by     uuid references auth.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists mosques_status_idx on mosques (status);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table mosques enable row level security;

-- Anyone (even anonymous) may read APPROVED listings only.
drop policy if exists "read approved" on mosques;
create policy "read approved" on mosques
  for select using (status = 'approved');

-- Signed-in users may submit, but only as a pending row they own.
drop policy if exists "insert pending" on mosques;
create policy "insert pending" on mosques
  for insert to authenticated
  with check (status = 'pending' and submitted_by = auth.uid());

-- (Approval / edits / deletes happen via the service role in the admin tool.)

-- ---------------------------------------------------------------------------
-- Reporting: a SECURITY DEFINER RPC so anyone can flag without write access.
-- Auto-hides a listing for re-review once it crosses a threshold.
-- ---------------------------------------------------------------------------
create or replace function report_mosque(mosque_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update mosques
     set reported_count = reported_count + 1,
         status = case when reported_count + 1 >= 3 then 'pending' else status end,
         updated_at = now()
   where id = mosque_id;
end;
$$;

grant execute on function report_mosque(uuid) to anon, authenticated;

-- keep updated_at fresh on any change
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists mosques_touch on mosques;
create trigger mosques_touch before update on mosques
  for each row execute function touch_updated_at();
