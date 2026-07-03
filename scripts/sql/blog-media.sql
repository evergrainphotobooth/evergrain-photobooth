-- =========================================================
-- Evergrain CMS — Multiple images/videos per blog post
-- Run once in the Supabase SQL Editor.
-- =========================================================

-- Ordered list of media the post uses. media[0] is the FEATURED item
-- (header background + first body placement). Each entry:
--   { type: "image"|"video", url, alt, title,
--     source: "upload|supabase|stock|video-upload|video-url",
--     provider: "file|youtube|vimeo", embed: "<iframe src>" | null }
-- The legacy image_url/image_alt/image_title columns are kept as a mirror of
-- the featured IMAGE so the renderer's header background, og:image, and index
-- thumbnail keep working unchanged.
alter table public.blog_posts add column if not exists media jsonb default '[]'::jsonb;

-- Backfill: fold any existing single featured image into the new media list.
update public.blog_posts
   set media = jsonb_build_array(
         jsonb_build_object(
           'type', 'image',
           'url', image_url,
           'alt', coalesce(image_alt, ''),
           'title', coalesce(image_title, ''),
           'source', 'upload',
           'provider', 'file'
         ))
 where image_url is not null and image_url <> ''
   and (media is null or media = '[]'::jsonb);
