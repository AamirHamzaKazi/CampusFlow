import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in to view notifications.' }, { status: 401 });

  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, description, kind, created_at, read_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return NextResponse.json({ error: 'Notifications could not be loaded.' }, { status: 500 });
  return NextResponse.json({ notifications: data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    kind: item.kind,
    createdAt: item.created_at,
    read: Boolean(item.read_at),
  })) });
}

export async function PATCH() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in to update notifications.' }, { status: 401 });

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);
  if (error) return NextResponse.json({ error: 'Notifications could not be marked as read.' }, { status: 500 });
  return NextResponse.json({ updated: true });
}
