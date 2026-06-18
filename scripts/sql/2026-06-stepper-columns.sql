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

-- REQUIRED for partial capture: step 1 only collects name/email/phone/eventType,
-- so event_date and venue_city must be nullable for an in-progress (partial) row.
-- (event_type, name, email, phone stay NOT NULL — all captured in step 1.)
alter table public.inquiries
  alter column event_date drop not null,
  alter column venue_city drop not null;

-- Expand the lead-status vocabulary to the CMS lead stages. The original schema
-- pinned status to ('new','contacted','archived'); the admin now sets
-- initiated/cold/warm/hot/closed/bad. Replace the old CHECK with the full set
-- (legacy values kept so pre-existing rows stay valid).
alter table public.inquiries drop constraint if exists inquiries_status_check;
alter table public.inquiries
  add constraint inquiries_status_check
  check (status in (
    'new','initiated','cold','warm','hot','closed','bad','contacted','archived'
  ));
