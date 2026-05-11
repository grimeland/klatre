-- Felt: personal logbook + social follow graph.
-- Adds ticks (sends/attempts), projects, follows.
-- Extends profiles with username for friendly URLs.
-- Auto-creates a profile row when a user signs up.

create type send_style as enum (
  'onsight',
  'flash',
  'redpoint',
  'top_rope',
  'tried'
);

alter table public.profiles
  add column username text unique,
  add column bio text;

create index profiles_username_lower_idx
  on public.profiles (lower(username));

create table public.route_ticks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete cascade,
  climbed_on date not null,
  send_style send_style not null,
  attempts smallint check (attempts is null or attempts > 0),
  comment text,
  created_at timestamptz not null default now()
);

create index route_ticks_user_id_idx on public.route_ticks (user_id, climbed_on desc);
create index route_ticks_route_id_idx on public.route_ticks (route_id);

create table public.route_projects (
  user_id uuid not null references public.profiles(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete cascade,
  started_at timestamptz not null default now(),
  note text,
  primary key (user_id, route_id)
);

create index route_projects_user_id_idx on public.route_projects (user_id, started_at desc);

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create index follows_followed_id_idx on public.follows (followed_id);

-- Auto-create a profile row whenever a user signs up.
-- Display name defaults to the email's local-part; username starts null
-- so the user picks it themselves on first login.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), 'Klatrer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS for the new tables.
alter table public.route_ticks enable row level security;
alter table public.route_projects enable row level security;
alter table public.follows enable row level security;

-- Ticks: readable by anyone signed in (so friends can see each other's logs).
create policy "authenticated can read route_ticks"
  on public.route_ticks for select to authenticated using (true);

create policy "users insert own route_ticks"
  on public.route_ticks for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users update own route_ticks"
  on public.route_ticks for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users delete own route_ticks"
  on public.route_ticks for delete to authenticated
  using (auth.uid() = user_id);

-- Projects: private to owner for now (we can open up later if friends want
-- to peek at each other's projects).
create policy "users read own route_projects"
  on public.route_projects for select to authenticated
  using (auth.uid() = user_id);

create policy "users insert own route_projects"
  on public.route_projects for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users update own route_projects"
  on public.route_projects for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users delete own route_projects"
  on public.route_projects for delete to authenticated
  using (auth.uid() = user_id);

-- Follows: who-follows-whom is public to signed-in users.
create policy "authenticated can read follows"
  on public.follows for select to authenticated using (true);

create policy "users insert own follow"
  on public.follows for insert to authenticated
  with check (auth.uid() = follower_id);

create policy "users delete own follow"
  on public.follows for delete to authenticated
  using (auth.uid() = follower_id);
