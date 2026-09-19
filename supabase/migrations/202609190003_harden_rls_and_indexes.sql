revoke execute on function public.handle_new_user() from public, anon, authenticated;

create index if not exists tool_events_user_id_idx on public.tool_events(user_id);
create index if not exists uploads_user_id_idx on public.uploads(user_id);

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select using ((select auth.uid()) = id);

drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update using ((select auth.uid()) = id);

drop policy if exists "favorites own all" on public.favorites;
create policy "favorites own all" on public.favorites for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "events insert own or anon" on public.tool_events;
create policy "events insert own or anon" on public.tool_events for insert with check (user_id is null or (select auth.uid()) = user_id);

drop policy if exists "events own read" on public.tool_events;
create policy "events own read" on public.tool_events for select using ((select auth.uid()) = user_id);

drop policy if exists "uploads own all" on public.uploads;
create policy "uploads own all" on public.uploads for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "ai usage own read" on public.ai_usage;
create policy "ai usage own read" on public.ai_usage for select using ((select auth.uid()) = user_id);

drop policy if exists "ai usage own insert" on public.ai_usage;
create policy "ai usage own insert" on public.ai_usage for insert with check ((select auth.uid()) = user_id);
