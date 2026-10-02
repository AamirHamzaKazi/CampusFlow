-- Run this in Supabase SQL Editor after creating the first Auth user.
-- Replace the email below with the invited user's exact email address.
insert into public.profiles (id, institution_id, role, full_name, email, department)
select
  users.id,
  '10000000-0000-4000-8000-000000000001'::uuid,
  'institution_admin',
  coalesce(nullif(users.raw_user_meta_data ->> 'full_name', ''), split_part(users.email, '@', 1)),
  users.email,
  'Campus administration'
from auth.users as users
where lower(users.email) = lower('ahamzqaz@gmail.com')
on conflict (id) do update set
  institution_id = excluded.institution_id,
  role = 'institution_admin',
  full_name = excluded.full_name,
  email = excluded.email,
  updated_at = now();
