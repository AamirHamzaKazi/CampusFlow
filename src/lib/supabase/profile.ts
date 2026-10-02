import 'server-only';
import { redirect } from 'next/navigation';
import { CampusRole, CampusUserProfile } from '@/types';
import { createClient } from './server';

const campusRoles = new Set<CampusRole>([
  'student', 'faculty', 'department_head', 'facility_manager', 'institution_admin',
]);

export function isCampusRole(value: unknown): value is CampusRole {
  return typeof value === 'string' && campusRoles.has(value as CampusRole);
}

export async function getCurrentProfile(): Promise<CampusUserProfile | null> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, institution_id, role, full_name, email, department')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data || !isCampusRole(data.role)) return null;
  return {
    id: data.id,
    institutionId: data.institution_id,
    role: data.role,
    fullName: data.full_name,
    email: data.email,
    department: data.department,
  };
}

export async function requireCampusProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?message=Your%20campus%20account%20is%20not%20set%20up%20yet.');
  return profile;
}
