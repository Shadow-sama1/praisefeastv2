create extension if not exists "pgcrypto";

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  role text not null check (role in ('attendee', 'speaker')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registrations_phone_number_idx
  on public.registrations (phone_number);

create index if not exists registrations_created_at_idx
  on public.registrations (created_at desc);

create or replace function public.ensure_registrations_table()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  create table if not exists public.registrations (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    phone_number text not null,
    role text not null check (role in ('attendee', 'speaker')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create index if not exists registrations_phone_number_idx
    on public.registrations (phone_number);

  create index if not exists registrations_created_at_idx
    on public.registrations (created_at desc);
end;
$$;
