import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, context: RouteContext<'/api/bookings/[id]'>) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in to update this booking.' }, { status: 401 });
  const { id } = await context.params;
  let input: { action?: unknown; reason?: unknown };
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }

  let result;
  if (input.action === 'approve') result = await supabase.rpc('approve_booking', { p_booking_id: id });
  else if (input.action === 'reject') result = await supabase.rpc('reject_booking', { p_booking_id: id, p_reason: typeof input.reason === 'string' ? input.reason : '' });
  else if (input.action === 'cancel') result = await supabase.rpc('cancel_booking', { p_booking_id: id });
  else return NextResponse.json({ error: 'Unsupported booking action.' }, { status: 400 });

  if (result.error) {
    const status = result.error.code === '42501' ? 403 : result.error.code === 'P0002' ? 404 : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }
  return NextResponse.json({ updated: true });
}
