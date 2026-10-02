# Supabase setup for CampusFlow

CampusFlow uses Supabase Auth for invite-only email/password accounts and Postgres for campus data. The migration enables Row Level Security (RLS); keep it enabled when using the browser and server clients.

## Local configuration

1. Create a Supabase project for the pilot institution.
2. Copy `.env.example` to `.env.local` in the repository root.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project’s API settings. These public values are expected in the app; database access is protected by RLS.
4. Set `SUPABASE_SECRET_KEY` only if you want campus admins to send invitations from CampusFlow. Store it only in `.env.local` or your deployment’s server-side environment settings. Never use it in a `NEXT_PUBLIC_` variable, commit it, or send it in chat.
5. Restart the development server after changing environment variables.

Placeholder values in `.env.example` only document the variable names. They do not connect to a project.

## Database and initial admin

Run these files in the Supabase SQL Editor, in order:

1. `supabase/migrations/20261002000100_phase1_foundation.sql`
2. `supabase/seed.sql`

Then create the first Auth user in **Authentication → Users**. Run `supabase/bootstrap_first_admin.sql` after replacing `REPLACE_WITH_ADMIN_EMAIL` with that user’s exact email. This grants the first `institution_admin` profile for the seeded pilot institution. Keep this bootstrap script restricted to trusted project owners; normal role assignment happens through authenticated admin invitations.

In **Authentication → URL Configuration**, allow the local app callback URL (`http://localhost:3000/auth/callback`) and the equivalent deployed URL before sending invites. Invitations link to `/auth/callback?next=/auth/set-password`.

## What is protected

- Campus profiles, resources, bookings, and maintenance windows include institution ownership.
- Authenticated users read only their institution’s records; students and faculty see their own bookings, while campus staff share operational visibility and actions.
- Booking and maintenance schedule writes go through database functions. A Postgres exclusion constraint prevents overlapping active time blocks, including concurrent requests.
- The app does not let users choose their own role. Campus admins select the role when inviting a user.

The SQL has not been run against a live project in this workspace. Once real project values are configured, apply the SQL and verify sign-in, RLS, invitation redirects, and concurrent booking behavior against that project.
