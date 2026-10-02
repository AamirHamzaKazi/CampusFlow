import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const nextPath = url.searchParams.get('next') ?? '/';
  const safeNext = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/';

  if (code || (tokenHash && type === 'invite')) {
    const supabase = await createClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: 'invite' });

    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  return NextResponse.redirect(new URL('/login?message=Invitation%20link%20is%20invalid%20or%20expired.', url.origin));
}
