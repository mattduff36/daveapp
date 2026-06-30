-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Company settings
create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  company_name text,
  company_address text,
  company_phone text,
  company_website text,
  logo_path text,
  default_engineer_name text,
  default_report_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_settings enable row level security;

create policy "Users can view own company settings"
  on public.company_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own company settings"
  on public.company_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own company settings"
  on public.company_settings for update
  using (auth.uid() = user_id);

create policy "Users can delete own company settings"
  on public.company_settings for delete
  using (auth.uid() = user_id);

-- Surveys
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  reference_number text,
  property_address text,
  property_type text,
  storeys integer,
  has_garage boolean,
  attachment_type text,
  construction_type text,
  instructing_party text,
  engineer_name text,
  current_step integer not null default 0,
  status text not null default 'draft',
  executive_summary text,
  introduction text,
  conclusions text,
  recommendations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists surveys_user_id_updated_at_idx
  on public.surveys (user_id, updated_at desc);

alter table public.surveys enable row level security;

create policy "Users can view own surveys"
  on public.surveys for select
  using (auth.uid() = user_id);

create policy "Users can insert own surveys"
  on public.surveys for insert
  with check (auth.uid() = user_id);

create policy "Users can update own surveys"
  on public.surveys for update
  using (auth.uid() = user_id);

create policy "Users can delete own surveys"
  on public.surveys for delete
  using (auth.uid() = user_id);

-- Survey areas
create table if not exists public.survey_areas (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.surveys on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  area_type text not null check (area_type in ('internal', 'external')),
  condition_rating text check (
    condition_rating in ('observation', 'monitor', 'defect', 'significant')
  ),
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists survey_areas_survey_id_idx
  on public.survey_areas (survey_id, sort_order);

alter table public.survey_areas enable row level security;

create policy "Users can view own survey areas"
  on public.survey_areas for select
  using (auth.uid() = user_id);

create policy "Users can insert own survey areas"
  on public.survey_areas for insert
  with check (auth.uid() = user_id);

create policy "Users can update own survey areas"
  on public.survey_areas for update
  using (auth.uid() = user_id);

create policy "Users can delete own survey areas"
  on public.survey_areas for delete
  using (auth.uid() = user_id);

-- Survey photos
create table if not exists public.survey_photos (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid references public.surveys on delete cascade not null,
  area_id uuid references public.survey_areas on delete cascade,
  user_id uuid references auth.users on delete cascade not null,
  storage_path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists survey_photos_survey_id_idx
  on public.survey_photos (survey_id, sort_order);

alter table public.survey_photos enable row level security;

create policy "Users can view own survey photos"
  on public.survey_photos for select
  using (auth.uid() = user_id);

create policy "Users can insert own survey photos"
  on public.survey_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own survey photos"
  on public.survey_photos for update
  using (auth.uid() = user_id);

create policy "Users can delete own survey photos"
  on public.survey_photos for delete
  using (auth.uid() = user_id);

-- Storage bucket for logos and survey photos
insert into storage.buckets (id, name, public)
values ('survey-assets', 'survey-assets', false)
on conflict (id) do nothing;

create policy "Users can read own survey assets"
  on storage.objects for select
  using (
    bucket_id = 'survey-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own survey assets"
  on storage.objects for insert
  with check (
    bucket_id = 'survey-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own survey assets"
  on storage.objects for update
  using (
    bucket_id = 'survey-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own survey assets"
  on storage.objects for delete
  using (
    bucket_id = 'survey-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger company_settings_set_updated_at
  before update on public.company_settings
  for each row execute function public.set_updated_at();

create trigger surveys_set_updated_at
  before update on public.surveys
  for each row execute function public.set_updated_at();

create trigger survey_areas_set_updated_at
  before update on public.survey_areas
  for each row execute function public.set_updated_at();
