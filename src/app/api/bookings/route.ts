import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in before requesting a booking.' }, { status: 401 });

  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }
  const resourceId = typeof input.resourceId === 'string' ? input.resourceId : '';
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const date = typeof input.date === 'string' ? input.date : '';
  const startTime = typeof input.startTime === 'string' ? input.startTime : '';
  const endTime = typeof input.endTime === 'string' ? input.endTime : '';
  const attendeeCount = Number(input.attendeeCount);
  const purpose = typeof input.purpose === 'string' ? input.purpose : '';
  if (!resourceId || !title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || !Number.isInteger(attendeeCount)) {
    return NextResponse.json({ error: 'Complete the booking details with a valid date, time, and attendee count.' }, { status: 400 });
  }

  const { data: bookingId, error } = await supabase.rpc('request_booking', {
    p_resource_id: resourceId,
    p_title: title,
    p_booking_date: date,
    p_start_time: startTime,
    p_end_time: endTime,
    p_attendee_count: attendeeCount,
    p_purpose: purpose,
  });
  if (error) {
    const status = error.code === '23P01' ? 409 : error.code === '42501' ? 403 : error.code === 'P0002' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ bookingId }, { status: 201 });
}
