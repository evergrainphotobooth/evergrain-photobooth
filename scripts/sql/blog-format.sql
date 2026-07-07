-- =========================================================
-- Evergrain CMS — remember each post's blog format
-- Run once in the Supabase SQL Editor.
-- Lets the "Choose for me" generator balance the mix of formats
-- (standard, listicle, how-to, review-roundup, ultimate-guide,
--  case-study, qa) by favoring formats we've used less.
-- =========================================================

alter table public.blog_posts add column if not exists blog_format text;
