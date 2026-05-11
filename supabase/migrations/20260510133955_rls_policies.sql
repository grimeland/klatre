-- Felt: row level security
-- Public reads on content tables. Owner-only on user data.
-- Writes on content tables go through service-role (bypasses RLS).

alter table public.crags enable row level security;
alter table public.routes enable row level security;
alter table public.crag_images enable row level security;
alter table public.weather_cache enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_crags enable row level security;

create policy "anyone can read crags"
  on public.crags for select to anon, authenticated using (true);

create policy "anyone can read routes"
  on public.routes for select to anon, authenticated using (true);

create policy "anyone can read crag_images"
  on public.crag_images for select to anon, authenticated using (true);

create policy "anyone can read weather_cache"
  on public.weather_cache for select to anon, authenticated using (true);

create policy "anyone can read profiles"
  on public.profiles for select to anon, authenticated using (true);

create policy "users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "users can read own saved_crags"
  on public.saved_crags for select to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own saved_crags"
  on public.saved_crags for insert to authenticated
  with check (auth.uid() = user_id);

create policy "users can delete own saved_crags"
  on public.saved_crags for delete to authenticated
  using (auth.uid() = user_id);
