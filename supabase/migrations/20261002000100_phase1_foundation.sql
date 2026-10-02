create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  campus_timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  role text not null check (role in ('student', 'faculty', 'department_head', 'facility_manager', 'institution_admin')),
  full_name text not null,
  email text not null,
  department text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  code text not null,
  type text not null check (type in ('classroom', 'computer_lab', 'seminar_hall', 'auditorium', 'sports_facility', 'meeting_room', 'specialized_lab', 'equipment')),
  building text not null,
  floor text not null default '',
  capacity integer not null check (capacity > 0),
  facilities text[] not null default '{}',
  opens_at time not null,
  closes_at time not null,
  status text not null default 'available' check (status in ('available', 'in_use', 'maintenance', 'reserved')),
  requires_approval boolean not null default false,
  approval_role text check (approval_role is null or approval_role in ('department_head', 'facility_manager', 'institution_admin')),
  max_booking_hours numeric(4,2) not null default 3 check (max_booking_hours > 0 and max_booking_hours <= 24),
  utilization_rate numeric(5,2) not null default 0 check (utilization_rate between 0 and 100),
  image_url text,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_id, code),
  check (closes_at > opens_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  attendee_count integer not null check (attendee_count > 0),
  purpose text not null default '',
  status text not null check (status in ('confirmed', 'pending_approval', 'cancelled', 'checked_in')),
  requires_approval boolean not null default false,
  approved_by uuid references public.profiles(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.maintenance_windows (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  maintenance_date date not null,
  start_time time not null,
  end_time time not null,
  reason text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- One canonical block table makes booking-vs-booking and booking-vs-maintenance
-- overlap checks atomic. Only the security-definer RPCs below can write it.
create table public.resource_schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete restrict,
  booking_id uuid unique references public.bookings(id) on delete cascade,
  maintenance_window_id uuid unique references public.maintenance_windows(id) on delete cascade,
  time_slot tsrange not null,
  active boolean not null default true,
  check ((booking_id is not null)::integer + (maintenance_window_id is not null)::integer = 1),
  check (not isempty(time_slot)),
  exclude using gist (resource_id with =, time_slot with &&) where (active)
);

create index bookings_institution_date_idx on public.bookings (institution_id, booking_date);
create index bookings_resource_date_idx on public.bookings (resource_id, booking_date);
create index maintenance_institution_date_idx on public.maintenance_windows (institution_id, maintenance_date);

create or replace function public.current_institution_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.institution_id from public.profiles p where p.id = (select auth.uid())
$$;

create or replace function public.current_campus_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = (select auth.uid())
$$;

create or replace function public.is_campus_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(public.current_campus_role() in ('department_head', 'facility_manager', 'institution_admin'), false)
$$;

alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.bookings enable row level security;
alter table public.maintenance_windows enable row level security;
alter table public.resource_schedule_blocks enable row level security;

create policy "institution members can read their institution" on public.institutions
  for select to authenticated using (id = (select public.current_institution_id()));

create policy "members can read their own profile and staff can read peers" on public.profiles
  for select to authenticated using (
    institution_id = (select public.current_institution_id()) and
    (id = (select auth.uid()) or (select public.is_campus_staff()))
  );

create policy "institution members can read resources" on public.resources
  for select to authenticated using (institution_id = (select public.current_institution_id()));
create policy "staff can add resources" on public.resources
  for insert to authenticated with check (
    institution_id = (select public.current_institution_id()) and (select public.is_campus_staff())
  );
create policy "staff can update resources" on public.resources
  for update to authenticated using (
    institution_id = (select public.current_institution_id()) and (select public.is_campus_staff())
  ) with check (
    institution_id = (select public.current_institution_id()) and (select public.is_campus_staff())
  );
create policy "staff can delete resources" on public.resources
  for delete to authenticated using (
    institution_id = (select public.current_institution_id()) and (select public.is_campus_staff())
  );

create policy "users see their bookings and staff see institution bookings" on public.bookings
  for select to authenticated using (
    institution_id = (select public.current_institution_id()) and
    (created_by = (select auth.uid()) or (select public.is_campus_staff()))
  );

create policy "members can read institution maintenance" on public.maintenance_windows
  for select to authenticated using (institution_id = (select public.current_institution_id()));

-- Explicit table grants keep booking and maintenance writes behind validated RPCs.
revoke all on public.institutions, public.profiles, public.resources, public.bookings,
  public.maintenance_windows, public.resource_schedule_blocks from anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.institutions, public.profiles, public.resources, public.bookings,
  public.maintenance_windows to authenticated;
grant insert, update, delete on public.resources to authenticated;
grant all on public.institutions, public.profiles, public.resources, public.bookings,
  public.maintenance_windows, public.resource_schedule_blocks to service_role;

create or replace function public.request_booking(
  p_resource_id uuid,
  p_title text,
  p_booking_date date,
  p_start_time time,
  p_end_time time,
  p_attendee_count integer,
  p_purpose text default ''
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_resource public.resources%rowtype;
  v_booking_id uuid;
  v_status text;
begin
  if auth.uid() is null then raise exception 'Sign in is required.' using errcode = '42501'; end if;
  select * into v_profile from public.profiles where id = auth.uid();
  if not found then raise exception 'Your campus profile is not set up.' using errcode = '42501'; end if;
  select * into v_resource from public.resources
    where id = p_resource_id and institution_id = v_profile.institution_id for update;
  if not found then raise exception 'Resource not found in your institution.' using errcode = 'P0002'; end if;
  if p_booking_date is null or p_start_time is null or p_end_time is null or p_end_time <= p_start_time then raise exception 'Choose a valid booking date and time.' using errcode = '22023'; end if;
  if p_start_time < v_resource.opens_at or p_end_time > v_resource.closes_at then raise exception 'Booking is outside resource operating hours.' using errcode = '22023'; end if;
  if extract(epoch from (p_end_time - p_start_time)) / 3600 > v_resource.max_booking_hours then raise exception 'Booking exceeds the maximum duration.' using errcode = '22023'; end if;
  if p_attendee_count < 1 or p_attendee_count > v_resource.capacity then raise exception 'Attendee count exceeds resource capacity.' using errcode = '22023'; end if;
  if v_resource.status = 'maintenance' then raise exception 'This resource is unavailable.' using errcode = '22023'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'Add a booking title.' using errcode = '22023'; end if;
  v_status := case when v_resource.requires_approval then 'pending_approval' else 'confirmed' end;

  insert into public.bookings (institution_id, resource_id, created_by, title, booking_date, start_time, end_time, attendee_count, purpose, status, requires_approval)
  values (v_profile.institution_id, v_resource.id, auth.uid(), trim(p_title), p_booking_date, p_start_time, p_end_time, p_attendee_count, coalesce(trim(p_purpose), ''), v_status, v_resource.requires_approval)
  returning id into v_booking_id;

  insert into public.resource_schedule_blocks (institution_id, resource_id, booking_id, time_slot)
  values (v_profile.institution_id, v_resource.id, v_booking_id, tsrange(p_booking_date + p_start_time, p_booking_date + p_end_time, '[)'));
  return v_booking_id;
end;
$$;

create or replace function public.approve_booking(p_booking_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not (select public.is_campus_staff()) then raise exception 'Staff access is required.' using errcode = '42501'; end if;
  update public.bookings set status = 'confirmed', approved_by = auth.uid(), updated_at = now()
  where id = p_booking_id and institution_id = (select public.current_institution_id()) and status = 'pending_approval';
  if not found then raise exception 'Pending booking not found.' using errcode = 'P0002'; end if;
end;
$$;

create or replace function public.reject_booking(p_booking_id uuid, p_reason text)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not (select public.is_campus_staff()) then raise exception 'Staff access is required.' using errcode = '42501'; end if;
  update public.bookings set status = 'cancelled', rejection_reason = nullif(trim(p_reason), ''), updated_at = now()
  where id = p_booking_id and institution_id = (select public.current_institution_id()) and status = 'pending_approval';
  if not found then raise exception 'Pending booking not found.' using errcode = 'P0002'; end if;
  update public.resource_schedule_blocks set active = false where booking_id = p_booking_id;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  update public.bookings set status = 'cancelled', updated_at = now()
  where id = p_booking_id
    and institution_id = (select public.current_institution_id())
    and status <> 'cancelled'
    and (created_by = (select auth.uid()) or (select public.is_campus_staff()));
  if not found then raise exception 'Booking not found or not permitted.' using errcode = '42501'; end if;
  update public.resource_schedule_blocks set active = false where booking_id = p_booking_id;
end;
$$;

create or replace function public.schedule_maintenance(
  p_resource_id uuid,
  p_maintenance_date date,
  p_start_time time,
  p_end_time time,
  p_reason text
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_institution_id uuid := (select public.current_institution_id());
  v_resource public.resources%rowtype;
  v_window_id uuid;
begin
  if auth.uid() is null or not (select public.is_campus_staff()) then raise exception 'Staff access is required.' using errcode = '42501'; end if;
  select * into v_resource from public.resources where id = p_resource_id and institution_id = v_institution_id for update;
  if not found then raise exception 'Resource not found in your institution.' using errcode = 'P0002'; end if;
  if p_maintenance_date is null or p_start_time is null or p_end_time is null or p_end_time <= p_start_time then raise exception 'Choose a valid maintenance date and time.' using errcode = '22023'; end if;
  if p_start_time < v_resource.opens_at or p_end_time > v_resource.closes_at then raise exception 'Maintenance is outside resource operating hours.' using errcode = '22023'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Add a maintenance reason.' using errcode = '22023'; end if;

  insert into public.maintenance_windows (institution_id, resource_id, created_by, maintenance_date, start_time, end_time, reason)
  values (v_institution_id, v_resource.id, auth.uid(), p_maintenance_date, p_start_time, p_end_time, trim(p_reason))
  returning id into v_window_id;
  insert into public.resource_schedule_blocks (institution_id, resource_id, maintenance_window_id, time_slot)
  values (v_institution_id, v_resource.id, v_window_id, tsrange(p_maintenance_date + p_start_time, p_maintenance_date + p_end_time, '[)'));
  return v_window_id;
end;
$$;

create or replace function public.cancel_maintenance(p_window_id uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not (select public.is_campus_staff()) then raise exception 'Staff access is required.' using errcode = '42501'; end if;
  update public.maintenance_windows set status = 'cancelled'
  where id = p_window_id and institution_id = (select public.current_institution_id()) and status = 'scheduled';
  if not found then raise exception 'Scheduled maintenance window not found.' using errcode = 'P0002'; end if;
  update public.resource_schedule_blocks set active = false where maintenance_window_id = p_window_id;
end;
$$;

revoke all on function public.current_institution_id() from public;
revoke all on function public.current_campus_role() from public;
revoke all on function public.is_campus_staff() from public;
revoke all on function public.request_booking(uuid, text, date, time, time, integer, text) from public;
revoke all on function public.approve_booking(uuid) from public;
revoke all on function public.reject_booking(uuid, text) from public;
revoke all on function public.cancel_booking(uuid) from public;
revoke all on function public.schedule_maintenance(uuid, date, time, time, text) from public;
revoke all on function public.cancel_maintenance(uuid) from public;
grant execute on function public.current_institution_id(), public.current_campus_role(), public.is_campus_staff() to authenticated;
grant execute on function public.request_booking(uuid, text, date, time, time, integer, text) to authenticated;
grant execute on function public.approve_booking(uuid), public.reject_booking(uuid, text), public.cancel_booking(uuid) to authenticated;
grant execute on function public.schedule_maintenance(uuid, date, time, time, text), public.cancel_maintenance(uuid) to authenticated;

insert into public.institutions (id, name, code, campus_timezone)
values ('10000000-0000-4000-8000-000000000001', 'Apex Institute of Technology', 'AIT', 'Asia/Kolkata')
on conflict (id) do nothing;
