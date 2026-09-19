create policy "ai usage own insert"
on public.ai_usage
for insert
with check (auth.uid() = user_id);

create index if not exists tool_events_created_at_idx on public.tool_events(created_at desc);
create index if not exists tool_events_tool_slug_idx on public.tool_events(tool_slug);
create index if not exists ai_usage_user_created_idx on public.ai_usage(user_id, created_at desc);
