-- =========================================================
-- Evergrain CMS — Supabase schema additions
-- Run once in Supabase → SQL Editor.
-- =========================================================

-- Add a `status` column to inquiries for the admin workflow.
-- Defaults to 'new'; admin marks them 'contacted' or 'archived' as work progresses.
alter table public.inquiries
  add column if not exists status text not null default 'new'
  check (status in ('new', 'contacted', 'archived'));

-- Add an `admin_notes` column for jotting notes inline against a row.
alter table public.inquiries
  add column if not exists admin_notes text;

-- Helpful index for the dashboard's "new this week" count.
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);
