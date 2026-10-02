-- Phase 2: persisted campus activity and per-user in-app notifications.

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text not null,
  actor_role text not null check (actor_role in ('student', 'faculty', 'department_head', 'facility_manager', 'institution_admin')),
  action text not null check (action in (
    'BOOKING_REQUESTED', 'BOOKING_CREATED', 'APPROVAL_GRANTED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED',
    'RESOURCE_CREATED', 'RESOURCE_UPDATED', 'MAINTENANCE_SCHEDULED', 'MAINTENANCE_CANCELLED'
  )),
  resource_id uuid references public.resources(id) on delete set null,
  resource_name text not null,
  details text not null,
  created_at timestamptz not null default now()
);

create index activity_logs_institution_created_idx on public.activity_logs (institution_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  kind text not null check (kind in ('booking', 'approval', 'maintenance', 'system')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

create policy "campus staff can read institution activity" on public.activity_logs
  for select to authenticated using (
    institution_id = (select public.current_institution_id()) and (select public.is_campus_staff())
  );

create policy "users can read their notifications" on public.notifications
  for select to authenticated using (
    institution_id = (select public.current_institution_id()) and user_id = (select auth.uid())
  );
create policy "users can mark their notifications read" on public.notifications
  for update to authenticated using (
    institution_id = (select public.current_institution_id()) and user_id = (select auth.uid())
  ) with check (
    institution_id = (select public.current_institution_id()) and user_id = (select auth.uid())
  );

revoke all on public.activity_logs, public.notifications from public, anon, authenticated;
grant select on public.activity_logs, public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant all on public.activity_logs, public.notifications to service_role;

create or replace function public.write_campus_activity(
  p_institution_id uuid,
  p_actor_id uuid,
  p_action text,
  p_resource_id uuid,
  p_resource_name text,
  p_details text
)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor_name text;
  v_actor_role text;
begin
  select full_name, role into v_actor_name, v_actor_role
  from public.profiles where id = p_actor_id and institution_id = p_institution_id;
  if not found then return; end if;

  insert into public.activity_logs (institution_id, actor_id, actor_name, actor_role, action, resource_id, resource_name, details)
  values (p_institution_id, p_actor_id, v_actor_name, v_actor_role, p_action, p_resource_id, coalesce(p_resource_name, 'Campus resource'), p_details);
end;
$$;

create or replace function public.notify_campus_staff(
  p_institution_id uuid,
  p_except_user_id uuid,
  p_title text,
  p_description text,
  p_kind text
)
returns void
language sql security definer
set search_path = ''
as $$
  insert into public.notifications (institution_id, user_id, title, description, kind)
  select p.institution_id, p.id, p_title, p_description, p_kind
  from public.profiles p
  where p.institution_id = p_institution_id
    and p.role in ('department_head', 'facility_manager', 'institution_admin')
    and (p_except_user_id is null or p.id <> p_except_user_id)
$$;

create or replace function public.record_booking_activity()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := (select auth.uid());
  v_resource_name text;
  v_action text;
  v_kind text;
  v_title text;
  v_description text;
begin
  select name into v_resource_name from public.resources where id = new.resource_id;

  if tg_op = 'INSERT' then
    if new.status = 'pending_approval' then
      v_action := 'BOOKING_REQUESTED';
      v_kind := 'approval';
      v_title := 'Booking request submitted';
      v_description := new.title || ' is waiting for campus staff review.';
    else
      v_action := 'BOOKING_CREATED';
      v_kind := 'booking';
      v_title := 'Booking confirmed';
      v_description := new.title || ' is confirmed for ' || new.booking_date::text || ', ' || new.start_time::text || '–' || new.end_time::text || '.';
    end if;

    perform public.write_campus_activity(new.institution_id, v_actor_id, v_action, new.resource_id, v_resource_name,
      v_title || ' · ' || new.booking_date::text || ' ' || new.start_time::text || '–' || new.end_time::text || '.');
    insert into public.notifications (institution_id, user_id, title, description, kind)
    values (new.institution_id, new.created_by, v_title, v_description, v_kind);

    if new.status = 'pending_approval' then
      perform public.notify_campus_staff(new.institution_id, new.created_by, 'Booking request to review',
        new.title || ' requested in ' || coalesce(v_resource_name, 'a campus resource') || '.', 'approval');
    end if;
    return new;
  end if;

  if old.status is distinct from new.status then
    if old.status = 'pending_approval' and new.status = 'confirmed' then
      v_action := 'APPROVAL_GRANTED'; v_kind := 'approval'; v_title := 'Booking approved';
      v_description := new.title || ' was approved for ' || new.booking_date::text || ', ' || new.start_time::text || '–' || new.end_time::text || '.';
    elsif old.status = 'pending_approval' and new.status = 'cancelled' and new.rejection_reason is not null then
      v_action := 'BOOKING_REJECTED'; v_kind := 'approval'; v_title := 'Booking request declined';
      v_description := new.title || ' was declined.' || case when trim(new.rejection_reason) = '' then '' else ' Reason: ' || new.rejection_reason end;
    elsif new.status = 'cancelled' then
      v_action := 'BOOKING_CANCELLED'; v_kind := 'booking'; v_title := 'Booking cancelled';
      v_description := new.title || ' was cancelled for ' || new.booking_date::text || '.';
    else
      return new;
    end if;

    perform public.write_campus_activity(new.institution_id, v_actor_id, v_action, new.resource_id, v_resource_name, v_description);
    if new.created_by <> coalesce(v_actor_id, '00000000-0000-0000-0000-000000000000'::uuid) then
      insert into public.notifications (institution_id, user_id, title, description, kind)
      values (new.institution_id, new.created_by, v_title, v_description, v_kind);
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.record_resource_activity()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null then
    perform public.write_campus_activity(new.institution_id, (select auth.uid()),
      case when tg_op = 'INSERT' then 'RESOURCE_CREATED' else 'RESOURCE_UPDATED' end,
      new.id, new.name,
      case when tg_op = 'INSERT' then 'Added ' || new.name || ' (' || new.code || ') to the campus inventory.'
        else 'Updated ' || new.name || ' (' || new.code || ') in the campus inventory.' end);
  end if;
  return new;
end;
$$;

create or replace function public.record_maintenance_activity()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_resource_name text;
  v_action text;
  v_details text;
begin
  if (select auth.uid()) is null then return new; end if;
  select name into v_resource_name from public.resources where id = new.resource_id;
  if tg_op = 'INSERT' then
    v_action := 'MAINTENANCE_SCHEDULED';
    v_details := 'Scheduled maintenance for ' || new.maintenance_date::text || ' ' || new.start_time::text || '–' || new.end_time::text || '. Reason: ' || new.reason;
  elsif old.status is distinct from new.status and new.status = 'cancelled' then
    v_action := 'MAINTENANCE_CANCELLED';
    v_details := 'Cancelled the maintenance window for ' || new.maintenance_date::text || ' (' || new.reason || ').';
  else
    return new;
  end if;
  perform public.write_campus_activity(new.institution_id, (select auth.uid()), v_action, new.resource_id, v_resource_name, v_details);
  return new;
end;
$$;

create trigger bookings_activity_after_insert_update
  after insert or update on public.bookings
  for each row execute function public.record_booking_activity();
create trigger resources_activity_after_insert_update
  after insert or update on public.resources
  for each row execute function public.record_resource_activity();
create trigger maintenance_activity_after_insert_update
  after insert or update on public.maintenance_windows
  for each row execute function public.record_maintenance_activity();

revoke all on function public.write_campus_activity(uuid, uuid, text, uuid, text, text) from public, anon, authenticated;
revoke all on function public.notify_campus_staff(uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.record_booking_activity() from public, anon, authenticated;
revoke all on function public.record_resource_activity() from public, anon, authenticated;
revoke all on function public.record_maintenance_activity() from public, anon, authenticated;
