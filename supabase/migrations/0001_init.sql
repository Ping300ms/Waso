-- Waso schema: profiles (extends auth.users) + sightings (one row per user per caught bird).
-- Badges are NOT stored server-side: they're pure derivations of (static bird catalog + sightings),
-- computed identically client-side on any device (see src/domain/badges.ts).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.sightings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  bird_id text not null,
  first_seen_date date not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, bird_id)
);

create index if not exists sightings_user_id_idx on public.sightings(user_id);

alter table public.profiles enable row level security;
alter table public.sightings enable row level security;

-- Everyone authenticated can read all profiles (leaderboard, player browsing).
-- Only the owner can update their own row (pseudo change).
create policy "profiles_select_all_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Everyone authenticated can read all sightings (leaderboard aggregation, public Wasodex viewing).
-- Only the owner can write their own sightings.
create policy "sightings_select_all_authenticated" on public.sightings
  for select using (auth.role() = 'authenticated');

create policy "sightings_insert_own" on public.sightings
  for insert with check (auth.uid() = user_id);

create policy "sightings_update_own" on public.sightings
  for update using (auth.uid() = user_id);

create policy "sightings_delete_own" on public.sightings
  for delete using (auth.uid() = user_id);

-- Auto-create a profiles row whenever the admin creates a new user in Supabase Auth,
-- so there's no extra manual step besides creating the auth user itself. Pseudo defaults
-- to the email's local part and can be changed later from the Profil screen.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, pseudo)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
