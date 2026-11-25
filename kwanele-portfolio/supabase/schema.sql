-- Run once in Supabase: SQL Editor > New query.
create table public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  panel text not null check (panel in ('cyber','software','pm')),
  title text not null,
  description text default '',
  category text default '',
  role text default '',
  tech text[] default '{}',
  event_date date,
  links jsonb default '[]',   -- [{label,url}]
  media jsonb default '[]',   -- [{type,url,path,alt}]
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz default now()
);
alter table public.admins enable row level security;
alter table public.posts enable row level security;
create policy "admin reads own row" on public.admins for select to authenticated using (user_id = auth.uid());
create policy "public reads published" on public.posts for select using (status = 'published');
create policy "admin full access" on public.posts for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
insert into storage.buckets (id, name, public) values ('media','media',true) on conflict do nothing;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin write" on storage.objects for all to authenticated
  using (bucket_id = 'media' and exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (bucket_id = 'media' and exists (select 1 from public.admins a where a.user_id = auth.uid()));
-- After creating YOUR user in Authentication > Users, run:
-- insert into public.admins select id from auth.users where email = 'kpmalekwanele@gmail.com';

-- ===== PART 2: story globe + editable site content (run this if you ran Part 1 earlier) =====
create table if not exists public.site_content (key text primary key, value text not null default '');
create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  title text not null, cta text default 'Read the story', story text default '',
  event_date date, sort int default 0, links jsonb default '[]', media jsonb default '[]',
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz default now());
alter table public.site_content enable row level security;
alter table public.moments enable row level security;
create policy "public reads site content" on public.site_content for select using (true);
create policy "admin writes site content" on public.site_content for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "public reads published moments" on public.moments for select using (status = 'published');
create policy "admin full access moments" on public.moments for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
