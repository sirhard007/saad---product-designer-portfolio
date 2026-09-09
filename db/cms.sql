-- Run once in the existing Supabase SQL editor. Existing projects are preserved.
begin;
alter table public.projects add column if not exists client text not null default '';
alter table public.projects add column if not exists role text not null default '';
alter table public.projects add column if not exists tools text not null default '';
alter table public.projects add column if not exists industry text not null default '';
alter table public.projects add column if not exists cover_type text not null default 'image' check (cover_type in ('image','video'));
alter table public.projects add column if not exists video_url text not null default '';
alter table public.projects add column if not exists poster text not null default '';
alter table public.projects add column if not exists featured boolean not null default false;
alter table public.projects add column if not exists homepage_visible boolean not null default true;
alter table public.projects add column if not exists published boolean not null default true;
alter table public.projects add column if not exists sort_order integer not null default 0;
create table if not exists public.cms_admins (
 id uuid primary key default gen_random_uuid(), username text unique not null,
 email text not null default '', password_hash text not null, avatar_url text not null default '',
 created_at timestamptz not null default now(), last_login timestamptz, session_version integer not null default 1
);
create table if not exists public.cms_media (
 id uuid primary key default gen_random_uuid(), name text not null, url text not null unique,
 public_id text not null, kind text not null check(kind in ('image','video')), bytes bigint not null default 0,
 created_at timestamptz not null default now()
);
create table if not exists public.cms_websites (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 category text not null default '',
 description text not null default '',
 url text not null,
 preview_type text not null default 'image' check(preview_type in ('image','video')),
 image_url text not null default '',
 video_url text not null default '',
 poster_url text not null default '',
 accent text not null default '#159c91',
 published boolean not null default false,
 sort_order integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
insert into public.cms_websites(id,title,category,description,url,preview_type,image_url,accent,published,sort_order) values
 ('80d9be09-394c-4f75-a0cb-1bbfd8b0fd01','Korede Fitness','Fitness & wellness website','','https://www.koredefitness.com','image','/live/korede-fitness.png','#12b9e8',true,1),
 ('80d9be09-394c-4f75-a0cb-1bbfd8b0fd02','Allahu Mubaraq Enterprises','Industrial supply website','','https://www.allahumubaraq.com','image','/live/allahumubaraq.png','#f26d21',true,2)
on conflict(id) do nothing;
create table if not exists public.cms_events (
 id bigint generated always as identity primary key, visitor text not null, session text not null,
 event text not null, path text not null, target text not null default '', device text not null,
 source text not null, country text, city text, created_at timestamptz not null default now()
);
create index if not exists cms_events_date on public.cms_events(created_at);
create table if not exists public.cms_messages (
 id uuid primary key default gen_random_uuid(), name text not null, email text not null,
 message text not null, status text not null default 'unread' check(status in ('unread','read')),
 created_at timestamptz not null default now()
);
create table if not exists public.cms_settings (
 id integer primary key check(id=1), contact_email text not null default '', resume_url text not null default '',
 analytics_enabled boolean not null default true
);
insert into public.cms_settings(id) values(1) on conflict do nothing;
create table if not exists public.cms_rate_limits (
 key text primary key, attempts integer not null default 1, started_at timestamptz not null default now()
);
create or replace function public.cms_rate_limit(bucket text, maximum integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 insert into cms_rate_limits(key) values(bucket)
 on conflict(key) do update set attempts=case when cms_rate_limits.started_at < now()-make_interval(secs=>window_seconds) then 1 else cms_rate_limits.attempts+1 end,
 started_at=case when cms_rate_limits.started_at < now()-make_interval(secs=>window_seconds) then now() else cms_rate_limits.started_at end
 returning attempts into n;
 return n<=maximum;
end $$;
revoke all on function public.cms_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.cms_rate_limit(text,integer,integer) to service_role;
alter table public.cms_admins enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_websites enable row level security;
alter table public.cms_events enable row level security;
alter table public.cms_messages enable row level security;
alter table public.cms_settings enable row level security;
alter table public.cms_rate_limits enable row level security;
revoke all on public.cms_admins, public.cms_media, public.cms_websites, public.cms_events, public.cms_messages, public.cms_settings, public.cms_rate_limits from anon, authenticated;
-- Public project reads now go through the server, which enforces publishing rules.
revoke all on public.projects from anon, authenticated;
grant all on public.projects, public.cms_admins, public.cms_media, public.cms_websites, public.cms_events, public.cms_messages, public.cms_settings, public.cms_rate_limits to service_role;
grant usage, select on sequence public.cms_events_id_seq to service_role;
commit;
