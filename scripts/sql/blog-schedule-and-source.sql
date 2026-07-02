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

-- (Inquiry source-page tracking needs NO migration — it is captured inside
--  the existing inquiries.raw_payload JSON and read from there by the CMS.)

-- 2) Auto-publish scheduler (precise, plan-independent) ------------------
-- Runs the publish endpoint every 5 minutes so scheduled posts go live at
-- (approximately) their chosen time. Requires the pg_cron + pg_net extensions
-- (Supabase → Database → Extensions → enable "pg_cron" and "pg_net"), a
-- CRON_SECRET env var set in Vercel, and the SAME secret pasted below.
--
--   create extension if not exists pg_cron;
--   create extension if not exists pg_net;
--
--   select cron.schedule(
--     'publish-scheduled-blogs',
--     '*/5 * * * *',
--     $$ select net.http_get(
--          url     := 'https://evergrainphotobooth.com/api/admin/blog-posts?task=publish-scheduled',
--          headers := jsonb_build_object('Authorization', 'Bearer REPLACE_WITH_YOUR_CRON_SECRET')
--        ); $$
--   );
--
-- To change or remove it later:  select cron.unschedule('publish-scheduled-blogs');
