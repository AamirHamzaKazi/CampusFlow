import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

function mapResource(input: Record<string, unknown>) {
  const hours = input.operatingHours && typeof input.operatingHours === 'object' ? input.operatingHours as Record<string, unknown> : {};
  return {
    name: typeof input.name === 'string' ? input.name.trim() : '',
    code: typeof input.code === 'string' ? input.code.trim().toUpperCase() : '',
    type: input.type,
    building: typeof input.building === 'string' ? input.building.trim() : '',
    floor: typeof input.floor === 'string' ? input.floor.trim() : '',
    capacity: Number(input.capacity),
    facilities: Array.isArray(input.facilities) ? input.facilities.filter((value): value is string => typeof value === 'string') : [],
    opens_at: hours.open,
    closes_at: hours.close,
    status: input.status,
    requires_approval: Boolean(input.requiresApproval),
    approval_role: input.approvalRole ?? null,
    max_booking_hours: Number(input.maxBookingHours),
    utilization_rate: Number(input.utilizationRate ?? 0),
    image_url: typeof input.imageUrl === 'string' ? input.imageUrl : null,
    description: typeof input.description === 'string' ? input.description.trim() : '',
  };
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Sign in with a campus account.' }, { status: 401 });
  if (['student', 'faculty'].includes(profile.role)) return NextResponse.json({ error: 'Staff access is required to manage resources.' }, { status: 403 });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }
  const resource = mapResource(input);
  if (!resource.name || !resource.code || typeof resource.type !== 'string' || !resource.building || !Number.isInteger(resource.capacity) || resource.capacity < 1) {
    return NextResponse.json({ error: 'Add a valid name, code, type, building, and capacity.' }, { status: 400 });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from('resources').insert({ ...resource, institution_id: profile.institutionId }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === '42501' ? 403 : 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
