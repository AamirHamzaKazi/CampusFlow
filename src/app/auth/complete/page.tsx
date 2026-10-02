'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type CompletionState = 'working' | 'error';

export default function InvitationCompletionPage() {
  const router = useRouter();
  const started = useRef(false);
  const [state, setState] = useState<CompletionState>('working');
  const [message, setMessage] = useState('Verifying your invitation…');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function completeInvitation() {
      const currentUrl = new URL(window.location.href);
      const fragment = new URLSearchParams(currentUrl.hash.slice(1));
      const accessToken = fragment.get('access_token');
      const refreshToken = fragment.get('refresh_token');
      const tokenType = fragment.get('type');
      const authError = currentUrl.searchParams.get('error_code') ?? currentUrl.searchParams.get('error');
      const nextPath = currentUrl.searchParams.get('next') ?? '/auth/set-password';
      const safeNext = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/auth/set-password';

      // Remove one-time credentials from the address bar before doing any work.
      window.history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}`);

      if (authError || !accessToken || !refreshToken || (tokenType && tokenType !== 'invite')) {
        setState('error');
        setMessage('This invitation link is invalid or has expired. Ask your campus administrator to send a fresh invitation.');
        return;
      }

      try {
        const { error } = await createClient().auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) throw error;
        router.replace(safeNext);
        router.refresh();
      } catch {
        setState('error');
        setMessage('We could not verify this invitation. It may have expired; ask your campus administrator to send a fresh one.');
      }
    }

    void completeInvitation();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <section aria-live="polite" className="w-full max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">CF</div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[.16em] text-muted-foreground">CampusFlow access</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {state === 'working' ? 'Opening your invitation' : 'Invitation link unavailable'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        {state === 'error' && <Link href="/login" className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-semibold text-background">Return to sign in</Link>}
      </section>
    </main>
  );
}
