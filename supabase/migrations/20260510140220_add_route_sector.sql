-- Felt: add sector grouping to routes (e.g. "Øvre Sydstup", "Østveggen" på Kolsås).
-- Optional — most crags don't have named sectors.

alter table public.routes add column sector text;

-- Drop the old (crag_slug, name) unique constraint and replace with one that
-- includes sector, since the same route name can exist in different sectors.
alter table public.routes drop constraint routes_crag_slug_name_key;
alter table public.routes
  add constraint routes_crag_slug_sector_name_key
  unique (crag_slug, sector, name);

create index routes_sector_idx on public.routes (crag_slug, sector);
