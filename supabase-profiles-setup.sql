-- Supabase Profiles Table Setup
-- Run this in Supabase → SQL Editor

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by everyone"
on public.profiles for select
to anon, authenticated
using (true);

create policy "users can upsert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

