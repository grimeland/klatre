-- Felt: initial schema
-- Crags, routes, images, profiles, saved crags, weather cache.
-- Computed fields (dryness, weather, distance) live outside the DB.

create extension if not exists postgis;

create type climbing_type as enum ('sport', 'trad', 'buldring', 'multipitch', 'is', 'alpin');
create type exposure_dir as enum ('S', 'V', 'Ø', 'N');
create type rock_type as enum ('Gneis', 'Granitt', 'Sandstein', 'Kalkstein', 'Konglomerat');
create type route_type as enum ('sport', 'trad', 'buldring');

create table public.crags (
  slug text primary key,
  name text not null,
  area text not null,
  description text,
  location geography(Point, 4326) not null,
  climbing_types climbing_type[] not null default '{}',
  exposure exposure_dir[] not null default '{}',
  rock_type rock_type,
  route_count int,
  grade_low text,
  grade_high text,
  approach_minutes int,
  parking_note text,
  approach_note text,
  exposure_note text,
  season_note text,
  access_note text,
  local_club text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  crag_slug text not null references public.crags(slug) on delete cascade,
  name text not null,
  grade text not null,
  grade_numeric int not null,
  length_m int,
  stars smallint not null check (stars between 0 and 3),
  type route_type not null,
  ascents int not null default 0,
  is_classic boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (crag_slug, name)
);

create table public.crag_images (
  id uuid primary key default gen_random_uuid(),
  crag_slug text not null references public.crags(slug) on delete cascade,
  storage_path text,
  placeholder_id smallint check (placeholder_id between 1 and 6),
  display_order int not null default 0,
  alt_text text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.saved_crags (
  user_id uuid not null references public.profiles(id) on delete cascade,
  crag_slug text not null references public.crags(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, crag_slug)
);

create table public.weather_cache (
  crag_slug text primary key references public.crags(slug) on delete cascade,
  forecast jsonb,
  history jsonb,
  dryness jsonb,
  fetched_at timestamptz not null default now()
);

create index crags_location_idx on public.crags using gist (location);
create index crags_climbing_types_idx on public.crags using gin (climbing_types);
create index crags_exposure_idx on public.crags using gin (exposure);
create index routes_crag_slug_idx on public.routes (crag_slug);
create index routes_grade_numeric_idx on public.routes (grade_numeric);
create index crag_images_crag_slug_idx on public.crag_images (crag_slug);
create index saved_crags_user_id_idx on public.saved_crags (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger crags_set_updated_at
  before update on public.crags
  for each row execute function public.set_updated_at();
