import { redirect } from 'next/navigation';
import CampusFlowApp from '@/components/campus/CampusFlowApp';
import { signOut } from '@/app/login/actions';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getCurrentProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';
import { CampusSnapshot } from '@/lib/demo-repository';
import { Booking, MaintenanceWindow, Resource } from '@/types';

export const dynamic = 'force-dynamic';

function SetupPanel({ title, detail }: { title: string; detail: string }) {
  return <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12"><section className="w-full max-w-xl rounded-2xl border border-border bg-card p-7 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">CF</div><h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p><ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-foreground"><li>Create or configure your Supabase project.</li><li>Copy <code>.env.example</code> to <code>.env.local</code> and add the project URL and publishable key.</li><li>Apply <code>supabase/migrations/20261002000100_phase1_foundation.sql</code>, then run <code>supabase/seed.sql</code>.</li></ol><p className="mt-4 text-xs text-muted-foreground">Placeholder values cannot connect to Supabase. Keep secret keys server-side and out of chat.</p><a href="/login" className="mt-6 inline-flex rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background">Go to sign in</a></section></main>;
}

export default async function Home() {
  if (!isSupabaseConfigured()) {
    return <SetupPanel title="Connect your campus workspace" detail="CampusFlow is now configured for real, invite-only accounts. Add a Supabase project to continue." />;
  }

  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  let hasUser = false;
  let connectionFailed = false;
  try {
    supabase = await createClient();
    // Check whether a cookie session exists before validating it remotely.
    // A signed-out visitor is expected to have no session; that is not a
    // Supabase connection failure.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      connectionFailed = true;
    } else if (session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      connectionFailed = Boolean(userError);
      hasUser = Boolean(user);
    }
  } catch {
    connectionFailed = true;
  }
  if (connectionFailed || !supabase) return <SetupPanel title="Could not reach Supabase" detail="Check the project URL and publishable key in your local environment, then restart the development server." />;
  if (!hasUser) redirect('/login');

  const profile = await getCurrentProfile();
  if (!profile) {
    return <main className="flex min-h-screen items-center justify-center bg-background px-4"><section className="w-full max-w-lg rounded-2xl border border-border bg-card p-7 text-center shadow-sm"><h1 className="text-xl font-semibold">Campus account setup is incomplete</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Your signed-in account has no CampusFlow profile yet. Ask the campus administrator to send an invitation, or finish the first-admin bootstrap in Supabase.</p><form action={signOut} className="mt-5"><button className="rounded-lg border border-border px-4 py-2 text-sm font-medium">Sign out</button></form></section></main>;
  }

  const institutionQuery = await supabase.from('institutions').select('name').eq('id', profile.institutionId).maybeSingle();
  const resourcesQuery = await supabase.from('resources').select('*').order('name');
  const bookingsQuery = await supabase.from('bookings').select('*').order('booking_date').order('start_time');
  const maintenanceQuery = await supabase.from('maintenance_windows').select('*').order('maintenance_date').order('start_time');
  const dataError = institutionQuery.error ?? resourcesQuery.error ?? bookingsQuery.error ?? maintenanceQuery.error;
  if (dataError) return <SetupPanel title="Campus database needs setup" detail={`Supabase connected, but the CampusFlow schema could not be loaded (${dataError.message}). Apply the migration and resource seed, then refresh.`} />;

  const institutionName = institutionQuery.data?.name ?? 'Campus workspace';
  const resources = (resourcesQuery.data ?? []).map((row): Resource => ({
    id: row.id,
    tenantId: row.institution_id,
    name: row.name,
    code: row.code,
    type: row.type,
    building: row.building,
    floor: row.floor,
    capacity: row.capacity,
    facilities: row.facilities ?? [],
    operatingHours: { open: String(row.opens_at).slice(0, 5), close: String(row.closes_at).slice(0, 5) },
    status: row.status,
    requiresApproval: row.requires_approval,
    approvalRole: row.approval_role ?? undefined,
    maxBookingHours: Number(row.max_booking_hours),
    utilizationRate: Number(row.utilization_rate),
    imageUrl: row.image_url ?? undefined,
    description: row.description,
  }));
  const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
  const { data: sameInstitutionProfiles } = await supabase.from('profiles').select('id, full_name, email, role, department');
  const profilesById = new Map((sameInstitutionProfiles ?? []).map((item) => [item.id, item]));
  const bookings = (bookingsQuery.data ?? []).map((row): Booking => {
    const resource = resourceById.get(row.resource_id);
    const organizer = profilesById.get(row.created_by) ?? {
      id: profile.id,
      full_name: profile.fullName,
      email: profile.email,
      role: profile.role,
      department: profile.department,
    };
    const approver = row.approved_by ? profilesById.get(row.approved_by) : undefined;
    return {
      id: row.id,
      tenantId: row.institution_id,
      resourceId: row.resource_id,
      resourceName: resource?.name ?? 'Campus resource',
      resourceType: resource?.type ?? 'classroom',
      title: row.title,
      organizerName: organizer.full_name,
      organizerRole: organizer.role,
      organizerEmail: organizer.email,
      department: organizer.department,
      date: row.booking_date,
      startTime: String(row.start_time).slice(0, 5),
      endTime: String(row.end_time).slice(0, 5),
      attendeeCount: row.attendee_count,
      purpose: row.purpose,
      status: row.status,
      requiresApproval: row.requires_approval,
      approvedBy: approver?.full_name,
      rejectionReason: row.rejection_reason ?? undefined,
      createdAt: row.created_at,
      priorityScore: 5,
    };
  });
  const maintenance = (maintenanceQuery.data ?? []).map((row): MaintenanceWindow => ({
    id: row.id,
    tenantId: row.institution_id,
    resourceId: row.resource_id,
    resourceName: resourceById.get(row.resource_id)?.name ?? 'Campus resource',
    date: row.maintenance_date,
    startTime: String(row.start_time).slice(0, 5),
    endTime: String(row.end_time).slice(0, 5),
    reason: row.reason,
    status: row.status,
  }));

  const initialSnapshot: CampusSnapshot = { resources, bookings, maintenance, auditLogs: [], notifications: [] };
  return <CampusFlowApp profile={profile} institutionName={institutionName} initialSnapshot={initialSnapshot} />;
}
