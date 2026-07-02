-- =========================================================
-- Evergrain CMS — Multi-category blogs + redirect tracking
-- Run once in the Supabase SQL Editor (after the earlier blog migrations).
-- =========================================================

-- A post can belong to many categories. category_id stays the PRIMARY category
-- (it drives the URL slug); category_ids holds every category it appears under.
alter table public.blog_posts add column if not exists category_ids uuid[] default '{}';

-- The path the post's static page was last published at, so a later slug/primary
-- change can be turned into a 301 redirect instead of a 404.
alter table public.blog_posts add column if not exists published_path text;

-- Backfill: existing posts belong to (at least) their current primary category.
update public.blog_posts
   set category_ids = array[category_id]
 where category_id is not null
   and (category_ids is null or category_ids = '{}');

-- Recorded whenever a published post's URL changes. The "Check for redirects"
-- button materializes these into vercel.json as 301s.
create table if not exists public.blog_redirects (
  id          uuid primary key default gen_random_uuid(),
  from_path   text not null unique,   -- e.g. /a-thousand-words/old-category/old-slug
  to_path     text not null,          -- e.g. /a-thousand-words/new-category/new-slug
  post_id     uuid,
  created_at  timestamptz default now()
);
alter table public.blog_redirects enable row level security;
