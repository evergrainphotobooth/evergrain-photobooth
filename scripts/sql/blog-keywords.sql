-- =========================================================
-- Evergrain CMS — Targeted Keywords for the blog generator
-- Run once in the Supabase SQL Editor (after blog-tables.sql).
-- A simple global list of SEO keywords the AI generator should try
-- to weave into every blog naturally.
-- =========================================================

create table if not exists public.blog_keywords (
  id          uuid primary key default gen_random_uuid(),
  keyword     text not null,
  created_at  timestamptz default now()
);

-- Case-insensitive uniqueness so "Photo Booth" and "photo booth" can't both exist.
create unique index if not exists blog_keywords_lower_idx
  on public.blog_keywords (lower(keyword));

-- RLS on, no public policies → service-role-only, like the other blog tables.
alter table public.blog_keywords enable row level security;
