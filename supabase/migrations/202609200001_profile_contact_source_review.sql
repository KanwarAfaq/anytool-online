alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists occupation text,
  add column if not exists bio text,
  add column if not exists avatar_url text;

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null default 'General inquiry',
  message text not null,
  locale text not null default 'en',
  status text not null default 'new' check (status in ('new','read','replied','closed')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact public insert" on public.contact_messages;
create policy "contact public insert"
on public.contact_messages
for insert
with check (
  length(name) between 1 and 120
  and length(email) between 3 and 320
  and length(subject) between 1 and 200
  and length(message) between 5 and 5000
);

create index if not exists contact_messages_created_at_idx
on public.contact_messages(created_at desc);

create table if not exists public.source_review_queue (
  id bigint generated always as identity primary key,
  source_key text not null,
  source_url text not null,
  detected_at timestamptz not null default now(),
  previous_hash text,
  current_hash text,
  note text,
  status text not null default 'needs_review' check (status in ('needs_review','reviewed','ignored'))
);

alter table public.source_review_queue enable row level security;
