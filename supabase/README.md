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
2. `supabase/migrations/20261002000200_phase2_activity_notifications.sql`
3. `supabase/seed.sql`

If the foundation and seed are already installed, apply only the new Phase 2 migration; do not rerun the foundation migration.

Then create the first Auth user in **Authentication → Users**. Run `supabase/bootstrap_first_admin.sql` after replacing `REPLACE_WITH_ADMIN_EMAIL` with that user’s exact email. This grants the first `institution_admin` profile for the seeded pilot institution. Keep this bootstrap script restricted to trusted project owners; normal role assignment happens through authenticated admin invitations.

In **Authentication → URL Configuration**, allow the local invitation return URL (`http://localhost:3000/auth/complete`) and the equivalent deployed URL before sending invites. CampusFlow supports Supabase's default invitation email; custom SMTP is only needed if you want to customize email delivery/templates or send more than the built-in limit of 2 emails per hour. The browser completion page reads the one-time session tokens from the email redirect, stores the session, and opens `/auth/set-password`.

If an invitation expires and sending it again reports that the email is already registered, check **Authentication → Users**. For a test account that is still unconfirmed, remove that specific pending test user before inviting again. Do not remove a confirmed or in-use account; have that person sign in or use the account recovery flow instead. The app reports this distinction in the invitation error.

## What is protected

- Campus profiles, resources, bookings, and maintenance windows include institution ownership.
- Authenticated users read only their institution’s records; students and faculty see their own bookings, while campus staff share operational visibility and actions.
- Booking and maintenance schedule writes go through database functions. A Postgres exclusion constraint prevents overlapping active time blocks, including concurrent requests.
- The app does not let users choose their own role. Campus admins select the role when inviting a user.
- Booking, approval, resource, and maintenance changes are recorded in an institution-scoped activity log. Booking status changes create in-app notifications for the requester and, for pending requests, campus staff. Users can read only their own notifications and mark them read.

The SQL has not been run against a live project in this workspace. Once real project values are configured, apply the SQL and verify sign-in, RLS, invitation redirects, and concurrent booking behavior against that project.
