-- Felt: capture first-ascent metadata and description on routes.
-- These are central to climbing-guide culture and useful for the design.

alter table public.routes
  add column fa_year int,
  add column fa_by text,
  add column description text;
