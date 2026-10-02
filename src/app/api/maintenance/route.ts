import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in to schedule maintenance.' }, { status: 401 });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }
  const resourceId = typeof input.resourceId === 'string' ? input.resourceId : '';
  const date = typeof input.date === 'string' ? input.date : '';
  const startTime = typeof input.startTime === 'string' ? input.startTime : '';
  const endTime = typeof input.endTime === 'string' ? input.endTime : '';
  const reason = typeof input.reason === 'string' ? input.reason.trim() : '';
  if (!resourceId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || !reason) {
    return NextResponse.json({ error: 'Complete the maintenance details with a valid date and time.' }, { status: 400 });
  }
  const { data: windowId, error } = await supabase.rpc('schedule_maintenance', {
    p_resource_id: resourceId,
    p_maintenance_date: date,
    p_start_time: startTime,
    p_end_time: endTime,
    p_reason: reason,
  });
  if (error) {
    const status = error.code === '23P01' ? 409 : error.code === '42501' ? 403 : error.code === 'P0002' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ windowId }, { status: 201 });
}
