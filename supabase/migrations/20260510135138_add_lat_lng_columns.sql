-- Felt: expose lat/lng as plain columns for easy reads.
-- Geography column stays as the spatial-index source for future "near me" queries.

alter table public.crags
  add column lat double precision generated always as (st_y(location::geometry)) stored,
  add column lng double precision generated always as (st_x(location::geometry)) stored;
