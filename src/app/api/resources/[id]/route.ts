import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentProfile } from '@/lib/supabase/profile';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, context: RouteContext<'/api/resources/[id]'>) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Sign in with a campus account.' }, { status: 401 });
  if (['student', 'faculty'].includes(profile.role)) return NextResponse.json({ error: 'Staff access is required to manage resources.' }, { status: 403 });
  const { id } = await context.params;
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }
  const supabase = await createClient();
  const { data, error } = await supabase.from('resources').update({
    name: typeof input.name === 'string' ? input.name.trim() : '',
    code: typeof input.code === 'string' ? input.code.trim().toUpperCase() : '',
    type: input.type,
    building: typeof input.building === 'string' ? input.building.trim() : '',
    floor: typeof input.floor === 'string' ? input.floor.trim() : '',
    capacity: Number(input.capacity),
    facilities: Array.isArray(input.facilities) ? input.facilities.filter((value): value is string => typeof value === 'string') : [],
    opens_at: (input.operatingHours as Record<string, unknown> | undefined)?.open,
    closes_at: (input.operatingHours as Record<string, unknown> | undefined)?.close,
    status: input.status,
    requires_approval: Boolean(input.requiresApproval),
    approval_role: input.approvalRole ?? null,
    max_booking_hours: Number(input.maxBookingHours),
    utilization_rate: Number(input.utilizationRate ?? 0),
    image_url: typeof input.imageUrl === 'string' ? input.imageUrl : null,
    description: typeof input.description === 'string' ? input.description.trim() : '',
  }).eq('id', id).eq('institution_id', profile.institutionId).select('id').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === '42501' ? 403 : 400 });
  if (!data) return NextResponse.json({ error: 'Resource not found or unavailable.' }, { status: 404 });
  return NextResponse.json({ id: data.id });
}

