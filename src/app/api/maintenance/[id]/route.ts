import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(_request: NextRequest, context: RouteContext<'/api/maintenance/[id]'>) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in to cancel maintenance.' }, { status: 401 });
  const { id } = await context.params;
  const { error } = await supabase.rpc('cancel_maintenance', { p_window_id: id });
  if (error) {
    const status = error.code === '42501' ? 403 : error.code === 'P0002' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ updated: true });
}
