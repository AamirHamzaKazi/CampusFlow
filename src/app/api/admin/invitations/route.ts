import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { CampusRole } from '@/types';

const campusRoles = new Set<CampusRole>(['student', 'faculty', 'department_head', 'facility_manager', 'institution_admin']);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to invite campus members.' }, { status: 401 });

  const { data: inviter, error: inviterError } = await supabase
    .from('profiles')
    .select('institution_id, role')
    .eq('id', user.id)
    .maybeSingle();
  if (inviterError || inviter?.role !== 'institution_admin') {
    return NextResponse.json({ error: 'Only a campus admin can invite members.' }, { status: 403 });
  }

  let input: { email?: unknown; fullName?: unknown; department?: unknown; role?: unknown };
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  const department = typeof input.department === 'string' ? input.department.trim() : '';
  const role = input.role;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length < 2 || fullName.length > 120 || department.length > 120 || typeof role !== 'string' || !campusRoles.has(role as CampusRole)) {
    return NextResponse.json({ error: 'Enter a valid email, name, department, and campus role.' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      // Supabase's default invite email redirects back with the session tokens
      // in the URL fragment. Fragments never reach a Route Handler, so the
      // browser completion page must exchange them for the cookie-backed session.
      redirectTo: new URL('/auth/complete?next=/auth/set-password', request.url).toString(),
      data: { full_name: fullName, department },
    });
    if (error) {
      if (error.code === 'user_already_exists' || /already (been )?registered|already exists/i.test(error.message)) {
        return NextResponse.json({
          error: 'An account already exists for this email. If it is an unconfirmed, expired test invitation, remove that user in Supabase Authentication → Users, then send a new invitation. If the account is confirmed, the person should sign in or reset their password instead.',
        }, { status: 409 });
      }
      if (/email rate limit exceeded|over_email_send_rate_limit|email.*rate.?limit/i.test(`${error.code ?? ''} ${error.message}`)) {
        return NextResponse.json({
          error: 'Supabase’s built-in email service has reached its limit of 2 emails per hour. Don’t keep retrying; wait until the limit resets, or configure custom SMTP in Supabase to send more invitations.',
        }, { status: 429 });
      }
      return NextResponse.json({ error: error.message || 'Invitation could not be sent.' }, { status: 400 });
    }
    if (!data.user) return NextResponse.json({ error: 'Invitation could not be sent.' }, { status: 400 });

    const { error: profileError } = await admin.from('profiles').upsert({
      id: data.user.id,
      institution_id: inviter.institution_id,
      role,
      full_name: fullName,
      email,
      department,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id);
      return NextResponse.json({ error: 'Invitation profile could not be created. No account was kept.' }, { status: 500 });
    }
    return NextResponse.json({ invited: true, email }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invitation service is not configured.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
