create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'en',
  plan text not null default 'free' check (plan in ('free','pro','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_slug text not null,
  created_at timestamptz not null default now(),
  primary key(user_id,tool_slug)
);

create table if not exists public.tool_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  tool_slug text not null,
  event text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'cloudinary',
  public_id text not null,
  secure_url text,
  resource_type text,
  bytes bigint,
  delete_after timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null,
  provider text not null,
  model text,
  status text not null,
  input_units bigint not null default 0,
  output_units bigint not null default 0,
  estimated_cost numeric(12,6) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.tool_events enable row level security;
alter table public.uploads enable row level security;
alter table public.ai_usage enable row level security;

create policy "profiles own read" on public.profiles for select using (auth.uid()=id);
create policy "profiles own update" on public.profiles for update using (auth.uid()=id);
create policy "favorites own all" on public.favorites for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "events insert own or anon" on public.tool_events for insert with check (user_id is null or auth.uid()=user_id);
create policy "events own read" on public.tool_events for select using (auth.uid()=user_id);
create policy "uploads own all" on public.uploads for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "ai usage own read" on public.ai_usage for select using (auth.uid()=user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,display_name)
  values(new.id,coalesce(new.raw_user_meta_data->>'display_name',''))
  on conflict(id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
