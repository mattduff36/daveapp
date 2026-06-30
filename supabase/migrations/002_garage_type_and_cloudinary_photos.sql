-- Garage type on surveys
alter table public.surveys
  add column if not exists garage_type text;

-- Cloudinary metadata on survey photos
alter table public.survey_photos
  alter column storage_path drop not null;

alter table public.survey_photos
  add column if not exists photo_url text,
  add column if not exists cloudinary_public_id text,
  add column if not exists width integer,
  add column if not exists height integer;
