-- Run in Supabase SQL Editor (or `supabase db push`).
create table if not exists admins(user_id uuid primary key references auth.users(id) on delete cascade);
create or replace function is_admin() returns boolean language sql security definer stable set search_path=public as $$ select exists(select 1 from admins where user_id=auth.uid()) $$;

create table if not exists profile(id int primary key default 1 check(id=1),name text,title text,greeting text,intro text,photo_url text,about text,education_summary text,interests text,strengths text,resume_url text,email text,github text,linkedin text,twitter text,instagram text);
create table if not exists skills(id uuid primary key default gen_random_uuid(),name text not null,category text,sort_order int default 0,published boolean default true,created_at timestamptz default now());
create table if not exists projects(id uuid primary key default gen_random_uuid(),title text not null,slug text unique,category text,description text,details text,tech text,image_url text,github_url text,demo_url text,sort_order int default 0,published boolean default true,created_at timestamptz default now());
create table if not exists experience(id uuid primary key default gen_random_uuid(),organization text,position text not null,duration text,description text,tech text,image_url text,sort_order int default 0,published boolean default true,created_at timestamptz default now());
create table if not exists education(id uuid primary key default gen_random_uuid(),institution text,degree text not null,duration text,details text,sort_order int default 0,published boolean default true,created_at timestamptz default now());
create table if not exists certifications(id uuid primary key default gen_random_uuid(),title text not null,issuer text,kind text default 'Certification',image_url text,sort_order int default 0,published boolean default true,created_at timestamptz default now());
create table if not exists posts(id uuid primary key default gen_random_uuid(),title text not null,slug text unique,excerpt text,content text,cover_url text,sort_order int default 0,published boolean default true,created_at timestamptz default now());
create table if not exists messages(id uuid primary key default gen_random_uuid(),name text not null check(length(name)<=100),email text not null check(length(email)<=150),message text not null check(length(message)<=2000),created_at timestamptz default now());

alter table admins enable row level security; alter table profile enable row level security; alter table messages enable row level security;
create policy "admin reads self" on admins for select using(user_id=auth.uid());
create policy "public read profile" on profile for select using(true);
create policy "admin writes profile" on profile for all using(is_admin()) with check(is_admin());
create policy "anyone sends message" on messages for insert with check(true);
create policy "admin reads messages" on messages for select using(is_admin());
create policy "admin deletes messages" on messages for delete using(is_admin());
do $$ declare t text; begin foreach t in array array['skills','projects','experience','education','certifications','posts'] loop
 execute format('alter table %I enable row level security',t);
 execute format('create policy "public read published" on %I for select using(published=true or is_admin())',t);
 execute format('create policy "admin write" on %I for all using(is_admin()) with check(is_admin())',t);
end loop; end $$;

insert into storage.buckets(id,name,public) values('media','media',true) on conflict do nothing;
create policy "public read media" on storage.objects for select using(bucket_id='media');
create policy "admin upload media" on storage.objects for insert with check(bucket_id='media' and is_admin());
create policy "admin update media" on storage.objects for update using(bucket_id='media' and is_admin());
create policy "admin delete media" on storage.objects for delete using(bucket_id='media' and is_admin());
