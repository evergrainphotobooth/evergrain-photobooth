-- =========================================================
-- Evergrain CMS — Blog tables (run once in Supabase SQL Editor)
-- Blogs live under /candid-moments, categories under
-- /candid-moments/[category-slug]. Content is authored + stored here;
-- public rendering is a later phase.
-- =========================================================

-- ---- Categories ----
create table if not exists public.blog_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  blurb       text,                       -- shown with the category page header
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---- Posts ----
create table if not exists public.blog_posts (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,        -- H1 on the page
  slug              text unique,          -- /candid-moments/[category]/[slug]
  category_id       uuid references public.blog_categories(id) on delete set null,
  primary_keyword   text,
  meta_title        text,                 -- ~50–60 chars
  meta_description  text,                 -- ~140–160 chars
  image_url         text,                 -- Supabase Storage (or pasted) URL
  image_alt         text,
  image_title       text,
  content_html      text,                 -- generated semantic HTML body
  word_count        integer default 0,
  checklist         jsonb,                -- [{ item, pass, note }]
  status            text default 'draft'
                      check (status in ('draft','published')),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  published_at      timestamptz
);

create index if not exists blog_posts_category_idx on public.blog_posts (category_id);
create index if not exists blog_posts_status_idx   on public.blog_posts (status);

-- RLS on, no public policies → only the service_role key (our admin API) can read/write,
-- exactly like the inquiries table.
alter table public.blog_categories enable row level security;
alter table public.blog_posts       enable row level security;

-- Optional seed: a default category so the editor has something to file under.
insert into public.blog_categories (slug, name, blurb)
values ('tips-and-guides', 'Tips & Guides',
        'Practical advice for planning an unforgettable photo booth experience.')
on conflict (slug) do nothing;
