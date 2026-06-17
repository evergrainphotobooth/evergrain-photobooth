-- Stepper / progressive-capture migration
-- Adds two columns to public.inquiries:
--   completed  — false while a lead is mid-form (partial), true once all 4 steps submit.
--                Defaults true so every pre-existing row reads as a finished inquiry.
--   last_step  — furthest step (1–4) the lead reached. Powers the CMS "Partial · N/4" badge.
-- Safe + idempotent: re-running does nothing.

alter table public.inquiries
  add column if not exists completed boolean not null default true,
  add column if not exists last_step integer;

-- Optional: speed up the CMS "Partial / Complete" filter on larger datasets.
create index if not exists inquiries_completed_idx on public.inquiries (completed);
