-- =========================================================
-- Run once in the Supabase SQL Editor.
-- Adds: scheduled blog publishing + inquiry source-page tracking.
-- =========================================================

-- 1) Blog: scheduled publishing -----------------------------------------
alter table public.blog_posts add column if not exists scheduled_at timestamptz;

-- Allow the new 'scheduled' status (the inline check from blog-tables.sql is
-- named blog_posts_status_check by Postgres).
alter table public.blog_posts drop constraint if exists blog_posts_status_check;
alter table public.blog_posts add constraint blog_posts_status_check
  check (status in ('draft','published','scheduled'));

-- Fast lookup of due posts for the publish cron.
create index if not exists blog_posts_scheduled_idx
  on public.blog_posts (scheduled_at) where status = 'scheduled';

-- 2) Inquiries: which page the inquiry was submitted from ----------------
alter table public.inquiries add column if not exists source_page text;
